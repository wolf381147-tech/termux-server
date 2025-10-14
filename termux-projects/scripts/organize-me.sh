#!/bin/bash
echo "开始整理你的手机服务器项目..."

# 创建分类文件夹
echo "创建分类文件夹..."
mkdir -p system web projects config docs scripts data logs

echo "移动文件到对应文件夹..."

# 移动系统管理文件
mv wakelock-manager.js service-monitor.js start-sshd.js start-web.js health-check.js system/ 2>/dev/null
echo "✅ 系统文件整理完成"

# 移动配置文件
mv ssh-commands.txt ssh-quick-connect.txt connection-info.txt "快速连接.txt" "连接卡片.txt" "SSH连接卡片.txt" config/ 2>/dev/null
echo "✅ 配置文件整理完成"

# 移动项目文件
mv node-server.js pm2-demo.js python-setup.py quick-connect.sh projects/ 2>/dev/null
echo "✅ 项目文件整理完成"

# 移动脚本文件
mv *.sh scripts/ 2>/dev/null
echo "✅ 脚本文件整理完成"

echo ""
echo "🎉 整理完成！新的文件夹结构："
echo "================================="
ls -la
echo ""
echo "📁 主要文件夹："
echo "system/    - 系统管理脚本"
echo "config/    - 配置和连接信息" 
echo "projects/  - 项目文件"
echo "scripts/   - 工具脚本"
echo "web/       - 网站文件"
echo "data/      - 数据文件"
echo "logs/      - 日志文件"
