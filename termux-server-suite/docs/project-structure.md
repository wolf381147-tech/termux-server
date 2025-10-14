# 项目结构说明

## 总体结构

```
termux-server-suite/
├── config/                    # 配置管理模块
│   ├── app-config.js          # 应用配置定义
│   └── config-manager.js      # 配置读取与管理
├── docs/                      # 项目文档
│   ├── DEVELOPMENT.md         # 开发指南
│   ├── project-structure.md   # 项目结构说明
│   └── security-guide.md      # 安全配置指南
├── my-website/                # 静态网站根目录
│   └── index.html             # 默认首页
└── system/                    # 核心服务脚本
    ├── event-bus.js           # 事件通信总线
    ├── health-check.js        # 服务健康检测
    ├── service-manager.js     # 服务管理接口
    ├── service-monitor.js     # PM2服务监控器
    ├── start-sshd.js          # SSH服务启动器
    ├── start-web.js           # Web服务器启动器
    └── wakelock-manager.js    # 唤醒锁管理器
```

## 目录详细说明

### config/ - 配置管理模块

包含应用的所有配置文件和配置管理工具。

- [app-config.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/config/app-config.js) - 定义应用的默认配置参数
- [config-manager.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/config/config-manager.js) - 配置读取、验证和管理工具

### docs/ - 项目文档

包含项目的各种文档资料。

- [DEVELOPMENT.md](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/docs/DEVELOPMENT.md) - 开发指南，包含开发流程、代码规范等
- [project-structure.md](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/docs/project-structure.md) - 项目结构说明文档
- [security-guide.md](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/docs/security-guide.md) - 安全配置指南

### my-website/ - 静态网站目录

Web服务器默认托管的网站内容。

- [index.html](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/my-website/index.html) - 默认首页

### system/ - 核心服务脚本

实现各种核心服务功能的脚本文件。

- [event-bus.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/event-bus.js) - 实现事件驱动架构的中央事件总线
- [health-check.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/health-check.js) - 定期检查服务可用性的健康检查工具
- [service-manager.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/service-manager.js) - 通用服务管理器，提供服务启动、停止和监控功能
- [service-monitor.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/service-monitor.js) - 监控PM2管理的服务并在服务失败时自动重启
- [start-sshd.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/start-sshd.js) - SSH服务启动和管理脚本
- [start-web.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/start-web.js) - Web服务器启动和管理脚本
- [wakelock-manager.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/wakelock-manager.js) - 管理设备唤醒锁以防止CPU休眠

## 注意事项

VS Code Server 服务（曾位于 [start-vscode.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-server-suite/system/start-vscode.js)）由于存在一些未解决的问题，暂时从项目中移除。相关文件保留在Git历史记录中，如有需要可恢复。