# KAVAS-LUNCH Frontend

Sistema de reservas del comedor universitario de la Universidad Peruana Cayetano Heredia (UPCH).

## Descripción

Frontend del sistema KAVAS-LUNCH desarrollado con React + TypeScript + Vite. Permite a los estudiantes y personal de la UPCH reservar sus almuerzos de manera anticipada, visualizar menús disponibles y gestionar sus reservas.

**Stack Tecnológico:**
- ⚛️ React 18 + TypeScript
- ⚡ Vite (build tool)
- 🎨 TailwindCSS + shadcn/ui
- 🔌 Axios (HTTP client)
- 🔐 JWT Authentication
- 🐳 Docker + Multi-stage build
- 📊 Recharts (gráficos)
- 📅 date-fns (manejo de fechas)

## 🐳 Inicio Rápido con Docker

### Prerequisitos

- Docker Desktop instalado
- Git
- Backend Laravel corriendo en http://localhost:8000

### Levantar el proyecto

```bash
# Construir y levantar el contenedor
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

### Acceder a la aplicación

- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes del panel admin
│   │   ├── Dashboard.tsx
│   │   ├── DishesManagement.tsx
│   │   ├── MenusManagement.tsx
│   │   ├── DeliverySystem.tsx
│   │   └── SalesReports.tsx
│   ├── ui/             # Componentes UI (shadcn/ui)
│   ├── Header.tsx      # Barra de navegación
│   └── auth/           # Componentes de autenticación
├── pages/              # Páginas/rutas principales
│   ├── Index.tsx       # Landing page
│   ├── Auth.tsx        # Login/Registro
│   ├── MenusUser.tsx   # Catálogo de menús
│   ├── Reserve.tsx     # Formulario de reserva
│   ├── Reservations.tsx # Historial de reservas
│   ├── Admin.tsx       # Panel de administración
│   └── Profile.tsx     # Perfil del usuario
├── services/           # Servicios API
│   ├── auth.ts         # Autenticación y perfil
│   ├── menus.ts        # Menús públicos
│   ├── reservations.ts # Reservas de usuario
│   └── admin.ts        # Endpoints admin
├── contexts/           # React Contexts
│   └── AuthContext.tsx # Estado global de autenticación
├── lib/
│   ├── api.ts          # Cliente Axios con interceptors
│   └── utils.ts        # Utilidades generales
├── types/
│   └── index.ts        # TypeScript types/interfaces
└── hooks/              # Custom hooks
    ├── use-mobile.tsx
    └── use-toast.ts
```

## 🎯 Características Principales

### Para Usuarios
- ✅ Autenticación JWT con correo institucional (@upch.pe)
- ✅ Visualización de menús disponibles con fotos de platos
- ✅ Sistema de filtros (por fecha, categoría y stock)
- ✅ Reserva de menús con código QR único
- ✅ Selección de horario y método de pago
- ✅ Historial completo de reservas (pendientes/entregadas/canceladas)
- ✅ Cancelación de reservas
- ✅ Perfil con estadísticas personalizadas

### Para Administradores
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de platos (crear, editar, eliminar, activar/desactivar)
- ✅ Gestión de menús diarios (crear, editar, eliminar, actualizar stock)
- ✅ Actualización rápida de stock con botones +/-
- ✅ Sistema de despacho/entrega con escáner QR
- ✅ Cancelación de reservas desde admin
- ✅ Reportes de ventas con exportación a Excel
- ✅ Auditoría de cambios de stock

## Comandos Docker Útiles

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f frontend

# Reiniciar servicio
docker compose restart frontend

# Reconstruir sin caché
docker compose build --no-cache

# Eliminar todo
docker compose down -v
```

**Nota:** Este es el frontend del sistema. El backend está desarrollado en PHP-Laravel y se encuentra en un repositorio separado.