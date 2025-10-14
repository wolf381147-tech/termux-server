#!/usr/bin/env node

// VS Code Server服务管理脚本
// 支持启动、停止和检查VS Code Server服务状态

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '../..');

// 导入配置管理器和应用配置
const configPath = path.join(projectRoot, 'termux-server-suite/config/app-config.js');
const config = require(configPath);

// VS Code Server端口
const VSCODE_PORT = 8080;

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
    'code-server',
    'pkill',
    'killall',
    'ps aux',
    'netstat',
    'npm',
    'node',
    'which',
    'whereis'
  ];
  
  for (const safeCommand of safeCommands) {
    if (command.includes(safeCommand)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查code-server是否已安装
 */
function isCodeServerInstalled() {
  try {
    execSync('which code-server', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 安装code-server
 */
function installCodeServer() {
  try {
    console.log('正在安装 VS Code Server...');
    
    // 使用npm安装code-server
    const installCommand = 'npm install -g code-server';
    if (!isCommandSafe(installCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(installCommand, { stdio: 'inherit' });
    console.log('VS Code Server 安装成功');
  } catch (error) {
    console.error('安装 VS Code Server 失败:', error.message);
    process.exit(1);
  }
}

/**
 * 启动VS Code Server服务
 */
function startVSCode() {
  try {
    console.log('正在启动 VS Code Server 服务...');
    
    // 检查是否已安装code-server
    if (!isCodeServerInstalled()) {
      console.log('VS Code Server 未安装，正在自动安装...');
      installCodeServer();
    }
    
    // 检查是否已在运行
    try {
      const checkCommand = `pkill -f "code-server.*--port ${VSCODE_PORT}"`;
      if (isCommandSafe(checkCommand)) {
        execSync(checkCommand, { stdio: 'ignore' });
        console.log('已停止可能正在运行的旧 VS Code Server 服务');
      }
    } catch (error) {
      // 如果没有运行的服务，pkill会返回错误，这是正常的
    }
    
    // 启动VS Code Server服务
    const startCommand = `code-server --port ${VSCODE_PORT} --host 0.0.0.0 --auth none ${projectRoot}`;
    if (!isCommandSafe(startCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    // 使用spawn启动服务，使其在后台运行
    const [cmd, ...args] = startCommand.split(' ');
    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    console.log(`VS Code Server 服务启动成功，端口: ${VSCODE_PORT}`);
    console.log(`项目目录: ${projectRoot}`);
    
    // 获取VS Code Server服务状态
    checkVSCodeStatus();
  } catch (error) {
    console.error('启动 VS Code Server 服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 停止VS Code Server服务
 */
function stopVSCode() {
  try {
    console.log('正在停止 VS Code Server 服务...');
    
    const stopCommand = `pkill -f "code-server.*--port ${VSCODE_PORT}"`;
    if (!isCommandSafe(stopCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(stopCommand, { stdio: 'inherit' });
    console.log('VS Code Server 服务已停止');
  } catch (error) {
    console.error('停止 VS Code Server 服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查VS Code Server服务状态
 */
function checkVSCodeStatus() {
  try {
    console.log('正在检查 VS Code Server 服务状态...');
    
    // 检查端口是否在监听
    const checkCommand = `netstat -tulpn | grep :${VSCODE_PORT}`;
    if (!isCommandSafe(checkCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    const result = execSync(checkCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (result.includes(`:${VSCODE_PORT}`)) {
      console.log('✅ VS Code Server 服务正在运行');
      
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
          console.log(`访问地址: http://${localIP}:${VSCODE_PORT}`);
          console.log(`VS Code Server 已在你的设备上运行，你可以通过以下地址访问:`);
          console.log(`http://${localIP}:${VSCODE_PORT}`);
          console.log(`无需密码即可直接访问`);
        } else {
          console.log('无法获取IP地址信息');
        }
      } catch (error) {
        console.log('无法获取IP地址信息');
      }
    } else {
      console.log('❌ VS Code Server 服务未运行');
    }
  } catch (error) {
    console.log('❌ VS Code Server 服务未运行');
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
VS Code Server 服务管理工具

用法:
  node start-vscode.js [选项]

选项:
  start    启动VS Code Server服务
  stop     停止VS Code Server服务
  status   检查VS Code Server服务状态
  help     显示此帮助信息

如果没有提供选项，默认执行 status 命令。

说明:
  VS Code Server 是一个在浏览器中运行的 VS Code 版本。
  启动后，你可以通过浏览器访问完整的 VS Code 环境，方便进行项目开发。
  默认情况下，VS Code Server 将在端口 8080 上运行，并且不需要密码即可访问。
  `);
}

// 主程序入口
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  switch (command) {
    case 'start':
      startVSCode();
      break;
    case 'stop':
      stopVSCode();
      break;
    case 'status':
      checkVSCodeStatus();
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
  startVSCode,
  stopVSCode,
  checkVSCodeStatus,
  isCommandSafe
};