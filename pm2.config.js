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
      },
      error_file: './logs/sshd-error.log',
      out_file: './logs/sshd-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
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
      },
      error_file: './logs/webserver-error.log',
      out_file: './logs/webserver-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
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
      },
      error_file: './logs/health-check-error.log',
      out_file: './logs/health-check-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
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
      },
      error_file: './logs/service-monitor-error.log',
      out_file: './logs/service-monitor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
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
      },
      error_file: './logs/wakelock-manager-error.log',
      out_file: './logs/wakelock-manager-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};