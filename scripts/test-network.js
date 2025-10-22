const { exec } = require('child_process');
const net = require('net');

console.log('🔍 Testing Network Connectivity to Database Server...');
console.log('=' .repeat(60));

const DB_HOST = '154.56.158.238';
const DB_PORTS = [1433, 1434];

// Test ping connectivity
function testPing() {
  return new Promise((resolve) => {
    console.log(`\n⏳ Testing ping to ${DB_HOST}...`);
    
    const command = process.platform === 'win32' ? `ping -n 4 ${DB_HOST}` : `ping -c 4 ${DB_HOST}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Ping failed:', error.message);
        resolve(false);
      } else {
        console.log('✅ Ping successful!');
        console.log('📊 Ping Results:');
        console.log(stdout.split('\n').slice(0, 6).join('\n'));
        resolve(true);
      }
    });
  });
}

// Test port connectivity
function testPort(host, port) {
  return new Promise((resolve) => {
    console.log(`\n⏳ Testing port ${port} on ${host}...`);
    
    const socket = new net.Socket();
    const timeout = 5000; // 5 seconds timeout
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is open and accessible!`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${port} connection timed out (${timeout}ms)`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (error) => {
      console.log(`❌ Port ${port} connection failed: ${error.message}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Get local network info
function getNetworkInfo() {
  return new Promise((resolve) => {
    console.log('\n⏳ Getting local network configuration...');
    
    const command = process.platform === 'win32' 
      ? 'ipconfig | findstr "IPv4"'
      : 'ifconfig | grep "inet "';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to get network info:', error.message);
        resolve();
      } else {
        console.log('✅ Local Network Configuration:');
        console.log(stdout);
        resolve();
      }
    });
  });
}

// Test SQL Server specific connectivity
async function testSQLServerConnectivity() {
  console.log('\n⏳ Testing SQL Server specific connectivity...');
  
  try {
    const sql = require('mssql');
    
    const config = {
      server: `${DB_HOST}\\SQLEXPRESS`,
      database: 'master', // Try master database first
      user: 'sa',
      password: 'sa2006',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 10000,
        requestTimeout: 10000,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS',
      },
    };
    
    console.log(`  Attempting connection to ${config.server}...`);
    
    const pool = await sql.connect(config);
    console.log('✅ SQL Server connection successful!');
    
    const result = await pool.request().query(`
      SELECT 
        @@SERVERNAME as ServerName,
        @@VERSION as Version,
        SERVERPROPERTY('InstanceName') as InstanceName,
        SERVERPROPERTY('MachineName') as MachineName
    `);
    
    console.log('📊 SQL Server Info:');
    console.log(`  Server Name: ${result.recordset[0].ServerName}`);
    console.log(`  Instance Name: ${result.recordset[0].InstanceName}`);
    console.log(`  Machine Name: ${result.recordset[0].MachineName}`);
    console.log(`  Version: ${result.recordset[0].Version.split('\n')[0]}`);
    
    await pool.close();
    return true;
  } catch (error) {
    console.log('❌ SQL Server connection failed:', error.message);
    console.log(`  Error Code: ${error.code || 'N/A'}`);
    return false;
  }
}

// Main test function
async function runNetworkTests() {
  console.log('🎯 Target Database Server:', DB_HOST);
  console.log('🎯 Target Ports:', DB_PORTS.join(', '));
  console.log('=' .repeat(60));
  
  const results = {
    ping: false,
    ports: {},
    sqlServer: false
  };
  
  // Test ping
  results.ping = await testPing();
  
  // Test ports
  for (const port of DB_PORTS) {
    results.ports[port] = await testPort(DB_HOST, port);
  }
  
  // Get network info
  await getNetworkInfo();
  
  // Test SQL Server connection
  results.sqlServer = await testSQLServerConnectivity();
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 NETWORK TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Ping to ${DB_HOST}: ${results.ping ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  for (const [port, success] of Object.entries(results.ports)) {
    console.log(`Port ${port}: ${success ? '✅ OPEN' : '❌ CLOSED/TIMEOUT'}`);
  }
  
  console.log(`SQL Server Connection: ${results.sqlServer ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Recommendations
  console.log('\n🔧 RECOMMENDATIONS:');
  
  if (!results.ping) {
    console.log('❌ Network connectivity issue - check IP address and network');
  }
  
  if (!results.ports[1433]) {
    console.log('❌ Port 1433 (SQL Server) is not accessible:');
    console.log('   - Enable TCP/IP protocol in SQL Server Configuration Manager');
    console.log('   - Check Windows Firewall settings');
    console.log('   - Verify SQL Server service is running');
  }
  
  if (!results.ports[1434]) {
    console.log('❌ Port 1434 (SQL Server Browser) is not accessible:');
    console.log('   - Start SQL Server Browser service');
    console.log('   - Check Windows Firewall settings');
  }
  
  if (!results.sqlServer) {
    console.log('❌ SQL Server authentication failed:');
    console.log('   - Enable SQL Server Authentication mode');
    console.log('   - Enable and configure SA account');
    console.log('   - Check username/password credentials');
  }
  
  if (results.ping && results.ports[1433] && results.sqlServer) {
    console.log('✅ All tests passed! Your database should be accessible.');
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Run the tests
runNetworkTests().catch(console.error);
