const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const defaultEnvFile = '.env.production'
const envFile = process.env.PM2_ENV_FILE || defaultEnvFile
const resolvedEnvPath = path.resolve(__dirname, envFile)

if (fs.existsSync(resolvedEnvPath)) {
  dotenv.config({ path: resolvedEnvPath })
} else if (fs.existsSync(path.resolve(__dirname, '.env'))) {
  dotenv.config({ path: path.resolve(__dirname, '.env') })
} else {
  dotenv.config()
}

const port = process.env.PORT || '5000'
const appEnv = Object.assign({}, process.env, {
  PORT: port
})

// Only set NODE_ENV if it's not already set
if (!process.env.NODE_ENV) {
  appEnv.NODE_ENV = 'production'
}

module.exports = {
  apps: [
    {
      name: 'recepcionactiva',
      script: 'npm',
      args: ['run', 'start'],
      interpreter: 'none',
      cwd: __dirname,
      env: appEnv,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: path.resolve(__dirname, 'logs/err.log'),
      out_file: path.resolve(__dirname, 'logs/out.log'),
      log_file: path.resolve(__dirname, 'logs/combined.log'),
      time: true
    }
  ]
}
