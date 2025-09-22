@echo off
chcp 65001 >nul
title Recepción Activa - Instalador

echo.
echo ==========================================
echo    RECEPCIÓN ACTIVA - INSTALADOR
echo ==========================================
echo.

REM Verifica si Node.js está instalado
echo [1/6] Verificando Node.js...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no encontrado.
    echo.
    echo Por favor instale Node.js desde: https://nodejs.org
    echo Versión recomendada: LTS (Long Term Support)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

REM Verifica si npm está disponible
echo.
echo [2/6] Verificando npm...
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no encontrado.
    echo.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version

REM Instala PM2 globalmente
echo.
echo [3/6] Instalando PM2...
call npm install -g pm2
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando PM2
    echo.
    pause
    exit /b 1
)
echo ✅ PM2 instalado correctamente

REM Instala dependencias del proyecto
echo.
echo [4/6] Instalando dependencias del proyecto...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    echo.
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

REM Configura archivo .env
echo.
echo [5/6] Configurando variables de entorno...
IF NOT EXIST .env (
    copy env.example .env
    echo ✅ Archivo .env creado desde plantilla
    echo.
    echo ⚠️  IMPORTANTE: Debe configurar el archivo .env
    echo.
    echo Presione Enter para abrir el archivo de configuración...
    pause >nul
    notepad .env
) ELSE (
    echo ✅ Archivo .env ya existe
)

REM Crea directorio de logs
IF NOT EXIST logs mkdir logs
echo ✅ Directorio de logs creado

REM Build del proyecto
echo.
echo [6/6] Compilando aplicación...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error compilando la aplicación
    echo.
    pause
    exit /b 1
)
echo ✅ Aplicación compilada

REM Inicia la aplicación con PM2
echo.
echo ==========================================
echo    INICIANDO APLICACIÓN
echo ==========================================
echo.

call pm2 start ecosystem.config.js
call pm2 save

echo.
echo ==========================================
echo    INSTALACIÓN COMPLETADA
echo ==========================================
echo.
echo ✅ Recepción Activa está ejecutándose
echo.
echo 🌐 Acceso local:    http://localhost:3000
echo 🌐 Acceso en red:   http://%COMPUTERNAME%:3000
echo.

REM Obtiene la IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo 🌐 Acceso por IP:   http://%%b:3000
    )
)

echo.
echo 📋 Comandos útiles:
echo    pm2 status          - Ver estado de la aplicación
echo    pm2 logs            - Ver logs en tiempo real
echo    pm2 restart all     - Reiniciar aplicación
echo    pm2 stop all        - Detener aplicación
echo.
echo Presione cualquier tecla para salir...
pause >nul
