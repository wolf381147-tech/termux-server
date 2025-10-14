const { exec } = require('child_process');
const config = require('../config/config-manager');
const ServiceManager = require('./service-manager');
const eventBus = require('./event-bus');

// 从配置中获取Web服务器设置
const webConfig = config.get('webServer');
const { port, host, directory } = webConfig;

// 创建Web服务管理器
const webService = new ServiceManager('Web', {
    startCommand: `python -m http.server ${port}`,
    stopCommand: 'pkill -f "http.server"',
    workingDir: directory,
    events: {
        started: 'service.web.started',
        stopped: 'service.web.stopped',
        failed: 'service.web.start.failed'
    }
});

// 启动Web服务
webService.start();

// 定期发送心跳
const heartbeatInterval = setInterval(() => {
    console.log('Web 服务器运行中...', new Date().toISOString());
    webService.sendHeartbeat();
}, config.get('serviceMonitor.checkInterval'));

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止 Web 服务器...');
    clearInterval(heartbeatInterval);
    webService.stop();
    process.exit(0);
});

// 订阅相关事件
eventBus.subscribe('service.restart.started', (data) => {
    if (data.service === 'webserver') {
        console.log(`收到Web服务重启通知: ${data.attempt} 次尝试`);
    }
});
