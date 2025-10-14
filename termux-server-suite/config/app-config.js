// 应用配置文件
module.exports = {
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
    enableBatteryCheck: true, // 是否启用电池检查
    minBatteryLevel: 20, // 最低电池百分比
    autoReleaseOnLowBattery: true // 低电量时自动释放唤醒锁
  },

  // Web服务器配置
  webServer: {
    port: 8000,
    host: '0.0.0.0',
    directory: process.env.WEBSITE_DIR || './my-website', // 使用环境变量或默认值
    enableCors: false, // 是否启用CORS
    customHeaders: {} // 自定义HTTP头
  },

  // SSH服务器配置
  sshServer: {
    port: 8022,
    enablePasswordAuth: true, // 是否启用密码认证
    enablePubkeyAuth: true // 是否启用公钥认证
  },

  // 日志配置
  logging: {
    level: 'info',
    dir: process.env.LOGS_DIR || './logs', // 使用环境变量或默认值
    maxSize: '10m',
    maxFiles: '14d'
  },
  
  // 系统配置
  system: {
    tempDir: process.env.TEMP_DIR || '/tmp/termux-server', // 使用环境变量或默认值
    pidDir: process.env.PID_DIR || '/tmp/termux-server/pids', // 使用环境变量或默认值
    maxConcurrentJobs: 5
  },
  
  // 安全配置
  security: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 100,
    blockDuration: 300000 // 5分钟
  }
};