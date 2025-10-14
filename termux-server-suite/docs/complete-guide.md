# Termux Server Suite 完整指南

## 目录

1. [项目概述](#项目概述)
2. [目录结构](#目录结构)
3. [核心组件](#核心组件)
4. [安装和使用](#安装和使用)
5. [开发指南](#开发指南)
6. [安全指南](#安全指南)
7. [注意事项](#注意事项)

## 项目概述

这是一个在Android设备上使用Termux构建的完整服务器解决方案。该项目提供了多种服务和监控功能，可以在移动设备上运行一个功能完备的服务器环境。

### 项目特点

- SSH服务管理
- Web服务器托管
- 系统健康检查
- 服务监控和自动恢复
- 唤醒锁管理（防止设备休眠）
- 自动化脚本集合

### 技术架构

整体架构: 基于Node.js的事件驱动架构，使用PM2作为进程管理器统一管理多个后台服务。

关键技术决策:
- 使用Node.js编写所有脚本以保证跨平台兼容性和异步处理能力
- 采用PM2进行服务进程管理和持久化运行
- 模块化设计，各服务独立运行但可通过配置协同工作

架构模式:
- 主从模式：PM2为主控进程，各服务为子进程
- 监控-恢复模式：健康检查和服务监控实现故障自愈

设计模式:
- 单例模式：用于全局配置管理（config-manager.js）
- 事件总线模式：event-bus.js实现组件间解耦通信

## 目录结构

```
termux-server-suite/
├── config/                    # 配置管理模块
│   ├── app-config.js          # 应用配置定义
│   └── config-manager.js      # 配置读取与管理
├── docs/                      # 项目文档
│   ├── complete-guide.md      # 完整指南（本文档）
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

### 目录详细说明

#### config/ - 配置管理模块

包含应用的所有配置文件和配置管理工具。

- `app-config.js` - 定义应用的默认配置参数
- `config-manager.js` - 配置读取、验证和管理工具

#### docs/ - 项目文档

包含项目的各种文档资料。

- `complete-guide.md` - 完整指南（本文档）
- `security-guide.md` - 安全配置指南

#### my-website/ - 静态网站目录

Web服务器默认托管的网站内容。

- `index.html` - 默认首页

#### system/ - 核心服务脚本

实现各种核心服务功能的脚本文件。

- `event-bus.js` - 实现事件驱动架构的中央事件总线
- `health-check.js` - 定期检查服务可用性的健康检查工具
- `service-manager.js` - 通用服务管理器，提供服务启动、停止和监控功能
- `service-monitor.js` - 监控PM2管理的服务并在服务失败时自动重启
- `start-sshd.js` - SSH服务启动和管理脚本
- `start-web.js` - Web服务器启动和管理脚本
- `wakelock-manager.js` - 管理设备唤醒锁以防止CPU休眠

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

### 已禁用的服务

**VS Code Server服务** - 曾提供基于浏览器的VS Code开发环境，但由于存在一些未解决的问题，暂时禁用。

如果你想重新启用此功能，可以查看Git历史记录中删除的`start-vscode.js`文件及相关配置。

## 安装和使用

### 环境准备

必需工具:
- Termux（Android终端模拟器）
- Node.js >=14.0.0
- Git（用于克隆项目）
- PM2（通过npm安装）

可选工具:
- VSCode（可通过start-vscode.js启动）
- Jest（用于单元测试）

### 搭建开发环境

```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install
```

### 构建、部署和运维命令

```bash
# 启动单个服务
npm run start:sshd
npm run start:web
npm run start:health-check
npm run start:service-monitor
npm run start:wakelock

# 一键启动所有服务
npm run start:all

# 停止所有服务
npm run stop:all

# 查看服务状态
npm run status

# 查看日志
npm run logs
```

### 清理残留进程

如果之前运行过包含 VS Code Server 的版本，可能有残留的进程。可以使用以下命令清理：

```
node termux-server-suite/system/cleanup-vscode.js
```

或者手动清理：
```
npm run stop:vscode
npm run delete:vscode
```

## 开发指南

### 服务架构

所有服务都通过PM2进行管理，配置文件为根目录下的 `pm2.config.js`。

#### 当前激活的服务

1. **SSH服务** - 提供SSH远程登录功能，端口8022
2. **Web服务** - 托管静态网站，端口8000
3. **健康检查服务** - 定期检查SSH和Web服务状态
4. **服务监控** - 监控并自动重启失败的服务
5. **唤醒锁管理** - 防止设备休眠影响服务运行

### 开发流程

#### 启动服务

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

#### 停止服务

```bash
# 停止所有服务
npm run stop:all
```

#### 查看服务状态

```bash
# 查看服务状态
npm run status

# 查看服务日志
npm run logs
```

### 配置管理

所有配置都在 `config/` 目录中管理，使用分层配置结构，支持环境变量覆盖。

### 测试

使用Jest进行单元测试：

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 代码规范

- 使用ESLint进行代码检查
- 遵循JavaScript Standard Style
- 所有重要功能都需要有单元测试
- 提交前确保所有测试通过

## 安全指南

### 概述

本文档旨在提供项目的安全最佳实践和指南，帮助开发者和运维人员确保系统的安全性。

### 安全措施

#### 1. 避免硬编码敏感信息

项目中所有路径和敏感配置都已从代码中移除，改为通过环境变量或配置文件管理：

- Web服务器目录：使用 `WEBSITE_DIR` 环境变量配置
- 日志目录：使用 `LOGS_DIR` 环境变量配置
- 临时文件目录：使用 `TEMP_DIR` 环境变量配置
- PID文件目录：使用 `PID_DIR` 环境变量配置

#### 2. 命令执行安全

为了防止命令注入攻击，所有模块都实现了命令安全检查机制：

##### 服务管理器安全检查
- 限制可执行的命令类型
- 禁止危险命令如 `rm -rf`、`format` 等
- 对所有执行的命令进行安全验证

##### 唤醒锁管理器安全检查
- 仅允许预定义的Termux安全命令
- 包括 `termux-wake-lock`、`termux-wake-unlock`、`termux-battery-status`

##### 服务监控器安全检查
- 仅允许PM2相关命令
- 使用正则表达式验证命令格式
- 限制服务名称字符集

#### 3. 环境变量安全

使用环境变量管理敏感配置具有以下优势：

1. **避免代码泄露**：敏感信息不会出现在代码中
2. **环境隔离**：不同环境可以使用不同的配置
3. **权限控制**：环境变量可以通过系统权限进行控制

### 安全配置示例

#### 设置安全的环境变量

在Linux/Termux环境下：

```bash
# 创建安全的配置目录
mkdir -p $HOME/termux-config
mkdir -p $HOME/termux-logs

# 设置环境变量
export WEBSITE_DIR="$HOME/storage/shared/my-website"
export LOGS_DIR="$HOME/termux-logs"
export TEMP_DIR="$HOME/termux-config/temp"
export PID_DIR="$HOME/termux-config/pids"
```

#### 权限设置

确保配置目录具有适当权限：

```bash
# 设置目录权限
chmod 700 $HOME/termux-config
chmod 700 $HOME/termux-logs
```

### 安全审计清单

在部署前，请检查以下项目：

- [ ] 所有路径配置都使用环境变量而非硬编码
- [ ] 没有在代码中存储密码或密钥
- [ ] 命令执行都经过安全验证
- [ ] 敏感目录具有适当权限
- [ ] 环境变量已正确设置
- [ ] 防火墙规则已配置（如适用）

### 常见安全问题及解决方案

#### 1. 路径遍历攻击

**问题**：恶意用户可能尝试访问系统其他目录。

**解决方案**：
- 使用环境变量配置路径
- 限制Web服务器可访问的目录
- 实施严格的输入验证

#### 2. 命令注入

**问题**：恶意输入可能导致执行意外命令。

**解决方案**：
- 实施命令白名单机制
- 验证所有执行的命令
- 避免直接使用用户输入构造命令

## 注意事项

- 请勿将敏感信息提交到版本控制系统
- 在公网环境下运行服务时，请确保采取适当的安全措施
- 长时间运行唤醒锁可能会消耗电池电量
- 长时间运行可能被Android系统杀死后台进程
- 电池消耗较大，不适合长时间无人值守运行
- 某些设备可能不支持持续唤醒锁

## 贡献

欢迎提交Issue和Pull Request来改进项目。