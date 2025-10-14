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
            // 检查参数有效性
            if (!host || typeof port !== 'number' || port < 1 || port > 65535) {
                resolve(false);
                return;
            }
            
            const socket = new net.Socket();
            const timeout = this.timeout;
            
            const timer = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, timeout);
            
            socket.setTimeout(timeout);
            socket.on('connect', () => {
                clearTimeout(timer);
                socket.destroy();
                resolve(true);
            });
            socket.on('timeout', () => {
                clearTimeout(timer);
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                clearTimeout(timer);
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
            // 检查参数有效性
            if (!host || typeof port !== 'number' || port < 1 || port > 65535) {
                resolve(false);
                return;
            }
            
            const req = http.get(`http://${host}:${port}`, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 400);
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
            // 检查参数有效性
            if (!check || !check.name || !check.type || !check.port) {
                return {
                    name: check ? check.name : 'unknown',
                    healthy: false,
                    error: '检查配置不完整',
                    timestamp: new Date().toISOString()
                };
            }
            
            let isHealthy = false;
            
            if (check.type === 'tcp') {
                isHealthy = await this.checkTCP(host, check.port);
            } else if (check.type === 'http') {
                isHealthy = await this.checkHTTP(host, check.port);
            } else {
                return {
                    name: check.name,
                    healthy: false,
                    error: `不支持的检查类型: ${check.type}`,
                    timestamp: new Date().toISOString()
                };
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
        
        // 检查配置有效性
        if (!Array.isArray(this.checks)) {
            console.error('健康检查配置无效，checks必须是数组');
            eventBus.publish('health.check.error', {
                error: '健康检查配置无效',
                timestamp: new Date().toISOString()
            });
            return results;
        }
        
        for (const check of this.checks) {
            const result = await this.performCheck(check);
            results.push(result);
            
            if (!result.healthy) {
                console.log(`❌ ${check.name} 服务异常: ${result.error || '服务无响应'}`);
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
        // 检查必要配置
        if (!this.checkInterval || this.checkInterval < 1000) {
            console.error('健康检查间隔配置无效，必须是大于1000的数字');
            return;
        }
        
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