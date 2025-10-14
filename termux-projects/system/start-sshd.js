const { exec } = require('child_process');
const config = require('../config/config-manager');
const ServiceManager = require('./service-manager');
const eventBus = require('./event-bus');

// 从配置中获取SSH配置
const sshPort = config.get('sshServer.port');

// 创建SSH服务管理器
const sshService = new ServiceManager('SSH', {
    startCommand: 'sshd',
    stopCommand: 'pkill sshd',
    events: {
        started: 'service.ssh.started',
        stopped: 'service.ssh.stopped',
        failed: 'service.ssh.start.failed'
    }
});

// 启动SSH服务
sshService.start();

// 定期发送心跳
const heartbeatInterval = setInterval(() => {
    console.log('SSH 服务运行中...', new Date().toISOString());
    sshService.sendHeartbeat();
}, config.get('serviceMonitor.checkInterval'));

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止 SSH 服务...');
    clearInterval(heartbeatInterval);
    sshService.stop();
    process.exit(0);
});

// 订阅相关事件
eventBus.subscribe('service.restart.started', (data) => {
    if (data.service === 'sshd') {
        console.log(`收到SSH服务重启通知: ${data.attempt} 次尝试`);
    }
});
