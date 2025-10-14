# 配置管理系统使用说明

## 概述

项目采用集中式配置管理，所有配置参数都定义在 [config/app-config.js](file:///e:/Termux%E5%A4%87%E4%BD%9C/app-config.js) 文件中。通过 [config/config-manager.js](file:///e:/Termux%E5%A4%87%E4%BD%9C/config-manager.js) 提供的工具来读取和管理配置。

## 配置结构

```javascript
{
  // 健康检查配置
  healthCheck: {
    checks: [...],           // 检查项列表
    checkInterval: 30000,    // 检查间隔(毫秒)
    timeout: 5000            // 超时时间(毫秒)
  },

  // 服务监控配置
  serviceMonitor: {
    services: [...],         // 监控的服务列表
    checkInterval: 60000,    // 检查间隔(毫秒)
    maxRetries: 3            // 最大重启重试次数
  },

  // 唤醒锁配置
  wakelock: {
    checkInterval: 30000,           // 检查间隔(毫秒)
    enableBatteryCheck: true,       // 是否启用电池检查
    minBatteryLevel: 20,            // 最低电池百分比
    autoReleaseOnLowBattery: true   // 低电量时自动释放唤醒锁
  },

  // Web服务器配置
  webServer: {
    port: 8000,              // 端口号
    host: '0.0.0.0',         // 监听地址
    directory: '...',        // 网站目录
    enableCors: false,       // 是否启用CORS
    customHeaders: {}        // 自定义HTTP头
  },

  // SSH服务器配置
  sshServer: {
    port: 8022,                   // SSH端口号
    enablePasswordAuth: true,     // 是否启用密码认证
    enablePubkeyAuth: true        // 是否启用公钥认证
  },

  // 日志配置
  logging: {
    level: 'info',           // 日志级别
    dir: './logs',           // 日志目录
    maxSize: '10m',          // 单个日志文件最大大小
    maxFiles: '14d'          // 日志保留时间
  },
  
  // 系统配置
  system: {
    tempDir: '/tmp/termux-server',      // 临时目录
    pidDir: '/tmp/termux-server/pids',  // PID文件目录
    maxConcurrentJobs: 5                // 最大并发任务数
  },
  
  // 安全配置
  security: {
    enableRateLimiting: true,      // 是否启用速率限制
    maxRequestsPerMinute: 100,     // 每分钟最大请求数
    blockDuration: 300000          // 封禁时长(毫秒)
  }
}
```

## 使用方法

### 1. 引入配置管理器

```javascript
// 引入整个配置对象
const config = require('../config/config-manager').config;

// 或者引入配置读取函数
const { get, getOrDefault } = require('../config/config-manager');
```

### 2. 读取配置值

```javascript
// 直接读取配置值
const sshPort = config.sshServer.port;

// 使用get函数通过路径读取
const sshPort = get('sshServer.port');

// 使用getOrDefault函数提供默认值
const sshPort = getOrDefault('sshServer.port', 22);
```

### 3. 在代码中使用配置

```javascript
const config = require('../config/config-manager');
const sshPort = config.get('sshServer.port');
const checkInterval = config.get('healthCheck.checkInterval');
```

## 配置验证

配置管理器会在初始化时自动验证配置的有效性：

- 端口号必须在1-65535范围内
- 检查间隔建议不小于1000毫秒
- 电池电量阈值必须在0-100范围内

如果配置无效，会抛出错误或警告信息。

## 扩展配置

要添加新的配置项，只需在 [app-config.js](file:///e:/Termux%E5%A4%87%E4%BD%9C/app-config.js) 中添加相应的字段，并在使用的地方通过配置管理器读取即可。

### 示例：添加数据库配置

1. 在 [app-config.js](file:///e:/Termux%E5%A4%87%E4%BD%9C/app-config.js) 中添加：
```javascript
module.exports = {
  // ... 其他配置
  database: {
    host: 'localhost',
    port: 3306,
    name: 'termux_server',
    user: 'user',
    password: 'password'
  }
};
```

2. 在代码中使用：
```javascript
const { get } = require('../config/config-manager');
const dbConfig = get('database');
```