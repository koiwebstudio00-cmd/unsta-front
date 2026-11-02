# UNSTA · Frontend

Panel de atención y admisiones. Repositorio independiente con Next.js, React y shadcn. No necesita una copia del backend para instalar, probar o compilar.

## Entrega del 2 de noviembre de 2026

Incluye la vista de seguimientos automáticos con contador y fecha/hora del próximo envío, y la página **Proyecto** junto al badge **Demo**, con descripción funcional y exportación Markdown. La descripción cubre agente, CRM, conocimiento 1.1.0, datos persistidos y límites de la demo.

Antes del próximo deploy, configurar `API_URL` con el backend accesible desde el servidor, `APP_ORIGIN` con el dominio HTTPS del panel y `COOKIE_SECURE=true`. El backend debe tener aplicada la migración de seguimientos. Ejecutar `npm run docs:build`, `npm test`, `npm run typecheck` y `npm run build`; después verificar login, chat, Seguimiento, acceso directo `/?view=project` y descarga `.md` en el despliegue. El push no copia datos, cuentas ni variables locales. Esta entrega no realiza el despliegue.

## Descripción del proyecto y documentación

La descripción funcional está disponible dentro del panel en `/?view=project`, con el botón **Proyecto** del encabezado, junto al badge **Demo**. Incluye agente, CRM, reglas de seguimiento, resumen del conocimiento y límites actuales. **Exportar .md** descarga el contenido completo en UTF-8 como `unsta-descripcion-del-proyecto.md`, sin datos personales del CRM.

La fuente editorial única es `src/lib/project-description.ts`: alimenta página y exportación. Su inventario es una referencia fechada (conocimiento 1.1.0, 40 registros, 19 fuentes, 12 propuestas), no un contador en vivo. Actualizarla cuando cambie el alcance o el conocimiento y ejecutar `npm run docs:build` para regenerar [la copia documental](docs/descripcion-proyecto.md). No importa archivos del backend ni necesita PostgreSQL. Las pruebas verifican que esa copia coincida con la exportación.

## Funcionalidades actuales

- Inicio con indicadores, etapas y demanda por propuesta, período y sede.
- CRM con tablero/listado, edición de datos, intereses, notas y tareas.
- Chat con simulación de consultas, respuestas del agente/equipo, fuentes y resumen de contexto.
- Seguimiento con tareas, derivaciones y ciclos automáticos: primer mensaje a las 2 horas, segundo dos horas después y evaluación de cierre otras dos horas después. El contenido se adapta al tema y una respuesta reinicia el ciclo.
- Avisos de apertura de cursos simulados, con consentimiento, dentro del panel.
- Vista de estado y conocimiento; descripción del proyecto exportable.

El backend programa y persiste los seguimientos. La intervención humana, el cierre y las condiciones de exclusión los detienen; las etapas corregidas manualmente se respetan. Los mensajes se publican en el panel, sin entrega por WhatsApp/email. Se muestra la fecha y hora de próximos envíos en la zona de Tucumán.

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

Abrir el dominio HTTPS del frontend e ingresar con email y contraseña. El formulario incluye mostrar/ocultar contraseña y un enlace a `/solicitar-acceso`, con contacto de Koi: koi.webstudio00@gmail.com.

Una sola vez por persona, crear la cuenta en la terminal del backend en Dokploy, desde `/app`, con `npm run account:create -- tu-correo@tu-dominio.com`. Requiere aplicar las migraciones del backend. El comando informa un archivo privado `.local/account-….local.json` con las credenciales iniciales; guardarlas en un gestor de contraseñas. No se envía correo automáticamente.

Las credenciales son reutilizables y la sesión dura siete días. Todos los usuarios acceden al mismo espacio UNSTA. Aún no hay roles diferenciados ni recuperación/cambio de contraseña autoservicio. Para ayuda se ofrece el contacto de Koi.

`APP_ORIGIN` debe coincidir con `PANEL_ORIGIN` del backend y `COOKIE_SECURE=true` en ambos. El nuevo login utiliza `/v1/auth/login`; el navegador nunca recibe hashes ni credenciales de servicio. Desplegar los repositorios no migra automáticamente los leads o las cuentas locales. Ver la guía completa en el README del backend.
