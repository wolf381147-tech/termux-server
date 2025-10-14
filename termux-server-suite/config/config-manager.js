/**
 * 配置管理工具
 * 提供配置读取、验证和默认值设置功能
 */

const defaultConfig = require('./app-config');

class ConfigManager {
    constructor(config = {}) {
        this.config = this.mergeConfig(defaultConfig, config);
        this.validateConfig();
    }

    /**
     * 合并默认配置和用户配置
     */
    mergeConfig(defaultCfg, userCfg) {
        const merged = { ...defaultCfg };
        
        for (const key in userCfg) {
            if (typeof merged[key] === 'object' && typeof userCfg[key] === 'object') {
                merged[key] = this.mergeConfig(merged[key], userCfg[key]);
            } else {
                merged[key] = userCfg[key];
            }
        }
        
        return merged;
    }

    /**
     * 验证配置
     */
    validateConfig() {
        // 验证端口范围
        if (this.config.sshServer.port < 1 || this.config.sshServer.port > 65535) {
            throw new Error('SSH端口必须在1-65535之间');
        }
        
        if (this.config.webServer.port < 1 || this.config.webServer.port > 65535) {
            throw new Error('Web服务器端口必须在1-65535之间');
        }
        
        // 验证检查间隔
        if (this.config.healthCheck.checkInterval < 1000) {
            console.warn('健康检查间隔过短，建议设置为1000ms以上');
        }
        
        if (this.config.serviceMonitor.checkInterval < 1000) {
            console.warn('服务监控间隔过短，建议设置为1000ms以上');
        }
        
        if (this.config.wakelock.checkInterval < 1000) {
            console.warn('唤醒锁检查间隔过短，建议设置为1000ms以上');
        }
        
        // 验证电池电量阈值
        if (this.config.wakelock.minBatteryLevel < 0 || this.config.wakelock.minBatteryLevel > 100) {
            throw new Error('最低电池电量必须在0-100之间');
        }
    }

    /**
     * 获取指定路径的配置值
     */
    get(path) {
        const keys = path.split('.');
        let result = this.config;
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return undefined;
            }
        }
        
        return result;
    }

    /**
     * 获取配置并提供默认值
     */
    getOrDefault(path, defaultValue) {
        const value = this.get(path);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * 获取整个配置对象
     */
    getAll() {
        return this.config;
    }

    /**
     * 更新配置值
     */
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }
}

// 创建默认配置管理器实例
const configManager = new ConfigManager();

module.exports = {
    ConfigManager,
    config: configManager.getAll(),
    get: (path) => configManager.get(path),
    getOrDefault: (path, defaultValue) => configManager.getOrDefault(path, defaultValue)
};