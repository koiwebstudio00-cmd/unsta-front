> El panel es ahora un repositorio independiente. Instalación y comandos vigentes en README.md. La auditoría de PostgreSQL vive en backend.

# Panel local UNSTA

Implementado el 31/10/2026 con Next.js 16.4.3 y React 19.3.1. Reutiliza el patrón de Lamelas: navegador → servidor del panel → API Express → PostgreSQL. El panel muestra datos persistidos; no fabrica respuestas del agente.

## Arranque

Primero iniciar el backend y PostgreSQL según [backend-local.md](backend-local.md). Desde la raíz:

```sh
cp .env.example .env.local
npm run dev
```

No volver a copiar el archivo si ya tiene configuración propia. Abrir http://localhost:3000. `APP_ORIGIN` del panel debe coincidir exactamente con `PANEL_ORIGIN` del backend; usar `localhost`, no alternarlo con `127.0.0.1` en el navegador.

Para la versión compilada, detener el servidor de desarrollo y ejecutar:

```sh
npm run build
npm start
```

Para crear acceso:

```sh
npm run demo:invite -- evaluador@example.test
```

Abrir el archivo privado indicado por el comando y copiar su propiedad `token` al formulario de invitación. No enviar ese archivo al repositorio. La invitación es de un solo uso y vence en 24 horas; la sesión dura siete días. Todas las invitaciones entran al espacio compartido UNSTA; cada navegador conserva su sesión, pero accede a los mismos datos. El acceso actual es para evaluadores que prueban ambos roles; no es un portal público de alumnos.

## Recorrido disponible

### Interfaz CRM (actualización del 31/10/2026)

- **Inicio** es la vista por defecto: KPIs del espacio, distribución por etapa, recordatorios y últimos contactos. Los valores salen de la API; no hay métricas simuladas ni tendencias inventadas.
- **Interesados** abre un pipeline de seis etapas. Arrastrar desde el asa de una tarjeta, usar Espacio → flechas → Espacio con teclado o elegir una etapa en su menú. También hay vista de lista, búsqueda y filtros por propuesta/sede. El movimiento se muestra inmediatamente, se guarda en PostgreSQL y se revierte si falla. La notificación permite deshacer durante diez segundos.
- **Nuevo interesado** abre un formulario de nombre, email y teléfono. Crea el contacto y una conversación en una transacción. Las propuestas se registran por el asistente con evidencia de la conversación.
- **Conversaciones** muestra lista, chat y ficha en tres columnas en escritorio. En móvil se navega entre la lista y el chat; la ficha se abre en un panel lateral. “Simular consulta” permite probar el rol del interesado; “Equipo” conserva los controles de atención humana.
- La ficha utiliza secciones desplegables para propuestas, notas y tareas. La edición de datos se realiza en un diálogo. **Seguimiento** separa tareas/atención y avisos de cursos en pestañas.

La etapa del pipeline pertenece al **contacto** (`Contact.pipelineStage`). Es una gestión manual del equipo, independiente de la etapa de cada propuesta (`Interest.stage`); mover una tarjeta no crea evidencia, no cambia el interés en todas las carreras y no confirma una inscripción real. Los contactos existentes comienzan en Nuevos.

Migración aditiva: `20261031060000_contact_pipeline`. En otras instalaciones ejecutar `npm run db:generate` y `npm run db:migrate`, y reiniciar la API. Nuevas rutas de evaluador: `POST /v1/demo/contacts` y `PATCH /v1/demo/contacts/:id/stage`, con sesión, CSRF y aislamiento por espacio. Los workflows de n8n conservan su contrato.

Se instalaron Dialog y Sonner mediante `npx shadcn@latest add dialog sonner --yes --overwrite`, y `@dnd-kit/core@6.3.1` para el arrastre. Las transiciones respetan la preferencia de movimiento reducido. La demo muestra hasta 200 contactos/conversaciones del directorio; sus KPIs corresponden a ese recorte.

El recorrido original sigue disponible dentro de estas vistas:

1. **Conversaciones → Simular consulta:** crear una persona de prueba y enviar una consulta. El mensaje queda guardado y encolado. Mientras el despacho esté apagado aparece un aviso explícito; no se simula una respuesta del modelo.
2. **Equipo:** tomar la conversación, responder manualmente, devolverla al asistente o cerrarla. Tomar el chat cancela los turnos pendientes; al devolverlo se procesan mensajes nuevos, sin reproducir los anteriores.
3. **Ficha:** corregir nombre, email, teléfono y condición; agregar notas internas y tareas. Los campos corregidos quedan protegidos frente a futuras extracciones automáticas. Dejar un campo vacío conserva su valor previo.
4. **Interesados:** buscar y filtrar por propuesta, sede y etapa; abrir la ficha y el chat. Los intereses aparecen cuando el agente los registra con evidencia. Sus etapas pueden cambiarse manualmente; la inscripción se identifica como simulada.
5. **Seguimiento:** completar/cancelar tareas, ver derivaciones, cancelar suscripciones y crear una apertura ficticia. Los eventos quedan encolados hasta conectar n8n. El procesamiento genera avisos internos para suscripciones válidas, sin envíos externos.
6. **Estado:** ver configuración, alcance y fuentes de los 39 registros. La configuración de n8n no se presenta como prueba de ejecución real.

La vista se adapta a escritorio y móvil. El chat consulta cambios cada 2,5 segundos; la ficha cada cinco; los listados cada diez. Las actualizaciones se pausan cuando la pestaña queda oculta.

## Sesión y frontera con el agente

`/api/auth/login` intercambia la invitación con el backend. Guarda sesión y CSRF en cookies HttpOnly; devuelve solo `{ok:true}` al navegador. Las mutaciones requieren el origen exacto y el servidor añade el token CSRF. El proxy `/api/demo/*` permite únicamente rutas de evaluador conocidas, con método e identificadores válidos. No expone `/v1/agent`, credenciales de servicio ni URLs arbitrarias. Las respuestas autenticadas no se almacenan en caché.

Las notas internas se muestran solamente en la vista Equipo. Ambos roles pertenecen al mismo evaluador: cambiar de vista no es una barrera de permisos entre dos cuentas diferentes. El aislamiento real es entre espacios y se aplica en el backend/PostgreSQL.

## Verificación realizada

- Compilación de producción y comprobación de TypeScript.
- Cinco pruebas del cliente y proxy: cuerpo JSON, errores, rutas permitidas, origen y formato de cookies.
- Veintiuna pruebas HTTP/PostgreSQL del backend, incluida lectura autenticada de fuentes y condiciones.
- Veintisiete pruebas del contrato y generación reproducible de tres workflows.
- Navegador real: invitación, nueva persona, mensaje, toma humana, respuesta, edición de datos, nota interna, tarea y finalización, apertura simulada, búsqueda y recarga.
- Consulta posterior directa a PostgreSQL: un contacto ficticio, dos mensajes, una nota, una tarea completada y una apertura encolada. La nota no aparece como mensaje.
- Vista móvil a 390 px: sin desbordamiento horizontal, navegación y salida de sesión disponibles.

Datos de aceptación: `Lucía Demo`, `lucia@example.test`; son ficticios y quedaron en el espacio de prueba. El script `scripts/audit/verify-data.ts del repositorio backend <workspace_id>` comprueba ese escenario de aceptación de forma solo lectura. No es un test genérico para espacios vacíos.

No se ejecutó el modelo, no se importaron workflows remotos y no se probaron aún la captura automática de intereses, la derivación del modelo ni la generación de avisos mediante n8n. Esos recorridos tienen cobertura local del backend con transporte controlado, pero requieren la prueba integrada descrita en [importar-n8n.md](importar-n8n.md).

## Comandos de validación

```sh
npm test
npm run typecheck
npm run build
npm run api:build
npm run api:test
npm run check
```

`api:test` utiliza exclusivamente `unsta_demo_test`. Los datos creados manualmente desde el navegador permanecen en la base de demo. Para detener el panel/API usar Ctrl+C en sus terminales; detener PostgreSQL con `docker compose --env-file .env.local stop`, conservando el volumen.

## Componentes oficiales shadcn/ui

El frontend usa componentes instalados mediante el CLI oficial, preset **Nova / Radix**, base neutral y Tailwind CSS 4. Se eliminó la hoja de estilos personalizada anterior. Los componentes del registro están en `src/components/ui/`, con la configuración en `components.json`.

Comandos ejecutados desde la raíz del frontend (CLI resuelto a 4.23.0):

```sh
npx shadcn@4.23.0 init --preset nova --base radix --no-monorepo --yes
npx shadcn@4.23.0 add sidebar-07 button badge card input textarea label native-select table tabs alert avatar dropdown-menu separator empty accordion --yes
```

`AppSidebar`, `NavMain` y `NavUser` provienen del bloque `sidebar-07`. Sus datos de ejemplo se sustituyeron por las vistas y la sesión reales de UNSTA. Se conserva Sidebar con plegado a iconos, Tooltip y Sheet móvil, además de Avatar/DropdownMenu en NavUser. El botón de salir utiliza la sesión existente. Se retiraron la página y los menús de ejemplo ajenos a esta demo.

Chat, ficha, seguimiento y acceso usan Button, Card, Input, Textarea, Label, NativeSelect, Table, Tabs, Alert, Badge, Avatar, Empty y Accordion del registro. `feedback.tsx` contiene únicamente composición de Empty, estado de carga y el renderizador de enlaces del chat. La lógica de API y persistencia no cambió.

El tema visual se instaló desde el registro de Tweakcn con el CLI, ejecutado desde la raíz del frontend:

```bash
npx shadcn@latest add https://tweakcn.com/r/themes/cmie97f2b000704l27r9g1p11 --yes
```

Incluye la paleta azul, variables claras y oscuras, sombras y radio base de 0.5rem. Las fuentes Geist, Geist Mono y Noto Serif Georgian se cargan con `next/font/google` y se vinculan a las utilidades de Tailwind. Para agregar componentes en el futuro, ejecutar el CLI desde la raíz del frontend para que respete sus alias y `components.json`.

Verificación tras el reemplazo: build de producción y TypeScript correctos; cinco pruebas del panel aprobadas. En navegador se comprobó el plegado a iconos, apertura de NavUser, cambio entre pestañas Interesado/Equipo, guardado de la ficha, tabla con búsqueda y navegación móvil a 390 px con cierre del Sheet al seleccionar una vista, sin desbordamiento horizontal. Capturas en `docs/capturas/shadcn-escritorio.png` y `docs/capturas/shadcn-movil.png`.

Verificación de la interfaz CRM: 23 pruebas de backend y 6 del panel aprobadas, build y TypeScript correctos. En navegador se comprobó creación del lead ficticio “Sofía · Prueba CRM”, arrastre con ratón y teclado, cambio de etapa por menú, Deshacer, persistencia tras recarga, búsqueda en lista, notas y conversación con ambos roles en modo de atención humana. Revisión móvil a 390 px: navegación lista/chat, ficha lateral y pipeline sin desbordamiento horizontal de la página.

## Selector claro / oscuro

Switch oficial instalado con `npx shadcn@latest add switch --yes`, disponible en la cabecera del panel y en el ingreso. `next-themes` aplica la clase del tema antes de hidratar y guarda la preferencia en el navegador (`unsta-theme`); el valor inicial es claro. Las notificaciones siguen el tema seleccionado. Se ajustó el contraste de iniciales y acciones de la ficha en oscuro.

Verificación: 6 pruebas del panel aprobadas y build de producción con TypeScript correcto. En navegador se comprobó cambio con clic y teclado, persistencia de ambos temas al recargar, Inicio, pipeline, diálogo de nuevo interesado, conversaciones e ingreso; cabecera móvil a 390 px sin desbordamiento horizontal. Sin errores o advertencias en la consola durante la revisión. Captura: `docs/capturas/tema-oscuro.png`.
