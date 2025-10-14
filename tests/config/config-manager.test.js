const { ConfigManager, get, getOrDefault } = require('../../termux-projects/config/config-manager');

describe('ConfigManager', () => {
  describe('ConfigManager class', () => {
    it('应该能够创建配置管理器实例', () => {
      const configManager = new ConfigManager();
      expect(configManager).toBeInstanceOf(ConfigManager);
      expect(configManager.getAll()).toBeDefined();
    });

    it('应该能够合并用户配置和默认配置', () => {
      const userConfig = {
        sshServer: {
          port: 2222
        }
      };
      
      const configManager = new ConfigManager(userConfig);
      const config = configManager.getAll();
      
      // 用户配置应该被应用
      expect(config.sshServer.port).toBe(2222);
      
      // 其他默认配置应该保持不变
      expect(config.webServer.port).toBe(8000);
    });

    it('应该验证配置的有效性', () => {
      // 有效的配置
      expect(() => {
        new ConfigManager();
      }).not.toThrow();

      // 无效的SSH端口
      expect(() => {
        new ConfigManager({
          sshServer: {
            port: 99999
          }
        });
      }).toThrow('SSH端口必须在1-65535之间');

      // 无效的Web端口
      expect(() => {
        new ConfigManager({
          webServer: {
            port: 0
          }
        });
      }).toThrow('Web服务器端口必须在1-65535之间');
    });
  });

  describe('get method', () => {
    it('应该能够通过路径获取配置值', () => {
      expect(get('sshServer.port')).toBe(8022);
      expect(get('webServer.port')).toBe(8000);
      expect(get('healthCheck.checkInterval')).toBe(30000);
    });

    it('获取不存在的配置路径应返回undefined', () => {
      expect(get('nonexistent.path')).toBeUndefined();
    });
  });

  describe('getOrDefault method', () => {
    it('应该返回配置值如果存在', () => {
      expect(getOrDefault('sshServer.port', 22)).toBe(8022);
    });

    it('应该返回默认值如果配置不存在', () => {
      expect(getOrDefault('nonexistent.path', 'default')).toBe('default');
    });
  });
});