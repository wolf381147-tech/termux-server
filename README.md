# Termux Server Suite

一个在 Android 设备上使用 Termux 构建的完整服务器解决方案。该项目提供多种服务和监控功能，可以在移动设备上运行功能完备的服务器环境。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Termux](https://img.shields.io/badge/termux-project-blue)](https://github.com/termux/termux-app)

## 功能特性

- 🔐 SSH 服务管理 - 安全远程访问
- 🌐 Web 服务器托管 - 静态网站服务
- 💻 VS Code Server - 浏览器中的完整VS Code环境
- 🏥 系统健康检查 - 服务可用性监控
- 🛡️ 服务监控与自动恢复 - 保证服务持续运行
- 🔋 唤醒锁管理 - 防止设备休眠导致服务中断
- 📊 统一监控面板 - 通过浏览器实时查看系统状态
- 🚀 快捷脚本系统 - 简化日常操作

## 目录结构

```
.
├── termux-server-suite/
│   ├── system/           # 核心系统服务
│   ├── my-website/       # 服务器监控面板
│   ├── config/           # 配置文件
│   └── docs/             # 项目文档
├── .shortcuts/           # Termux 快捷脚本
└── pm2.config.js         # PM2 配置文件
```

## 核心组件

### 1. SSH 服务管理 (`start-sshd.js`)
启动和管理 SSH 服务，允许安全远程连接到设备。

### 2. Web 服务器 (`start-web.js`)
启动 Python HTTP 服务器托管静态网站和监控面板。

### 3. VS Code Server (`start-vscode.js`)
启动 code-server 服务，通过浏览器访问完整的 VS Code 环境，方便项目开发。

### 4. 健康检查 (`health-check.js`)
定期检查关键服务的可用性：
- SSH 服务 (端口 8022)
- Web 服务 (端口 8000)
- VS Code Server (端口 8080)

### 5. 服务监控 (`service-monitor.js`)
监控 PM2 管理的服务并在服务停止时自动重启。

### 6. 唤醒锁管理 (`wakelock-manager.js`)
管理设备唤醒锁，防止 CPU 进入休眠状态。

### 7. 统一监控面板 (`my-website/index.html`)
通过浏览器访问的实时服务器监控面板，提供系统状态、服务信息和日志查看功能。

## 安装说明

### 前置要求
- [Termux](https://termux.com/) 应用已安装
- 设备已连接网络

### 安装步骤

1. 克隆项目到 Termux 环境中：
   ```bash
   git clone <repository-url>
   cd termux-server-suite
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动所有服务：
   ```bash
   npm run start:all
   ```

## 使用方法

### 命令行方式

```bash
# 启动所有服务
npm run start:all

# 停止所有服务
npm run stop:all

# 重启所有服务
npm run restart:all

# 查看服务状态
npm run status

# 查看服务日志
npm run logs

# 单独启动某个服务（开发环境）
npm run dev:sshd
npm run dev:web
npm run dev:vscode
npm run dev:health-check
npm run dev:service-monitor
npm run dev:wakelock
```

### 快捷脚本方式

Termux 提供了图形化快捷菜单，可以通过 Termux 的通知栏快速访问：

1. 打开 Termux 应用
2. 下拉通知栏
3. 点击 "Termux:Widget" 通知
4. 选择相应功能

快捷脚本包括：
- 🖥️ 服务器监控面板
- 💾 系统状态快照工具
- 🚪 退出菜单

## VS Code Server 使用说明

项目集成了 VS Code Server，允许你通过浏览器访问完整的 VS Code 环境，方便开发和调试项目。

### 启动 VS Code Server
```bash
npm run start:vscode
```

### 访问 VS Code
启动服务后，可以通过以下地址访问 VS Code：
```
http://[设备IP地址]:8080
```

例如：
```
http://192.168.1.100:8080
```

### 安全说明
默认情况下，VS Code Server 配置为无需认证即可访问，这在本地开发环境中很方便，但在公共网络中可能存在安全风险。建议在生产环境中通过SSH隧道访问。

## 配置管理

项目的配置文件位于 `termux-server-suite/config/` 目录中。支持通过环境变量覆盖默认配置，详情请参考 [开发指南](termux-server-suite/docs/DEVELOPMENT.md)。

## 安全说明

- 请勿将敏感信息提交到版本控制系统
- 在公网环境下运行服务时，请确保采取适当的安全措施
- 长时间运行唤醒锁可能会消耗电池电量
- 详细安全指南请参考 [开发指南](termux-server-suite/docs/DEVELOPMENT.md)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。请参考 [开发指南](termux-server-suite/docs/DEVELOPMENT.md) 了解项目架构和开发规范。

## 许可证

本项目采用 MIT 许可证，详情请参考 [LICENSE](LICENSE) 文件。