const { exec } = require('child_process');
const config = require('../config/config-manager');
const eventBus = require('./event-bus');

class ServiceMonitor {
    constructor() {
        this.services = config.get('serviceMonitor.services');
        this.checkInterval = config.get('serviceMonitor.checkInterval');
        this.maxRetries = config.get('serviceMonitor.maxRetries') || 3;
        this.retryCounts = {};
        
        // 订阅相关事件
        this.subscribeToEvents();
    }
    
    /**
     * 订阅相关事件
     */
    subscribeToEvents() {
        eventBus.subscribe('service.health.failed', (data) => {
            console.log(`收到服务异常通知: ${data.service}`);
            // 可以在这里添加自动处理逻辑
        });
        
        eventBus.subscribe('config.updated', (data) => {
            console.log('配置已更新，重新加载配置...');
            this.services = config.get('serviceMonitor.services');
            this.checkInterval = config.get('serviceMonitor.checkInterval');
            this.maxRetries = config.get('serviceMonitor.maxRetries') || 3;
        });
    }
    
    /**
     * 验证命令安全性
     * @param {string} command - 要验证的命令
     * @returns {boolean} 命令是否安全
     */
    isCommandSafe(command) {
        // 只允许PM2相关命令
        const allowedPatterns = [
            /^pm2 describe [a-zA-Z0-9\-_]+$/,
            /^pm2 restart [a-zA-Z0-9\-_]+$/
        ];
        
        for (const pattern of allowedPatterns) {
            if (pattern.test(command)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查服务状态
     */
    checkService(serviceName) {
        // 检查参数有效性
        if (!serviceName || typeof serviceName !== 'string') {
            return Promise.resolve({ name: 'unknown', status: 'unknown' });
        }
        
        const command = `pm2 describe ${serviceName}`;
        
        // 验证命令安全性
        if (!this.isCommandSafe(command)) {
            console.error(`服务检查命令不安全: ${command}`);
            return Promise.resolve({ name: serviceName, status: 'unknown' });
        }
        
        return new Promise((resolve) => {
            exec(command, { timeout: 5000 }, (error, stdout) => {
                if (error || !stdout) {
                    resolve({ name: serviceName, status: 'stopped' });
                } else if (stdout.includes('online')) {
                    resolve({ name: serviceName, status: 'running' });
                } else {
                    resolve({ name: serviceName, status: 'stopped' });
                }
            });
        });
    }
    
    /**
     * 重启服务
     */
    restartService(serviceName) {
        // 检查参数有效性
        if (!serviceName || typeof serviceName !== 'string') {
            console.error('服务名称无效');
            eventBus.publish('service.restart.failed', {
                service: 'unknown',
                error: '服务名称无效',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        const command = `pm2 restart ${serviceName}`;
        
        // 验证命令安全性
        if (!this.isCommandSafe(command)) {
            console.error(`服务重启命令不安全: ${command}`);
            eventBus.publish('service.restart.failed', {
                service: serviceName,
                error: '重启命令不安全',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // 初始化重试计数
        if (!this.retryCounts[serviceName]) {
            this.retryCounts[serviceName] = 0;
        }
        
        // 检查是否超过最大重试次数
        if (this.retryCounts[serviceName] >= this.maxRetries) {
            console.error(`❌ 服务 ${serviceName} 重启次数已达上限 (${this.maxRetries})，停止自动重启`);
            // 发布服务重启失败事件
            eventBus.publish('service.restart.failed', {
                service: serviceName,
                reason: 'max retries exceeded',
                maxRetries: this.maxRetries,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        this.retryCounts[serviceName]++;
        console.log(`重启服务: ${serviceName} (第 ${this.retryCounts[serviceName]} 次尝试)`);
        
        // 发布服务重启开始事件
        eventBus.publish('service.restart.started', {
            service: serviceName,
            attempt: this.retryCounts[serviceName],
            timestamp: new Date().toISOString()
        });
        
        exec(command, { timeout: 10000 }, (error) => {
            if (error) {
                console.error(`重启 ${serviceName} 失败:`, error);
                // 发布服务重启失败事件
                eventBus.publish('service.restart.failed', {
                    service: serviceName,
                    error: error.message,
                    attempt: this.retryCounts[serviceName],
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log(`✅ ${serviceName} 已重启`);
                // 发布服务重启成功事件
                eventBus.publish('service.restart.completed', {
                    service: serviceName,
                    attempt: this.retryCounts[serviceName],
                    timestamp: new Date().toISOString()
                });
                // 重置重试计数
                this.retryCounts[serviceName] = 0;
            }
        });
    }
    
    /**
     * 监控所有服务
     */
    async monitor() {
        console.log('开始监控服务...');
        
        // 检查配置有效性
        if (!Array.isArray(this.services)) {
            console.error('服务监控配置无效，services必须是数组');
            eventBus.publish('service.monitor.error', {
                error: '服务监控配置无效',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // 发布监控开始事件
        eventBus.publish('service.monitor.started', {
            timestamp: new Date().toISOString()
        });
        
        for (const service of this.services) {
            try {
                const status = await this.checkService(service);
                if (status.status === 'stopped') {
                    console.log(`❌ 服务 ${service} 已停止，正在重启...`);
                    this.restartService(service);
                } else {
                    // 发布服务运行正常事件
                    eventBus.publish('service.running', {
                        service: service,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error(`检查服务 ${service} 时出错:`, error);
                eventBus.publish('service.monitor.error', {
                    service: service,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        console.log('服务监控完成:', new Date().toISOString());
        
        // 发布监控完成事件
        eventBus.publish('service.monitor.completed', {
            services: this.services,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * 启动服务监控器
     */
    start() {
        // 检查必要配置
        if (!this.checkInterval || this.checkInterval < 1000) {
            console.error('服务监控间隔配置无效，必须是大于1000的数字');
            return;
        }
        
        // 立即执行一次监控
        this.monitor();
        
        // 定期监控
        setInterval(() => {
            this.monitor();
        }, this.checkInterval);
        
        console.log('服务监控器已启动');
        
        // 发布服务监控启动事件
        eventBus.publish('service.monitor.started', {
            timestamp: new Date().toISOString()
        });
    }
}

// 创建并启动服务监控器
const monitor = new ServiceMonitor();
monitor.start();

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止服务监控...');
    // 发布服务监控停止事件
    eventBus.publish('service.monitor.stopped', {
        timestamp: new Date().toISOString()
    });
    process.exit(0);
});

module.exports = ServiceMonitor;