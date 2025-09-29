@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Recepción Activa - Instalador

echo.
echo ==========================================
echo    RECEPCIÓN ACTIVA - INSTALADOR
echo ==========================================
echo.

REM Verifica si Node.js está instalado
echo [1/8] Verificando Node.js...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no encontrado.
    echo.
    echo Por favor instale Node.js desde: https://nodejs.org
    echo Versión recomendada: LTS (Long Term Support)
    echo.
    echo Después de instalar Node.js, reinicie este instalador.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Versión: !NODE_VERSION!

REM Verifica si npm está disponible
echo.
echo [2/8] Verificando npm...
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no encontrado.
    echo.
    echo Esto puede indicar un problema con la instalación de Node.js.
    echo Por favor reinstale Node.js desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ npm encontrado
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    Versión: !NPM_VERSION!

REM Instala PM2 globalmente
echo.
echo [3/8] Instalando PM2...
call npm install -g pm2
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando PM2
    echo.
    echo Posibles soluciones:
    echo 1. Ejecutar como administrador
    echo 2. Verificar conexión a internet
    echo 3. Limpiar caché de npm: npm cache clean --force
    echo.
    pause
    exit /b 1
)
echo ✅ PM2 instalado correctamente

REM Limpia caché de npm para evitar problemas
echo.
echo [4/8] Limpiando caché de npm...
call npm cache clean --force
echo ✅ Caché limpiado

REM Instala dependencias del proyecto
echo.
echo [5/8] Instalando dependencias del proyecto...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    echo.
    echo Posibles soluciones:
    echo 1. Verificar conexión a internet
    echo 2. Eliminar node_modules y package-lock.json
    echo 3. Ejecutar: npm install --force
    echo.
    echo ¿Desea intentar con --force? (S/N)
    set /p FORCE_INSTALL=
    if /i "!FORCE_INSTALL!"=="S" (
        echo Intentando instalación forzada...
        call npm install --force
        IF %ERRORLEVEL% NEQ 0 (
            echo ❌ Error persistente. Verifique la conexión a internet.
            pause
            exit /b 1
        )
    ) else (
        pause
        exit /b 1
    )
)
echo ✅ Dependencias instaladas

REM Configura archivo .env
echo.
echo [6/8] Configurando variables de entorno...
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
    echo.
    echo ¿Desea reconfigurar el archivo .env? (S/N)
    set /p RECONFIG=
    if /i "!RECONFIG!"=="S" (
        echo Abriendo archivo .env para configuración...
        notepad .env
    )
)

REM Crea directorio de logs
IF NOT EXIST logs mkdir logs
echo ✅ Directorio de logs creado

REM Genera cliente de Prisma
echo.
echo [7/8] Generando cliente de Prisma...
call npx prisma generate
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error generando cliente de Prisma
    echo.
    echo Esto puede indicar un problema con la configuración de la base de datos.
    echo Verifique que el archivo .env esté configurado correctamente.
    echo.
    pause
    exit /b 1
)
echo ✅ Cliente de Prisma generado

REM Build del proyecto
echo.
echo [8/8] Compilando aplicación...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error compilando la aplicación
    echo.
    echo Posibles soluciones:
    echo 1. Verificar configuración en archivo .env
    echo 2. Verificar que la base de datos esté accesible
    echo 3. Revisar logs de compilación arriba
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

REM Detiene cualquier instancia previa
call pm2 stop recepcionactiva 2>nul
call pm2 delete recepcionactiva 2>nul

REM Inicia la aplicación
call pm2 start ecosystem.config.js
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error iniciando la aplicación con PM2
    echo.
    echo Posibles soluciones:
    echo 1. Verificar que el puerto 3000 no esté en uso
    echo 2. Verificar configuración en archivo .env
    echo 3. Revisar logs: pm2 logs recepcionactiva
    echo.
    pause
    exit /b 1
)

call pm2 save
echo ✅ Aplicación iniciada con PM2

REM Verifica que la aplicación esté funcionando
echo.
echo Verificando estado de la aplicación...
timeout /t 3 /nobreak >nul
call pm2 status recepcionactiva
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ La aplicación no está ejecutándose correctamente
    echo.
    echo Revise los logs con: pm2 logs recepcionactiva
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo    INSTALACIÓN COMPLETADA
echo ==========================================
echo.
echo ✅ Recepción Activa está ejecutándose correctamente
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
echo    pm2 monit           - Monitoreo en tiempo real
echo.
echo 🔧 Para configurar inicio automático:
echo    pm2 startup
echo    pm2 save
echo.
echo ⚠️  IMPORTANTE: Si la aplicación no funciona correctamente:
echo    1. Verifique la configuración en el archivo .env
echo    2. Revise los logs: pm2 logs recepcionactiva
echo    3. Verifique que SQL Server esté ejecutándose
echo    4. Consulte la documentación en README.md
echo.
echo Presione cualquier tecla para salir...
pause >nul
