module.exports = {
  apps: [
    {
      name: 'bot-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8443
      }
    },
    {
      name: 'community-api',
      script: './server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
