const { exec } = require('child_process');
const http = require('http');
const net = require('net');
const { get } = require('../../termux-projects/config/config-manager');
const EventBus = require('../../termux-projects/system/event-bus');
const HealthChecker = require('../../termux-projects/system/health-check');

// 模拟依赖模块
jest.mock('child_process');
jest.mock('http');
jest.mock('net');
jest.mock('../../termux-projects/config/config-manager');
jest.mock('../../termux-projects/system/event-bus');

describe('HealthChecker', () => {
  let healthChecker;
  let mockEventBus;

  beforeEach(() => {
    // 设置mock
    get.mockImplementation((path) => {
      const config = {
        'healthCheck.checks': [
          { name: 'SSH', port: 8022, type: 'tcp' },
          { name: 'Web', port: 8000, type: 'http' }
        ],
        'healthCheck.checkInterval': 30000,
        'healthCheck.timeout': 5000
      };
      return config[path];
    });

    // 模拟EventBus实例
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn()
    };
    EventBus.mockImplementation(() => mockEventBus);

    // 创建健康检查器实例
    healthChecker = new HealthChecker();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('应该正确初始化配置', () => {
      expect(healthChecker.checks).toEqual([
        { name: 'SSH', port: 8022, type: 'tcp' },
        { name: 'Web', port: 8000, type: 'http' }
      ]);
      expect(healthChecker.checkInterval).toBe(30000);
      expect(healthChecker.timeout).toBe(5000);
    });

    it('应该订阅相关事件', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('service.started', expect.any(Function));
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('config.updated', expect.any(Function));
    });
  });

  describe('checkTCP', () => {
    it('应该能够检查TCP连接', async () => {
      let connectCallback;
      const mockSocket = {
        setTimeout: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'connect') connectCallback = callback;
        }),
        connect: jest.fn(() => {
          setTimeout(connectCallback, 0);
        }),
        destroy: jest.fn()
      };

      net.Socket.mockImplementation(() => mockSocket);

      const result = await healthChecker.checkTCP('localhost', 8022);
      
      expect(result).toBe(true);
      expect(mockSocket.connect).toHaveBeenCalledWith(8022, 'localhost');
      expect(mockSocket.destroy).toHaveBeenCalled();
    });
  });

  describe('checkHTTP', () => {
    it('应该能够检查HTTP连接', async () => {
      let responseCallback;
      const mockResponse = {
        statusCode: 200
      };

      const mockRequest = {
        on: jest.fn(),
        setTimeout: jest.fn((timeout, callback) => {
          // 不触发超时
        }),
        destroy: jest.fn()
      };

      http.get.mockImplementation((url, callback) => {
        responseCallback = callback;
        setTimeout(() => responseCallback(mockResponse), 0);
        return mockRequest;
      });

      const result = await healthChecker.checkHTTP('localhost', 8000);
      
      expect(result).toBe(true);
      expect(http.get).toHaveBeenCalledWith('http://localhost:8000', expect.any(Function));
    });
  });

  describe('performCheck', () => {
    it('应该能够执行TCP检查', async () => {
      const checkTCPSpy = jest.spyOn(healthChecker, 'checkTCP').mockResolvedValue(true);

      const check = { name: 'SSH', port: 8022, type: 'tcp' };
      const result = await healthChecker.performCheck(check);

      expect(checkTCPSpy).toHaveBeenCalledWith('localhost', 8022);
      expect(result.name).toBe('SSH');
      expect(result.healthy).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('应该能够执行HTTP检查', async () => {
      const checkHTTPSpy = jest.spyOn(healthChecker, 'checkHTTP').mockResolvedValue(true);

      const check = { name: 'Web', port: 8000, type: 'http' };
      const result = await healthChecker.performCheck(check);

      expect(checkHTTPSpy).toHaveBeenCalledWith('localhost', 8000);
      expect(result.name).toBe('Web');
      expect(result.healthy).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('runChecks', () => {
    it('应该执行所有配置的检查', async () => {
      const performCheckSpy = jest.spyOn(healthChecker, 'performCheck')
        .mockResolvedValue({ name: 'Test', healthy: true });

      await healthChecker.runChecks();

      expect(performCheckSpy).toHaveBeenCalledTimes(2); // SSH and Web checks
      expect(mockEventBus.publish).toHaveBeenCalledWith('service.health.ok', expect.any(Object));
      expect(mockEventBus.publish).toHaveBeenCalledWith('health.check.completed', expect.any(Object));
    });
  });
});