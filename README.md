# UNSTA · Frontend

Panel de atención y admisiones. Repositorio independiente con Next.js, React y shadcn. No necesita una copia del backend para instalar, probar o compilar.

## Desarrollo

Node 24 (ver `.nvmrc`). Ejecutar desde esta carpeta:

```sh
npm ci
cp .env.example .env.local # solo en una instalación nueva
npm run dev
```

Abrir http://localhost:3000. La configuración local existente ya fue trasladada: no sobrescribirla.

| Variable del servidor Next | Uso |
| --- | --- |
| `API_URL` | Origen de la API UNSTA accesible desde el servidor Next. Local: `http://127.0.0.1:4100`. |
| `APP_ORIGIN` | URL del panel en el navegador. Debe coincidir exactamente con `PANEL_ORIGIN` del backend. |
| `COOKIE_SECURE` | `false` para localhost HTTP; `true` para despliegue HTTPS. |

Estas variables son del servidor: no usar prefijo NEXT_PUBLIC ni agregar claves de PostgreSQL/n8n. El navegador usa las rutas de sesión y proxy del propio Next; la lógica de CRM, datos y agente vive en el backend.

## Verificar y ejecutar

```sh
npm test
npm run typecheck
npm run build
npm start
```

El build usa webpack y genera `.next/standalone` con los assets; `npm start` ejecuta esa salida y carga `.env.local` si existe. El puerto de producción se configura con `PORT` (por defecto 3000). No requiere PostgreSQL para compilar; sí acceso a las fuentes de Google usadas por `next/font`.

## Dokploy

Crear un servicio Application conectado a ESTE repositorio, contexto `/`, Dockerfile `/Dockerfile`, puerto interno 3000. El Dockerfile genera y ejecuta la salida standalone con sus assets. Configurar las tres variables anteriores y agregar el dominio HTTPS del panel en Dokploy.

`API_URL` debe ser una URL alcanzable desde el contenedor del frontend, no el localhost del backend. Un dominio HTTPS estable del backend evita depender de nombres de redes entre proyectos. El frontend no necesita acceso directo a PostgreSQL ni n8n.

El backend se administra en su repositorio separado. El despliegue del frontend no necesita reconstruir el backend. Conservar compatibilidad con `/v1/auth` y `/v1/demo`; las pruebas del proxy cubren el reenvío de sesión y filtros.

## Estructura

- `src/app`: páginas, metadatos y rutas de sesión/proxy.
- `src/components`: panel y componentes shadcn.
- `src/lib`: cliente HTTP, tipos, filtros y presentación.
- `public`: logo y recursos públicos.
- `test`: pruebas del cliente y proxy.

La auditoría de PostgreSQL antes ubicada en `scripts/verify-data.ts` ahora pertenece a `backend/scripts/audit/verify-data.ts`. No hay imports ni dependencias de archivos del backend en este repositorio.

La separación conserva diseño, funciones, contratos y acceso compartido institucional. Detalle de validación en `docs/SEPARACION-2026-10-31.txt`.

## Acceso al panel desplegado

Abrir el dominio HTTPS asignado a este frontend. El formulario pide un código de invitación, no una contraseña.

Generar el código en la terminal del contenedor del backend en Dokploy, desde `/app`, con `npm run invite -- tu-correo@tu-dominio.com`. El comando informa la ruta de un archivo privado `.local/invite-….local.json`: copiar su propiedad `token` en «Código de invitación». No se envía correo ni se verifica la titularidad del email.

Cada código es de un solo uso y vence en 24 horas; la sesión dura siete días. Para otro navegador o un nuevo ingreso después de cerrar sesión o de su vencimiento, generar otra invitación. Todos los evaluadores ven los datos del mismo espacio UNSTA. No hay login con contraseña/SSO, recuperación ni roles diferenciados todavía.

`APP_ORIGIN` debe coincidir con `PANEL_ORIGIN` del backend, y `COOKIE_SECURE=true` en ambos. Crear invitaciones sobre la base de producción; desplegar los repositorios no migra automáticamente los datos locales. La guía completa de operación está en el README del repositorio backend.
