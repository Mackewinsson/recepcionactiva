# 🔧 Guía Rápida de Configuración de Base de Datos

Esta guía resuelve los problemas más comunes de conexión a SQL Server en Windows.

## 🚨 Problema Común: Error de Conexión

**Síntoma:** La aplicación no puede conectarse a la base de datos SQL Server.

**Causa más común:** Formato incorrecto de la cadena de conexión.

## ✅ Soluciones por Tipo de Instancia

### 1. Instancia por Defecto (Puerto 1433)

**Formato correcto:**
```env
DATABASE_URL="sqlserver://sa:su_password@192.168.1.30:1433;database=VsolDatos;trustServerCertificate=true"
```

**Verificar:**
```cmd
telnet 192.168.1.30 1433
```

### 2. Instancia Nombrada (ej: SQLEXPRESS)

**Formato correcto:**
```env
DATABASE_URL="sqlserver://sa:su_password@192.168.1.30\\SQLEXPRESS:1433;database=VsolDatos;trustServerCertificate=true"
```

**Verificar:**
- SQL Server Browser está ejecutándose
- Puerto dinámico está configurado

### 3. Usando Nombre de Servidor

**Formato correcto:**
```env
DATABASE_URL="sqlserver://sa:su_password@servidor1\\SQLEXPRESS:1433;database=VsolDatos;trustServerCertificate=true"
```

## 🔍 Diagnóstico Paso a Paso

### Paso 1: Verificar SQL Server
```cmd
# Verificar que SQL Server esté ejecutándose
services.msc
# Buscar: SQL Server (SQLEXPRESS) o SQL Server (MSSQLSERVER)
```

### Paso 2: Verificar TCP/IP
1. Abrir "SQL Server Configuration Manager"
2. Ir a "SQL Server Network Configuration" → "Protocols for [INSTANCE]"
3. Habilitar "TCP/IP"
4. Reiniciar SQL Server

### Paso 3: Verificar Conectividad
```cmd
# Probar conectividad básica
ping 192.168.1.30

# Probar puerto específico
telnet 192.168.1.30 1433
```

### Paso 4: Probar desde SSMS
- Servidor: `192.168.1.30` o `192.168.1.30\SQLEXPRESS`
- Autenticación: SQL Server Authentication
- Usuario: `sa`
- Contraseña: [su contraseña]

## 🛠️ Comandos de Diagnóstico

### Verificar Puertos en Uso
```cmd
netstat -an | findstr 1433
```

### Verificar Servicios SQL Server
```cmd
sc query | findstr SQL
```

### Verificar Firewall
```cmd
netsh advfirewall firewall show rule name="SQL Server"
```

## 📋 Lista de Verificación

- [ ] SQL Server está ejecutándose
- [ ] TCP/IP está habilitado
- [ ] Puerto 1433 está abierto en firewall
- [ ] Usuario `sa` está habilitado
- [ ] Autenticación SQL Server está habilitada
- [ ] Para instancias nombradas: SQL Server Browser está ejecutándose
- [ ] Cadena de conexión tiene formato correcto
- [ ] Base de datos existe
- [ ] Usuario tiene permisos en la base de datos

## 🚨 Errores Comunes y Soluciones

### "Login failed for user 'sa'"
**Solución:**
1. Abrir SSMS como administrador
2. Conectar con autenticación de Windows
3. Ir a Security → Logins → sa
4. Habilitar el usuario
5. Establecer contraseña

### "Cannot connect to server"
**Solución:**
1. Verificar que SQL Server esté ejecutándose
2. Habilitar TCP/IP en Configuration Manager
3. Reiniciar SQL Server
4. Verificar firewall

### "A network-related or instance-specific error"
**Solución:**
1. Para instancias nombradas: verificar SQL Server Browser
2. Verificar que el puerto esté configurado correctamente
3. Probar con IP en lugar de nombre de servidor

## 📞 Soporte

Si el problema persiste:
1. Verificar logs de la aplicación: `pm2 logs`
2. Verificar logs de SQL Server
3. Probar conexión desde otra máquina
4. Verificar configuración de red

---

**Nota:** Esta guía cubre los problemas más comunes. Para casos específicos, consulte la documentación completa en README.md
