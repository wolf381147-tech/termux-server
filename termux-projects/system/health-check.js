const http = require('http');
const net = require('net');
const { exec } = require('child_process');
const { get } = require('../config/config-manager');

class HealthChecker {
    constructor() {
        this.checks = get('healthCheck.checks');
        this.checkInterval = get('healthCheck.checkInterval');
        this.timeout = get('healthCheck.timeout');
    }
    
    checkTCP(host, port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = this.timeout;
            
            socket.setTimeout(timeout);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                resolve(false);
            });
            
            socket.connect(port, host);
        });
    }
    
    checkHTTP(host, port) {
        return new Promise((resolve) => {
            const req = http.get(`http://${host}:${port}`, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.setTimeout(this.timeout, () => {
                req.destroy();
                resolve(false);
            });
        });
    }
    
    async performCheck(check) {
        const host = 'localhost';
        
        try {
            let isHealthy = false;
            
            if (check.type === 'tcp') {
                isHealthy = await this.checkTCP(host, check.port);
            } else if (check.type === 'http') {
                isHealthy = await this.checkHTTP(host, check.port);
            }
            
            return {
                name: check.name,
                healthy: isHealthy,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                name: check.name,
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async runChecks() {
        console.log('执行健康检查...');
        const results = [];
        
        for (const check of this.checks) {
            const result = await this.performCheck(check);
            results.push(result);
            
            if (!result.healthy) {
                console.log(`❌ ${check.name} 服务异常`);
                // 这里可以添加自动恢复逻辑
            } else {
                console.log(`✅ ${check.name} 服务正常`);
            }
        }
        
        return results;
    }
    
    start() {
        // 立即执行一次检查
        this.runChecks();
        
        // 定期检查
        setInterval(() => {
            this.runChecks();
        }, this.checkInterval);
        
        console.log('健康检查器已启动');
    }
}

const healthChecker = new HealthChecker();
healthChecker.start();

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止健康检查...');
    process.exit(0);
});