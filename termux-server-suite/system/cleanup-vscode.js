#!/usr/bin/env node

/**
 * 清理脚本 - 用于停止和删除残留的 VS Code Server 进程
 */

const { exec } = require('child_process');

console.log('正在清理残留的 VS Code Server 进程...');

// 停止 VS Code Server 进程
exec('pm2 stop vscode', (error, stdout, stderr) => {
  if (error) {
    console.log('没有找到运行中的 vscode 进程或 pm2 未安装');
  } else {
    console.log('已停止 VS Code Server 进程');
    console.log(stdout);
  }
  
  if (stderr) {
    console.error('停止进程时出现错误:', stderr);
  }
  
  // 删除 VS Code Server 进程
  exec('pm2 delete vscode', (deleteError, deleteStdout, deleteStderr) => {
    if (deleteError) {
      console.log('没有找到可删除的 vscode 进程');
    } else {
      console.log('已删除 VS Code Server 进程');
      console.log(deleteStdout);
    }
    
    if (deleteStderr) {
      console.error('删除进程时出现错误:', deleteStderr);
    }
    
    console.log('清理完成。现在可以重新启动所有服务:');
    console.log('npm run start:all');
  });
});