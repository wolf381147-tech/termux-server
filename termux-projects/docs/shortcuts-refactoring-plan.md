# .shortcuts 目录重构计划

## 概述

.shortcuts 目录包含 58 个脚本文件，存在明显的功能冗余、重复和命名不一致问题。本文档分析了现有问题，并提出了重构计划。

## 当前问题分析

### 1. 功能冗余和重复

#### SSH 相关脚本 (11个)
- [start-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-ssh) - 基础SSH启动
- [start-ssh-optimized](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-ssh-optimized) - 优化版SSH启动（添加了唤醒锁）
- [start-ssh-with-guide](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-ssh-with-guide) - 带指南的SSH启动
- [smart-ssh-mode](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/smart-ssh-mode) - 智能SSH模式
- [quick-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/quick-ssh) - 快速SSH启动
- [ssh-service](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/ssh-service) - SSH服务管理
- [ssh-manager](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/ssh-manager) - SSH管理器
- [ssh-tutorial](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/ssh-tutorial) - SSH教程
- [start-smart-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-smart-ssh) - 启动智能SSH
- [stop-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/stop-ssh) - 停止SSH
- [show-ssh-qr](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/show-ssh-qr) - 显示SSH连接二维码

问题：
- 多个脚本功能高度相似，只是添加了一些额外功能
- 缺乏统一的SSH服务管理接口
- 重复代码多，维护困难

#### Web 相关脚本 (9个)
- [web-server](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/web-server) - Web服务器
- [web-dev-server](file:///e:/Termux%E5%A4%87%E4%BD%93/.shortcuts/web-dev-server) - Web开发服务器
- [start-web-gui](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-web-gui) - 启动Web GUI
- [start-web-manager](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-web-manager) - 启动Web管理器
- [start-web-manager-background](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/start-web-manager-background) - 后台启动Web管理器
- [stop-web-manager](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/stop-web-manager) - 停止Web管理器
- [setup-web-gui](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/setup-web-gui) - 设置Web GUI
- [web-development](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/web-development) - Web开发
- [web-file-manager-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/web-file-manager-menu) - Web文件管理器菜单

问题：
- 功能重叠，多个脚本都涉及Web服务器管理
- 命名不一致（web-server vs web-dev-server）
- 缺乏统一的Web服务管理接口

#### 备份相关脚本 (5个)
- [backup-project](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/backup-project) - 项目备份
- [backup-system](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/backup-system) - 系统备份
- [backup-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/backup-menu) - 备份菜单
- [ultimate-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/ultimate-backup) - 终极备份
- [main-menu-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/main-menu-backup) - 主菜单备份

问题：
- 功能重叠，都是备份相关
- 命名不一致（backup vs ultimate-backup）
- 缺乏统一的备份管理接口

#### 菜单相关脚本 (5个)
- [main-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/main-menu) - 主菜单
- [main-menu-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/main-menu-backup) - 主菜单备份
- [backup-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/backup-menu) - 备份菜单
- [return-to-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/return-to-menu) - 返回菜单
- [web-file-manager-menu](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/web-file-manager-menu) - Web文件管理器菜单

问题：
- 多个菜单脚本功能重复
- 命名不一致

### 2. 命名不一致问题

1. **功能相似但命名不同**：
   - start-ssh vs start-ssh-optimized vs start-ssh-with-guide
   - web-server vs web-dev-server
   - backup-project vs ultimate-backup

2. **命名格式不统一**：
   - 有些使用动词开头（start-xxx, stop-xxx）
   - 有些使用名词（web-server, ssh-service）
   - 有些使用形容词（smart-ssh-mode, optimized）

## 重构建议

### 1. 创建统一的服务管理框架

#### SSH 服务管理
将所有SSH相关脚本合并为一个统一的SSH管理器，通过参数控制不同功能：
```
ssh-manager [start|stop|status|config] [--optimized] [--with-guide] [--smart-mode]
```

#### Web 服务管理
将所有Web相关脚本合并为一个统一的Web管理器：
```
web-manager [start|stop|status|setup] [--dev] [--background] [--gui]
```

#### 备份管理
将所有备份相关脚本合并为一个统一的备份工具：
```
backup-tool [project|system|full] [--ultimate] [--list] [--restore]
```

### 2. 统一命名规范

1. **使用统一前缀**：
   - 服务管理类：`service-xxx`
   - 工具类：`tool-xxx`
   - 配置类：`config-xxx`
   - 菜单类：`menu-xxx`

2. **功能区分**：
   - 基础功能：`service-ssh`
   - 增强功能：`service-ssh-enhanced`
   - 特殊模式：`service-ssh-mode-smart`

### 3. 重构后的目录结构

```
.shortcuts/
├── service-ssh              # SSH服务管理（整合所有SSH功能）
├── service-web              # Web服务管理（整合所有Web功能）
├── tool-backup              # 备份工具（整合所有备份功能）
├── tool-file-manager        # 文件管理工具
├── menu-main                # 主菜单
├── menu-system              # 系统菜单
├── config-network           # 网络配置
├── config-system            # 系统配置
└── utils                    # 实用工具集合
```

### 4. 具体重构步骤

#### 第一阶段：分析和规划
- [x] 分析现有脚本功能
- [x] 识别重复和冗余功能
- [x] 制定重构计划

#### 第二阶段：创建新结构
- [x] 创建统一的服务管理框架
- [x] 合并功能相似的脚本
- [x] 实现统一的命令行接口

#### 第三阶段：测试和迁移
- [ ] 测试新脚本功能
- [ ] 确保向后兼容性
- [ ] 更新文档和说明

#### 第四阶段：清理和优化
- [ ] 删除冗余脚本
- [ ] 更新依赖关系
- [ ] 优化性能和用户体验

## 已完成的重构工作

### 1. 创建统一的SSH服务管理器
- 创建了 [service-ssh](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-ssh) 脚本，整合了所有SSH相关功能
- 支持多种模式：基础模式、优化模式（防息屏）、智能模式
- 提供完整的命令行接口和帮助信息

### 2. 创建统一的Web服务管理器
- 创建了 [service-web](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/service-web) 脚本，整合了所有Web相关功能
- 支持多种服务类型：Web服务器、文件管理器、Web GUI
- 支持前台和后台运行模式

### 3. 创建统一的备份工具
- 创建了 [tool-backup](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/tool-backup) 脚本，整合了所有备份相关功能
- 支持多种备份类型：项目备份、系统备份、完整备份、终极备份
- 提供备份清理和列表功能

### 4. 创建统一的菜单系统
- 创建了 [menu-main](file:///e:/Termux%E5%A4%87%E4%BB%BD/.shortcuts/menu-main) 脚本，作为所有功能的统一入口
- 提供了层次化的菜单结构，便于用户操作

## 预期收益

1. **减少文件数量**：从58个减少到15-20个
2. **提高可维护性**：统一接口，减少重复代码
3. **增强用户体验**：一致的命令和参数
4. **便于扩展**：模块化设计，易于添加新功能