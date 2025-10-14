#!/usr/bin/env node

// VS Code Server安装和管理脚本
// 解决在Termux环境中安装code-server的问题

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    'npm',
    'node',
    'which',
    'whereis',
    'pkg',
    'apt',
    'curl',
    'wget'
  ];
  
  for (const safeCommand of safeCommands) {
    if (command.includes(safeCommand)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查是否已安装code-server
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
 * 通过预编译包安装code-server
 */
function installCodeServerPrebuilt() {
  try {
    console.log('正在通过预编译包安装 VS Code Server...');
    
    // 下载预编译包
    const downloadCommand = 'curl -fOL https://github.com/coder/code-server/releases/latest/download/code-server-arm64.tar.gz';
    if (!isCommandSafe(downloadCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(downloadCommand, { stdio: 'inherit' });
    
    // 解压
    execSync('tar -xzf code-server-arm64.tar.gz', { stdio: 'inherit' });
    
    // 移动到系统目录
    const extractDir = fs.readdirSync('.').find(file => file.startsWith('code-server') && fs.statSync(file).isDirectory());
    if (extractDir) {
      execSync(`mv ${extractDir}/bin/code-server $PREFIX/bin/`, { stdio: 'inherit' });
      execSync(`rm -rf ${extractDir}`, { stdio: 'inherit' });
      execSync('rm code-server-arm64.tar.gz', { stdio: 'inherit' });
      console.log('VS Code Server 安装成功');
      return true;
    } else {
      console.error('无法找到解压后的目录');
      return false;
    }
  } catch (error) {
    console.error('通过预编译包安装 VS Code Server 失败:', error.message);
    return false;
  }
}

/**
 * 通过npm安装code-server（带错误处理）
 */
function installCodeServerNpm() {
  try {
    console.log('正在通过npm安装 VS Code Server...');
    
    // 尝试设置npm配置以跳过需要编译的包
    try {
      execSync('npm config set python python3', { stdio: 'ignore' });
    } catch (e) {
      // 忽略配置错误
    }
    
    const installCommand = 'npm install -g code-server --unsafe-perm=true --allow-root';
    if (!isCommandSafe(installCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(installCommand, { stdio: 'inherit' });
    console.log('VS Code Server 安装成功');
    return true;
  } catch (error) {
    console.error('通过npm安装 VS Code Server 失败:', error.message);
    return false;
  }
}

/**
 * 安装VS Code Server
 */
function installCodeServer() {
  console.log('正在安装 VS Code Server...');
  
  // 首先尝试通过预编译包安装
  if (installCodeServerPrebuilt()) {
    return;
  }
  
  // 如果预编译包安装失败，尝试npm安装
  if (installCodeServerNpm()) {
    return;
  }
  
  console.error('所有安装方法都失败了，请手动安装code-server');
  process.exit(1);
}

/**
 * 启动VS Code Server
 */
function startCodeServer() {
  try {
    if (!isCodeServerInstalled()) {
      console.log('VS Code Server 未安装，正在自动安装...');
      installCodeServer();
    }
    
    console.log('正在启动 VS Code Server...');
    
    // 创建配置目录
    const configDir = path.join(process.env.HOME, '.config', 'code-server');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 创建配置文件
    const configPath = path.join(configDir, 'config.yaml');
    const configContent = `
bind-addr: 0.0.0.0:8080
auth: none
cert: false
`;
    
    fs.writeFileSync(configPath, configContent);
    
    // 启动VS Code Server
    const startCommand = 'code-server --config ' + configPath;
    if (!isCommandSafe(startCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    const child = spawn('code-server', ['--config', configPath], {
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    console.log('VS Code Server 启动成功');
    console.log('访问地址: http://[你的设备IP]:8080');
  } catch (error) {
    console.error('启动 VS Code Server 失败:', error.message);
    process.exit(1);
  }
}

/**
 * 停止VS Code Server
 */
function stopCodeServer() {
  try {
    console.log('正在停止 VS Code Server...');
    
    const stopCommand = 'pkill -f code-server';
    if (!isCommandSafe(stopCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(stopCommand, { stdio: 'inherit' });
    console.log('VS Code Server 已停止');
  } catch (error) {
    console.error('停止 VS Code Server 失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查VS Code Server状态
 */
function checkCodeServerStatus() {
  try {
    console.log('正在检查 VS Code Server 状态...');
    
    const checkCommand = 'pgrep -f code-server';
    if (!isCommandSafe(checkCommand)) {
      console.error('安全错误：拒绝执行不安全的命令');
      process.exit(1);
    }
    
    execSync(checkCommand, { stdio: 'ignore' });
    console.log('✅ VS Code Server 正在运行');
    
    // 显示连接信息
    try {
      const ipCommand = 'ip route get 1.1.1.1 | awk \'{print $7}\'';
      if (isCommandSafe(ipCommand)) {
        const localIP = execSync(ipCommand, { encoding: 'utf8' }).trim();
        console.log(`访问地址: http://${localIP}:8080`);
      }
    } catch (error) {
      console.log('无法获取IP地址信息');
    }
  } catch (error) {
    console.log('❌ VS Code Server 未运行');
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
VS Code Server 安装和管理工具

用法:
  node install-vscode.js [选项]

选项:
  install  安装VS Code Server
  start    启动VS Code Server
  stop     停止VS Code Server
  status   检查VS Code Server状态
  help     显示此帮助信息

如果没有提供选项，默认执行 status 命令。
  `);
}

// 主程序入口
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  switch (command) {
    case 'install':
      installCodeServer();
      break;
    case 'start':
      startCodeServer();
      break;
    case 'stop':
      stopCodeServer();
      break;
    case 'status':
      checkCodeServerStatus();
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
  installCodeServer,
  startCodeServer,
  stopCodeServer,
  checkCodeServerStatus
};