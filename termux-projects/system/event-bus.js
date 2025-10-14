/**
 * 中央事件总线系统
 * 提供模块间事件通信功能
 */

class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     */
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * 取消订阅事件
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     */
    unsubscribe(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * 发布事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    publish(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`处理事件 ${event} 时出错:`, error);
            }
        });
    }

    /**
     * 获取事件订阅数量
     * @param {string} event - 事件名称
     * @returns {number} 订阅数量
     */
    getSubscriptionCount(event) {
        if (!this.events[event]) return 0;
        return this.events[event].length;
    }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

module.exports = eventBus;