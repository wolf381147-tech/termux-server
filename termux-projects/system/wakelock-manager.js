const { exec } = require('child_process');

class WakelockManager {
    constructor() {
        this.isLocked = false;
        this.checkInterval = 30000; // 30秒检查一次
    }
    
    acquire() {
        exec('termux-wake-lock', (error) => {
            if (!error) {
                this.isLocked = true;
                console.log('唤醒锁已获取:', new Date().toISOString());
            }
        });
    }
    
    release() {
        exec('termux-wake-unlock', (error) => {
            if (!error) {
                this.isLocked = false;
                console.log('唤醒锁已释放:', new Date().toISOString());
            }
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
