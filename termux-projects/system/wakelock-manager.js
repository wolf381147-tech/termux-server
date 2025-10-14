const { exec } = require('child_process');
const config = require('../config/app-config');

class WakelockManager {
    constructor() {
        this.isLocked = false;
        // 从配置中获取检查间隔
        this.checkInterval = config.wakelock.checkInterval;
        // 从配置中获取电池检查设置
        this.enableBatteryCheck = config.wakelock.enableBatteryCheck;
        this.minBatteryLevel = config.wakelock.minBatteryLevel;
    }
    
    acquire() {
        // 如果启用了电池检查，先检查电池电量
        if (this.enableBatteryCheck) {
            this.checkBatteryLevel().then(canAcquire => {
                if (canAcquire) {
                    exec('termux-wake-lock', (error) => {
                        if (!error) {
                            this.isLocked = true;
                            console.log('唤醒锁已获取:', new Date().toISOString());
                        }
                    });
                } else {
                    console.log('电池电量过低，跳过获取唤醒锁');
                }
            });
        } else {
            exec('termux-wake-lock', (error) => {
                if (!error) {
                    this.isLocked = true;
                    console.log('唤醒锁已获取:', new Date().toISOString());
                }
            });
        }
    }
    
    release() {
        exec('termux-wake-unlock', (error) => {
            if (!error) {
                this.isLocked = false;
                console.log('唤醒锁已释放:', new Date().toISOString());
            }
        });
    }
    
    // 检查电池电量
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
                            resolve(false);
                        } else {
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
    
    startMonitoring() {
        // 定期检查并重新获取唤醒锁
        setInterval(() => {
            if (!this.isLocked) {
                this.acquire();
            }
        }, this.checkInterval);
        
        console.log('唤醒锁监控已启动');
    }
}

const wakelock = new WakelockManager();
wakelock.acquire();
wakelock.startMonitoring();

// 保持进程运行
process.on('SIGINT', () => {
    wakelock.release();
    process.exit(0);
});
