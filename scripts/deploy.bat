@echo off
chcp 65001 >nul
title Recepción Activa - Deploy

echo.
echo ==========================================
echo    RECEPCIÓN ACTIVA - DEPLOY
echo ==========================================
echo.

REM Verifica si PM2 está instalado
where pm2 >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ PM2 no encontrado. Ejecute setup.bat primero.
    echo.
    pause
    exit /b 1
)

REM Verifica si existe el archivo .env
IF NOT EXIST .env (
    echo ❌ Archivo .env no encontrado.
    echo.
    echo Ejecute setup.bat primero para configurar el entorno.
    echo.
    pause
    exit /b 1
)

echo ✅ Verificaciones completadas
echo.

REM Compila la aplicación
echo [1/3] Compilando aplicación...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error compilando la aplicación
    echo.
    pause
    exit /b 1
)
echo ✅ Aplicación compilada

REM Reinicia la aplicación con PM2
echo.
echo [2/3] Reiniciando aplicación...
call pm2 restart recepcionactiva
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error reiniciando la aplicación
    echo.
    pause
    exit /b 1
)
echo ✅ Aplicación reiniciada

REM Guarda la configuración de PM2
echo.
echo [3/3] Guardando configuración...
call pm2 save
echo ✅ Configuración guardada

echo.
echo ==========================================
echo    DEPLOY COMPLETADO
echo ==========================================
echo.
echo ✅ Recepción Activa está ejecutándose
echo.
echo 🌐 Acceso local:    http://localhost:3000
echo.

REM Obtiene la IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo 🌐 Acceso por IP:   http://%%b:3000
    )
)

echo.
echo 📋 Comandos útiles:
echo    pm2 status          - Ver estado
echo    pm2 logs            - Ver logs
echo    pm2 restart all     - Reiniciar
echo.
echo Presione cualquier tecla para salir...
pause >nul
