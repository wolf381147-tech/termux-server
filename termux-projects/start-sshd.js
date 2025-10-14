const { exec } = require('child_process');

console.log('启动 SSH 服务...');
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

// 定期输出状态
setInterval(() => {
    console.log('SSH 服务运行中...', new Date().toISOString());
}, 60000);
