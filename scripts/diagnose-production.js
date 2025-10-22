const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 Complete Production Environment Diagnostic...');
console.log('=' .repeat(60));

// Check if required files exist
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n📋 Environment Variables Check:');
  console.log('-' .repeat(40));
  
  const envFiles = ['.env', '.env.production', '.env.local'];
  let foundEnvFile = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      foundEnvFile = true;
      console.log(`\n📄 Found: ${envFile}`);
      
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split('\n');
        
        const importantVars = [
          'DATABASE_URL',
          'DB_HOST',
          'DB_PORT',
          'DB_USER',
          'DB_PASS',
          'DB_NAME',
          'DB_INSTANCE',
          'NODE_ENV',
          'PORT'
        ];
        
        for (const varName of importantVars) {
          const line = lines.find(l => l.startsWith(varName + '='));
          if (line) {
            const value = line.split('=')[1]?.replace(/"/g, '') || '';
            const displayValue = varName.includes('PASS') || varName.includes('SECRET') 
              ? '***' 
              : value;
            console.log(`  ${varName}: ${displayValue}`);
          } else {
            console.log(`  ${varName}: ❌ NOT SET`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error reading ${envFile}: ${error.message}`);
      }
    }
  }
  
  if (!foundEnvFile) {
    console.log('❌ No environment files found!');
  }
}

// Check Node.js and npm versions
function checkNodeVersions() {
  return new Promise((resolve) => {
    console.log('\n📋 Node.js Environment Check:');
    console.log('-' .repeat(40));
    
    exec('node --version', (error, stdout) => {
      if (error) {
        console.log('❌ Node.js version check failed:', error.message);
      } else {
        console.log(`✅ Node.js version: ${stdout.trim()}`);
      }
      
      exec('npm --version', (error, stdout) => {
        if (error) {
          console.log('❌ npm version check failed:', error.message);
        } else {
          console.log(`✅ npm version: ${stdout.trim()}`);
        }
        
        exec('npx --version', (error, stdout) => {
          if (error) {
            console.log('❌ npx version check failed:', error.message);
          } else {
            console.log(`✅ npx version: ${stdout.trim()}`);
          }
          resolve();
        });
      });
    });
  });
}

// Check project structure
function checkProjectStructure() {
  console.log('\n📋 Project Structure Check:');
  console.log('-' .repeat(40));
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'next.config.ts', desc: 'Next.js configuration' },
    { path: 'prisma/schema.prisma', desc: 'Prisma schema' },
    { path: 'src/lib/prisma.ts', desc: 'Prisma client configuration' },
    { path: 'src/app/api/users/route.ts', desc: 'Users API route' },
    { path: 'src/app/api/auth/login/route.ts', desc: 'Login API route' }
  ];
  
  const requiredDirs = [
    { path: 'src', desc: 'Source code directory' },
    { path: 'src/app', desc: 'Next.js app directory' },
    { path: 'src/app/api', desc: 'API routes directory' },
    { path: 'prisma', desc: 'Prisma directory' },
    { path: 'scripts', desc: 'Scripts directory' }
  ];
  
  for (const file of requiredFiles) {
    checkFileExists(file.path, file.desc);
  }
  
  for (const dir of requiredDirs) {
    checkFileExists(dir.path, dir.desc);
  }
}

// Check if dependencies are installed
function checkDependencies() {
  return new Promise((resolve) => {
    console.log('\n📋 Dependencies Check:');
    console.log('-' .repeat(40));
    
    if (!fs.existsSync('package.json')) {
      console.log('❌ package.json not found!');
      resolve();
      return;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = [
        'next',
        'prisma',
        '@prisma/client',
        '@prisma/adapter-mssql',
        'mssql'
      ];
      
      for (const dep of requiredDeps) {
        const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        if (version) {
          console.log(`✅ ${dep}: ${version}`);
        } else {
          console.log(`❌ ${dep}: NOT FOUND in package.json`);
        }
      }
      
      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules: EXISTS');
      } else {
        console.log('❌ node_modules: NOT FOUND - run npm install');
      }
      
    } catch (error) {
      console.log('❌ Error reading package.json:', error.message);
    }
    
    resolve();
  });
}

// Check Prisma configuration
function checkPrismaConfig() {
  console.log('\n📋 Prisma Configuration Check:');
  console.log('-' .repeat(40));
  
  // Check if Prisma client is generated
  const prismaClientPath = 'src/generated/prisma';
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma client: GENERATED');
  } else {
    console.log('❌ Prisma client: NOT GENERATED - run npx prisma generate');
  }
  
  // Check Prisma schema
  if (fs.existsSync('prisma/schema.prisma')) {
    try {
      const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
      if (schema.includes('provider = "sqlserver"')) {
        console.log('✅ Prisma schema: SQL Server provider configured');
      } else {
        console.log('❌ Prisma schema: SQL Server provider not found');
      }
    } catch (error) {
      console.log('❌ Error reading Prisma schema:', error.message);
    }
  }
}

// Check build status
function checkBuildStatus() {
  return new Promise((resolve) => {
    console.log('\n📋 Build Status Check:');
    console.log('-' .repeat(40));
    
    if (fs.existsSync('.next')) {
      console.log('✅ Next.js build: EXISTS');
      
      // Check if build is recent
      const stats = fs.statSync('.next');
      const buildTime = new Date(stats.mtime);
      const now = new Date();
      const diffHours = (now - buildTime) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        console.log(`✅ Build age: ${Math.round(diffHours * 60)} minutes ago`);
      } else {
        console.log(`⚠️  Build age: ${Math.round(diffHours)} hours ago - consider rebuilding`);
      }
    } else {
      console.log('❌ Next.js build: NOT FOUND - run npm run build');
    }
    
    resolve();
  });
}

// Main diagnostic function
async function runDiagnostic() {
  console.log('🎯 Target: Production Environment');
  console.log('🎯 Database: 154.56.158.238\\SQLEXPRESS');
  console.log('=' .repeat(60));
  
  // Run all checks
  checkProjectStructure();
  checkEnvironmentVariables();
  await checkNodeVersions();
  await checkDependencies();
  checkPrismaConfig();
  await checkBuildStatus();
  
  // Summary and recommendations
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(60));
  
  console.log('\n🔧 Common Issues and Solutions:');
  console.log('1. Database Connection Timeout:');
  console.log('   - Run: node scripts/test-network.js');
  console.log('   - Check SQL Server configuration on remote server');
  console.log('   - Verify Windows Firewall settings');
  
  console.log('\n2. Environment Configuration:');
  console.log('   - Run: node scripts/fix-production-env.js');
  console.log('   - Verify .env.production has correct database URL');
  
  console.log('\n3. Prisma Issues:');
  console.log('   - Run: npx prisma generate');
  console.log('   - Check if Prisma client is generated');
  
  console.log('\n4. Build Issues:');
  console.log('   - Run: npm run build');
  console.log('   - Clear .next directory if corrupted');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run network test: node scripts/test-network.js');
  console.log('2. Fix environment: node scripts/fix-production-env.js');
  console.log('3. Test database: node scripts/test-production-db.js');
  console.log('4. Start server: npm start');
  
  console.log('\n' + '=' .repeat(60));
}

// Run the diagnostic
runDiagnostic().catch(console.error);
