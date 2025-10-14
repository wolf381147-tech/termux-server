// 测试环境设置文件
console.log('Setting up test environment...');

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 模拟Termux特定命令
jest.mock('child_process', () => {
  return {
    exec: jest.fn((command, callback) => {
      // 模拟不同命令的返回结果
      if (command === 'termux-wake-lock') {
        callback(null, 'Wake lock acquired', '');
      } else if (command === 'termux-wake-unlock') {
        callback(null, 'Wake lock released', '');
      } else if (command === 'termux-battery-status') {
        callback(null, JSON.stringify({ percentage: 80 }), '');
      } else if (command.startsWith('pm2 describe')) {
        callback(null, 'online', '');
      } else if (command === 'sshd') {
        callback(null, 'sshd started', '');
      } else if (command === 'pkill sshd') {
        callback(null, 'sshd killed', '');
      } else if (command.includes('http.server')) {
        callback(null, 'server started', '');
      } else if (command.includes('pkill -f "http.server"')) {
        callback(null, 'server killed', '');
      } else {
        callback(new Error('Unknown command'), '', '');
      }
      
      // 返回一个模拟的子进程对象
      return {
        on: jest.fn()
      };
    }),
    execSync: jest.fn((command) => {
      if (command === 'termux-battery-status') {
        return JSON.stringify({ percentage: 80 });
      }
      return '';
    })
  };
});

// 模拟网络模块
jest.mock('net', () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      let connectCallback;
      let timeoutCallback;
      let errorCallback;
      
      return {
        setTimeout: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'connect') connectCallback = callback;
          if (event === 'timeout') timeoutCallback = callback;
          if (event === 'error') errorCallback = callback;
        }),
        connect: jest.fn(() => {
          // 立即触发连接成功
          if (connectCallback) {
            setTimeout(connectCallback, 0);
          }
        }),
        destroy: jest.fn()
      };
    })
  };
});

// 模拟HTTP模块
jest.mock('http', () => {
  return {
    get: jest.fn((url, callback) => {
      const res = {
        statusCode: 200
      };
      
      callback(res);
      
      return {
        on: jest.fn(),
        setTimeout: jest.fn((timeout, callback) => {
          // 不触发超时
        }),
        destroy: jest.fn()
      };
    }),
    createServer: jest.fn(() => {
      return {
        listen: jest.fn((port, host, callback) => {
          callback();
        }),
        on: jest.fn()
      };
    })
  };
});