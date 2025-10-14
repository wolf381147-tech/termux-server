const http = require('http');
const net = require('net');
const { exec } = require('child_process');

class EnhancedHealthChecker {
    constructor(config = {}) {
        this.checks = config.checks || [
            { name: 'SSH', port: 8022, type: 'tcp' },
            { name: 'Web', port: 8000, type: 'http' }
        ];
        this.checkInterval = config.checkInterval || 30000;
        this.timeout = config.timeout || 5000;
    }
    
    checkTCP(host, port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            
            socket.setTimeout(this.timeout);
            socket.on('connect', () => {
                socket.destroy();
                resolve({ success: true, responseTime: Date.now() });
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve({ success: false, error: 'Connection timeout' });
            });
            socket.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
            
            const startTime = Date.now();
            socket.connect(port, host, () => {
                socket.responseTime = Date.now() - startTime;
            });
        });
    }
    
    checkHTTP(host, port) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const req = http.get(`http://${host}:${port}`, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: res.statusCode === 200,
                    statusCode: res.statusCode,
                    responseTime
                });
            });
            
            req.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
            
            req.setTimeout(this.timeout, () => {
                req.destroy();
                resolve({ success: false, error: 'Request timeout' });
            });
        });
    }
    
    async performCheck(check) {
        const host = check.host || 'localhost';
        
        try {
            let result = {};
            
            if (check.type === 'tcp') {
                result = await this.checkTCP(host, check.port);
            } else if (check.type === 'http') {
                result = await this.checkHTTP(host, check.port);
            }
            
            return {
                name: check.name,
                healthy: result.success,
                timestamp: new Date().toISOString(),
                responseTime: result.responseTime,
                details: result
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
                console.log(`❌ ${check.name} 服务异常: ${result.error || 'Unknown error'}`);
                // 可以在这里添加事件触发或回调通知
            } else {
                console.log(`✅ ${check.name} 服务正常 (${result.responseTime}ms)`);
            }
        }
        
        return results;
    }
    
    start() {
        console.log('健康检查器已启动');
        // 立即执行一次检查
        this.runChecks();
        
        // 定期检查
        this.intervalId = setInterval(() => {
            this.runChecks();
        }, this.checkInterval);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log('健康检查器已停止');
        }
    }
}

module.exports = EnhancedHealthChecker;

// 如果直接运行此文件，则执行以下代码
if (require.main === module) {
    const healthChecker = new EnhancedHealthChecker();
    healthChecker.start();
    
    // 保持进程运行
    process.on('SIGINT', () => {
        console.log('停止健康检查...');
        healthChecker.stop();
        process.exit(0);
    });
}