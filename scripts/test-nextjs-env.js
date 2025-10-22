// Test that Next.js loads the correct environment variables
require('dotenv').config();

console.log('Environment Variables Loaded:');
console.log('========================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_INSTANCE:', process.env.DB_INSTANCE);
console.log('========================================');

// Also test the actual prisma import
console.log('\nTesting Prisma Import...');
try {
  const { prisma } = require('../src/lib/prisma');
  console.log('✅ Prisma imported successfully');

  // Try a simple connection
  (async () => {
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Prisma connection works!');
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('❌ Prisma connection failed:', error.message);
      process.exit(1);
    }
  })();
} catch (error) {
  console.error('❌ Failed to import Prisma:', error.message);
  console.error(error.stack);
  process.exit(1);
}
