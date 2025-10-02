#!/usr/bin/env node

/**
 * FTP Test Script
 * 
 * This script tests the FTP environment configuration.
 * It verifies that all required environment variables are set correctly.
 */

console.log('🧪 Testing FTP Environment Configuration');
console.log('=========================================');

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredVars = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('');
  console.log('Please run: npm run setup-ftp');
  process.exit(1);
}

console.log('✅ All required FTP environment variables are set:');
console.log(`   FTP_HOST: ${process.env.FTP_HOST}`);
console.log(`   FTP_PORT: ${process.env.FTP_PORT}`);
console.log(`   FTP_USER: ${process.env.FTP_USER}`);
console.log(`   FTP_PASSWORD: ${process.env.FTP_PASSWORD ? '***' : 'NOT SET'}`);
console.log(`   FTP_BASE_PATH: ${process.env.FTP_BASE_PATH}`);
console.log(`   FTP_SECURE: ${process.env.FTP_SECURE}`);
console.log(`   FTP_HTTP_BASE_URL: ${process.env.FTP_HTTP_BASE_URL}`);

console.log('');
console.log('📋 Next steps:');
console.log('1. Ensure your FTP server is running and accessible');
console.log('2. Test the connection by uploading a photo through the web interface');
console.log('3. Check the application logs for FTP connection details');
console.log('');
console.log('🔧 To test actual FTP connectivity, you can:');
console.log('   - Use an FTP client to connect to your server');
console.log('   - Upload a photo through the web interface');
console.log('   - Check the application logs for FTP operations');