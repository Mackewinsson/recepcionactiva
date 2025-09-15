#!/bin/bash

echo "🐳 Starting SQL Server container..."

# Check if container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^sql1$"; then
    echo "📦 Container 'sql1' exists, starting it..."
    docker start sql1
else
    echo "🆕 Creating new SQL Server container..."
    docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=sa2006Strong!" -p 1433:1433 --name sql1 -d mcr.microsoft.com/mssql/server:2022-latest
fi

# Wait for SQL Server to be ready
echo "⏳ Waiting for SQL Server to be ready..."
sleep 30

# Check if container is running
if docker ps --format 'table {{.Names}}' | grep -q "^sql1$"; then
    echo "✅ SQL Server is running on localhost:1433"
    echo "🔗 Database: MotosMunozDatos"
    echo "👤 Username: sa"
    echo "🔑 Password: sa2006Strong!"
else
    echo "❌ Failed to start SQL Server container"
    exit 1
fi
