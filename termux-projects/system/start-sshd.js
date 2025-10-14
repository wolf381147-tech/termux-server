const { exec } = require('child_process');
const config = require('../config/config-manager');
const eventBus = require('./event-bus');

// 从配置中获取SSH端口
const sshPort = config.get('sshServer.port');

console.log(`启动 SSH 服务 (端口: ${sshPort})...`);
const sshd = exec('sshd', (error, stdout, stderr) => {
    if (error) {
        console.error('SSH 服务启动失败:', error);
        // 发布SSH服务启动失败事件
        eventBus.publish('service.ssh.start.failed', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    console.log('SSH 服务启动成功');
    // 发布SSH服务启动成功事件
    eventBus.publish('service.ssh.started', {
        port: sshPort,
        timestamp: new Date().toISOString()
    });
});

// 订阅相关事件
eventBus.subscribe('service.restart.started', (data) => {
    if (data.service === 'sshd') {
        console.log(`收到SSH服务重启通知: ${data.attempt} 次尝试`);
    }
});

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止 SSH 服务...');
    // 发布SSH服务停止事件
    eventBus.publish('service.ssh.stopped', {
        timestamp: new Date().toISOString()
    });
    exec('pkill sshd');
    process.exit(0);
});

// 定期输出状态，使用配置中的间隔时间
setInterval(() => {
    console.log('SSH 服务运行中...', new Date().toISOString());
    // 发布SSH服务心跳事件
    eventBus.publish('service.ssh.heartbeat', {
        timestamp: new Date().toISOString()
    });
}, config.get('serviceMonitor.checkInterval'));