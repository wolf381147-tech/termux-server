const { exec } = require('child_process');

class ServiceMonitor {
    constructor() {
        this.services = ['sshd', 'webserver'];
        this.checkInterval = 60000; // 1分钟检查一次
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
        console.log(`重启服务: ${serviceName}`);
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
