#!/bin/bash
echo "🔄 Termux项目完整恢复脚本"
echo "=========================================="

# 检查环境
echo "1. 检查Termux环境..."
if ! command -v pkg >/dev/null; then
    echo "❌ 错误: 未检测到Termux环境"
    echo "请先安装Termux和Termux:API"
    exit 1
fi

echo "2. 设置存储权限..."
termux-setup-storage

echo "3. 恢复脚本文件..."
cp -r .shortcuts ~/
chmod +x ~/.shortcuts/*

echo "4. 恢复配置文件..."
cp .bashrc ~/
[ -f .tmux.conf ] && cp .tmux.conf ~/

echo "5. 恢复项目文件..."
if [ -d "termux-projects" ]; then
    mkdir -p ~/storage/shared/
    cp -r termux-projects ~/storage/shared/
fi

echo "6. 恢复SSH配置..."
if [ -d ".ssh" ]; then
    cp -r .ssh ~/
    chmod 600 ~/.ssh/* 2>/dev/null || true
fi

echo "7. 重新加载配置..."
source ~/.bashrc

echo ""
echo "✅ 恢复完成！"
echo "🚀 接下来可以:"
echo "   - 运行 'menu' 测试功能"
echo "   - 安装必要软件包"
echo "   - 配置SSH服务"
