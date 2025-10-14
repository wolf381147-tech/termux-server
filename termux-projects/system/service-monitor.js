const { exec } = require('child_process');
const config = require('../config/app-config');

class ServiceMonitor {
    constructor() {
        this.services = config.serviceMonitor.services;
        this.checkInterval = config.serviceMonitor.checkInterval;
        this.maxRetries = config.serviceMonitor.maxRetries || 3;
        this.retryCounts = {};
    }
    
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
    
    restartService(serviceName) {
        // 初始化重试计数
        if (!this.retryCounts[serviceName]) {
            this.retryCounts[serviceName] = 0;
        }
        
        // 检查是否超过最大重试次数
        if (this.retryCounts[serviceName] >= this.maxRetries) {
            console.error(`❌ 服务 ${serviceName} 重启次数已达上限 (${this.maxRetries})，停止自动重启`);
            return;
        }
        
        this.retryCounts[serviceName]++;
        console.log(`重启服务: ${serviceName} (第 ${this.retryCounts[serviceName]} 次尝试)`);
        
        exec(`pm2 restart ${serviceName}`, (error) => {
            if (error) {
                console.error(`重启 ${serviceName} 失败:`, error);
            } else {
                console.log(`✅ ${serviceName} 已重启`);
            }
        });
    }
    
    async monitor() {
        console.log('开始监控服务...');
        
        for (const service of this.services) {
            const status = await this.checkService(service);
            if (status.status === 'stopped') {
                console.log(`❌ 服务 ${service} 已停止，正在重启...`);
                this.restartService(service);
            } else {
                // 服务正常运行，重置重试计数
                this.retryCounts[service] = 0;
            }
        }
        
        console.log('服务监控完成:', new Date().toISOString());
    }
    
    start() {
        // 立即执行一次监控
        this.monitor();
        
        // 定期监控
        setInterval(() => {
            this.monitor();
        }, this.checkInterval);
        
        console.log('服务监控器已启动');
    }
}

const monitor = new ServiceMonitor();
monitor.start();

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止服务监控...');
    process.exit(0);
});