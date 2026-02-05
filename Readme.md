# Servyre IT Ticket Management System

Sistema completo de gestión de tickets de soporte IT para la empresa Servyre. Plataforma web moderna con autenticación multiusuario, seguimiento en tiempo real de tickets, dashboard interactivo y generación automática de reportes.

## 🎯 Características Principales

**Gestión de Tickets**
- Creación de tickets con título, descripción, prioridad y categoría
- Seguimiento visual del estado en tiempo real
- Historial completo de cambios y actualizaciones
- Sistema de comentarios internos y públicos
- Adjuntos de archivos y fotografías

**Roles y Permisos**
- **Usuarios Finales**: Crean tickets, ven estado y reciben actualizaciones
- **Técnicos IT**: Ven todos los tickets, asignan, actualizan estados y agregan reportes
- **Administradores**: Acceso completo, dashboard, reportes y configuración

**Dashboard y Reportería**
- Dashboard interactivo con métricas en tiempo real
- Gráficos de tickets por estado, prioridad y categoría
- Generación de reportes PDF mensuales
- Estadísticas de rendimiento y tiempo de resolución

**Notificaciones**
- Notificaciones automáticas al crear tickets
- Alertas de cambios de estado
- Notificaciones de comentarios
- Centro de notificaciones con historial

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener instalado:

- **Node.js**: v18 o superior
- **pnpm**: v10 o superior (gestor de paquetes)
- **Base de datos**: MySQL 8.0+ o TiDB
- **Git**: Para clonar el repositorio

Verifica las versiones con:
```bash
node --version
pnpm --version
```

## 🚀 Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd servyre-ticket-system
```

### Paso 2: Instalar Dependencias

```bash
pnpm install
```

Este comando instalará todas las dependencias necesarias incluyendo React, Express, tRPC, Tailwind CSS y otras librerías.

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Base de Datos
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/servyre_tickets

# Autenticación OAuth (Manus)
VITE_APP_ID=tu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Seguridad
JWT_SECRET=tu_secreto_jwt_muy_seguro

# Información del Propietario
OWNER_NAME=Tu Nombre
OWNER_OPEN_ID=tu_open_id

# APIs Internas (Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=tu_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=tu_frontend_api_key

# Analytics (Opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=tu_website_id

# Información de la App
VITE_APP_TITLE=Servyre IT Ticket System
VITE_APP_LOGO=https://url-del-logo.png
```

### Paso 4: Configurar la Base de Datos

Ejecuta las migraciones para crear las tablas:

```bash
pnpm db:push
```

Este comando generará e ejecutará automáticamente todas las migraciones necesarias.

### Paso 5: Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Guía de Uso

### Para Usuarios Finales

**Crear un Ticket**

1. Inicia sesión con tu cuenta @servyre.com
2. Haz clic en "Crear Nuevo Ticket"
3. Completa los campos:
   - **Título**: Descripción breve del problema (mínimo 5 caracteres)
   - **Descripción**: Detalles completos del problema (mínimo 10 caracteres)
   - **Categoría**: Selecciona la categoría que mejor describe tu problema
   - **Prioridad**: Indica la urgencia (Crítica, Alta, Media, Baja)
4. Haz clic en "Crear Ticket"

**Ver Mis Tickets**

1. Ve a la sección "Mis Tickets" desde el menú lateral
2. Visualiza todos tus tickets con su estado actual
3. Haz clic en cualquier ticket para ver detalles completos

**Seguimiento de Ticket**

En la página de detalles del ticket puedes:
- Ver el estado actual (Abierto, En Progreso, Resuelto, Cerrado)
- Leer comentarios del equipo técnico
- Ver el historial completo de cambios
- Agregar comentarios o preguntas
- Ver el reporte técnico cuando esté disponible

**Recibir Notificaciones**

- Recibirás notificaciones cuando tu ticket sea asignado
- Se te notificará cuando el estado cambie
- Verás alertas cuando se agreguen comentarios
- Accede al centro de notificaciones desde el icono de campana en la esquina superior derecha

### Para Técnicos IT

**Ver Todos los Tickets**

1. Ve a "Todos los Tickets" desde el menú lateral
2. Visualiza todos los tickets del sistema
3. Usa los filtros para encontrar tickets específicos:
   - **Búsqueda**: Por título o número de ticket
   - **Estado**: Abierto, En Progreso, Resuelto, Cerrado
   - **Prioridad**: Crítica, Alta, Media, Baja

**Gestionar un Ticket**

1. Haz clic en un ticket para abrir sus detalles
2. Puedes:
   - **Cambiar Estado**: Actualiza el progreso del ticket
   - **Asignar**: Asigna el ticket a otro técnico
   - **Agregar Reporte Técnico**: Documenta la solución
   - **Agregar Comentarios**: Comunícate con el usuario o el equipo
   - **Comentarios Internos**: Notas solo visibles para técnicos

**Resolver Tickets**

1. Abre el ticket que completaste
2. Agrega un reporte técnico explicando la solución
3. Cambia el estado a "Resuelto"
4. El usuario será notificado automáticamente

### Para Administradores

**Acceder al Dashboard**

1. Ve a "Dashboard" desde el menú lateral
2. Visualiza métricas clave:
   - Total de tickets
   - Tickets abiertos y resueltos
   - Tasa de resolución
   - Gráficos de distribución por estado y prioridad
   - Tickets recientes

**Generar Reportes**

1. Ve a "Administración" desde el menú lateral
2. En la sección "Generar Reportes Mensuales":
   - Selecciona el mes y año
   - Haz clic en "Generar Reporte"
3. El reporte PDF incluirá:
   - Resumen ejecutivo
   - Total de tickets procesados
   - Tickets resueltos y abiertos
   - Distribución por prioridad y estado
   - Tiempo promedio de resolución
   - Estadísticas de rendimiento

**Monitorear el Sistema**

- El dashboard muestra en tiempo real el estado del sistema
- Puedes ver la carga de trabajo actual
- Identifica cuellos de botella o áreas de mejora
- Monitorea las tendencias mensuales

## 🏗️ Estructura del Proyecto

```
servyre-ticket-system/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas principales
│   │   ├── components/       # Componentes reutilizables
│   │   ├── lib/              # Utilidades y configuración
│   │   ├── App.tsx           # Rutas principales
│   │   └── main.tsx          # Punto de entrada
│   └── public/               # Archivos estáticos
├── server/                    # Backend Express + tRPC
│   ├── routers.ts            # Procedimientos tRPC
│   ├── db.ts                 # Funciones de base de datos
│   ├── reports.ts            # Generación de reportes
│   └── _core/                # Configuración interna
├── drizzle/                   # Migraciones de base de datos
│   ├── schema.ts             # Definición de tablas
│   └── migrations/           # Archivos de migración
├── shared/                    # Código compartido
├── storage/                   # Helpers de almacenamiento S3
├── package.json              # Dependencias del proyecto
├── tsconfig.json             # Configuración TypeScript
├── tailwind.config.ts        # Configuración Tailwind CSS
└── README.md                 # Este archivo
```

## 🗄️ Estructura de Base de Datos

El sistema utiliza las siguientes tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema con roles |
| `tickets` | Tickets de soporte con información completa |
| `ticket_comments` | Comentarios en tickets |
| `attachments` | Archivos adjuntos en tickets |
| `categories` | Categorías de tickets |
| `ticket_statuses` | Estados posibles de tickets |
| `priorities` | Niveles de prioridad |
| `ticket_history` | Historial de cambios en tickets |
| `notifications` | Notificaciones del sistema |
| `activity_logs` | Registro de actividades |

## 🔐 Seguridad

**Autenticación**
- Utiliza OAuth 2.0 con Manus
- Solo usuarios con dominio @servyre.com pueden acceder
- Las sesiones se almacenan de forma segura con JWT

**Autorización**
- Control de acceso basado en roles (RBAC)
- Los usuarios finales solo ven sus propios tickets
- Los técnicos pueden ver todos los tickets
- Los administradores tienen acceso completo

**Datos**
- Todas las contraseñas se hashean
- Las conexiones a la base de datos usan SSL
- Los archivos se almacenan en S3 con acceso controlado

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
pnpm dev                 # Inicia servidor de desarrollo

# Construcción
pnpm build              # Compila para producción

# Producción
pnpm start              # Inicia servidor en producción

# Base de Datos
pnpm db:push            # Ejecuta migraciones

# Testing
pnpm test               # Ejecuta pruebas

# Verificación
pnpm check              # Verifica tipos TypeScript
pnpm format             # Formatea código
```

## 🐛 Solución de Problemas

**Error: "Base de datos no disponible"**
- Verifica que MySQL/TiDB está corriendo
- Comprueba la variable `DATABASE_URL` en `.env.local`
- Asegúrate de que el usuario y contraseña son correctos

**Error: "No tienes permisos para acceder"**
- Verifica tu rol en la base de datos
- Asegúrate de estar usando la cuenta correcta
- Contacta con un administrador para cambiar permisos

**Error: "OAuth no configurado"**
- Verifica que `VITE_APP_ID` está configurado correctamente
- Comprueba que `OAUTH_SERVER_URL` es accesible
- Reinicia el servidor de desarrollo

**Los cambios no se reflejan**
- Limpia el caché del navegador (Ctrl+Shift+Del)
- Recarga la página (Ctrl+R o Cmd+R)
- Reinicia el servidor de desarrollo

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones recientes)
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluciones**: Desde 320px en adelante (responsive design)

## 🚀 Despliegue

Para desplegar la aplicación en producción:

1. **Compilar el proyecto**
   ```bash
   pnpm build
   ```

2. **Configurar variables de producción**
   - Actualiza `.env.production` con valores de producción
   - Asegúrate de usar una base de datos de producción

3. **Iniciar el servidor**
   ```bash
   pnpm start
   ```

4. **Configurar dominio personalizado**
   - Accede a la configuración de dominios en el panel de administración
   - Vincula tu dominio personalizado

## 📞 Soporte y Contacto

Para reportar problemas o sugerencias:
- Crea un issue en el repositorio de GitHub
- Contacta al equipo de desarrollo
- Consulta la documentación en línea

## 📄 Licencia

Este proyecto es propiedad de Servyre. Todos los derechos reservados.

## 🎓 Recursos Adicionales

- [Documentación de React](https://react.dev)
- [Documentación de tRPC](https://trpc.io)
- [Documentación de Tailwind CSS](https://tailwindcss.com)
- [Documentación de Drizzle ORM](https://orm.drizzle.team)

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Desarrollado por**: Equipo de Desarrollo Servyre
