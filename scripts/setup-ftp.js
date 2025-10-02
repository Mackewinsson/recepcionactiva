#!/usr/bin/env node

/**
 * FTP Setup Script
 * 
 * This script helps configure FTP settings for photo uploads.
 * It will create a .env file with FTP configuration if it doesn't exist,
 * or update the existing one with FTP settings.
 */

const fs = require('fs');
const path = require('path');

function main() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  console.log('🔧 FTP Configuration Setup');
  console.log('==========================');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('📋 Please copy env.example to .env first:');
    console.log('   cp env.example .env');
    console.log('');
    console.log('Then run this script again to configure FTP settings.');
    process.exit(1);
  }
  
  // Read current .env content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if FTP settings already exist
  const hasFTPConfig = envContent.includes('FTP_HOST');
  
  if (hasFTPConfig) {
    console.log('✅ FTP configuration already exists in .env');
    console.log('');
    console.log('Current FTP settings:');
    
    // Extract and display current FTP settings
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.startsWith('FTP_')) {
        const [key, value] = line.split('=');
        console.log(`   ${key}=${value}`);
      }
    });
    
    console.log('');
    console.log('To modify FTP settings, edit the .env file directly.');
  } else {
    console.log('📝 Adding FTP configuration to .env...');
    
    // Add FTP configuration
    const ftpConfig = `
# ===========================================
# CONFIGURACIÓN DE FTP PARA SUBIDA DE FOTOS
# ===========================================
# Configuración del servidor FTP para almacenar fotos
FTP_HOST=192.168.1.30
FTP_PORT=21
FTP_USER=ftp_user
FTP_PASSWORD=ftp_password
FTP_BASE_PATH=/uploads/orders
FTP_SECURE=false
FTP_HTTP_BASE_URL=http://192.168.1.30/uploads/orders
`;
    
    envContent += ftpConfig;
    
    // Write updated .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ FTP configuration added to .env');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update the FTP settings in .env with your actual FTP server details:');
    console.log('   - FTP_HOST: Your FTP server IP or hostname');
    console.log('   - FTP_USER: FTP username');
    console.log('   - FTP_PASSWORD: FTP password');
    console.log('   - FTP_BASE_PATH: Base path for uploads (default: /uploads/orders)');
    console.log('   - FTP_HTTP_BASE_URL: HTTP URL to access uploaded files');
    console.log('');
    console.log('2. Ensure your FTP server is running and accessible');
    console.log('3. Test the connection by uploading a photo');
  }
  
  console.log('');
  console.log('🔍 FTP Configuration Details:');
  console.log('==============================');
  console.log('• Photos will be uploaded to: {FTP_BASE_PATH}/{orderNumber}/');
  console.log('• Each order gets its own folder');
  console.log('• Folders are created automatically if they don\'t exist');
  console.log('• Files are stored with unique UUIDs to prevent conflicts');
  console.log('• Database stores relative paths for easy management');
  console.log('');
  console.log('📚 For more information, see the FTP documentation in the project README.');
}

main();
