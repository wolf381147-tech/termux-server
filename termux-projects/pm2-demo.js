const http = require('http');
const os = require('os');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`PM2 Demo Server\n运行在: ${os.hostname()}\n时间: ${new Date().toISOString()}`);
});

server.listen(3000, '0.0.0.0', () => {
    console.log('PM2 Demo Server running on port 3000');
});
