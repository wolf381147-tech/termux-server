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
        this.minBatteryLevel = config.get('wakelock.minBatteryLevel', 20);
        this.autoReleaseOnLowBattery = config.get('wakelock.autoReleaseOnLowBattery', true);
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
            this.minBatteryLevel = config.get('wakelock.minBatteryLevel', 20);
            this.autoReleaseOnLowBattery = config.get('wakelock.autoReleaseOnLowBattery', true);
        });
    }
    
    /**
     * 验证命令安全性
     * @param {string} command - 要验证的命令
     * @returns {boolean} 命令是否安全
     */
    isCommandSafe(command) {
        // 对于Termux特定命令，只允许预定义的安全命令
        const safeCommands = [
            'termux-wake-lock',
            'termux-wake-unlock',
            'termux-battery-status'
        ];
        
        return safeCommands.includes(command);
    }
    
    /**
     * 获取唤醒锁
     */
    acquire() {
        // 验证命令安全性
        if (!this.isCommandSafe('termux-wake-lock')) {
            console.error('唤醒锁获取命令不安全');
            eventBus.publish('wakelock.acquire.failed', {
                error: '获取命令不安全',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // 如果启用了电池检查，先检查电池电量
        if (this.enableBatteryCheck) {
            this.checkBatteryLevel().then(canAcquire => {
                if (canAcquire) {
                    exec('termux-wake-lock', { timeout: 5000 }, (error) => {
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
            }).catch(error => {
                // 电池检查出错时，默认允许获取唤醒锁
                console.warn('电池检查出错，默认允许获取唤醒锁:', error.message);
                exec('termux-wake-lock', { timeout: 5000 }, (error) => {
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
            });
        } else {
            exec('termux-wake-lock', { timeout: 5000 }, (error) => {
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
        // 验证命令安全性
        if (!this.isCommandSafe('termux-wake-unlock')) {
            console.error('唤醒锁释放命令不安全');
            eventBus.publish('wakelock.release.failed', {
                error: '释放命令不安全',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        exec('termux-wake-unlock', { timeout: 5000 }, (error) => {
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
        // 验证命令安全性
        if (!this.isCommandSafe('termux-battery-status')) {
            console.error('电池状态检查命令不安全');
            return Promise.resolve(true); // 默认允许获取唤醒锁
        }
        
        return new Promise((resolve, reject) => {
            exec('termux-battery-status', { timeout: 5000 }, (error, stdout) => {
                if (error) {
                    // 如果无法获取电池状态，返回错误
                    reject(new Error('无法获取电池状态'));
                } else {
                    try {
                        const batteryInfo = JSON.parse(stdout);
                        const batteryLevel = batteryInfo.percentage;
                        
                        if (typeof batteryLevel !== 'number' || batteryLevel < 0 || batteryLevel > 100) {
                            reject(new Error('电池电量数据无效'));
                            return;
                        }
                        
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
                        // 如果解析失败，返回错误
                        reject(new Error('电池状态解析失败'));
                    }
                }
            });
        });
    }
    
    /**
     * 启动监控
     */
    startMonitoring() {
        // 检查必要配置
        if (!this.checkInterval || this.checkInterval < 1000) {
            console.error('唤醒锁检查间隔配置无效，必须是大于1000的数字');
            return;
        }
        
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

// 创建并启动唤醒锁管理器
const wakelock = new WakelockManager();
wakelock.acquire();
wakelock.startMonitoring();

// 保持进程运行
process.on('SIGINT', () => {
    wakelock.release();
    console.log('停止唤醒锁管理...');
    // 发布唤醒锁管理停止事件
    eventBus.publish('wakelock.manager.stopped', {
        timestamp: new Date().toISOString()
    });
    process.exit(0);
});

module.exports = WakelockManager;