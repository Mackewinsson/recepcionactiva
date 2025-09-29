# 🚀 Recepción Activa - Sistema de Gestión de Órdenes de Trabajo

Sistema web moderno para la gestión de órdenes de trabajo con funcionalidad de carga de imágenes y integración con base de datos SQL Server.

## 📋 Requisitos Previos

- **Windows Server** (Windows 10/11 o Windows Server 2016+)
- **Node.js 18+** - [Descargar desde nodejs.org](https://nodejs.org) (versión LTS recomendada)
- **SQL Server** con la base de datos existente
- **Acceso a red** para el almacenamiento de imágenes

## ⚡ Instalación Rápida

### Paso 1: Instalar Node.js
1. Descargue Node.js desde [nodejs.org](https://nodejs.org)
2. Instale la versión LTS (Long Term Support)
3. Verifique la instalación abriendo CMD y ejecutando:
   ```cmd
   node --version
   npm --version
   ```

### Paso 2: Ejecutar el Instalador
1. Clone o descargue este repositorio
2. Navegue a la carpeta del proyecto
3. **Ejecute el instalador automático:**
   ```cmd
   setup.bat
   ```

### Paso 3: Configurar Base de Datos
1. Cuando se abra el archivo `.env` en Notepad, configure según su servidor SQL Server:

   **Para instancia por defecto (puerto 1433):**
   ```env
   NODE_ENV=production
   DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=VsolDatos;trustServerCertificate=true"
   PORT=3000
   APP_URL=http://192.168.1.30:3000
   ```

   **Para instancia nombrada (ej: SQLEXPRESS):**
   ```env
   NODE_ENV=production
   DATABASE_URL="sqlserver://sa:su_password@192.168.1.30\\SQLEXPRESS:1433;database=VsolDatos;trustServerCertificate=true"
   PORT=3000
   APP_URL=http://192.168.1.30:3000
   ```

2. **IMPORTANTE:** Reemplace los valores por los de su servidor:
   - `192.168.1.30` → IP de su servidor SQL Server
   - `su_password` → Contraseña del usuario `sa`
   - `VsolDatos` → Nombre de su base de datos
   - `SQLEXPRESS` → Nombre de su instancia (si aplica)

3. Guarde el archivo y cierre Notepad

## 🎯 ¡Listo! El sistema estará funcionando

Después de ejecutar `setup.bat`, el sistema estará disponible en:
- **Acceso local:** http://localhost:3000
- **Acceso en red:** http://[IP_DEL_SERVIDOR]:3000

## 🔧 Configuración de Almacenamiento de Imágenes

### Opción A: Ruta de Red (Recomendado para producción)
1. **Verificar conectividad de red:**
   ```cmd
   dir \\192.168.1.30\Imagenes
   ```

2. **Configurar en el archivo .env:**
   ```env
   NETWORK_IMAGE_PATH=\\192.168.1.30\Imagenes\
   ```

3. **Configurar en la base de datos:**
   ```sql
   -- Verificar configuración actual
   SELECT * FROM PRM WHERE NOMPRM = 'CarpetaImagenes'
   
   -- Actualizar si es necesario
   UPDATE PRM SET VALPRM = '\\192.168.1.30\Imagenes' WHERE NOMPRM = 'CarpetaImagenes'
   ```

### Opción B: Ruta Local de Windows
1. **Crear directorio local:**
   ```cmd
   mkdir C:\Mw_Imagenes
   ```

2. **Configurar en el archivo .env:**
   ```env
   NETWORK_IMAGE_PATH=C:\Mw_Imagenes\
   ```

3. **Configurar en la base de datos:**
   ```sql
   UPDATE PRM SET VALPRM = 'C:\Mw_Imagenes' WHERE NOMPRM = 'CarpetaImagenes'
   ```

### ⚠️ Importante
- La ruta configurada en `.env` debe coincidir con la configurada en la tabla `PRM`
- Asegúrese de que la aplicación tenga permisos de escritura en la carpeta
- Para rutas de red, verifique que el servicio de red esté funcionando

## 🛠️ Comandos Útiles

```cmd
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicación
pm2 restart all

# Detener aplicación
pm2 stop all

# Iniciar aplicación
pm2 start all

# Monitorear recursos
pm2 monit
```

## 🔥 Configuración de Firewall

Para permitir acceso desde otros equipos:
1. Abra **Windows Defender Firewall**
2. Haga clic en **Configuración avanzada**
3. Seleccione **Reglas de entrada** → **Nueva regla**
4. Elija **Puerto** → **TCP** → **Puerto específico: 3000**
5. Permita la conexión

## 🔧 Configuración de SQL Server en Windows

### Verificar configuración de SQL Server:

1. **Habilitar TCP/IP:**
   - Abrir "SQL Server Configuration Manager"
   - Ir a "SQL Server Network Configuration" → "Protocols for [INSTANCE]"
   - Habilitar "TCP/IP"
   - Reiniciar SQL Server

2. **Para instancias nombradas (ej: SQLEXPRESS):**
   - Asegurar que "SQL Server Browser" esté ejecutándose
   - Usar formato: `sqlserver://usuario:password@IP\\INSTANCIA:puerto;database=nombre;trustServerCertificate=true`

3. **Verificar conectividad:**
   ```cmd
   telnet 192.168.1.30 1433
   ```

4. **Probar conexión desde SQL Server Management Studio:**
   - Servidor: `192.168.1.30` o `192.168.1.30\SQLEXPRESS`
   - Autenticación: SQL Server Authentication
   - Usuario: `sa`
   - Contraseña: [su contraseña]

## 🔧 Herramientas de Diagnóstico

### Script de Diagnóstico Automático
Si tiene problemas con la instalación, ejecute el script de diagnóstico:

```cmd
troubleshoot.bat
```

Este script verificará automáticamente:
- ✅ Node.js y npm
- ✅ PM2
- ✅ Archivo .env
- ✅ Dependencias instaladas
- ✅ Cliente de Prisma generado
- ✅ Aplicación compilada
- ✅ Estado de la aplicación

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
- ✅ Verifique que SQL Server esté ejecutándose
- ✅ Confirme la cadena de conexión en el archivo `.env`
- ✅ Asegúrese de que SQL Server permita conexiones TCP/IP
- ✅ Para instancias nombradas, verifique que SQL Server Browser esté ejecutándose
- ✅ Compruebe que el puerto 1433 esté abierto en el firewall
- ✅ Verifique que el usuario `sa` tenga permisos de acceso

### Error: "Login failed for user 'sa'"
- Verificar que la autenticación SQL Server esté habilitada
- Confirmar que el usuario `sa` esté habilitado
- Verificar la contraseña del usuario `sa`

### Error: "Cannot connect to server"
- Verificar que SQL Server esté ejecutándose
- Comprobar la conectividad de red: `ping 192.168.1.30`
- Verificar que el puerto 1433 esté abierto: `telnet 192.168.1.30 1433`

### Error al Cargar Imágenes
- ✅ Verifique la accesibilidad de la ruta de red
- ✅ Confirme la configuración de la tabla PRM
- ✅ Asegúrese de los permisos del directorio

### Puerto ya en Uso
```cmd
# Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Terminar el proceso
taskkill /PID [id_del_proceso] /F
```

### Problemas con PM2
```cmd
# Reiniciar aplicación
pm2 restart all

# Ver logs detallados
pm2 logs

# Detener y iniciar desde cero
pm2 stop all
pm2 start all
```

## 📁 Estructura del Proyecto

```
recepcionactiva/
├── src/                    # Código fuente de la aplicación
├── public/                 # Archivos públicos
├── prisma/                 # Configuración de base de datos
├── ecosystem.config.js     # Configuración de PM2
├── setup.bat              # Instalador automático
├── env.example            # Plantilla de variables de entorno
└── README.md              # Este archivo
```

## 🔄 Actualizaciones

Para actualizar el sistema:
1. Detenga la aplicación: `pm2 stop all`
2. Actualice el código: `git pull` (si usa Git)
3. Reinstale dependencias: `npm install`
4. Recompile: `npm run build`
5. Reinicie: `pm2 start all`

## 📞 Soporte

Si encuentra problemas:
1. Verifique los logs: `pm2 logs`
2. Confirme la configuración del archivo `.env`
3. Verifique la conectividad de red y base de datos
4. Consulte la sección de solución de problemas arriba

## ✅ Lista de Verificación Final

- [ ] Node.js instalado
- [ ] Conexión a base de datos funcionando
- [ ] Variables de entorno configuradas
- [ ] Aplicación compilada exitosamente
- [ ] PM2 ejecutando la aplicación
- [ ] Firewall configurado
- [ ] Carga de imágenes probada
- [ ] Auto-inicio configurado

---

**¡El sistema está listo para usar!** 🎉

Para cualquier consulta o problema, revise esta documentación o contacte al administrador del sistema.
