const { exec } = require('child_process');
const config = require('../config/config-manager');
const eventBus = require('./event-bus');

// 从配置中获取Web服务器设置
const webConfig = config.get('webServer');
const { port, host, directory } = webConfig;

console.log(`启动 Web 服务器 (端口: ${port}, 目录: ${directory})...`);
const web = exec(`cd ${directory} && python -m http.server ${port}`, (error, stdout, stderr) => {
    if (error) {
        console.error('Web 服务器启动失败:', error);
        // 发布Web服务启动失败事件
        eventBus.publish('service.web.start.failed', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    console.log('Web 服务器启动成功');
    // 发布Web服务启动成功事件
    eventBus.publish('service.web.started', {
        port: port,
        host: host,
        directory: directory,
        timestamp: new Date().toISOString()
    });
});

// 订阅相关事件
eventBus.subscribe('service.restart.started', (data) => {
    if (data.service === 'webserver') {
        console.log(`收到Web服务重启通知: ${data.attempt} 次尝试`);
    }
});

process.on('SIGINT', () => {
    console.log('停止 Web 服务器...');
    // 发布Web服务停止事件
    eventBus.publish('service.web.stopped', {
        timestamp: new Date().toISOString()
    });
    exec('pkill -f "http.server"');
    process.exit(0);
});

// 定期输出状态，使用配置中的间隔时间
setInterval(() => {
    console.log('Web 服务器运行中...', new Date().toISOString());
    // 发布Web服务心跳事件
    eventBus.publish('service.web.heartbeat', {
        timestamp: new Date().toISOString()
    });
}, config.get('serviceMonitor.checkInterval'));