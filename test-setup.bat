@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Test Setup Script

echo.
echo ==========================================
echo    TESTING SETUP.BAT SCRIPT
echo ==========================================
echo.

echo 🧪 Este script probará el funcionamiento de setup.bat
echo.
echo ⚠️  ADVERTENCIA: Esto limpiará algunos archivos para probar la instalación
echo.
echo ¿Desea continuar? (S/N)
set /p CONTINUE=
if /i not "!CONTINUE!"=="S" (
    echo Test cancelado.
    pause
    exit /b 0
)

echo.
echo 📋 Preparando entorno de prueba...

REM Crear backup
echo [1/6] Creando backup de archivos importantes...
if not exist backup mkdir backup
if exist .env copy .env backup\ >nul
if exist package-lock.json copy package-lock.json backup\ >nul
echo ✅ Backup creado

REM Limpiar entorno
echo [2/6] Limpiando entorno para prueba...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist .env del .env
if exist src\generated rmdir /s /q src\generated
echo ✅ Entorno limpiado

REM Verificar estado inicial
echo [3/6] Verificando estado inicial...
echo.
echo Estado antes de setup.bat:
echo - Node.js: 
where node >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - npm: 
where npm >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - PM2: 
where pm2 >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - .env: 
if exist .env (echo   ✅ Existe) else (echo   ❌ No existe)
echo - node_modules: 
if exist node_modules (echo   ✅ Existe) else (echo   ❌ No existe)
echo - .next: 
if exist .next (echo   ✅ Existe) else (echo   ❌ No existe)

echo.
echo [4/6] Ejecutando setup.bat...
echo.
echo ==========================================
echo    EJECUTANDO SETUP.BAT
echo ==========================================
echo.

REM Ejecutar setup.bat
call setup.bat
set SETUP_RESULT=%ERRORLEVEL%

echo.
echo ==========================================
echo    RESULTADO DEL TEST
echo ==========================================
echo.

if %SETUP_RESULT%==0 (
    echo ✅ setup.bat se ejecutó exitosamente
) else (
    echo ❌ setup.bat falló con código de error: %SETUP_RESULT%
)

echo.
echo [5/6] Verificando estado final...
echo.
echo Estado después de setup.bat:
echo - Node.js: 
where node >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - npm: 
where npm >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - PM2: 
where pm2 >nul 2>nul && echo   ✅ Instalado || echo   ❌ No instalado
echo - .env: 
if exist .env (echo   ✅ Existe) else (echo   ❌ No existe)
echo - node_modules: 
if exist node_modules (echo   ✅ Existe) else (echo   ❌ No existe)
echo - .next: 
if exist .next (echo   ✅ Existe) else (echo   ❌ No existe)
echo - src\generated: 
if exist src\generated (echo   ✅ Existe) else (echo   ❌ No existe)

REM Verificar PM2
echo - Aplicación en PM2: 
if exist node_modules (
    call pm2 status recepcionactiva >nul 2>nul
    if %ERRORLEVEL%==0 (
        echo   ✅ Ejecutándose
    ) else (
        echo   ❌ No ejecutándose
    )
) else (
    echo   ❌ No se puede verificar (dependencias no instaladas)
)

echo.
echo [6/6] Restaurando backup...
if exist backup\.env copy backup\.env .env >nul
if exist backup\package-lock.json copy backup\package-lock.json . >nul
echo ✅ Backup restaurado

echo.
echo ==========================================
echo    RESUMEN DEL TEST
echo ==========================================
echo.

if %SETUP_RESULT%==0 (
    echo 🎉 TEST EXITOSO
    echo.
    echo ✅ setup.bat funcionó correctamente
    echo ✅ Todos los componentes se instalaron
    echo ✅ La aplicación debería estar ejecutándose
    echo.
    echo 🌐 Verifique el acceso en: http://localhost:3000
) else (
    echo ❌ TEST FALLIDO
    echo.
    echo ❌ setup.bat falló durante la ejecución
    echo ❌ Revise los mensajes de error arriba
    echo ❌ Consulte la documentación para solucionar problemas
)

echo.
echo 📋 Próximos pasos:
echo 1. Verificar que la aplicación esté accesible
echo 2. Probar funcionalidades básicas
echo 3. Verificar logs con: pm2 logs recepcionactiva
echo 4. Si hay problemas, ejecutar: troubleshoot.bat
echo.
echo Presione cualquier tecla para salir...
pause >nul
