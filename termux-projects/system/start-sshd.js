const { exec } = require('child_process');
const config = require('../config/app-config');

// 从配置中获取SSH端口
const sshPort = config.sshServer.port;

console.log(`启动 SSH 服务 (端口: ${sshPort})...`);
const sshd = exec('sshd', (error, stdout, stderr) => {
    if (error) {
        console.error('SSH 服务启动失败:', error);
        return;
    }
});

// 保持进程运行
process.on('SIGINT', () => {
    console.log('停止 SSH 服务...');
    exec('pkill sshd');
    process.exit(0);
});

// 定期输出状态，使用配置中的间隔时间
setInterval(() => {
    console.log('SSH 服务运行中...', new Date().toISOString());
}, config.serviceMonitor.checkInterval);
