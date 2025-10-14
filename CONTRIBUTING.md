# 贡献指南

欢迎对 Termux Server Suite 项目的贡献！我们很高兴您有兴趣帮助改进这个项目。在提交贡献之前，请花点时间阅读以下指南。

## 行为准则

本项目遵循 [Termux 行为准则](https://github.com/termux/termux-app/blob/master/CODE_OF_CONDUCT.md)。参与本项目即表示您同意遵守其条款。

## 如何贡献

### 报告 Bug

如果您在 Termux Server Suite 中发现了 Bug，请在 GitHub 上创建一个 Issue，并包含以下信息：

- 清晰简洁的标题
- 描述您期望发生的事情和实际发生的事情
- 重现问题的步骤
- 您的环境信息（Termux 版本、Android 版本等）
- 相关的日志输出或截图

### 提交功能请求

如果您有改进 Termux Server Suite 的想法，请在 GitHub 上创建一个 Issue，并包含以下信息：

- 清晰简洁的标题
- 详细描述您的建议
- 解释为什么这个功能对项目有用
- 如果可能，提供实现该功能的大致思路

### 提交 Pull Request

1. Fork 项目
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 将更改推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 开发环境设置

1. 克隆您的 Fork
2. 安装依赖：`npm install`
3. 进行更改
4. 运行测试：`npm test`
5. 确保所有测试都通过

## 代码规范

- 遵循项目中现有的代码风格
- 为新功能编写测试
- 更新相关文档
- 提交前运行测试套件

## 项目结构

- `termux-server-suite/system/` - 核心服务脚本
- `termux-server-suite/config/` - 配置文件
- `termux-server-suite/docs/` - 项目文档
- `termux-server-suite/my-website/` - 默认托管网站

## 问题和讨论

如果您有任何问题或想讨论项目，请在 GitHub 上创建一个 Issue。

感谢您对 Termux Server Suite 的贡献！