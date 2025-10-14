const { exec } = require('child_process');
const config = require('../config/app-config');

// 从配置中获取Web服务器设置
const webConfig = config.webServer;
const { port, host, directory } = webConfig;

console.log(`启动 Web 服务器 (端口: ${port}, 目录: ${directory})...`);
const web = exec(`cd ${directory} && python -m http.server ${port}`, (error, stdout, stderr) => {
    if (error) {
        console.error('Web 服务器启动失败:', error);
        return;
    }
});

process.on('SIGINT', () => {
    console.log('停止 Web 服务器...');
    exec('pkill -f "http.server"');
    process.exit(0);
});

// 定期输出状态，使用配置中的间隔时间
setInterval(() => {
    console.log('Web 服务器运行中...', new Date().toISOString());
}, config.serviceMonitor.checkInterval);
