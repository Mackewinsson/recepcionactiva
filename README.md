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

### Paso 2: Configurar el Proyecto
1. Clone o descargue este repositorio
2. Navegue a la carpeta del proyecto
3. **Instale las dependencias:**
   ```bash
   npm install
   ```

### Paso 3: Configurar Base de Datos
1. Copie el archivo de ejemplo y configure las variables de entorno:
   ```bash
   cp env.example .env
   ```
2. Edite el archivo `.env` y configure según su servidor SQL Server:

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

3. **IMPORTANTE:** Reemplace los valores por los de su servidor:
   - `192.168.1.30` → IP de su servidor SQL Server
   - `su_password` → Contraseña del usuario `sa`
   - `VsolDatos` → Nombre de su base de datos
   - `SQLEXPRESS` → Nombre de su instancia (si aplica)

4. Guarde el archivo `.env`

### Paso 4: Generar Cliente de Prisma y Compilar
```bash
# Generar cliente de Prisma
npx prisma generate

# Compilar la aplicación
npm run build
```

### Paso 5: Iniciar la Aplicación
```bash
# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

## 🎯 ¡Listo! El sistema estará funcionando

Después de completar la configuración, el sistema estará disponible en:
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

## 📸 Sistema de Subida de Fotos (FTP)

La aplicación utiliza un servidor FTP para la subida de fotos, proporcionando almacenamiento centralizado y mejor escalabilidad.

### Configuración FTP

Las fotos se suben al servidor FTP con la siguiente estructura:
```
/uploads/orders/{numeroOrden}/{nombre-unico}
```

### Configurar FTP

1. **Configurar parámetros FTP**:
   ```bash
   npm run setup-ftp
   ```

2. **Actualizar el archivo .env** con los detalles reales del servidor FTP:
   ```env
   FTP_HOST=192.168.1.30
   FTP_PORT=21
   FTP_USER=tu_usuario_ftp
   FTP_PASSWORD=tu_contraseña_ftp
   FTP_BASE_PATH=/uploads/orders
   FTP_SECURE=false
   FTP_HTTP_BASE_URL=http://192.168.1.30/uploads/orders
   ```

3. **Probar conexión FTP**:
   ```bash
   npm run test-ftp
   ```

### Características FTP

- ✅ **Creación automática de carpetas**: Las carpetas específicas por orden se crean automáticamente
- ✅ **Nombres únicos**: Nomenclatura basada en UUID previene conflictos
- ✅ **Integración con base de datos**: Referencias de fotos almacenadas en tabla `FOT`
- ✅ **Manejo de errores**: Manejo completo de errores y logging
- ✅ **Gestión de archivos**: Operaciones de subida y eliminación vía FTP
- ✅ **Acceso HTTP**: URLs HTTP configurables para acceso a fotos

### Requisitos del Servidor FTP

- El servidor FTP debe estar ejecutándose y ser accesible
- El usuario debe tener permisos de lectura/escritura en la ruta base
- La ruta base debe existir o ser creable por el usuario FTP
- Para acceso HTTP, configure un servidor web para servir archivos desde el directorio FTP

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

# Configurar FTP para subida de fotos
npm run setup-ftp

# Probar conexión FTP
npm run test-ftp

# Encriptar contraseña
npm run encrypt-password <contraseña>

# Crear usuario
npm run create-user <nombre> <id> [contraseña]

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

### Verificación Manual
Para verificar la instalación, ejecute estos comandos:

```bash
# Verificar Node.js y npm
node --version
npm --version

# Verificar dependencias
npm list

# Generar cliente de Prisma
npx prisma generate

# Compilar la aplicación
npm run build
```

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
├── scripts/                # Scripts de desarrollo
├── ecosystem.config.js     # Configuración de PM2
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
