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
1. Cuando se abra el archivo `.env` en Notepad, configure:
   ```env
   NODE_ENV=production
   DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=MotosMunozDatos;trustServerCertificate=true;encrypt=true"
   PORT=3000
   APP_URL=http://192.168.1.30:3000
   ```
2. Guarde el archivo y cierre Notepad

## 🎯 ¡Listo! El sistema estará funcionando

Después de ejecutar `setup.bat`, el sistema estará disponible en:
- **Acceso local:** http://localhost:3000
- **Acceso en red:** http://[IP_DEL_SERVIDOR]:3000

## 🔧 Configuración de Almacenamiento de Imágenes

### Opción A: Ruta de Red (Recomendado)
1. Asegúrese de que la ruta de red `\\192.168.1.30\Mw_Imagenes` sea accesible
2. Verifique que la tabla PRM tenga el registro correcto:
   ```sql
   SELECT * FROM PRM WHERE NOMPRM = 'CarpetaImagenes'
   -- Debe retornar: VALPRM = '\\192.168.1.30\Mw_Imagenes'
   ```

### Opción B: Ruta Local de Windows
1. Cree el directorio: `C:\Mw_Imagenes`
2. Actualice la tabla PRM:
   ```sql
   UPDATE PRM SET VALPRM = 'C:\Mw_Imagenes' WHERE NOMPRM = 'CarpetaImagenes'
   ```

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

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
- ✅ Verifique que SQL Server esté ejecutándose
- ✅ Confirme la cadena de conexión en el archivo `.env`
- ✅ Asegúrese de que SQL Server permita conexiones TCP/IP

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
