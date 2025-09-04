module.exports = {
  apps: [
    {
      name: 'ai-finance-webhook',
      script: 'n8n_webhook_endpoint.py',
      interpreter: 'python3',
      cwd: '/Users/srijan/ai-finance-agency',
      instances: 2, // Run 2 instances for load balancing
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/webhook-error.log',
      out_file: './logs/webhook-out.log',
      log_file: './logs/webhook-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000
    },
    {
      name: 'ai-finance-orchestrator',
      script: 'multi_agent_orchestrator.py',
      interpreter: 'python3',
      cwd: '/Users/srijan/ai-finance-agency',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/orchestrator-error.log',
      out_file: './logs/orchestrator-out.log',
      log_file: './logs/orchestrator-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 2000
    },
    {
      name: 'ai-finance-enterprise',
      script: 'native_enterprise_integration.py',
      interpreter: 'python3',
      cwd: '/Users/srijan/ai-finance-agency',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/enterprise-error.log',
      out_file: './logs/enterprise-out.log',
      log_file: './logs/enterprise-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '15s',
      restart_delay: 1500
    },
    {
      name: 'ai-finance-scheduler',
      script: 'automated_scheduler.py',
      interpreter: 'python3',
      cwd: '/Users/srijan/ai-finance-agency',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/scheduler-error.log',
      out_file: './logs/scheduler-out.log',
      log_file: './logs/scheduler-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '20s',
      restart_delay: 3000
    },
    {
      name: 'ai-finance-monitor',
      script: '24_7_production_setup.py',
      args: 'start',
      interpreter: 'python3',
      cwd: '/Users/srijan/ai-finance-agency',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/monitor-error.log',
      out_file: './logs/monitor-out.log',
      log_file: './logs/monitor-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 3,
      min_uptime: '60s',
      restart_delay: 5000
    }
  ]
};