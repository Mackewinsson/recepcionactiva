require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaMssql } = require('@prisma/adapter-mssql');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma Connection...');
  console.log('=' .repeat(60));
  console.log('Environment Variables:');
  console.log(`  DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME}`);
  console.log(`  DB_USER: ${process.env.DB_USER}`);
  console.log(`  DB_INSTANCE: ${process.env.DB_INSTANCE || '(not set)'}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL?.replace(/password=[^;]+/, 'password=***')}`);
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Build config from environment variables (same as prisma.ts)
    const config = {
      server: process.env.DB_HOST || 'localhost',
      port: process.env.DB_INSTANCE ? undefined : parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_NAME || 'vsoldatos',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASS || 'sa2006',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        enableArithAbort: true,
        instanceName: process.env.DB_INSTANCE || undefined,
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      },
    };

    console.log('⏳ Creating Prisma adapter with config...');
    console.log(`  Server: ${config.server}`);
    console.log(`  Port: ${config.port || 'dynamic (using instance name)'}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  Instance: ${config.options.instanceName || 'default'}`);
    console.log('');

    const adapter = new PrismaMssql(config);
    const prisma = new PrismaClient({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });

    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    console.log('');

    console.log('⏳ Running test query...');
    const result = await prisma.$queryRaw`SELECT DB_NAME() as dbname, @@VERSION as version`;
    console.log('✅ Query successful!');
    console.log(`  Database: ${result[0].dbname}`);
    console.log(`  Version: ${result[0].version.split('\n')[0]}`);
    console.log('');

    await prisma.$disconnect();
    console.log('✅ Prisma disconnected successfully');
    console.log('');
    console.log('=' .repeat(60));
    console.log('✅ PRISMA CONNECTION TEST PASSED!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('Your application is ready to use Prisma with SQL Server Express.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.log('❌ Prisma connection failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    if (error.stack) {
      console.log('Stack trace:');
      console.log(error.stack);
    }
    console.log('');

    process.exit(1);
  }
}

testPrismaConnection();
