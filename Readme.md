# Servyre IT Ticket Management System

**Sistema Integral de Gestión de Tickets de Soporte IT**

Plataforma web moderna y robusta diseñada para centralizar, gestionar y resolver incidencias tecnológicas de manera eficiente. Desarrollada con las últimas tecnologías para garantizar rendimiento, escalabilidad y una experiencia de usuario premium.

---

## 🚀 Tecnologías

Este proyecto está construido sobre un stack tecnológico moderno, priorizando el tipado estático, la performance y la experiencia de desarrollo.

### **Frontend**
-   **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
-   **Build System:** [Vite 7](https://vitejs.dev/)
-   **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
-   **Componentes UI:** [Radix UI](https://www.radix-ui.com/) (Headless accessibility)
-   **Estado & Data Fetching:** [TanStack Query](https://tanstack.com/query) + [tRPC Client](https://trpc.io/)
-   **Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
-   **Visualización de Datos:** [Recharts](https://recharts.org/)
-   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)

### **Backend**
-   **Runtime:** Node.js
-   **Framework:** [Express](https://expressjs.com/)
-   **API:** [tRPC](https://trpc.io/) (Type-safe APIs without schemas)
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **Validación:** Zod

### **Base de Datos & Almacenamiento**
-   **Database:** MySQL 8.0+
-   **Storage:** AWS S3 (Compatible)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

1.  **Node.js**: Versión 20 o superior (Recomendado v22 LTS).
2.  **pnpm**: Gestor de paquetes eficiente (`npm install -g pnpm`).
3.  **MySQL**: Servidor de base de datos MySQL corriendo localmente.

---

## 🛠️ Guía de Instalación Local

Sigue estos pasos para levantar el proyecto desde cero en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/yorbimv/servyre-ticket-system.git
cd servyre-ticket-system
```

### 2. Instalar Dependencias

Utilizamos `pnpm` para una instalación rápida y eficiente.

```bash
pnpm install
```

### 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto. Puedes copiar el ejemplo incluido:

```bash
cp .env.example .env
```

**Configuración para Desarrollo Local (Bypass de Autenticación):**
Asegúrate de que tu archivo `.env` tenga las siguientes configuraciones clave para trabajar sin un servidor OAuth externo:

```ini
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos (Ajusta usuario:password según tu MySQL local)
DATABASE_URL=mysql://root:password@localhost:3306/servyre

# Seguridad (Genera una cadena aleatoria para producción)
JWT_SECRET=desarrollo_secreto_temporal_123456

# Configuración Vital para Autenticación Local
# "servyre-local" activa el modo de bypass para desarrollo
VITE_APP_ID=servyre-local

# Dejar comentado para usar el bypass local
# OAUTH_SERVER_URL=
```

### 4. Inicializar la Base de Datos

Sincroniza el esquema de la base de datos (creación de tablas) con Drizzle Kit:

```bash
pnpm db:push
```

### 5. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

El servidor iniciará (usualmente en el puerto 5000 o 5001 si el anterior está ocupado).
Abre tu navegador en: **`http://localhost:5000`**

> **Nota:** Al ingresar localmente, el sistema te autenticará automáticamente como un **Administrador de Prueba**.

---

## 🎯 Características Principales

### **Gestión de Tickets**
-   **Ciclo de Vida Completo:** Creación, asignación, resolución y cierre.
-   **Clasificación:** Categorización por tipo de falla y niveles de prioridad (Crítica, Alta, Media, Baja).
-   **SLA:** Seguimiento de tiempos de resolución estimados y reales.

### **Roles y Permisos (RBAC)**
-   **Usuario Final:** Reporta incidentes y consulta el estado de sus tickets.
-   **Técnico:** Gestiona la cola de tickets, agrega reportes técnicos y comentarios internos.
-   **Administrador:** Acceso total, gestión de usuarios, departamentos y configuración del sistema.

### **Dashboard Interactivo**
-   Métricas en tiempo real (Tickets abiertos, resueltos, rendimiento).
-   Gráficos visuales de distribución de carga de trabajo.

### **Comunicación**
-   Sistema de comentarios con soporte para archivos adjuntos.
-   Notas internas privadas para el equipo técnico.
-   Historial de auditoría completo para cada acción.

---

## 🏗️ Estructura del Proyecto

```
servyre-ticket-system/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Componentes UI (Átomos y Moléculas)
│   │   ├── pages/          # Vistas principales de la aplicación
│   │   ├── contexts/       # Estado global (Theme, Auth)
│   │   └── lib/            # Configuración de clientes (tRPC, Utils)
├── server/                 # Backend (Express + tRPC)
│   ├── _core/              # Configuración del servidor y middlewares
│   ├── routers.ts          # Definición de rutas y procedimientos API
│   └── db.ts               # Lógica de acceso a datos
├── drizzle/                # Esquema de Base de Datos y Migraciones
└── shared/                 # Tipos y constantes compartidos (Full-stack type safety)
```
