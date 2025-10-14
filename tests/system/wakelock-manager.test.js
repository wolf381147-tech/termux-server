const { exec } = require('child_process');
const { get } = require('../../termux-projects/config/config-manager');
const EventBus = require('../../termux-projects/system/event-bus');
const WakelockManager = require('../../termux-projects/system/wakelock-manager');

// 模拟依赖模块
jest.mock('child_process');
jest.mock('../../termux-projects/config/config-manager');
jest.mock('../../termux-projects/system/event-bus');

describe('WakelockManager', () => {
  let wakelockManager;
  let mockEventBus;

  beforeEach(() => {
    // 设置mock
    get.mockImplementation((path) => {
      const config = {
        'wakelock.checkInterval': 30000,
        'wakelock.enableBatteryCheck': true,
        'wakelock.minBatteryLevel': 20,
        'wakelock.autoReleaseOnLowBattery': true
      };
      return config[path];
    });

    // 模拟EventBus实例
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn()
    };
    EventBus.mockImplementation(() => mockEventBus);

    // 创建唤醒锁管理器实例
    wakelockManager = new WakelockManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('应该正确初始化配置', () => {
      expect(wakelockManager.checkInterval).toBe(30000);
      expect(wakelockManager.enableBatteryCheck).toBe(true);
      expect(wakelockManager.minBatteryLevel).toBe(20);
      expect(wakelockManager.autoReleaseOnLowBattery).toBe(true);
    });

    it('应该订阅相关事件', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('service.health.failed', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('system.battery.low', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('config.updated', expect.any(Function));
    });
  });

  describe('acquire', () => {
    it('应该能够获取唤醒锁', (done) => {
      exec.mockImplementation((command, callback) => {
        if (command === 'termux-battery-status') {
          callback(null, JSON.stringify({ percentage: 80 }), '');
        } else if (command === 'termux-wake-lock') {
          callback(null, 'Wake lock acquired', '');
        }
      });

      wakelockManager.acquire();

      // 等待异步操作完成
      setTimeout(() => {
        expect(exec).toHaveBeenCalledWith('termux-battery-status', expect.any(Function));
        expect(exec).toHaveBeenCalledWith('termux-wake-lock', expect.any(Function));
        expect(mockEventBus.publish).toHaveBeenCalledWith('wakelock.acquired', expect.any(Object));
        done();
      }, 10);
    });

    it('在低电量时应该跳过获取唤醒锁', (done) => {
      exec.mockImplementation((command, callback) => {
        if (command === 'termux-battery-status') {
          callback(null, JSON.stringify({ percentage: 10 }), '');
        }
      });

      wakelockManager.acquire();

      // 等待异步操作完成
      setTimeout(() => {
        expect(exec).toHaveBeenCalledWith('termux-battery-status', expect.any(Function));
        expect(exec).not.toHaveBeenCalledWith('termux-wake-lock', expect.any(Function));
        expect(mockEventBus.publish).toHaveBeenCalledWith('wakelock.skipped.lowbattery', expect.any(Object));
        done();
      }, 10);
    });
  });

  describe('release', () => {
    it('应该能够释放唤醒锁', () => {
      exec.mockImplementation((command, callback) => {
        callback(null, 'Wake lock released', '');
      });

      wakelockManager.release();

      expect(exec).toHaveBeenCalledWith('termux-wake-unlock', expect.any(Function));
      expect(mockEventBus.publish).toHaveBeenCalledWith('wakelock.released', expect.any(Object));
    });
  });

  describe('checkBatteryLevel', () => {
    it('应该能够检查电池电量', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(null, JSON.stringify({ percentage: 80 }), '');
      });

      wakelockManager.checkBatteryLevel().then((result) => {
        expect(result).toBe(true);
        expect(exec).toHaveBeenCalledWith('termux-battery-status', expect.any(Function));
        expect(mockEventBus.publish).toHaveBeenCalledWith('system.battery.normal', expect.any(Object));
        done();
      });
    });

    it('应该在低电量时返回false', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(null, JSON.stringify({ percentage: 10 }), '');
      });

      wakelockManager.checkBatteryLevel().then((result) => {
        expect(result).toBe(false);
        expect(exec).toHaveBeenCalledWith('termux-battery-status', expect.any(Function));
        expect(mockEventBus.publish).toHaveBeenCalledWith('system.battery.low', expect.any(Object));
        done();
      });
    });
  });
});