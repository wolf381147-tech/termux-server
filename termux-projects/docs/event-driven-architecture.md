# 事件驱动架构使用说明

## 概述

项目采用事件驱动架构，通过中央事件总线实现模块间的解耦通信。各模块可以通过发布和订阅事件来进行通信，而无需直接调用彼此的方法。

## 事件总线

事件总线是系统的核心组件，负责事件的发布和订阅。所有模块都通过同一个事件总线实例进行通信。

### 核心方法

1. `subscribe(event, callback)` - 订阅事件
2. `unsubscribe(event, callback)` - 取消订阅事件
3. `publish(event, data)` - 发布事件

## 已定义的事件

### 健康检查相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `health.check.started` | 健康检查启动时 | `{ timestamp }` |
| `health.check.completed` | 健康检查完成时 | `{ results, timestamp }` |
| `health.check.stopped` | 健康检查停止时 | `{ timestamp }` |
| `service.health.ok` | 服务健康检查正常时 | `{ service, timestamp }` |
| `service.health.failed` | 服务健康检查异常时 | `{ service, timestamp, error }` |

### 服务监控相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `service.monitor.started` | 服务监控启动时 | `{ timestamp }` |
| `service.monitor.completed` | 服务监控完成时 | `{ services, timestamp }` |
| `service.monitor.stopped` | 服务监控停止时 | `{ timestamp }` |
| `service.running` | 服务运行正常时 | `{ service, timestamp }` |
| `service.restart.started` | 服务重启开始时 | `{ service, attempt, timestamp }` |
| `service.restart.completed` | 服务重启完成时 | `{ service, attempt, timestamp }` |
| `service.restart.failed` | 服务重启失败时 | `{ service, error, attempt, timestamp }` |

### 唤醒锁相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `wakelock.acquired` | 唤醒锁获取成功时 | `{ timestamp }` |
| `wakelock.released` | 唤醒锁释放成功时 | `{ timestamp }` |
| `wakelock.acquire.failed` | 唤醒锁获取失败时 | `{ error, timestamp }` |
| `wakelock.release.failed` | 唤醒锁释放失败时 | `{ error, timestamp }` |
| `wakelock.monitoring.started` | 唤醒锁监控启动时 | `{ interval, timestamp }` |
| `wakelock.manager.stopped` | 唤醒锁管理停止时 | `{ timestamp }` |
| `wakelock.skipped.lowbattery` | 因低电量跳过获取唤醒锁时 | `{ timestamp }` |

### 系统电池相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `system.battery.low` | 电池电量过低时 | `{ level, threshold, timestamp }` |
| `system.battery.normal` | 电池电量正常时 | `{ level, timestamp }` |

### SSH服务相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `service.ssh.started` | SSH服务启动成功时 | `{ service, config, timestamp }` |
| `service.ssh.start.failed` | SSH服务启动失败时 | `{ service, error, timestamp }` |
| `service.ssh.stopped` | SSH服务停止时 | `{ service, exitCode, signal, timestamp }` |
| `service.ssh.heartbeat` | SSH服务心跳检测时 | `{ service, timestamp }` |

### Web服务相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `service.web.started` | Web服务启动成功时 | `{ service, config, timestamp }` |
| `service.web.start.failed` | Web服务启动失败时 | `{ service, error, timestamp }` |
| `service.web.stopped` | Web服务停止时 | `{ service, exitCode, signal, timestamp }` |
| `service.web.heartbeat` | Web服务心跳检测时 | `{ service, timestamp }` |

### 配置相关事件

| 事件名称 | 触发时机 | 数据结构 |
|---------|---------|---------|
| `config.updated` | 配置更新时 | `{ timestamp }` |

## 使用方法

### 1. 引入事件总线

```javascript
const eventBus = require('./event-bus');
```

### 2. 订阅事件

```javascript
eventBus.subscribe('service.health.failed', (data) => {
    console.log(`服务 ${data.service} 出现异常:`, data.error);
});
```

### 3. 发布事件

```javascript
eventBus.publish('my.custom.event', {
    message: '这是一个自定义事件',
    timestamp: new Date().toISOString()
});
```

### 4. 取消订阅事件

```javascript
const myCallback = (data) => {
    console.log('处理事件:', data);
};

// 订阅
eventBus.subscribe('my.event', myCallback);

// 取消订阅
eventBus.unsubscribe('my.event', myCallback);
```

## 最佳实践

1. **事件命名**：使用点号分隔命名空间，如 `service.ssh.started`
2. **数据结构**：事件数据应包含 `timestamp` 字段
3. **错误处理**：事件回调函数应包含错误处理逻辑
4. **避免循环**：注意避免事件订阅形成循环调用
5. **性能考虑**：避免在事件回调中执行耗时操作

## 扩展事件系统

要添加新的事件，只需在适当的时机调用 `eventBus.publish()` 方法，并在需要监听的模块中使用 `eventBus.subscribe()` 订阅即可。

### 示例：添加自定义事件

1. 在某个模块中发布事件：
```javascript
eventBus.publish('my.feature.activated', {
    feature: 'awesome-feature',
    timestamp: new Date().toISOString()
});
```

2. 在另一个模块中订阅事件：
```javascript
eventBus.subscribe('my.feature.activated', (data) => {
    console.log(`功能 ${data.feature} 已激活`);
    // 执行相关逻辑
});
```

## 重构改进

最近的重构引入了以下改进：

1. **通用服务管理器**：创建了 [ServiceManager](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/service-manager.js#L9-L128) 类，统一处理服务的启动、停止和监控逻辑
2. **代码去重**：将SSH和Web服务的共同逻辑提取到 [ServiceManager](file:///e:/Termux%E5%A4%87%E4%BB%BD/termux-projects/system/service-manager.js#L9-L128) 中，减少了代码重复
3. **更好的模块化**：每个模块现在都有更清晰的职责分离
4. **增强的事件系统**：所有服务现在都发布一致的事件集，便于统一监控和管理