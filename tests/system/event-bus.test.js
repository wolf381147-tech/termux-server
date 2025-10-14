const EventBus = require('../../termux-projects/system/event-bus');

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    // 清理所有事件订阅
    eventBus.events = {};
  });

  describe('subscribe', () => {
    it('应该能够订阅事件', () => {
      const callback = jest.fn();
      eventBus.subscribe('test.event', callback);
      
      expect(eventBus.events['test.event']).toBeDefined();
      expect(eventBus.events['test.event']).toHaveLength(1);
      expect(eventBus.events['test.event'][0]).toBe(callback);
    });

    it('应该能够订阅同一事件的多个回调', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      eventBus.subscribe('test.event', callback1);
      eventBus.subscribe('test.event', callback2);
      
      expect(eventBus.events['test.event']).toHaveLength(2);
      expect(eventBus.events['test.event'][0]).toBe(callback1);
      expect(eventBus.events['test.event'][1]).toBe(callback2);
    });
  });

  describe('unsubscribe', () => {
    it('应该能够取消订阅事件', () => {
      const callback = jest.fn();
      eventBus.subscribe('test.event', callback);
      
      expect(eventBus.events['test.event']).toHaveLength(1);
      
      eventBus.unsubscribe('test.event', callback);
      
      expect(eventBus.events['test.event']).toHaveLength(0);
    });

    it('取消订阅不存在的事件不应出错', () => {
      const callback = jest.fn();
      expect(() => {
        eventBus.unsubscribe('nonexistent.event', callback);
      }).not.toThrow();
    });
  });

  describe('publish', () => {
    it('应该能够发布事件并调用所有订阅者', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventData = { message: 'test' };
      
      eventBus.subscribe('test.event', callback1);
      eventBus.subscribe('test.event', callback2);
      
      eventBus.publish('test.event', eventData);
      
      expect(callback1).toHaveBeenCalledWith(eventData);
      expect(callback2).toHaveBeenCalledWith(eventData);
    });

    it('发布没有订阅者的事件不应出错', () => {
      expect(() => {
        eventBus.publish('unsubscribed.event', {});
      }).not.toThrow();
    });

    it('当一个订阅者出错时，不应影响其他订阅者', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = jest.fn();
      const eventData = { test: 'data' };
      
      eventBus.subscribe('test.event', errorCallback);
      eventBus.subscribe('test.event', normalCallback);
      
      expect(() => {
        eventBus.publish('test.event', eventData);
      }).not.toThrow();
      
      expect(normalCallback).toHaveBeenCalledWith(eventData);
    });
  });

  describe('getSubscriptionCount', () => {
    it('应该返回正确的订阅数量', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      expect(eventBus.getSubscriptionCount('test.event')).toBe(0);
      
      eventBus.subscribe('test.event', callback1);
      expect(eventBus.getSubscriptionCount('test.event')).toBe(1);
      
      eventBus.subscribe('test.event', callback2);
      expect(eventBus.getSubscriptionCount('test.event')).toBe(2);
      
      eventBus.unsubscribe('test.event', callback1);
      expect(eventBus.getSubscriptionCount('test.event')).toBe(1);
    });

    it('查询不存在事件的订阅数量应返回0', () => {
      expect(eventBus.getSubscriptionCount('nonexistent.event')).toBe(0);
    });
  });
});