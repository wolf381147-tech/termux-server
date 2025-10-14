module.exports = {
  apps: [
    {
      name: 'sshd',
      script: 'termux-projects/system/start-sshd.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'webserver',
      script: 'termux-projects/system/start-web.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'health-check',
      script: 'termux-projects/system/health-check.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'service-monitor',
      script: 'termux-projects/system/service-monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'wakelock-manager',
      script: 'termux-projects/system/wakelock-manager.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};