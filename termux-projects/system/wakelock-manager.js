const { exec } = require('child_process');
const config = require('../config/config-manager');
const eventBus = require('./event-bus');

/**
 * 唤醒锁管理器
 * 用于管理 Termux 的 wake lock，防止设备休眠。
 */
class WakelockManager {
    constructor() {
        // 从配置中获取设置
        this.checkInterval = config.get('wakelock.checkInterval');
        this.enableBatteryCheck = config.get('wakelock.enableBatteryCheck');
        this.minBatteryLevel = config.get('wakelock.minBatteryLevel');
        this.autoReleaseOnLowBattery = config.get('wakelock.autoReleaseOnLowBattery');
        this.isLocked = false;
        
        // 订阅相关事件
        this.subscribeToEvents();
    }

    /**
     * 订阅相关事件
     */
    subscribeToEvents() {
        eventBus.subscribe('service.health.failed', (data) => {
            console.log(`收到服务异常通知: ${data.service}`);
        });
        
        eventBus.subscribe('system.battery.low', (data) => {
            if (this.autoReleaseOnLowBattery && this.isLocked) {
                console.log(`检测到低电量 (${data.level}%)，自动释放唤醒锁`);
                this.release();
            }
        });
        
        eventBus.subscribe('config.updated', (data) => {
            console.log('配置已更新，重新加载配置...');
            this.checkInterval = config.get('wakelock.checkInterval');
            this.enableBatteryCheck = config.get('wakelock.enableBatteryCheck');
            this.minBatteryLevel = config.get('wakelock.minBatteryLevel');
            this.autoReleaseOnLowBattery = config.get('wakelock.autoReleaseOnLowBattery');
        });
    }
    
    /**
     * 获取唤醒锁
     */
    acquire() {
        // 如果启用了电池检查，先检查电池电量
        if (this.enableBatteryCheck) {
            this.checkBatteryLevel().then(canAcquire => {
                if (canAcquire) {
                    exec('termux-wake-lock', (error) => {
                        if (!error) {
                            this.isLocked = true;
                            console.log('唤醒锁已获取:', new Date().toISOString());
                            // 发布唤醒锁获取事件
                            eventBus.publish('wakelock.acquired', {
                                timestamp: new Date().toISOString()
                            });
                        } else {
                            // 发布唤醒锁获取失败事件
                            eventBus.publish('wakelock.acquire.failed', {
                                error: error.message,
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                } else {
                    console.log('电池电量过低，跳过获取唤醒锁');
                    // 发布电池电量过低事件
                    eventBus.publish('wakelock.skipped.lowbattery', {
                        timestamp: new Date().toISOString()
                    });
                }
            });
        } else {
            exec('termux-wake-lock', (error) => {
                if (!error) {
                    this.isLocked = true;
                    console.log('唤醒锁已获取:', new Date().toISOString());
                    // 发布唤醒锁获取事件
                    eventBus.publish('wakelock.acquired', {
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // 发布唤醒锁获取失败事件
                    eventBus.publish('wakelock.acquire.failed', {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    }
    
    /**
     * 释放唤醒锁
     */
    release() {
        exec('termux-wake-unlock', (error) => {
            if (!error) {
                this.isLocked = false;
                console.log('唤醒锁已释放:', new Date().toISOString());
                // 发布唤醒锁释放事件
                eventBus.publish('wakelock.released', {
                    timestamp: new Date().toISOString()
                });
            } else {
                // 发布唤醒锁释放失败事件
                eventBus.publish('wakelock.release.failed', {
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    /**
     * 检查电池电量
     */
    checkBatteryLevel() {
        return new Promise((resolve) => {
            exec('termux-battery-status', (error, stdout) => {
                if (error) {
                    // 如果无法获取电池状态，默认允许获取唤醒锁
                    console.warn('无法获取电池状态，默认允许获取唤醒锁');
                    resolve(true);
                } else {
                    try {
                        const batteryInfo = JSON.parse(stdout);
                        const batteryLevel = batteryInfo.percentage;
                        
                        if (batteryLevel < this.minBatteryLevel) {
                            console.log(`电池电量 ${batteryLevel}% 低于阈值 ${this.minBatteryLevel}%`);
                            // 发布低电量事件
                            eventBus.publish('system.battery.low', {
                                level: batteryLevel,
                                threshold: this.minBatteryLevel,
                                timestamp: new Date().toISOString()
                            });
                            resolve(false);
                        } else {
                            // 发布正常电量事件
                            eventBus.publish('system.battery.normal', {
                                level: batteryLevel,
                                timestamp: new Date().toISOString()
                            });
                            resolve(true);
                        }
                    } catch (parseError) {
                        // 如果解析失败，默认允许获取唤醒锁
                        console.warn('电池状态解析失败，默认允许获取唤醒锁');
                        resolve(true);
                    }
                }
            });
        });
    }
    
    /**
     * 启动监控
     */
    startMonitoring() {
        // 定期检查并重新获取唤醒锁
        setInterval(() => {
            if (!this.isLocked) {
                this.acquire();
            }
        }, this.checkInterval);
        
        console.log('唤醒锁监控已启动');
        
        // 发布唤醒锁监控启动事件
        eventBus.publish('wakelock.monitoring.started', {
            interval: this.checkInterval,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = WakelockManager;