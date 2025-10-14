# 测试指南

## 概述

项目使用 Jest 作为测试框架，为所有核心模块提供单元测试。测试覆盖了事件总线、配置管理、健康检查、服务监控和唤醒锁管理等模块。

## 测试结构

```
tests/
├── setup.js              # 测试环境设置
├── config/               # 配置管理相关测试
│   └── config-manager.test.js
└── system/               # 系统模块相关测试
    ├── event-bus.test.js
    ├── health-check.test.js
    ├── service-monitor.test.js
    └── wakelock-manager.test.js
```

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行测试并监视文件变化

```bash
npm run test:watch
```

### 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

## 测试策略

### 1. 模拟外部依赖

测试中使用 Jest 的模拟功能来模拟以下外部依赖：

- `child_process` - 模拟系统命令执行
- `net` - 模拟TCP网络连接
- `http` - 模拟HTTP请求
- 配置管理器 - 模拟配置读取
- 事件总线 - 模拟事件发布和订阅

### 2. 测试覆盖范围

每个模块的测试包括：

1. **构造函数测试** - 验证实例化和初始化
2. **方法测试** - 验证各个公共方法的行为
3. **事件测试** - 验证事件的发布和订阅
4. **错误处理测试** - 验证异常情况的处理

### 3. 测试示例

```javascript
// 测试事件发布
it('应该能够发布事件并调用所有订阅者', () => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();
  const eventData = { message: 'test' };
  
  eventBus.subscribe('test.event', callback1);
  eventBus.subscribe('test.event', callback2);
  
  eventBus.publish('test.event', eventData);
  
  expect(callback1).toHaveBeenCalledWith(eventData);
  expect(callback2).toHaveBeenCalledWith(eventData);
});
```

## 编写新测试

### 1. 创建测试文件

在相应的目录中创建 `.test.js` 文件，例如 [tests/system/my-module.test.js](file:///e:/Termux%E5%A4%87%E4%BB%BD/tests/setup.js)。

### 2. 编写测试用例

使用 Jest 的测试语法：

```javascript
describe('模块名称', () => {
  beforeEach(() => {
    // 测试前的设置
  });

  afterEach(() => {
    // 测试后的清理
  });

  it('应该正确执行某个功能', () => {
    // 测试代码
    expect(result).toBe(expected);
  });
});
```

### 3. 运行测试

运行特定的测试文件：

```bash
npm test -- tests/system/my-module.test.js
```

## 测试最佳实践

1. **每个测试应该独立** - 测试之间不应该有依赖关系
2. **使用描述性的测试名称** - 测试名称应该清楚地说明测试的内容
3. **测试边界条件** - 包括正常情况、异常情况和边界情况
4. **模拟外部依赖** - 确保测试的稳定性和可重复性
5. **验证副作用** - 不仅验证返回值，还要验证状态变化和事件发布

## 覆盖率目标

项目目标是达到 80% 以上的测试覆盖率。可以通过运行 `npm run test:coverage` 查看当前覆盖率报告。