const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const webRoot = path.join(process.env.HOME, 'storage/shared/termux-projects/my-website');

const server = http.createServer((req, res) => {
    let filePath = path.join(webRoot, req.url === '/' ? 'index.html' : req.url);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
});

server.listen(port, () => {
    console.log(`Node.js server running at http://localhost:${port}`);
});
