/**
 * 通用服务管理器
 * 提供通用的服务启动、停止和监控功能
 */

const { exec } = require('child_process');
const eventBus = require('./event-bus');

class ServiceManager {
    /**
     * 创建服务管理器实例
     * @param {string} serviceName - 服务名称
     * @param {Object} config - 服务配置
     * @param {string} config.startCommand - 启动命令
     * @param {string} config.stopCommand - 停止命令
     * @param {string} config.workingDir - 工作目录（可选）
     * @param {Object} config.events - 事件配置
     */
    constructor(serviceName, config) {
        this.serviceName = serviceName;
        this.config = config;
        this.process = null;
        this.isRunning = false;
        
        // 订阅重启事件
        eventBus.subscribe('service.restart.started', (data) => {
            if (data.service === this.serviceName) {
                console.log(`收到${this.serviceName}服务重启通知: ${data.attempt} 次尝试`);
            }
        });
    }
    
    /**
     * 验证命令安全性
     * @param {string} command - 要验证的命令
     * @returns {boolean} 命令是否安全
     */
    isCommandSafe(command) {
        // 禁止的命令列表
        const forbiddenCommands = [
            'rm -rf', 'rm -f', 'rm -r', 
            'format', 'mkfs', 
            'dd if=',
            '>', '>>'
        ];
        
        // 检查是否包含禁止的命令
        for (const forbidden of forbiddenCommands) {
            if (command.includes(forbidden)) {
              return false;
            }
        }
        
        return true;
    }
    
    /**
     * 启动服务
     */
    start() {
        const { startCommand, workingDir } = this.config;
        
        // 检查必要配置
        if (!startCommand) {
            console.error(`${this.serviceName} 服务缺少启动命令`);
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.start.failed`, {
                service: this.serviceName,
                error: '缺少启动命令',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // 验证命令安全性
        if (!this.isCommandSafe(startCommand)) {
            console.error(`${this.serviceName} 服务启动命令不安全: ${startCommand}`);
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.start.failed`, {
                service: this.serviceName,
                error: '启动命令不安全',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        const command = workingDir ? `cd ${workingDir} && ${startCommand}` : startCommand;
        
        console.log(`启动 ${this.serviceName} 服务...`);
        
        this.process = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`${this.serviceName} 服务启动失败:`, error);
                this.isRunning = false;
                
                // 发布服务启动失败事件
                eventBus.publish(`service.${this.serviceName.toLowerCase()}.start.failed`, {
                    service: this.serviceName,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            console.log(`${this.serviceName} 服务启动成功`);
            this.isRunning = true;
            
            // 发布服务启动成功事件
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.started`, {
                service: this.serviceName,
                config: this.config,
                timestamp: new Date().toISOString()
            });
        });
        
        // 设置进程事件监听器
        if (this.process) {
            this.process.on('exit', (code, signal) => {
                this.isRunning = false;
                console.log(`${this.serviceName} 服务已停止 (退出码: ${code}, 信号: ${signal})`);
                
                // 发布服务停止事件
                eventBus.publish(`service.${this.serviceName.toLowerCase()}.stopped`, {
                    service: this.serviceName,
                    exitCode: code,
                    signal: signal,
                    timestamp: new Date().toISOString()
                });
            });
            
            this.process.on('error', (error) => {
                console.error(`${this.serviceName} 服务进程错误:`, error);
                this.isRunning = false;
                
                // 发布服务进程错误事件
                eventBus.publish(`service.${this.serviceName.toLowerCase()}.process.error`, {
                    service: this.serviceName,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });
        }
    }
    
    /**
     * 停止服务
     */
    stop() {
        const { stopCommand } = this.config;
        
        // 检查必要配置
        if (!stopCommand) {
            console.error(`${this.serviceName} 服务缺少停止命令`);
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.stop.failed`, {
                service: this.serviceName,
                error: '缺少停止命令',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // 验证命令安全性
        if (!this.isCommandSafe(stopCommand)) {
            console.error(`${this.serviceName} 服务停止命令不安全: ${stopCommand}`);
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.stop.failed`, {
                service: this.serviceName,
                error: '停止命令不安全',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        if (!this.process || !this.isRunning) {
            console.log(`${this.serviceName} 服务未运行`);
            return;
        }
        
        console.log(`停止 ${this.serviceName} 服务...`);
        
        exec(stopCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`停止 ${this.serviceName} 服务时出错:`, error);
            } else {
                console.log(`${this.serviceName} 服务已停止`);
            }
            
            this.isRunning = false;
            
            // 发布服务停止事件
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.stopped`, {
                service: this.serviceName,
                timestamp: new Date().toISOString()
            });
        });
    }
    
    /**
     * 发送心跳事件
     */
    sendHeartbeat() {
        if (this.isRunning) {
            // 发布服务心跳事件
            eventBus.publish(`service.${this.serviceName.toLowerCase()}.heartbeat`, {
                service: this.serviceName,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * 检查服务是否正在运行
     */
    getStatus() {
        return {
            service: this.serviceName,
            running: this.isRunning,
            pid: this.process ? this.process.pid : null
        };
    }
}

module.exports = ServiceManager;