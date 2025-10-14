/**
 * 配置管理工具
 * 提供配置读取、验证和默认值设置功能
 */

const path = require('path');
const defaultConfig = require('./app-config');

class ConfigManager {
  constructor(config = {}) {
    // 合并默认配置和用户配置
    this.config = this.mergeConfig(defaultConfig, config);
    
    // 验证关键配置项
    this.validateEssentialConfigs();
  }

  /**
   * 合并两个配置对象
   * @param {Object} defaultCfg - 默认配置
   * @param {Object} userCfg - 用户配置
   * @returns {Object} 合并后的配置
   */
  mergeConfig(defaultCfg, userCfg) {
    const merged = { ...defaultCfg };
    
    for (const key in userCfg) {
      if (userCfg.hasOwnProperty(key)) {
        if (typeof merged[key] === 'object' && 
            merged[key] !== null && 
            !Array.isArray(merged[key]) &&
            typeof userCfg[key] === 'object' && 
            userCfg[key] !== null && 
            !Array.isArray(userCfg[key])) {
          merged[key] = this.mergeConfig(merged[key], userCfg[key]);
        } else {
          merged[key] = userCfg[key];
        }
      }
    }
    
    return merged;
  }

  /**
   * 获取配置值
   * @param {string} key - 配置键，支持点号分隔的嵌套路径 (e.g. 'healthCheck.checkInterval')
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值或默认值
   */
  get(key, defaultValue = null) {
    // 将点号分隔的路径转换为数组
    const keys = key.split('.');
    let value = this.config;

    // 遍历路径获取嵌套值
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * 设置配置值
   * @param {string} key - 配置键，支持点号分隔的嵌套路径
   * @param {*} value - 配置值
   */
  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;

    // 遍历到倒数第二个键
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj) || typeof obj[k] !== 'object' || obj[k] === null || Array.isArray(obj[k])) {
        obj[k] = {};
      }
      obj = obj[k];
    }

    // 设置最后一个键的值
    obj[keys[keys.length - 1]] = value;
  }

  /**
   * 验证配置值类型
   * @param {*} value - 要验证的值
   * @param {string} type - 期望的类型
   * @returns {boolean} 是否匹配期望类型
   */
  static validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * 验证配置项
   * @param {string} key - 配置键
   * @param {string} type - 期望的类型
   * @param {*} defaultValue - 默认值
   * @throws {Error} 当配置项类型不匹配时抛出错误
   */
  validate(key, type, defaultValue = null) {
    const value = this.get(key, defaultValue);
    if (!ConfigManager.validateType(value, type)) {
      throw new Error(`配置项 "${key}" 类型不匹配，期望 ${type}，实际 ${typeof value}`);
    }
  }

  /**
   * 验证关键配置项
   */
  validateEssentialConfigs() {
    // 验证健康检查配置
    const healthChecks = this.get('healthCheck.checks');
    if (!Array.isArray(healthChecks)) {
      throw new Error('healthCheck.checks 必须是一个数组');
    }
    
    healthChecks.forEach((check, index) => {
      if (!check.name || !check.port || !check.type) {
        throw new Error(`healthCheck.checks[${index}] 缺少必要字段: name, port 或 type`);
      }
      
      if (typeof check.port !== 'number' || check.port < 1 || check.port > 65535) {
        throw new Error(`healthCheck.checks[${index}] 端口必须是1-65535之间的数字`);
      }
    });
    
    // 验证检查间隔
    const checkIntervals = [
      { key: 'healthCheck.checkInterval', name: '健康检查' },
      { key: 'serviceMonitor.checkInterval', name: '服务监控' },
      { key: 'wakelock.checkInterval', name: '唤醒锁检查' }
    ];
    
    checkIntervals.forEach(item => {
      this.validate(item.key, 'number');
      const interval = this.get(item.key);
      if (interval < 1000) {
        console.warn(`${item.name}间隔过短，建议设置为1000ms以上`);
      }
    });
  }

  /**
   * 获取整个配置对象
   * @returns {Object} 配置对象
   */
  getAll() {
    return { ...this.config };
  }
}

// 创建默认配置管理器实例
const configManager = new ConfigManager();

module.exports = {
    ConfigManager,
    config: configManager.getAll(),
    get: (key, defaultValue = null) => configManager.get(key, defaultValue),
    set: (key, value) => configManager.set(key, value)
};