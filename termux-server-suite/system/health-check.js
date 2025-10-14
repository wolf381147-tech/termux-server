const http = require('http');
const net = require('net');
const config = require('../config/config-manager');
const eventBus = require('./event-bus');

class HealthChecker {
    constructor() {
        this.checks = config.get('healthCheck.checks');
        this.checkInterval = config.get('healthCheck.checkInterval');
        this.timeout = config.get('healthCheck.timeout');
        
        // 订阅相关事件
        this.subscribeToEvents();
    }
    
    /**
     * 订阅相关事件
     */
    subscribeToEvents() {
        eventBus.subscribe('service.started', (data) => {
            console.log(`收到服务启动通知: ${data.service}`);
        });
        
        eventBus.subscribe('config.updated', (data) => {
            console.log('配置已更新，重新加载配置...');
            this.checks = config.get('healthCheck.checks');
            this.checkInterval = config.get('healthCheck.checkInterval');
            this.timeout = config.get('healthCheck.timeout');
        });
    }
    
    /**
     * TCP连接检查
     */
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
    
    /**
     * HTTP连接检查
     */
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
    
    /**
     * 执行单个检查
     */
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
    
    /**
     * 运行所有检查
     */
    async runChecks() {
        console.log('执行健康检查...');
        const results = [];
        
        for (const check of this.checks) {
            const result = await this.performCheck(check);
            results.push(result);
            
            if (!result.healthy) {
                console.log(`❌ ${check.name} 服务异常`);
                // 发布服务异常事件
                eventBus.publish('service.health.failed', {
                    service: check.name,
                    timestamp: new Date().toISOString(),
                    error: result.error
                });
            } else {
                console.log(`✅ ${check.name} 服务正常`);
                // 发布服务正常事件
                eventBus.publish('service.health.ok', {
                    service: check.name,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // 发布健康检查完成事件
        eventBus.publish('health.check.completed', {
            results,
            timestamp: new Date().toISOString()
        });
        
        return results;
    }
    
    /**
     * 启动健康检查器
     */
    start() {
        // 立即执行一次检查
        this.runChecks();
        
        // 定期检查
        setInterval(() => {
            this.runChecks();
        }, this.checkInterval);
        
        console.log('健康检查器已启动');
        
        // 发布健康检查启动事件
        eventBus.publish('health.check.started', {
            timestamp: new Date().toISOString()
        });
    }
}

// 创建并启动健康检查器
const healthChecker = new HealthChecker();
healthChecker.start();

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止健康检查...');
    // 发布健康检查停止事件
    eventBus.publish('health.check.stopped', {
        timestamp: new Date().toISOString()
    });
    process.exit(0);
});

module.exports = HealthChecker;