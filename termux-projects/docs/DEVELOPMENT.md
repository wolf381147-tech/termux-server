# 开发指南

## 目录结构

```
termux-projects/
├── config/              # 配置文件目录
├── docs/                # 项目文档目录
├── system/              # 核心系统服务
│   ├── start-sshd.js      # SSH服务管理
│   ├── start-web.js       # Web服务器管理
│   ├── health-check.js    # 健康检查服务
│   ├── service-monitor.js # 服务监控
│   ├── wakelock-manager.js# 唤醒锁管理
│   ├── service-manager.js # 通用服务管理器
│   └── event-bus.js       # 事件总线
├── my-website/          # 默认托管网站
├── projects/            # 其他项目文件
└── tests/               # 测试文件
```

## 架构说明

### 事件驱动架构

项目采用事件驱动架构，通过中央事件总线实现模块间的解耦通信。各模块可以通过发布和订阅事件来进行通信，而无需直接调用彼此的方法。

#### 事件总线

事件总线是系统的核心组件，负责事件的发布和订阅。所有模块都通过同一个事件总线实例进行通信。

核心方法:
1. `subscribe(event, callback)` - 订阅事件
2. `unsubscribe(event, callback)` - 取消订阅事件
3. `publish(event, data)` - 发布事件

#### 已定义的事件

##### 健康检查相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `health.check.started` | 健康检查启动时 | `{ timestamp }` |
| `health.check.completed` | 健康检查完成时 | `{ results, timestamp }` |
| `health.check.stopped` | 健康检查停止时 | `{ timestamp }` |
| `service.health.ok` | 服务健康检查正常时 | `{ service, timestamp }` |
| `service.health.failed` | 服务健康检查异常时 | `{ service, timestamp, error }` |

##### 服务监控相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `service.started` | 服务启动时 | `{ service, pid }` |
| `service.stopped` | 服务停止时 | `{ service }` |
| `service.restarted` | 服务重启时 | `{ service, pid }` |
| `service.health.failed` | 服务健康检查失败时 | `{ service, error }` |

##### 唤醒锁相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `wakelock.acquired` | 获取唤醒锁时 | `{ timestamp }` |
| `wakelock.released` | 释放唤醒锁时 | `{ timestamp }` |

### 配置管理

项目使用集中式配置管理系统，所有服务参数都通过 app-config.js 文件进行管理。配置项支持通过环境变量进行覆盖，以适应不同的部署环境。

配置结构:
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
  }
}
```

## 核心组件

### 通用服务管理器

创建了 ServiceManager 类，统一处理服务的启动、停止和监控逻辑。

优势：
- 通过 ServiceManager 统一管理所有服务
- 减少了约60%的服务管理代码重复
- 添加新服务类型只需配置参数，无需编写新的管理逻辑
- 一致的事件发布机制

### 快捷脚本重构

将原有的 60 多个功能重复的脚本精简为 4 个统一管理脚本：
- menu-main - 主菜单系统
- service-ssh - SSH服务统一管理器
- service-web - Web服务统一管理器
- tool-backup - 系统状态快照工具

## 安全措施

### 避免硬编码敏感信息

项目中所有路径和敏感配置都已从代码中移除，改为通过环境变量或配置文件管理：

- Web服务器目录：使用 `WEBSITE_DIR` 环境变量配置
- 日志目录：使用 `LOGS_DIR` 环境变量配置
- 临时文件目录：使用 `TEMP_DIR` 环境变量配置
- PID文件目录：使用 `PID_DIR` 环境变量配置

### 命令执行安全

为了防止命令注入攻击，所有模块都实现了命令安全检查机制：

#### 服务管理器安全检查
- 限制可执行的命令类型
- 禁止危险命令如 `rm -rf`、`format` 等
- 对所有执行的命令进行安全验证

#### 唤醒锁管理器安全检查
- 仅允许预定义的Termux安全命令
- 包括 `termux-wake-lock`、`termux-wake-unlock`、`termux-battery-status`

#### 服务监控器安全检查
- 仅允许安全的服务管理命令
- 包括 `sshd`、`python3 -m http.server` 等