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
     * 检查服务状态
     */
    checkService(serviceName) {
        return new Promise((resolve) => {
            exec(`pm2 describe ${serviceName}`, (error, stdout) => {
                if (error || !stdout.includes('online')) {
                    resolve({ name: serviceName, status: 'stopped' });
                } else {
                    resolve({ name: serviceName, status: 'running' });
                }
            });
        });
    }
    
    /**
     * 重启服务
     */
    restartService(serviceName) {
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
        
        exec(`pm2 restart ${serviceName}`, (error) => {
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
        
        // 发布监控开始事件
        eventBus.publish('service.monitor.started', {
            timestamp: new Date().toISOString()
        });
        
        for (const service of this.services) {
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