const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔧 Fixing Production Database Configuration...');
console.log('=' .repeat(60));

const ENV_FILE = '.env.production';
const BACKUP_FILE = '.env.production.backup';

// Production environment configuration
const PRODUCTION_ENV = `# ===========================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ===========================================

# ===========================================
# ENVIRONMENT
# ===========================================
NODE_ENV=production

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# Updated database URL for remote SQL Server Express
DATABASE_URL="sqlserver://sa:sa2006@154.56.158.238:1433;database=VsolDatos;trustServerCertificate=true"

# Individual database variables (used by custom Prisma adapter)
DB_HOST=154.56.158.238
DB_PORT=1433
DB_USER=sa
DB_PASS=sa2006
DB_NAME=VsolDatos
DB_INSTANCE=SQLEXPRESS

# Connection timeout settings
DB_CONNECTION_TIMEOUT=60000
DB_REQUEST_TIMEOUT=60000

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
APP_URL=http://0.0.0.0:5400
PORT=5400

# ===========================================
# FTP CONFIGURATION
# ===========================================
FTP_HOST=154.56.158.238
FTP_PORT=21
FTP_USER=recepUser
FTP_PASSWORD="User@2025#Recep."
FTP_BASE_PATH=/
FTP_SECURE=false
FTP_HTTP_BASE_URL=/

# ===========================================
# SECURITY
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here
SESSION_MAX_AGE=86400000
BCRYPT_ROUNDS=12

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# ===========================================
# NETWORK IMAGE PATH
# ===========================================
NETWORK_IMAGE_PATH=//192.168.8.11/Imagenes/
`;

// Execute command and return promise
function execCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${description}...`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${description} failed:`, error.message);
        reject(error);
      } else {
        console.log(`✅ ${description} completed successfully!`);
        if (stdout.trim()) {
          console.log(stdout);
        }
        resolve(stdout);
      }
    });
  });
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Backup existing file
function backupFile(filePath, backupPath) {
  try {
    if (fileExists(filePath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Backed up ${filePath} to ${backupPath}`);
      return true;
    } else {
      console.log(`⚠️  ${filePath} does not exist, creating new file`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to backup ${filePath}:`, error.message);
    return false;
  }
}

// Write new environment file
function writeEnvFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created/updated ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to write ${filePath}:`, error.message);
    return false;
  }
}

// Remove directory recursively
function removeDirectory(dirPath) {
  return new Promise((resolve) => {
    if (!fileExists(dirPath)) {
      console.log(`⚠️  Directory ${dirPath} does not exist`);
      resolve(true);
      return;
    }
    
    const command = process.platform === 'win32' 
      ? `rmdir /s /q "${dirPath}"`
      : `rm -rf "${dirPath}"`;
    
    exec(command, (error) => {
      if (error) {
        console.log(`❌ Failed to remove ${dirPath}:`, error.message);
        resolve(false);
      } else {
        console.log(`✅ Removed ${dirPath}`);
        resolve(true);
      }
    });
  });
}

// Main fix function
async function fixProductionEnvironment() {
  try {
    console.log('🎯 Target: Production Environment Configuration');
    console.log('🎯 Database: 154.56.158.238\\SQLEXPRESS');
    console.log('=' .repeat(60));
    
    // Step 1: Backup existing .env.production
    console.log('\n📋 Step 1: Backing up existing configuration...');
    backupFile(ENV_FILE, BACKUP_FILE);
    
    // Step 2: Create new .env.production
    console.log('\n📋 Step 2: Creating new production configuration...');
    writeEnvFile(ENV_FILE, PRODUCTION_ENV);
    
    // Step 3: Regenerate Prisma client
    console.log('\n📋 Step 3: Regenerating Prisma client...');
    await execCommand('npx prisma generate', 'Prisma client generation');
    
    // Step 4: Clear Next.js cache
    console.log('\n📋 Step 4: Clearing Next.js cache...');
    await removeDirectory('.next');
    
    // Step 5: Rebuild application
    console.log('\n📋 Step 5: Rebuilding application...');
    await execCommand('npm run build', 'Application build');
    
    // Success message
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 PRODUCTION ENVIRONMENT FIX COMPLETE!');
    console.log('=' .repeat(60));
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test database connection: node scripts/test-production-db.js');
    console.log('2. Test network connectivity: node scripts/test-network.js');
    console.log('3. Start the server: npm start');
    
    console.log('\n📋 Files Created/Modified:');
    console.log(`✅ ${ENV_FILE} - Updated with correct database settings`);
    console.log(`✅ ${BACKUP_FILE} - Backup of previous configuration`);
    console.log('✅ .next/ - Cleared and rebuilt');
    console.log('✅ Prisma client - Regenerated');
    
    console.log('\n🔧 If you still have connection issues:');
    console.log('1. Check SQL Server configuration on 154.56.158.238');
    console.log('2. Verify Windows Firewall settings');
    console.log('3. Ensure SQL Server Browser service is running');
    console.log('4. Run the network test script for detailed diagnostics');
    
  } catch (error) {
    console.log('\n❌ Fix failed:', error.message);
    console.log('\n🔧 Manual steps:');
    console.log('1. Check if .env.production exists');
    console.log('2. Verify npm and npx are available');
    console.log('3. Check file permissions');
    console.log('4. Run commands manually if needed');
  }
}

// Run the fix
fixProductionEnvironment();
