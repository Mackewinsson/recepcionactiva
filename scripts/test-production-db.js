require('dotenv').config({ path: '.env.production' });
const sql = require('mssql');

console.log('🔍 Testing Production Database Connection...');
console.log('=' .repeat(60));

// Test different connection configurations
const configs = [
  {
    name: 'Named Instance (SQLEXPRESS)',
    config: {
      server: '154.56.158.238\\SQLEXPRESS',
      database: 'VsolDatos',
      user: 'sa',
      password: 'sa2006',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS',
      },
    }
  },
  {
    name: 'Default Port (1433)',
    config: {
      server: '154.56.158.238',
      port: 1433,
      database: 'VsolDatos',
      user: 'sa',
      password: 'sa2006',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        enableArithAbort: true,
      },
    }
  },
  {
    name: 'Dynamic Port (no port specified)',
    config: {
      server: '154.56.158.238',
      database: 'VsolDatos',
      user: 'sa',
      password: 'sa2006',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS',
      },
    }
  }
];

async function testConnection(config, name) {
  console.log(`\n⏳ Testing: ${name}`);
  console.log(`  Server: ${config.server}`);
  console.log(`  Port: ${config.port || 'dynamic'}`);
  console.log(`  Instance: ${config.options.instanceName || 'default'}`);
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connection successful!');
    
    const result = await pool.request().query(`
      SELECT 
        DB_NAME() as CurrentDatabase,
        @@VERSION as SQLVersion,
        @@SERVERNAME as ServerName,
        SERVERPROPERTY('InstanceName') as InstanceName
    `);
    
    console.log('✅ Database Info:');
    console.log(`  Current Database: ${result.recordset[0].CurrentDatabase}`);
    console.log(`  Server Name: ${result.recordset[0].ServerName}`);
    console.log(`  Instance Name: ${result.recordset[0].InstanceName || '(default)'}`);
    console.log(`  SQL Version: ${result.recordset[0].SQLVersion.split('\n')[0]}`);
    
    await pool.close();
    console.log('✅ Connection closed successfully');
    return true;
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`  Error: ${error.message}`);
    console.log(`  Code: ${error.code || 'N/A'}`);
    return false;
  }
}

async function runTests() {
  console.log('Environment Variables:');
  console.log(`  DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT}`);
  console.log(`  DB_USER: ${process.env.DB_USER}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME}`);
  console.log(`  DB_INSTANCE: ${process.env.DB_INSTANCE}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL?.replace(/password=[^;]+/, 'password=***')}`);
  console.log('=' .repeat(60));
  
  let successCount = 0;
  
  for (const { config, name } of configs) {
    const success = await testConnection(config, name);
    if (success) successCount++;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Results: ${successCount}/${configs.length} connections successful`);
  
  if (successCount === 0) {
    console.log('\n🚨 TROUBLESHOOTING:');
    console.log('1. Check if SQL Server Express is running on 154.56.158.238');
    console.log('2. Verify TCP/IP protocol is enabled in SQL Server Configuration Manager');
    console.log('3. Ensure SQL Server Browser service is running');
    console.log('4. Check Windows Firewall settings (ports 1433, 1434)');
    console.log('5. Verify SQL Server allows remote connections');
    console.log('6. Test network connectivity: ping 154.56.158.238');
  } else {
    console.log('\n✅ At least one connection method works!');
    console.log('Update your .env.production file with the working configuration.');
  }
}

runTests().catch(console.error);
