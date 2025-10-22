const sql = require('mssql');

const config = {
  server: '154.56.158.238\\SQLEXPRESS',
  database: 'vsoldatos',
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
};

async function testConnection() {
  console.log('🔍 Testing SQL Server Express connection...');
  console.log('=' .repeat(60));
  console.log(`Server: ${config.server}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log(`Instance: SQLEXPRESS`);
  console.log('=' .repeat(60));
  console.log('');

  try {
    console.log('⏳ Connecting...');
    const pool = await sql.connect(config);
    console.log('✅ Connection successful!');
    console.log('');

    // Test query
    console.log('⏳ Running test query...');
    const result = await pool.request().query(`
      SELECT
        DB_NAME() as CurrentDatabase,
        @@VERSION as SQLVersion,
        @@SERVERNAME as ServerName,
        SERVERPROPERTY('InstanceName') as InstanceName
    `);

    console.log('✅ Query successful!');
    console.log('');
    console.log('Database Info:');
    console.log('  Current Database:', result.recordset[0].CurrentDatabase);
    console.log('  Server Name:', result.recordset[0].ServerName);
    console.log('  Instance Name:', result.recordset[0].InstanceName || '(default)');
    console.log('  SQL Version:', result.recordset[0].SQLVersion.split('\n')[0]);
    console.log('');

    // List available databases
    console.log('⏳ Listing available databases...');
    const dbResult = await pool.request().query(`
      SELECT name
      FROM sys.databases
      WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
      ORDER BY name
    `);

    console.log('✅ Available databases:');
    dbResult.recordset.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    console.log('');

    await pool.close();
    console.log('✅ Connection closed successfully');
    console.log('');
    console.log('=' .repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('Your application should now be able to connect to SQL Server Express.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('=' .repeat(60));
    console.log('TROUBLESHOOTING:');
    console.log('=' .repeat(60));
    console.log('');
    console.log('1. Verify SQL Server Express is running:');
    console.log('   - On the server, check services for "SQL Server (SQLEXPRESS)"');
    console.log('');
    console.log('2. Verify SQL Browser service is running:');
    console.log('   - SQL Browser helps locate named instances');
    console.log('   - Service name: "SQL Server Browser"');
    console.log('');
    console.log('3. Verify TCP/IP is enabled:');
    console.log('   - Open SQL Server Configuration Manager');
    console.log('   - SQL Server Network Configuration → Protocols for SQLEXPRESS');
    console.log('   - Enable TCP/IP');
    console.log('');
    console.log('4. Check firewall rules:');
    console.log('   - Port 1433 (TCP) must be open');
    console.log('   - Port 1434 (UDP) must be open for SQL Browser');
    console.log('');
    console.log('5. Verify SQL Server authentication:');
    console.log('   - SQL Server must allow SQL Server Authentication (not just Windows Auth)');
    console.log('   - The "sa" account must be enabled');
    console.log('');

    process.exit(1);
  }
}

testConnection();
