const { exec } = require('child_process');
const { get } = require('../../termux-projects/config/config-manager');
const EventBus = require('../../termux-projects/system/event-bus');
const ServiceMonitor = require('../../termux-projects/system/service-monitor');

// 模拟依赖模块
jest.mock('child_process');
jest.mock('../../termux-projects/config/config-manager');
jest.mock('../../termux-projects/system/event-bus');

describe('ServiceMonitor', () => {
  let serviceMonitor;
  let mockEventBus;

  beforeEach(() => {
    // 设置mock
    get.mockImplementation((path) => {
      const config = {
        'serviceMonitor.services': ['sshd', 'webserver'],
        'serviceMonitor.checkInterval': 60000,
        'serviceMonitor.maxRetries': 3
      };
      return config[path];
    });

    // 模拟EventBus实例
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn()
    };
    EventBus.mockImplementation(() => mockEventBus);

    // 创建服务监控器实例
    serviceMonitor = new ServiceMonitor();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('应该正确初始化配置', () => {
      expect(serviceMonitor.services).toEqual(['sshd', 'webserver']);
      expect(serviceMonitor.checkInterval).toBe(60000);
      expect(serviceMonitor.maxRetries).toBe(3);
      expect(serviceMonitor.retryCounts).toEqual({});
    });

    it('应该订阅相关事件', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('service.health.failed', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('config.updated', expect.any(Function));
    });
  });

  describe('checkService', () => {
    it('应该能够检查服务状态 (运行中)', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(null, 'online', '');
      });

      serviceMonitor.checkService('sshd').then((result) => {
        expect(result).toEqual({ name: 'sshd', status: 'running' });
        done();
      });
    });

    it('应该能够检查服务状态 (已停止)', (done) => {
      exec.mockImplementation((command, callback) => {
        callback(new Error('not found'), '', '');
      });

      serviceMonitor.checkService('sshd').then((result) => {
        expect(result).toEqual({ name: 'sshd', status: 'stopped' });
        done();
      });
    });
  });

  describe('restartService', () => {
    it('应该能够重启服务', () => {
      exec.mockImplementation((command, callback) => {
        callback(null);
      });

      serviceMonitor.restartService('sshd');

      expect(exec).toHaveBeenCalledWith('pm2 restart sshd', expect.any(Function));
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.restart.started', expect.any(Object));
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.restart.completed', expect.any(Object));
    });

    it('应该在达到最大重试次数时停止重启', () => {
      exec.mockImplementation((command, callback) => {
        callback(new Error('restart failed'));
      });

      // 模拟已达到最大重试次数
      serviceMonitor.retryCounts['sshd'] = 3;

      serviceMonitor.restartService('sshd');

      expect(exec).not.toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.restart.failed', expect.any(Object));
    });
  });

  describe('monitor', () => {
    it('应该监控所有配置的服务', async () => {
      const checkServiceSpy = jest.spyOn(serviceMonitor, 'checkService')
        .mockResolvedValue({ name: 'sshd', status: 'running' });

      await serviceMonitor.monitor();

      expect(checkServiceSpy).toHaveBeenCalledTimes(2); // sshd and webserver
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.monitor.started', expect.any(Object));
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.monitor.completed', expect.any(Object));
    });
  });
});