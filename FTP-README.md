# FTP Server Setup

## 🚀 Local Development FTP Server

This project includes a local FTP server for development and testing that matches the PHP configuration.

### Quick Start

```bash
# Start FTP server
npm run ftp:start

# Test connection
npm run ftp:test

# Stop server
npm run ftp:stop
```

### Configuration

- **Host**: `localhost`
- **Port**: `21`
- **Username**: `usermw`
- **Password**: `usermw`
- **HTTP Access**: `http://localhost:8080`

### Directory Structure

```
ftp-data/
├── uploads/
│   └── orders/
│       └── [Order files will appear here]
```

### Environment Variables

For local development, use these FTP settings:

```env
FTP_HOST=localhost
FTP_PORT=21
FTP_USER=usermw
FTP_PASSWORD=usermw
FTP_BASE_PATH=/uploads/orders
FTP_SECURE=false
FTP_HTTP_BASE_URL=http://localhost:8080
```

### Commands

- `npm run ftp:start` - Start FTP server
- `npm run ftp:stop` - Stop FTP server
- `npm run ftp:test` - Test FTP connection
- `npm run ftp:logs` - View server logs
- `npm run ftp:status` - Check server status

### Features

- ✅ Matches PHP FTP configuration
- ✅ Uppercase directory names (like PHP strtoupper)
- ✅ Binary file transfer
- ✅ HTTP file access via nginx
- ✅ Docker-based setup
- ✅ Easy management commands
