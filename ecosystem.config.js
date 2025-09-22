module.exports = {
  apps: [
    {
      name: 'recepcionactiva',
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${process.env.PORT || '3000'}`,
      cwd: './',
      env: {
        NODE_ENV: 'production',
        // Database configuration
        DATABASE_URL: process.env.DATABASE_URL,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_NAME: process.env.DB_NAME,
        // Network image path configuration
        NETWORK_IMAGE_PATH: process.env.NETWORK_IMAGE_PATH,
        // Application configuration
        PORT: process.env.PORT || '3000',
        APP_URL: process.env.APP_URL
      },
      // PM2 specific options
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}
