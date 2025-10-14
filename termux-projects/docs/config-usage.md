# 配置使用说明

## 概述

项目使用集中式配置管理系统，所有服务参数都通过 [app-config.js](file:///e:/Termux%E5%A4%87%E4%BD%93/config/app-config.js) 文件进行管理。配置项支持通过环境变量进行覆盖，以适应不同的部署环境。

## 配置结构

```javascript
{
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
    directory: process.env.WEBSITE_DIR || './my-website', // 网站目录
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
    dir: process.env.LOGS_DIR || './logs', // 日志目录
    maxSize: '10m',
    maxFiles: '14d'
  },
  
  // 系统配置
  system: {
    tempDir: process.env.TEMP_DIR || '/tmp/termux-server', // 临时目录
    pidDir: process.env.PID_DIR || '/tmp/termux-server/pids', // PID文件目录
    maxConcurrentJobs: 5
  },
  
  // 安全配置
  security: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 100,
    blockDuration: 300000 // 5分钟
  }
}
```

## 环境变量配置

为了提高安全性和灵活性，部分敏感或环境相关的配置项可以通过环境变量进行设置：

| 环境变量 | 对应配置项 | 默认值 | 说明 |
|---------|----------|-------|-----|
| `WEBSITE_DIR` | `webServer.directory` | `./my-website` | Web服务器托管目录 |
| `LOGS_DIR` | `logging.dir` | `./logs` | 日志文件存储目录 |
| `TEMP_DIR` | `system.tempDir` | `/tmp/termux-server` | 临时文件目录 |
| `PID_DIR` | `system.pidDir` | `/tmp/termux-server/pids` | PID文件目录 |

### 设置环境变量示例

在Linux/Termux环境下设置环境变量：

```bash
export WEBSITE_DIR="/data/data/com.termux/files/home/storage/shared/my-website"
export LOGS_DIR="/data/data/com.termux/files/home/logs"
```

在Windows环境下设置环境变量：

```cmd
set WEBSITE_DIR=C:\Users\%USERNAME%\termux-projects\my-website
set LOGS_DIR=C:\Users\%USERNAME%\termux-projects\logs
```

## 配置读取方法

使用配置管理器读取配置项：

```javascript
const { get, getOrDefault } = require('../config/config-manager');

// 读取配置项
const sshPort = get('sshServer.port');
const webDir = get('webServer.directory');

// 读取配置项，带默认值
const maxRetries = getOrDefault('serviceMonitor.maxRetries', 3);
```

## 安全性考虑

1. **避免硬编码敏感路径**：使用环境变量配置敏感路径，避免在代码中硬编码
2. **权限控制**：确保配置文件和相关目录具有适当的访问权限
3. **定期审查**：定期审查配置项，确保没有泄露敏感信息

## 最佳实践

1. **使用环境变量**：对于环境相关的配置，优先使用环境变量
2. **配置验证**：系统会在启动时验证配置的有效性
3. **文档更新**：新增配置项时，及时更新本文档
4. **安全审计**：定期检查配置文件中是否包含敏感信息