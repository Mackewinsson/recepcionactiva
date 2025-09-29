@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Verificación de Configuración SQL Server

echo.
echo ==========================================
echo    VERIFICACIÓN DE CONFIGURACIÓN SQL SERVER
echo ==========================================
echo.

REM Verificar que existe archivo .env
IF NOT EXIST .env (
    echo ❌ ERROR: Archivo .env no encontrado
    echo.
    echo Solución: Copie env.example a .env y configure las variables
    echo.
    echo Comandos:
    echo   copy env.example .env
    echo   notepad .env
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo .env encontrado
echo.

REM Verificar DATABASE_URL
echo 🔍 Verificando DATABASE_URL...
findstr /C:"DATABASE_URL=" .env >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: DATABASE_URL no está configurada
    set DB_URL_OK=0
) ELSE (
    echo ✅ DATABASE_URL encontrada
    set DB_URL_OK=1
    
    REM Extraer y mostrar valor
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DATABASE_URL=" .env') do set DATABASE_URL_VALUE=%%a
    echo.
    echo 📋 Valor actual:
    echo !DATABASE_URL_VALUE!
    echo.
    
    REM Verificar que no esté vacía
    if "!DATABASE_URL_VALUE!"=="" (
        echo ❌ ERROR: DATABASE_URL está vacía
        set DB_FORMAT_OK=0
    ) else (
        echo ✅ DATABASE_URL tiene valor
        set DB_FORMAT_OK=1
        
        REM Verificar formato básico
        echo !DATABASE_URL_VALUE! | findstr /C:"sqlserver://" >nul
        if %ERRORLEVEL% NEQ 0 (
            echo ❌ ERROR: Formato incorrecto
            echo    Debe empezar con: sqlserver://
            echo    Formato correcto: sqlserver://usuario:password@host:puerto;database=nombre;trustServerCertificate=true
            set DB_FORMAT_OK=0
        ) else (
            echo ✅ Formato básico correcto (empieza con sqlserver://)
        )
        
        REM Verificar que no sea el valor de ejemplo
        echo !DATABASE_URL_VALUE! | findstr /C:"su_password_aqui" >nul
        if %ERRORLEVEL%==0 (
            echo ❌ ERROR: Aún tiene valores de ejemplo
            echo    Debe cambiar 'su_password_aqui' por su contraseña real
            set DB_FORMAT_OK=0
        ) else (
            echo ✅ No tiene valores de ejemplo
        )
        
        REM Verificar que no sea el valor de ejemplo de IP
        echo !DATABASE_URL_VALUE! | findstr /C:"192.168.1.30" >nul
        if %ERRORLEVEL%==0 (
            echo ⚠️  ADVERTENCIA: Usa IP de ejemplo (192.168.1.30)
            echo    Debe cambiar por la IP real de su servidor SQL Server
        ) else (
            echo ✅ No usa IP de ejemplo
        )
        
        REM Verificar que no sea el valor de ejemplo de base de datos
        echo !DATABASE_URL_VALUE! | findstr /C:"RecepcionActiva" >nul
        if %ERRORLEVEL%==0 (
            echo ⚠️  ADVERTENCIA: Usa nombre de base de datos de ejemplo
            echo    Debe cambiar por el nombre real de su base de datos
        )
    )
)

echo.
echo 🔍 Verificando otras variables de base de datos...

REM Verificar DB_HOST
findstr /C:"DB_HOST=" .env >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ DB_HOST no configurada
    set DB_HOST_OK=0
) ELSE (
    echo ✅ DB_HOST configurada
    set DB_HOST_OK=1
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_HOST=" .env') do set DB_HOST_VALUE=%%a
    echo    Valor: !DB_HOST_VALUE!
)

REM Verificar DB_NAME
findstr /C:"DB_NAME=" .env >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ DB_NAME no configurada
    set DB_NAME_OK=0
) ELSE (
    echo ✅ DB_NAME configurada
    set DB_NAME_OK=1
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_NAME=" .env') do set DB_NAME_VALUE=%%a
    echo    Valor: !DB_NAME_VALUE!
)

REM Verificar DB_USER
findstr /C:"DB_USER=" .env >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ DB_USER no configurada
    set DB_USER_OK=0
) ELSE (
    echo ✅ DB_USER configurada
    set DB_USER_OK=1
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_USER=" .env') do set DB_USER_VALUE=%%a
    echo    Valor: !DB_USER_VALUE!
)

REM Verificar DB_PASS
findstr /C:"DB_PASS=" .env >nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ DB_PASS no configurada
    set DB_PASS_OK=0
) ELSE (
    echo ✅ DB_PASS configurada
    set DB_PASS_OK=1
    for /f "tokens=2 delims==" %%a in ('findstr /C:"DB_PASS=" .env') do set DB_PASS_VALUE=%%a
    echo    Valor: [OCULTO POR SEGURIDAD]
)

echo.
echo ==========================================
echo    PRUEBA DE CONECTIVIDAD
echo ==========================================
echo.

if !DB_HOST_OK!==1 (
    echo 🔍 Probando conectividad con servidor SQL Server...
    echo Servidor: !DB_HOST_VALUE!
    echo.
    
    REM Probar ping
    echo [1/4] Probando conectividad básica (ping)...
    ping -n 1 !DB_HOST_VALUE! >nul 2>nul
    if %ERRORLEVEL%==0 (
        echo ✅ Servidor accesible por ping
    ) else (
        echo ❌ Servidor no accesible por ping
        echo    Verifique que la IP sea correcta y el servidor esté encendido
    )
    
    REM Probar puerto 1433
    echo.
    echo [2/4] Probando puerto SQL Server (1433)...
    echo Probando conexión TCP al puerto 1433...
    echo (Esto puede tomar unos segundos...)
    
    REM Usar PowerShell para probar el puerto
    powershell -Command "try { $tcpClient = New-Object System.Net.Sockets.TcpClient; $tcpClient.Connect('!DB_HOST_VALUE!', 1433); $tcpClient.Close(); Write-Host '✅ Puerto 1433 accesible' } catch { Write-Host '❌ Puerto 1433 no accesible' }" 2>nul
    
    REM Probar con telnet si está disponible
    echo.
    echo [3/4] Probando con telnet (si está disponible)...
    where telnet >nul 2>nul
    if %ERRORLEVEL%==0 (
        echo Probando telnet a !DB_HOST_VALUE!:1433...
        echo (Presione Ctrl+C si se cuelga)
        timeout /t 3 /nobreak >nul
        echo Si telnet se conecta, el puerto está abierto
    ) else (
        echo Telnet no disponible en este sistema
    )
    
    REM Probar generación de cliente Prisma
    echo.
    echo [4/4] Probando generación de cliente Prisma...
    echo Esto verifica que la configuración sea válida para Prisma...
    npx prisma generate >nul 2>nul
    if %ERRORLEVEL%==0 (
        echo ✅ Cliente Prisma generado exitosamente
        echo    La configuración de base de datos es válida
    ) else (
        echo ❌ Error generando cliente Prisma
        echo    La configuración de base de datos tiene problemas
        echo.
        echo Posibles causas:
        echo 1. Formato incorrecto de DATABASE_URL
        echo 2. Credenciales incorrectas
        echo 3. Base de datos no existe
        echo 4. Servidor no accesible
    )
    
) else (
    echo ⚠️  No se puede probar conectividad (DB_HOST no configurado)
)

echo.
echo ==========================================
echo    RESUMEN Y RECOMENDACIONES
echo ==========================================
echo.

if !DB_URL_OK!==1 (
    if !DB_FORMAT_OK!==1 (
        echo ✅ CONFIGURACIÓN BÁSICA: OK
        echo    DATABASE_URL está configurada y tiene formato correcto
    ) else (
        echo ❌ CONFIGURACIÓN BÁSICA: PROBLEMA
        echo    DATABASE_URL tiene problemas de formato
    )
) else (
    echo ❌ CONFIGURACIÓN BÁSICA: PROBLEMA
    echo    DATABASE_URL no está configurada
)

echo.
echo 📖 EJEMPLOS DE CONFIGURACIÓN CORRECTA:
echo.
echo Para instancia por defecto (puerto 1433):
echo DATABASE_URL="sqlserver://sa:SU_CONTRASEÑA@SU_IP:1433;database=SU_BASE_DATOS;trustServerCertificate=true"
echo.
echo Para instancia nombrada (ej: SQLEXPRESS):
echo DATABASE_URL="sqlserver://sa:SU_CONTRASEÑA@SU_IP\\SQLEXPRESS:1433;database=SU_BASE_DATOS;trustServerCertificate=true"
echo.
echo Para instancia con encriptación:
echo DATABASE_URL="sqlserver://sa:SU_CONTRASEÑA@SU_IP:1433;database=SU_BASE_DATOS;trustServerCertificate=true;encrypt=true"
echo.

echo 🔧 COMANDOS DE DIAGNÓSTICO:
echo    telnet [IP] 1433    - Probar puerto SQL Server
echo    ping [IP]           - Probar conectividad básica
echo    npx prisma generate - Probar configuración Prisma
echo.

echo 📋 PRÓXIMOS PASOS:
if !DB_URL_OK!==0 (
    echo 1. Configurar DATABASE_URL en archivo .env
) else if !DB_FORMAT_OK!==0 (
    echo 1. Corregir formato de DATABASE_URL
) else (
    echo 1. ✅ Configuración básica correcta
    echo 2. Verificar que SQL Server esté ejecutándose
    echo 3. Verificar que TCP/IP esté habilitado
    echo 4. Verificar configuración de firewall
    echo 5. Probar la aplicación
)

echo.
echo Presione cualquier tecla para salir...
pause >nul
