module.exports = {
  apps: [
    {
      name: 'emberquest-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Spawns a worker for every CPU core
      exec_mode: 'cluster', // Enables PM2's native cluster mode
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3050
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3050
      }
    }
  ]
};
