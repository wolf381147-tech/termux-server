#!/data/data/com.termux/files/usr/bin/python3
import sys
print("🐍 Python环境检查:")
print(f"Python版本: {sys.version}")
print(f"Python路径: {sys.executable}")

try:
    import pip
    print("✅ pip 可用")
except ImportError:
    print("❌ pip 不可用")
