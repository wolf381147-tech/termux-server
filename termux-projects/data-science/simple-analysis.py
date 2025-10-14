#!/data/data/com.termux/files/usr/bin/python3
import math
import random

# 简单的数据分析示例（不需要图形界面）
print("📊 简单数据分析演示")
print("=" * 40)

# 生成示例数据
print("1. 基础数学计算")
numbers = [random.randint(1, 100) for _ in range(10)]
print(f"数据: {numbers}")
print(f"平均值: {sum(numbers)/len(numbers):.2f}")
print(f"最大值: {max(numbers)}")
print(f"最小值: {min(numbers)}")

print("\n2. 数学函数演示")
print(f"π 的值: {math.pi:.4f}")
print(f"e 的值: {math.e:.4f}")
print(f"5的平方根: {math.sqrt(5):.4f}")

print("\n3. 随机数统计")
counts = [0] * 6
for _ in range(1000):
    dice = random.randint(1, 6)
    counts[dice-1] += 1

print("掷骰子1000次结果:")
for i, count in enumerate(counts):
    print(f"点数 {i+1}: {count}次 ({count/10:.1f}%)")

print("\n4. 斐波那契数列")
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

fib = fibonacci(15)
print(f"前15个斐波那契数: {fib}")

print("\n✅ 数据分析完成!")
