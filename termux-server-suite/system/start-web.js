#!/usr/bin/env node

// Web服务管理脚本
// 支持启动、停止和检查Web服务状态

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '../..');

// 导入配置管理器和应用配置
const configPath = path.join(projectRoot, 'termux-server-suite/config/app-config.js');
const config = require(configPath);

// Web端口
const WEB_PORT = 8000;

/**
 * 检查命令是否安全执行
 * @param {string} command - 要检查的命令
 * @returns {boolean} 是否安全
 */
function isCommandSafe(command) {
  // 禁止危险命令
  const dangerousPatterns = [
    /rm\s+-rf/,
    /format/,
    /dd\s+if=/,
    />\s*\/dev\/(null|zero)/
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return false;
    }
  }
  
  // 只允许预定义的安全命令
  const safeCommands = [
    'python3 -m http.server',
    'pkill',
    'killall',
    'ps aux',
    'netstat',
    'termux-wake-lock',
    'termux-wake-unlock'
  ];
  
  for (const safeCommand of safeCommands) {
    if (command.includes(safeCommand)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 启动Web服务
 */
function startWeb() {
  try {
    console.log('正在启动Web服务...');
    
    // 检查是否已在运行
    try {
      const checkCommand = `pkill -f "python3 -m http.server ${WEB_PORT}"`;
      if (isCommandSafe(checkCommand)) {
        execSync(checkCommand, { stdio: 'ignore' });
        console.log('已停止可能正在运行的旧Web服务');
      }
    } catch (error) {
      // 如果没有运行的服务，pkill会返回错误，这是正常的
    }
    
    // 检查网站目录是否存在
    if (!fs.existsSync(config.websiteDir)) {
      console.error(`网站目录不存在: ${config.websiteDir}`);
      process.exit(1);
    }
    
    // 启动Web服务
    const startCommand = `cd "${config.websiteDir}" && python3 -m http.server ${WEB_PORT}`;
    if (!isCommandSafe(startCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    // 使用spawn启动服务，使其在后台运行
    const [cmd, ...args] = startCommand.split(' ');
    const child = spawn(cmd, args, {
      cwd: config.websiteDir,
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    console.log(`Web服务启动成功，端口: ${WEB_PORT}`);
    console.log(`网站目录: ${config.websiteDir}`);
    
    // 获取Web服务状态
    checkWebStatus();
  } catch (error) {
    console.error('启动Web服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 停止Web服务
 */
function stopWeb() {
  try {
    console.log('正在停止Web服务...');
    
    const stopCommand = `pkill -f "python3 -m http.server ${WEB_PORT}"`;
    if (!isCommandSafe(stopCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(stopCommand, { stdio: 'inherit' });
    console.log('Web服务已停止');
  } catch (error) {
    console.error('停止Web服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查Web服务状态
 */
function checkWebStatus() {
  try {
    console.log('正在检查Web服务状态...');
    
    // 检查端口是否在监听
    const checkCommand = `netstat -tulpn | grep :${WEB_PORT}`;
    if (!isCommandSafe(checkCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    const result = execSync(checkCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (result.includes(`:${WEB_PORT}`)) {
      console.log('✅ Web服务正在运行');
      
      // 显示连接信息
      try {
        // 尝试多种方法获取IP地址
        const ipCommands = [
          'ip route get 1.1.1.1 | awk \'{print $7}\'',
          'ifconfig | grep -Eo \'inet (addr:)?([0-9]*\\.){3}[0-9]*\' | grep -Eo \'([0-9]*\\.){3}[0-9]*\' | grep -v \'127.0.0.1\' | head -n 1',
          'hostname -I | awk \'{print $1}\''
        ];
        
        let localIP = null;
        for (const ipCommand of ipCommands) {
          if (isCommandSafe(ipCommand)) {
            try {
              localIP = execSync(ipCommand, { encoding: 'utf8' }).trim();
              if (localIP) break;
            } catch (e) {
              // 继续尝试下一个命令
            }
          }
        }
        
        if (localIP) {
          console.log(`访问地址: http://${localIP}:${WEB_PORT}`);
        } else {
          console.log('无法获取IP地址信息');
        }
      } catch (error) {
        console.log('无法获取IP地址信息');
      }
    } else {
      console.log('❌ Web服务未运行');
    }
  } catch (error) {
    console.log('❌ Web服务未运行');
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
Web服务管理工具

用法:
  node start-web.js [选项]

选项:
  start    启动Web服务
  stop     停止Web服务
  status   检查Web服务状态
  help     显示此帮助信息

如果没有提供选项，默认执行 status 命令。
  `);
}

// 主程序入口
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  switch (command) {
    case 'start':
      startWeb();
      break;
    case 'stop':
      stopWeb();
      break;
    case 'status':
      checkWebStatus();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.log(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 执行主程序
if (require.main === module) {
  main();
}

module.exports = {
  startWeb,
  stopWeb,
  checkWebStatus,
  isCommandSafe
};