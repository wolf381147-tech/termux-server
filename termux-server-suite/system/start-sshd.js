#!/usr/bin/env node

// SSH服务管理脚本
// 支持启动、停止和检查SSH服务状态

const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '../..');

// 导入配置管理器和应用配置
const configPath = path.join(projectRoot, 'termux-server-suite/config/app-config.js');
const config = require(configPath);

// SSH端口
const SSH_PORT = 8022;

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
    'sshd',
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
 * 启动SSH服务
 */
function startSSH() {
  try {
    console.log('正在启动SSH服务...');
    
    // 检查sshd是否已在运行
    try {
      execSync('pkill sshd', { stdio: 'ignore' });
      console.log('已停止可能正在运行的旧SSH服务');
    } catch (error) {
      // 如果没有运行的sshd进程，pkill会返回错误，这是正常的
    }
    
    // 启动SSH服务
    const startCommand = 'sshd';
    if (!isCommandSafe(startCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(startCommand, { stdio: 'inherit' });
    console.log('SSH服务启动成功');
    
    // 获取SSH服务状态
    checkSSHStatus();
  } catch (error) {
    console.error('启动SSH服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 停止SSH服务
 */
function stopSSH() {
  try {
    console.log('正在停止SSH服务...');
    
    const stopCommand = 'pkill sshd';
    if (!isCommandSafe(stopCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(stopCommand, { stdio: 'inherit' });
    console.log('SSH服务已停止');
  } catch (error) {
    console.error('停止SSH服务失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查SSH服务状态
 */
function checkSSHStatus() {
  try {
    console.log('正在检查SSH服务状态...');
    
    // 检查端口是否在监听
    const checkCommand = `netstat -tulpn | grep :${SSH_PORT}`;
    if (!isCommandSafe(checkCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    const result = execSync(checkCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    if (result.includes(`:${SSH_PORT}`)) {
      console.log('✅ SSH服务正在运行');
      
      // 显示连接信息
      try {
        const ipCommand = 'ip route get 1.1.1.1 | awk \'{print $7}\'';
        if (isCommandSafe(ipCommand)) {
          const localIP = execSync(ipCommand, { encoding: 'utf8' }).trim();
          console.log(`连接信息: ssh -p ${SSH_PORT} u0_a$(id -u)@${localIP}`);
        }
      } catch (error) {
        console.log('无法获取IP地址信息');
      }
    } else {
      console.log('❌ SSH服务未运行');
    }
  } catch (error) {
    console.log('❌ SSH服务未运行');
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
SSH服务管理工具

用法:
  node start-sshd.js [选项]

选项:
  start    启动SSH服务
  stop     停止SSH服务
  status   检查SSH服务状态
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
      startSSH();
      break;
    case 'stop':
      stopSSH();
      break;
    case 'status':
      checkSSHStatus();
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
  startSSH,
  stopSSH,
  checkSSHStatus,
  isCommandSafe
};