# 开发指南

## 目录结构

```
termux-server-suite/
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
├── my-website/          # 服务器监控网页
└── tests/               # 测试文件
```

## 目录详细说明

### config/
存放项目的配置文件，如 app-config.js 等。

### docs/
项目相关文档，包括开发指南和安全指南。

### system/
核心系统服务模块，包含所有基础服务的实现：
- SSH服务管理
- Web服务器管理
- 健康检查服务
- 服务监控
- 唤醒锁管理
- 通用服务管理器
- 事件总线

### .shortcuts/
Termux快捷脚本目录，包含统一的服务管理脚本：
- menu-main - 主菜单系统
- server-monitor - 服务器监控面板
- service-ssh - SSH服务统一管理器
- service-web - Web服务统一管理器
- tool-backup - 系统状态快照工具

### my-website/
服务器监控网页，通过Python HTTP服务器提供访问。

## 技术栈说明

### 核心技术
- **Node.js** - 服务运行时环境
- **PM2** - 生产环境进程管理器
- **Nodemon** - 开发环境自动重启工具

### 依赖管理
- **npm** - 包管理器
- **package.json** - 项目依赖和脚本配置

## 网络命令兼容性

为了在未root的Android设备上更好地工作，项目中的网络信息获取功能采用了多种方法：

1. **ip命令** - 标准Linux网络工具
2. **ifconfig命令** - 传统Unix网络工具，在某些设备上更稳定
3. **netcfg命令** - Android特定网络工具
4. **hostname命令** - 系统主机名工具
5. **系统文件读取** - 直接读取网络接口信息

这些方法按顺序尝试，确保在各种Android设备和Termux环境中都能正确获取网络信息。

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

为了防止命令注入攻击，所有模块都实现了命令安全检查机制。

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

### 网络安全

#### 端口管理

项目使用以下端口：

1. **SSH服务**：默认端口 8022
2. **Web服务**：默认端口 8000

#### 防火墙建议

建议在公网环境下运行时采取以下措施：

1. 使用防火墙限制对特定IP地址的访问
2. 定期更新系统和软件包
3. 使用强密码和密钥认证

### 数据保护

#### 日志安全

- 日志文件不包含敏感信息
- 日志文件定期轮转以避免占用过多存储空间
- 日志文件存储在安全的位置

#### 备份安全

备份工具不包含任何敏感信息，仅备份系统状态和已安装包列表。

### 安全最佳实践

#### 权限管理

1. 仅授予必要的权限
2. 定期审查权限设置
3. 使用最小权限原则

#### 更新管理

1. 定期更新Termux和相关包
2. 关注安全公告
3. 及时应用安全补丁

#### 监控和审计

1. 启用日志记录
2. 定期检查日志
3. 监控异常活动

### 故障排除

#### 常见安全问题

1. **端口冲突**：确保端口未被其他应用占用
2. **权限问题**：检查文件和目录权限
3. **网络连接**：验证网络配置和防火墙设置

#### 安全检查清单

- [ ] 检查配置文件中的敏感信息
- [ ] 验证命令执行安全性
- [ ] 确认网络端口配置
- [ ] 检查文件权限设置
- [ ] 验证日志记录配置

## 运行和管理

### 启动所有服务
```bash
npm run start:all
```

### 停止所有服务
```bash
npm run stop:all
```

### 重启所有服务
```bash
npm run restart:all
```

### 查看服务状态
```bash
npm run status
```

### 查看服务日志
```bash
npm run logs
```

### 监控服务
```bash
npm run monit
```

### 单独启动某个服务（开发环境）
```bash
npm run dev:sshd
npm run dev:web
npm run dev:health-check
npm run dev:service-monitor
npm run dev:wakelock
```

### 单独启动某个服务（生产环境）
```bash
npm run start:sshd
npm run start:web
npm run start:health-check
npm run start:service-monitor
npm run start:wakelock
```

### 使用快捷脚本
```bash
# 服务器监控面板
~/.shortcuts/server-monitor

# SSH服务管理
~/.shortcuts/service-ssh start --optimized
~/.shortcuts/service-ssh stop
~/.shortcuts/service-ssh toggle
~/.shortcuts/service-ssh info

# Web服务管理
~/.shortcuts/service-web start --type server
~/.shortcuts/service-web start --type manager --background
~/.shortcuts/service-web stop --type server
~/.shortcuts/service-web toggle --type server
~/.shortcuts/service-web info --type server

# 系统状态快照工具
~/.shortcuts/tool-backup snapshot
~/.shortcuts/tool-backup list

# 主菜单系统
~/.shortcuts/menu-main
```

### 菜单系统结构
```
🚀 Termux 服务器项目
├── 🖥️  服务器监控面板
│   ├── 🔄 重启所有服务
│   ├── ⏹️ 停止所有服务
│   ├── ▶️ 启动所有服务
│   ├── 📊 刷新监控面板
│   └── 📋 查看服务日志
├── 💾 备份工具
├── 📊 系统状态
└── 🚪 退出
```