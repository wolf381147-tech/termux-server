module.exports = {
  apps: [
    {
      name: 'sshd',
      script: 'termux-server-suite/system/start-sshd.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'webserver',
      script: 'termux-server-suite/system/start-web.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'health-check',
      script: 'termux-server-suite/system/health-check.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'service-monitor',
      script: 'termux-server-suite/system/service-monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'wakelock-manager',
      script: 'termux-server-suite/system/wakelock-manager.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};