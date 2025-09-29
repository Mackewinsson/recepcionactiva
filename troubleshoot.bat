@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Recepción Activa - Diagnóstico de Problemas

echo.
echo ==========================================
echo    DIAGNÓSTICO DE PROBLEMAS
echo ==========================================
echo.

echo 🔍 Verificando componentes del sistema...
echo.

REM Verifica Node.js
echo [1/8] Verificando Node.js...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no encontrado
    set NODE_OK=0
) ELSE (
    echo ✅ Node.js encontrado
    for /f "tokens=*" %%i in ('node --version') do echo    Versión: %%i
    set NODE_OK=1
)

REM Verifica npm
echo.
echo [2/8] Verificando npm...
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no encontrado
    set NPM_OK=0
) ELSE (
    echo ✅ npm encontrado
    for /f "tokens=*" %%i in ('npm --version') do echo    Versión: %%i
    set NPM_OK=1
)

REM Verifica PM2
echo.
echo [3/8] Verificando PM2...
where pm2 >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ PM2 no encontrado
    set PM2_OK=0
) ELSE (
    echo ✅ PM2 encontrado
    for /f "tokens=*" %%i in ('pm2 --version') do echo    Versión: %%i
    set PM2_OK=1
)

REM Verifica archivo .env
echo.
echo [4/8] Verificando archivo .env...
IF NOT EXIST .env (
    echo ❌ Archivo .env no encontrado
    set ENV_OK=0
) ELSE (
    echo ✅ Archivo .env encontrado
    set ENV_OK=1
    
    REM Verifica variables importantes
    echo    Verificando variables de entorno...
    findstr /C:"DATABASE_URL" .env >nul
    IF %ERRORLEVEL% NEQ 0 (
        echo    ❌ DATABASE_URL no configurada
        set DB_URL_OK=0
    ) ELSE (
        echo    ✅ DATABASE_URL configurada
        set DB_URL_OK=1
        
        REM Verificar formato de DATABASE_URL
        for /f "tokens=2 delims==" %%a in ('findstr /C:"DATABASE_URL=" .env') do set DATABASE_URL_VALUE=%%a
        
        REM Verificar que no esté vacía
        if "!DATABASE_URL_VALUE!"=="" (
            echo    ❌ DATABASE_URL está vacía
            set DB_FORMAT_OK=0
        ) else (
            echo    ✅ DATABASE_URL tiene valor
            
            REM Verificar formato básico
            echo !DATABASE_URL_VALUE! | findstr /C:"sqlserver://" >nul
            if %ERRORLEVEL% NEQ 0 (
                echo    ❌ DATABASE_URL formato incorrecto (debe empezar con sqlserver://)
                set DB_FORMAT_OK=0
            ) else (
                echo    ✅ DATABASE_URL formato correcto
                set DB_FORMAT_OK=1
            )
            
            REM Verificar que no sea el valor de ejemplo
            echo !DATABASE_URL_VALUE! | findstr /C:"su_password_aqui" >nul
            if %ERRORLEVEL%==0 (
                echo    ❌ DATABASE_URL aún tiene valores de ejemplo
                set DB_FORMAT_OK=0
            )
            
            REM Verificar que no sea el valor de ejemplo de IP
            echo !DATABASE_URL_VALUE! | findstr /C:"192.168.1.30" >nul
            if %ERRORLEVEL%==0 (
                echo    ⚠️  DATABASE_URL usa IP de ejemplo (192.168.1.30)
            )
        )
    )
    
    findstr /C:"NODE_ENV" .env >nul
    IF %ERRORLEVEL% NEQ 0 (
        echo    ❌ NODE_ENV no configurada
    ) ELSE (
        echo    ✅ NODE_ENV configurada
    )
    
    REM Verificar otras variables de base de datos
    findstr /C:"DB_HOST" .env >nul
    IF %ERRORLEVEL% NEQ 0 (
        echo    ❌ DB_HOST no configurada
    ) ELSE (
        echo    ✅ DB_HOST configurada
    )
    
    findstr /C:"DB_NAME" .env >nul
    IF %ERRORLEVEL% NEQ 0 (
        echo    ❌ DB_NAME no configurada
    ) ELSE (
        echo    ✅ DB_NAME configurada
    )
)

REM Verifica dependencias
echo.
echo [5/8] Verificando dependencias...
IF NOT EXIST node_modules (
    echo ❌ Dependencias no instaladas (node_modules no encontrado)
    set DEPS_OK=0
) ELSE (
    echo ✅ Dependencias instaladas
    set DEPS_OK=1
)

REM Verifica cliente de Prisma
echo.
echo [6/8] Verificando cliente de Prisma...
IF NOT EXIST src\generated\prisma (
    echo ❌ Cliente de Prisma no generado
    set PRISMA_OK=0
) ELSE (
    echo ✅ Cliente de Prisma generado
    set PRISMA_OK=1
)

REM Verifica build
echo.
echo [7/8] Verificando build de la aplicación...
IF NOT EXIST .next (
    echo ❌ Aplicación no compilada (.next no encontrado)
    set BUILD_OK=0
) ELSE (
    echo ✅ Aplicación compilada
    set BUILD_OK=1
)

REM Verifica estado de PM2
echo.
echo [8/8] Verificando estado de la aplicación...
if !PM2_OK!==1 (
    call pm2 status recepcionactiva >nul 2>nul
    IF %ERRORLEVEL% NEQ 0 (
        echo ❌ Aplicación no está ejecutándose en PM2
        set APP_OK=0
    ) ELSE (
        echo ✅ Aplicación ejecutándose en PM2
        set APP_OK=1
        echo.
        echo Estado actual:
        call pm2 status recepcionactiva
    )
) ELSE (
    echo ❌ No se puede verificar (PM2 no instalado)
    set APP_OK=0
)

echo.
echo ==========================================
echo    RESUMEN DEL DIAGNÓSTICO
echo ==========================================
echo.

if !NODE_OK!==1 (
    echo ✅ Node.js: OK
) ELSE (
    echo ❌ Node.js: PROBLEMA - Instalar desde https://nodejs.org
)

if !NPM_OK!==1 (
    echo ✅ npm: OK
) ELSE (
    echo ❌ npm: PROBLEMA - Reinstalar Node.js
)

if !PM2_OK!==1 (
    echo ✅ PM2: OK
) ELSE (
    echo ❌ PM2: PROBLEMA - Ejecutar: npm install -g pm2
)

if !ENV_OK!==1 (
    echo ✅ Archivo .env: OK
) ELSE (
    echo ❌ Archivo .env: PROBLEMA - Copiar desde env.example
)

if !DEPS_OK!==1 (
    echo ✅ Dependencias: OK
) ELSE (
    echo ❌ Dependencias: PROBLEMA - Ejecutar: npm install
)

if !PRISMA_OK!==1 (
    echo ✅ Cliente Prisma: OK
) ELSE (
    echo ❌ Cliente Prisma: PROBLEMA - Ejecutar: npx prisma generate
)

if !BUILD_OK!==1 (
    echo ✅ Build: OK
) ELSE (
    echo ❌ Build: PROBLEMA - Ejecutar: npm run build
)

if !APP_OK!==1 (
    echo ✅ Aplicación: OK
) ELSE (
    echo ❌ Aplicación: PROBLEMA - Verificar logs con: pm2 logs recepcionactiva
)

echo.
echo ==========================================
echo    COMANDOS DE SOLUCIÓN
echo ==========================================
echo.

if !NODE_OK!==0 (
    echo Para instalar Node.js:
    echo 1. Descargar desde: https://nodejs.org
    echo 2. Instalar versión LTS
    echo 3. Reiniciar este script
    echo.
)

if !PM2_OK!==0 (
    echo Para instalar PM2:
    echo npm install -g pm2
    echo.
)

if !ENV_OK!==0 (
    echo Para crear archivo .env:
    echo copy env.example .env
    echo notepad .env
    echo.
)

if !DEPS_OK!==0 (
    echo Para instalar dependencias:
    echo npm install
    echo.
)

if !PRISMA_OK!==0 (
    echo Para generar cliente de Prisma:
    echo npx prisma generate
    echo.
)

if !BUILD_OK!==0 (
    echo Para compilar la aplicación:
    echo npm run build
    echo.
)

if !APP_OK!==0 (
    echo Para iniciar la aplicación:
    echo pm2 start ecosystem.config.js
    echo pm2 save
    echo.
)

echo.
echo ==========================================
echo    PRUEBA DE CONECTIVIDAD SQL SERVER
echo ==========================================
echo.

if !DB_URL_OK!==1 (
    echo 🔍 Probando conectividad con SQL Server...
    echo.
    
    REM Extraer información de la DATABASE_URL
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DATABASE_URL=" .env') do set DATABASE_URL_VALUE=%%a
    
    REM Extraer host de DB_HOST si está disponible
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_HOST=" .env') do set DB_HOST_VALUE=%%a
    
    if not "!DB_HOST_VALUE!"=="" (
        echo Probando conectividad con: !DB_HOST_VALUE!
        echo.
        
        REM Probar ping
        echo [1/3] Probando conectividad básica (ping)...
        ping -n 1 !DB_HOST_VALUE! >nul 2>nul
        if %ERRORLEVEL%==0 (
            echo ✅ Servidor accesible por ping
        ) else (
            echo ❌ Servidor no accesible por ping
            echo    Verifique que la IP sea correcta y el servidor esté encendido
        )
        
        REM Probar puerto 1433
        echo.
        echo [2/3] Probando puerto SQL Server (1433)...
        echo Probando conexión TCP al puerto 1433...
        echo (Esto puede tomar unos segundos...)
        
        REM Usar PowerShell para probar el puerto
        powershell -Command "try { $tcpClient = New-Object System.Net.Sockets.TcpClient; $tcpClient.Connect('!DB_HOST_VALUE!', 1433); $tcpClient.Close(); Write-Host '✅ Puerto 1433 accesible' } catch { Write-Host '❌ Puerto 1433 no accesible' }" 2>nul
        
        REM Probar con telnet si está disponible
        echo.
        echo [3/3] Probando con telnet (si está disponible)...
        where telnet >nul 2>nul
        if %ERRORLEVEL%==0 (
            echo Probando telnet a !DB_HOST_VALUE!:1433...
            echo (Presione Ctrl+C si se cuelga)
            timeout /t 3 /nobreak >nul
            echo Si telnet se conecta, el puerto está abierto
        ) else (
            echo Telnet no disponible en este sistema
        )
        
        echo.
        echo 📋 INFORMACIÓN DE CONFIGURACIÓN:
        echo DATABASE_URL: !DATABASE_URL_VALUE!
        echo DB_HOST: !DB_HOST_VALUE!
        echo.
        echo 🔧 SI HAY PROBLEMAS DE CONECTIVIDAD:
        echo 1. Verificar que SQL Server esté ejecutándose
        echo 2. Verificar que TCP/IP esté habilitado en SQL Server
        echo 3. Verificar configuración de firewall
        echo 4. Verificar que el puerto 1433 esté abierto
        echo 5. Para instancias nombradas, verificar SQL Server Browser
        echo.
    ) else (
        echo ⚠️  No se puede probar conectividad (DB_HOST no configurado)
    )
) else (
    echo ⚠️  No se puede probar conectividad (DATABASE_URL no configurada)
)

echo 📋 Comandos útiles:
echo    pm2 status          - Ver estado de la aplicación
echo    pm2 logs            - Ver logs en tiempo real
echo    pm2 restart all     - Reiniciar aplicación
echo    pm2 stop all        - Detener aplicación
echo    pm2 monit           - Monitoreo en tiempo real
echo.
echo 🔧 Comandos de diagnóstico SQL Server:
echo    telnet [IP] 1433    - Probar puerto SQL Server
echo    ping [IP]           - Probar conectividad básica
echo.
echo Presione cualquier tecla para salir...
pause >nul
