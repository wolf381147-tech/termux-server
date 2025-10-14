# Termux Server Project

这是一个在Android设备上使用Termux构建的完整服务器解决方案。该项目提供了多种服务和监控功能，可以在移动设备上运行一个功能完备的服务器环境。

## 项目特点

- SSH服务管理
- Web服务器托管
- 系统健康检查
- 服务监控和自动恢复
- 唤醒锁管理（防止设备休眠）
- 自动化脚本集合

## 目录结构

```
termux-server-suite/
├── system/              # 核心系统服务
├── my-website/          # 默认托管网站
├── config/              # 配置文件
└── docs/                # 项目文档
```

## 核心组件

### 1. SSH服务 (start-sshd.js)
启动和管理SSH服务，允许远程连接到设备。

### 2. Web服务器 (start-web.js)
启动Python HTTP服务器托管静态网站。

### 3. 健康检查 (health-check.js)
定期检查关键服务的可用性：
- SSH服务 (端口 8022)
- Web服务 (端口 8000)

### 4. 服务监控 (service-monitor.js)
监控PM2管理的服务并在服务停止时自动重启。

### 5. 唤醒锁管理 (wakelock-manager.js)
管理设备唤醒锁，防止CPU进入休眠状态。

## 安装和使用

1. 克隆项目到Termux环境中：
   ```
   git clone <repository-url>
   ```

2. 安装依赖（如果有的话）：
   ```
   npm install
   ```

3. 使用Node.js运行相应服务：
   ```
   node termux-server-suite/system/start-sshd.js
   node termux-server-suite/system/start-web.js
   node termux-server-suite/system/health-check.js
   node termux-server-suite/system/service-monitor.js
   node termux-server-suite/system/wakelock-manager.js
   ```

## 配置

项目的配置文件位于 `termux-server-suite/config/` 目录中，包括连接信息和SSH配置。

## 注意事项

- 请勿将敏感信息提交到版本控制系统
- 在公网环境下运行服务时，请确保采取适当的安全措施
- 长时间运行唤醒锁可能会消耗电池电量

## 贡献

欢迎提交Issue和Pull Request来改进项目。