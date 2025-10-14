const { exec } = require('child_process');

console.log('启动 Web 服务器...');
const web = exec('cd ~/storage/shared/termux-projects/my-website && python -m http.server 8000', (error, stdout, stderr) => {
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

setInterval(() => {
    console.log('Web 服务器运行中...', new Date().toISOString());
}, 60000);
