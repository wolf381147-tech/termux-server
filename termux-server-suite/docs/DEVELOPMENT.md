# 开发指南

## 项目结构

```
termux-server-suite/
├── config/                    # 配置文件
│   ├── app-config.js          # 应用配置
│   └── config-manager.js      # 配置管理器
├── system/                    # 核心系统服务
│   ├── start-sshd.js          # SSH服务启动器
│   ├── start-web.js           # Web服务启动器
│   ├── health-check.js        # 健康检查服务
│   ├── service-monitor.js     # 服务监控器
│   ├── service-manager.js     # 通用服务管理器
│   ├── wakelock-manager.js    # 唤醒锁管理器
│   └── event-bus.js           # 事件总线
├── my-website/                # 默认托管网站
└── docs/                      # 项目文档
```

## 服务架构

所有服务都通过PM2进行管理，配置文件为根目录下的 `pm2.config.js`。

### 当前激活的服务

1. **SSH服务** - 提供SSH远程登录功能，端口8022
2. **Web服务** - 托管静态网站，端口8000
3. **健康检查服务** - 定期检查SSH和Web服务状态
4. **服务监控** - 监控并自动重启失败的服务
5. **唤醒锁管理** - 防止设备休眠影响服务运行

### 已禁用的服务

**VS Code Server服务** - 曾提供基于浏览器的VS Code开发环境，但由于存在一些未解决的问题，暂时禁用。

如果你想重新启用此功能，可以查看Git历史记录中删除的`start-vscode.js`文件及相关配置。

## 开发流程

### 启动服务

```bash
# 启动所有服务
npm run start:all

# 启动单个服务
npm run start:sshd
npm run start:web
npm run start:health-check
npm run start:service-monitor
npm run start:wakelock
```

### 停止服务

```bash
# 停止所有服务
npm run stop:all
```

### 查看服务状态

```bash
# 查看服务状态
npm run status

# 查看服务日志
npm run logs
```

## 配置管理

所有配置都在 `config/` 目录中管理，使用分层配置结构，支持环境变量覆盖。

## 测试

使用Jest进行单元测试：

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 代码规范

- 使用ESLint进行代码检查
- 遵循JavaScript Standard Style
- 所有重要功能都需要有单元测试
- 提交前确保所有测试通过