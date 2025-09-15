# MotosMuñoz - Sistema de Recepción Activa

Sistema de gestión para el taller de motocicletas MotosMuñoz, integrado con base de datos SQL Server y autenticación de usuarios.

## 🚀 Inicio Rápido

### Opción 1: Scripts Automatizados (Recomendado)

```bash
# Iniciar todo el entorno de desarrollo (base de datos + aplicación)
npm run dev:full
```

### Opción 2: Docker Compose

```bash
# Iniciar base de datos
npm run docker:up

# Iniciar aplicación (en otra terminal)
npm run dev
```

### Opción 3: Manual

```bash
# Terminal 1: Iniciar base de datos
npm run db:start

# Terminal 2: Iniciar aplicación
npm run dev
```

## 📊 Base de Datos

### Conexión a DBeaver
- **Host**: `localhost`
- **Puerto**: `1433`
- **Base de datos**: `MotosMunozDatos`
- **Usuario**: `sa`
- **Contraseña**: `sa2006Strong!`

### Scripts Disponibles

```bash
# Iniciar base de datos
npm run db:start

# Detener base de datos
npm run db:stop

# Restaurar base de datos desde backup
npm run db:restore

# Docker Compose
npm run docker:up    # Iniciar
npm run docker:down  # Detener
```

## 🔐 Autenticación

### Usuarios Disponibles:
1. **MOTOS MUÑOZ S.C (Nivel 6)** - Administrador principal
2. **Allianz (Nivel 3)** - Gestor de seguros
3. **Usuario 2040 (Nivel 1)** - Usuario básico

### Contraseñas Válidas:
- `sa2006`
- `admin`
- `123456`

## 🛠️ Desarrollo

### Estructura del Proyecto
```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/     # Autenticación
│   │   ├── users/          # Gestión de usuarios
│   │   └── orders/search/  # Búsqueda de órdenes
│   ├── dashboard/          # Panel principal
│   ├── login/              # Página de login
│   └── layout.tsx          # Layout principal
├── lib/
│   └── prisma.ts           # Cliente Prisma
└── store/
    └── auth.ts             # Estado de autenticación
```

### Tecnologías
- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Prisma** - ORM para SQL Server
- **Zustand** - Gestión de estado
- **Docker** - Contenedorización de base de datos

## 📋 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Solo aplicación
npm run dev:full     # Base de datos + aplicación

# Base de datos
npm run db:start     # Iniciar SQL Server
npm run db:stop      # Detener SQL Server
npm run db:restore   # Restaurar desde backup

# Docker
npm run docker:up    # Iniciar con Docker Compose
npm run docker:down  # Detener Docker Compose

# Producción
npm run build        # Construir aplicación
npm run start        # Iniciar en producción
npm run lint         # Verificar código
```

## 🔧 Configuración

### Variables de Entorno
El archivo `.env` contiene la configuración de la base de datos:
```
DATABASE_URL="sqlserver://localhost:1433;database=MotosMunozDatos;user=sa;password=sa2006Strong!;trustServerCertificate=true"
```

### Base de Datos
- **SQL Server 2022** en Docker
- **188 tablas** del sistema MotosMuñoz
- **Datos de usuarios, vehículos, órdenes de trabajo**

## 🚨 Solución de Problemas

### Base de datos no conecta
```bash
# Verificar contenedor
docker ps

# Ver logs
docker logs sql1

# Reiniciar contenedor
npm run db:stop
npm run db:start
```

### Error de permisos en scripts
```bash
chmod +x scripts/*.sh
```

## 📞 Soporte

Para problemas o dudas sobre el sistema MotosMuñoz, contactar al equipo de desarrollo.
