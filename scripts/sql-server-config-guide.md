# SQL Server Express Remote Connection Configuration Guide

## 🎯 **Problem**
Your application cannot connect to SQL Server Express on `154.56.158.238\SQLEXPRESS` due to timeout errors.

## 🔧 **Solution Steps**

### **Step 1: Enable TCP/IP Protocol**
On the database server (`154.56.158.238`):

1. Open **SQL Server Configuration Manager**
2. Navigate to: **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**
3. Right-click **TCP/IP** → **Enable**
4. Double-click **TCP/IP** → **IP Addresses** tab
5. Scroll down to **IPAll** section
6. Set **TCP Port** to `1433` (or leave blank for dynamic)
7. Click **OK**
8. **Restart SQL Server service**

### **Step 2: Start SQL Server Browser Service**
1. Open **Services** (`services.msc`)
2. Find **SQL Server Browser**
3. Right-click → **Start**
4. Right-click → **Properties** → Set startup type to **Automatic**

### **Step 3: Configure Windows Firewall**
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → **Next**
4. Select **TCP** → **Specific local ports** → Enter `1433` → **Next**
5. Select **Allow the connection** → **Next**
6. Check all profiles → **Next**
7. Name: "SQL Server 1433" → **Finish**

Repeat for port **1434** (UDP) for SQL Server Browser.

### **Step 4: Enable SQL Server Authentication**
1. Open **SQL Server Management Studio**
2. Connect to `localhost\SQLEXPRESS`
3. Right-click server → **Properties** → **Security**
4. Select **SQL Server and Windows Authentication mode**
5. Click **OK** → **Restart SQL Server service**

### **Step 5: Enable SA Account**
1. In **SQL Server Management Studio**
2. Navigate to: **Security** → **Logins** → **sa**
3. Right-click **sa** → **Properties**
4. Go to **Status** tab
5. Set **Login** to **Enabled**
6. Go to **General** tab
7. Set a strong password for **sa** account

### **Step 6: Test Remote Connection**
From your application server, test the connection:

```cmd
# Test with SQL Server Management Studio
# Server name: 154.56.158.238\SQLEXPRESS
# Authentication: SQL Server Authentication
# Login: sa
# Password: [your password]
```

## 🚨 **Common Issues**

### **Issue 1: "Named Pipes Provider" Error**
- **Solution**: Enable TCP/IP protocol (Step 1)

### **Issue 2: "Login failed for user 'sa'"**
- **Solution**: Enable SQL Server Authentication and enable SA account (Steps 4-5)

### **Issue 3: "A network-related error occurred"**
- **Solution**: Check Windows Firewall settings (Step 3)

### **Issue 4: "SQL Server does not exist or access denied"**
- **Solution**: Start SQL Server Browser service (Step 2)

## ✅ **Verification Commands**

Run these on the database server to verify configuration:

```cmd
# Check if SQL Server service is running
sc query MSSQL$SQLEXPRESS

# Check if SQL Server Browser is running
sc query SQLBrowser

# Check listening ports
netstat -an | findstr 1433
netstat -an | findstr 1434
```

## 📞 **If Still Having Issues**

1. Check Windows Event Viewer for SQL Server errors
2. Verify the database server IP address is correct
3. Test with a simple connection string from another machine
4. Consider using the default instance instead of SQLEXPRESS

## 🔄 **Alternative: Use Default Instance**

If SQLEXPRESS continues to cause issues, you can:

1. Install SQL Server Express as the default instance
2. Use connection string: `154.56.158.238:1433` (no instance name)
3. Update your application's `.env.production` accordingly
