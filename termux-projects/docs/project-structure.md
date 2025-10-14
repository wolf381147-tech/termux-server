# 项目结构说明

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
├── file-manager/        # 文件管理工具
├── data-science/        # 数据科学相关脚本
├── scripts/             # 实用脚本
├── web-gui/             # Web图形界面
└── projects/            # 其他项目文件
```

## 目录详细说明

### config/
存放项目的配置文件，如 [app-config.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/config/app-config.js) 等。

### docs/
项目相关文档，包括：
- 配置使用说明
- 事件驱动架构文档
- 项目结构说明
- 重构总结
- 测试指南
- 安全指南
- 快捷脚本重构计划

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
- [menu-main](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/menu-main) - 主菜单系统
- [service-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-ssh) - SSH服务统一管理器
- [service-web](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-web) - Web服务统一管理器
- [tool-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/tool-backup) - 备份工具统一管理器

### my-website/
默认托管的网站文件，通过Python HTTP服务器提供访问。

### 其他功能目录
- [file-manager/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/file-manager/) - 文件管理工具
- [data-science/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/data-science/) - 数据科学相关脚本
- [scripts/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/scripts/) - 实用脚本
- [web-gui/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/web-gui/) - Web图形界面
- [projects/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/projects/) - 其他项目文件

## 文件说明

### 核心服务文件 (位于 [system/](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/) 目录)

1. [start-sshd.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/start-sshd.js) - SSH服务启动和管理
2. [start-web.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/start-web.js) - Web服务器启动和管理
3. [health-check.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/health-check.js) - 系统健康检查服务
4. [service-monitor.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/service-monitor.js) - 服务监控和自动恢复
5. [wakelock-manager.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/wakelock-manager.js) - 设备唤醒锁管理
6. [service-manager.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/service-manager.js) - 通用服务管理器
7. [event-bus.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/event-bus.js) - 中央事件总线

## 运行和管理

使用PM2进行服务管理，配置文件位于项目根目录的 [pm2.config.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/pm2.config.js)。

### 启动所有服务
```bash
npm run start:all
```

### 停止所有服务
```bash
npm run stop:all
```

### 查看服务状态
```bash
npm run status
```

### 查看服务日志
```bash
npm run logs
```

### 单独启动某个服务
```bash
npm run start:sshd
npm run start:web
npm run start:health-check
npm run start:service-monitor
npm run start:wakelock
```

### 使用快捷脚本
```bash
# SSH服务管理
~/.shortcuts/service-ssh start --optimized
~/.shortcuts/service-ssh stop
~/.shortcuts/service-ssh info

# Web服务管理
~/.shortcuts/service-web start --type server
~/.shortcuts/service-web start --type manager --background
~/.shortcuts/service-web stop --type server

# 备份工具
~/.shortcuts/tool-backup backup --type project
~/.shortcuts/tool-backup backup --type ultimate
~/.shortcuts/tool-backup list

# 主菜单系统
~/.shortcuts/menu-main
```