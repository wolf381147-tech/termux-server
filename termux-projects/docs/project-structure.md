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
- [server-monitor](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/server-monitor) - 服务器监控面板
- [service-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-ssh) - SSH服务统一管理器
- [service-web](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-web) - Web服务统一管理器
- [tool-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/tool-backup) - 系统状态快照工具

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

## 技术栈说明

### 核心技术
- **Node.js** - 服务运行时环境
- **PM2** - 生产环境进程管理器
- **Nodemon** - 开发环境自动重启工具

### 依赖管理
- **npm** - 包管理器
- **package.json** - 项目依赖和脚本配置

### 测试框架
- **Jest** - JavaScript测试框架

### 版本控制
- **Git** - 代码版本控制

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
├── 🔐 SSH 服务管理
│   ├── 🔁 切换SSH服务状态
│   ├── ▶️ 启动优化SSH服务（防息屏断联）
│   └── 📊 查看SSH状态和连接信息
├── 🌐 Web 服务管理
│   ├── 🔁 切换Web服务器状态
│   └── 📊 查看Web状态和连接信息
├── 💾 系统状态快照工具
│   ├── 📸 创建系统状态快照
│   ├── 📋 列出快照文件
│   └── 🧹 清理旧快照
├── 📊 系统状态
└── 🚪 退出
```