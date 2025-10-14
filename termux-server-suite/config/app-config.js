// 应用配置文件
// 所有路径配置都支持通过环境变量覆盖

const path = require('path');

// 基础目录配置，支持通过环境变量覆盖
const WEBSITE_DIR = process.env.WEBSITE_DIR || path.join(__dirname, '../my-website');
const LOGS_DIR = process.env.LOGS_DIR || path.join(__dirname, '../logs');
const TEMP_DIR = process.env.TEMP_DIR || '/data/data/com.termux/files/usr/tmp';
const PID_DIR = process.env.PID_DIR || '/data/data/com.termux/files/usr/tmp';

module.exports = {
  // 网站目录
  websiteDir: WEBSITE_DIR,
  
  // 日志目录
  logsDir: LOGS_DIR,
  
  // 临时文件目录
  tempDir: TEMP_DIR,
  
  // PID文件目录
  pidDir: PID_DIR,
  
  // 健康检查配置
  healthCheck: {
    checks: [
      { name: 'SSH', port: 8022, type: 'tcp' },
      { name: 'Web', port: 8000, type: 'http' }
    ],
    checkInterval: 30000, // 30秒检查一次
    timeout: 5000 // 连接超时时间
  },

  // 服务监控配置
  serviceMonitor: {
    services: ['sshd', 'webserver'],
    checkInterval: 60000, // 1分钟检查一次
    maxRetries: 3 // 最大重启重试次数
  },

  // 唤醒锁配置
  wakelock: {
    checkInterval: 30000, // 30秒检查一次
    enableBatteryCheck: true // 是否启用电池检查
  }
};