# UNSTA · Agente y plataforma de admisiones

Actualizado: 2 de noviembre de 2026 · Conocimiento: 1.1.0

Una plataforma de atención y gestión de interesados que combina un asistente conversacional con un espacio de trabajo para el equipo de admisiones. Permite orientar consultas, conservar el contexto de cada persona y acompañar su recorrido desde el primer mensaje hasta el seguimiento o la derivación humana.

- 40 registros de conocimiento

- 19 fuentes de referencia

- 12 propuestas del catálogo

- 7 carreras de grado

## Qué se desarrolló

Se desarrollaron un panel web, una API con base de datos persistente y un agente conectado mediante n8n. El backend conserva los datos y valida las acciones; el agente consulta el conocimiento disponible y utiliza herramientas para registrar información o derivar consultas. El equipo puede revisar e intervenir desde la misma plataforma.

- Frontend independiente con Next.js, React y componentes de interfaz reutilizables.
- Backend independiente con TypeScript, Express, Prisma y PostgreSQL.
- Tres workflows de n8n: conversación, manejo de errores y apertura simulada de cursos.
- Base de conocimiento versionada, con fuentes, períodos y condiciones de uso de cada registro.

## El agente conversacional

Responde en español argentino, con voseo y un tono natural. Atiende la consulta directamente, sin anunciar búsquedas, herramientas o procesos internos. Conserva el contexto del intercambio y consulta información respaldada antes de afirmar datos académicos.

- Orienta sobre carreras, cursos, ingreso, documentación, servicios y contactos institucionales.
- Recupera fuentes y distingue información confirmada, desconocida, histórica o discrepante; no inventa precios, fechas ni vacantes.
- Registra datos de contacto declarados y propuestas de interés con evidencia del mensaje. Las preguntas concretas sobre una carrera pueden indicar interés exploratorio; una mención aislada no acredita intención de inscripción.
- Genera resúmenes para el equipo con intereses conversados, dudas pendientes y próximos pasos.
- Deriva a admisiones, alumnos, idiomas, orientación vocacional o tesorería cuando hace falta atención humana.
- Respeta datos y etapas corregidos por el equipo. Una preinscripción declarada no equivale a una inscripción confirmada.

## La plataforma de trabajo

El panel reúne la atención, el CRM y los pendientes en un espacio institucional compartido. Cada integrante ingresa con su propia cuenta y puede continuar la gestión con el historial disponible.

- Inicio: indicadores de atención, distribución por etapas, próximas tareas y demanda por propuesta, con filtros de período, sede y tipo.
- Interesados: tablero y listado para crear contactos, buscar personas y moverlas entre Nuevos, Contactados, En seguimiento, Preinscripción, Inscripción simulada y Sin interés.
- Conversaciones: historial, fuentes consultadas, simulación de mensajes del interesado, respuestas humanas y controles para tomar, devolver al asistente o cerrar el chat.
- Ficha del interesado: datos, propuestas de interés, notas internas, tareas y contexto resumido por la IA.
- Seguimiento: tareas manuales, derivaciones abiertas, próximos mensajes automáticos y ciclos finalizados.
- Avisos de cursos: solicitudes con consentimiento y simulación de una apertura, con avisos guardados dentro del panel.
- Estado de la demo: configuración de conexiones, catálogo y fuentes de conocimiento.
- Descripción del proyecto: esta página y exportación de su contenido en Markdown.

## Autonomía y seguimiento

Los seguimientos alcanzan a todos los leads elegibles, incluso quienes solo saludaron, después de que el asistente haya publicado una respuesta correctamente. El mensaje retoma el tema más reciente: saludo, consulta general, carrera, horarios, aranceles, ingreso, plan de estudios o modalidad y sede. El segundo mensaje tiene una redacción diferente.

- A las 2 horas sin respuesta: primer seguimiento. El lead pasa a En seguimiento, salvo que su etapa esté protegida por una corrección manual.
- Dos horas después del primer envío: segundo seguimiento.
- Dos horas después del segundo: si sigue sin responder, se marca Sin interés por falta de respuesta. En un ciclo normal corresponde a las 6 horas; no se registra como un rechazo declarado.
- Si el lead responde, se cancela el plazo anterior y se reinicia el ciclo. Un lead cerrado automáticamente por silencio puede reactivarse.
- La toma humana, una derivación, el cierre, un cambio manual de etapa, la preinscripción o un pedido de no contacto detienen el ciclo. Las consultas administrativas de alumnos y los cierres explícitos no activan mensajes comerciales.
- Los plazos son corridos, sin franja horaria. Si la respuesta inicial se demoró más de dos horas, se concede un intervalo completo desde esa respuesta. Tras una caída no se envían mensajes acumulados en ráfaga.
- Los ciclos persisten en PostgreSQL y se procesan mientras el backend está encendido. Los mensajes se publican en el chat del panel; no hay envío por WhatsApp ni email.

## Información cargada en la base de conocimiento

El inventario editorial corresponde a la versión 1.1.0, actualizada el 2 de noviembre de 2026: 40 registros y 19 fuentes de referencia. El catálogo contiene 12 propuestas: siete carreras y cinco cursos o diplomaturas. Es un recorte de la oferta de UNSTA, no un catálogo completo ni una consulta en tiempo real al sistema académico.

- Carreras: Medicina, Licenciatura en Psicología, Abogacía, Contador Público, Licenciatura en Marketing, Ingeniería en Informática e Ingeniería en Inteligencia Artificial.
- Se ampliaron las fichas de Medicina, Psicología, Abogacía, Contador Público, Informática e Inteligencia Artificial con duración, modalidad, sedes publicadas, perfil, ámbitos profesionales, síntesis del plan por año y datos de ingreso o contacto cuando la fuente los publica. Marketing conserva una ficha de alcance más acotado. Los planes son resúmenes temáticos, no transcripciones completas de materias y correlatividades.
- Cursos y diplomaturas: Inglés A1, Portugués A1, Italiano A1, Social Media Marketing y Automatización con IA, y Diplomatura en Nutrición Deportiva. Se conserva además información general del Centro de Idiomas.
- Ingreso: preinscripción, documentación básica, entrega de documentación, extranjeros, mayores de 25 años sin secundario completo y equivalencias. Medicina incluye información específica sobre nivelación y examen de ingreso.
- Institución y servicios: información institucional, Sede Central, Campus Yerba Buena, contactos, atención a alumnos, orientación vocacional, becas y beneficios.
- Aranceles, horarios y calendario: registros publicados de cursos y calendario académico 2026, junto con límites explícitos para cuotas, horarios o aulas no confirmados. La existencia de un registro no implica que todos sus importes o fechas estén disponibles.
- Las fuentes conservan fechas y condiciones. Los datos de una cohorte no se trasladan a otra; las discrepancias de sede y los datos faltantes requieren confirmación. El foco operativo está en Central y Yerba Buena, aunque algunas fichas mencionan otras sedes publicadas.

## Qué guarda la base de datos operativa

Además del conocimiento, PostgreSQL conserva contactos, conversaciones, mensajes, intereses con evidencia, resúmenes, etapas, notas, tareas, derivaciones, suscripciones y avisos simulados. También guarda los ciclos de seguimiento, trabajos pendientes, reintentos, auditoría de acciones y las cuentas y sesiones del equipo.

- El backend aplica aislamiento por espacio de trabajo mediante políticas de acceso en PostgreSQL y utiliza un rol de ejecución restringido.
- Las sesiones usan cookies HttpOnly y las escrituras validan origen y protección CSRF. Las contraseñas se almacenan como hashes; las credenciales de servicios no se entregan al navegador.
- La cola persistente y las operaciones transaccionales controlan el orden de las respuestas y evitan duplicados.
- Esta descripción y su exportación no incluyen conversaciones, datos personales, contraseñas ni credenciales. Las cifras anteriores describen el conocimiento, no la cantidad de leads activos.

## Alcance actual y operación

Es una demo funcional de atención y admisiones. Permite probar el recorrido completo dentro del panel y colaborar con el agente, conservando límites claros entre información, gestión interna y trámites institucionales.

- No consulta expedientes académicos, no acredita pagos, no confirma inscripciones reales ni verifica vacantes en tiempo real.
- Las derivaciones son pendientes internos del equipo de la demo; no notifican por sí mismas a las áreas oficiales de la universidad.
- Los avisos de apertura y la inscripción simulada son demostraciones. WhatsApp y email no forman parte del envío actual.
- Las cuentas comparten el espacio institucional; no hay roles diferenciados, SSO ni recuperación de contraseña autoservicio.
- Para operar se requieren PostgreSQL, backend, frontend y los workflows de n8n configurados. Un n8n remoto necesita un origen HTTPS accesible para llamar al backend. Los repositorios se instalan y despliegan por separado.
- La validación incluye pruebas de contratos, API y frontend, ciclos con reloj simulado y conversaciones de prueba con el agente real. La continuidad del servicio depende de mantener los procesos e integraciones disponibles.
