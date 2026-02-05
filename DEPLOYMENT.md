# Guía de Despliegue

Esta guía explica cómo desplegar el **Sistema de Tickets Servyre** tanto localmente para desarrollo como en la web para producción.

---

## 1. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

*   **Node.js** (v18 o superior)
*   **npm** o **pnpm** (recomendado)
*   **Base de Datos MySQL** (Instancia local o proveedor en la nube como PlanetScale/Railway)

---

## 2. Variables de Entorno

La aplicación requiere variables de entorno para funcionar. Crea un archivo `.env` en el directorio raíz basándote en `.env.example`.

| Variable | Descripción | Requerido | Valor por Defecto |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión a MySQL. | **Sí** | - |
| `JWT_SECRET` | Cadena secreta para firmar cookies de sesión. | **Sí** | - |
| `PORT` | Puerto donde escuchará el servidor. | No | 5000 |
| `NODE_ENV` | Modo del entorno (`development` o `production`). | No | development |

---

## 3. Despliegue Local (Desarrollo)

Para ejecutar la aplicación en tu computadora:

1.  **Instalar Dependencias**:
    ```bash
    npm install
    # o
    pnpm install
    ```

2.  **Configurar Entorno**:
    Copia `.env.example` to `.env` y actualiza `DATABASE_URL` con tus credenciales locales de MySQL.

3.  **Configurar Base de Datos**:
    Sube el esquema a tu base de datos:
    ```bash
    npm run db:push
    # o
    pnpm run db:push
    ```

4.  **Iniciar Servidor de Desarrollo**:
    ```bash
    npm run dev
    # o
    pnpm run dev
    ```
    La aplicación estará disponible en `http://localhost:5000` (o el puerto que hayas configurado).

---

## 4. Despliegue Local (Simulación de Producción)

Para probar la construcción de producción localmente:

1.  **Construir el Proyecto**:
    ```bash
    npm run build
    ```

2.  **Iniciar el Servidor**:
    ```bash
    npm run start
    ```

---

## 5. Despliegue Web

Puedes desplegar esta aplicación en cualquier plataforma que soporte Node.js.

### Opción A: Railway (Recomendado para Base de Datos + App)

1.  Crea una cuenta en [railway.app](https://railway.app/).
2.  Crea un nuevo proyecto.
3.  **Agregar Base de Datos**: Añade un servicio MySQL. Conéctate a él y obtén la `DATABASE_URL`.
4.  **Desplegar Código**: Conecta tu repositorio de GitHub.
5.  **Configurar Variables**: Añade `DATABASE_URL` y `JWT_SECRET` en el panel de Railway.
6.  **Comando de Construcción (Build)**: Railway debería detectarlo automáticamente, pero si es necesario: `npm run build` (o `pnpm run build`).
7.  **Comando de Inicio (Start)**: `npm run start` (o `pnpm run start`).

### Opción B: Vercel (Frontend/Serverless)

*Nota: Dado que esta app usa un servidor Express personalizado (`server/index.ts`), desplegar en Vercel requiere configurarlo como servidor independiente o envolverlo en una función serverless, lo cual puede requerir cambios en el código. **Se recomiendan Railway o Render** para esta arquitectura específica.*

### Opción C: Render / Heroku

Similar a Railway:
1.  Crea un Web Service.
2.  Conecta el repo de GitHub.
3.  Configura las Variables de Entorno (`DATABASE_URL`, `JWT_SECRET`).
4.  Comando de Construcción: `npm install && npm run build` (o `pnpm install && pnpm run build`).
5.  Comando de Inicio: `npm run start` (o `pnpm run start`).

---

## Solución de Problemas

*   **Errores de Base de Datos**: Asegúrate de que tu servidor MySQL esté corriendo y la cadena de conexión sea correcta.
*   **Errores de Construcción**: Verifica que todas las dependencias estén instaladas. El uso de `npx` o `pnpm` simplifica esto.
