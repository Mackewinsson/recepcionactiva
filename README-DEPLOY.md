# 🚀 Deploy de Recepción Activa en Windows

Guía completa para desplegar la aplicación Recepción Activa en un entorno Windows usando PM2.

---

## ✅ Requisitos previos

1. **Node.js** (versión LTS recomendada)  
   👉 [Descargar Node.js](https://nodejs.org)

2. **Acceso a la base de datos SQL Server** con los datos de conexión

3. **Permisos de red** para acceder a la carpeta de imágenes (si aplica)

---

## 🗂️ Archivos de configuración

### `ecosystem.config.js`
Configuración de PM2 para gestionar la aplicación:
- Nombre: `recepcionactiva`
- Puerto: `3000`
- Logs en carpeta `./logs/`
- Reinicio automático habilitado

### `env.example`
Plantilla de variables de entorno que debe copiarse a `.env`:
- Configuración de base de datos
- Configuración de red para imágenes
- Variables de entorno de la aplicación

### `setup.bat`
Script de instalación automatizada que:
- Verifica Node.js y npm
- Instala PM2 globalmente
- Instala dependencias del proyecto
- Configura archivo `.env`
- Compila la aplicación
- Inicia la aplicación con PM2

---

## 🚀 Instalación paso a paso

### Opción 1: Instalación automática (Recomendada)

1. **Ejecutar el instalador:**
   ```bash
   # Doble clic en setup.bat
   # O desde línea de comandos:
   setup.bat
   ```

2. **Configurar variables de entorno:**
   - El script abrirá automáticamente el archivo `.env`
   - Complete los datos de conexión a la base de datos
   - Configure la ruta de red para imágenes (si aplica)

3. **Verificar instalación:**
   - La aplicación estará disponible en `http://localhost:3000`
   - Acceso desde red: `http://[IP-DEL-SERVIDOR]:3000`

### Opción 2: Instalación manual

1. **Instalar PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar entorno:**
   ```bash
   copy env.example .env
   # Editar .env con los datos correctos
   ```

4. **Compilar aplicación:**
   ```bash
   npm run build
   ```

5. **Iniciar con PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

---

## 🌐 Acceso desde red local

### Obtener IP del servidor:
```bash
ipconfig
```

### Acceder desde otros dispositivos:
```
http://[IP-DEL-SERVIDOR]:3000
```

**Ejemplo:**
- IP del servidor: `192.168.1.30`
- URL de acceso: `http://192.168.1.30:3000`

---

## 🛠️ Comandos PM2 útiles

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs recepcionactiva

# Reiniciar aplicación
pm2 restart recepcionactiva

# Detener aplicación
pm2 stop recepcionactiva

# Eliminar aplicación de PM2
pm2 delete recepcionactiva

# Ver monitoreo en tiempo real
pm2 monit
```

---

## ⚙️ Configuración de variables de entorno

### Variables principales en `.env`:

```env
# Entorno de ejecución
NODE_ENV=production

# Base de datos (Prisma) - IMPORTANTE: Use solo UNA opción según su configuración
# Opción 1: Instancia por defecto (puerto 1433)
DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=VsolDatos;trustServerCertificate=true"

# Opción 2: Instancia nombrada (ej: SQLEXPRESS) - Descomente si usa instancia nombrada
# DATABASE_URL="sqlserver://sa:su_password@192.168.1.30\\SQLEXPRESS:1433;database=VsolDatos;trustServerCertificate=true"

# Opción 3: Con encriptación habilitada - Descomente si requiere encriptación
# DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=VsolDatos;trustServerCertificate=true;encrypt=true"

# Base de datos (configuración individual - opcional)
DB_HOST=192.168.1.30
DB_PORT=1433
DB_USER=sa
DB_PASS=su_password
DB_NAME=VsolDatos

# Red para imágenes (opcional)
NETWORK_IMAGE_PATH=\\192.168.1.30\Imagenes\

# Configuración de aplicación
PORT=3000
APP_URL=http://192.168.1.30:3000
```

### 🔧 Configuración de SQL Server en Windows

#### Verificar configuración de SQL Server:

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

---

## 🔧 Configuración de inicio automático

Para que la aplicación se inicie automáticamente al arrancar Windows:

```bash
# Configurar PM2 para inicio automático
pm2 startup

# Guardar configuración actual
pm2 save
```

---

## 📁 Estructura de logs

Los logs se guardan en la carpeta `./logs/`:
- `err.log` - Errores
- `out.log` - Salida estándar
- `combined.log` - Logs combinados

---

## 🚨 Solución de problemas

### Error: "Node.js no encontrado"
- Instalar Node.js desde [nodejs.org](https://nodejs.org)
- Reiniciar la terminal después de la instalación

### Error: "Puerto 3000 en uso"
- Cambiar el puerto en `ecosystem.config.js`
- O detener la aplicación que usa el puerto 3000

### Error de conexión a base de datos
- ✅ Verificar datos en archivo `.env`
- ✅ Comprobar conectividad de red al servidor de BD
- ✅ Verificar permisos de usuario de BD
- ✅ Para instancias nombradas, verificar que SQL Server Browser esté ejecutándose
- ✅ Comprobar que el puerto 1433 esté abierto en el firewall
- ✅ Verificar que el usuario `sa` tenga permisos de acceso

### Error: "Login failed for user 'sa'"
- Verificar que la autenticación SQL Server esté habilitada
- Confirmar que el usuario `sa` esté habilitado
- Verificar la contraseña del usuario `sa`

### Error: "Cannot connect to server"
- Verificar que SQL Server esté ejecutándose
- Comprobar la conectividad de red: `ping 192.168.1.30`
- Verificar que el puerto 1433 esté abierto: `telnet 192.168.1.30 1433`

### Error de acceso a carpeta de red
- ✅ Verificar permisos de red
- ✅ Comprobar que la ruta existe
- ✅ Verificar credenciales de red
- ✅ Probar acceso manual: `dir \\192.168.1.30\Imagenes`
- ✅ Verificar que la tabla PRM tenga la configuración correcta

---

## 📞 Soporte

Para soporte técnico o reportar problemas:
1. Revisar logs en `./logs/`
2. Verificar configuración en `.env`
3. Comprobar estado con `pm2 status`

---

## ✅ Verificación de instalación

Después de la instalación, verificar:

1. **Estado de la aplicación:**
   ```bash
   pm2 status
   ```

2. **Acceso web:**
   - Local: `http://localhost:3000`
   - Red: `http://[IP]:3000`

3. **Logs sin errores:**
   ```bash
   pm2 logs recepcionactiva --lines 50
   ```

---

**¡Instalación completada! 🎉**
