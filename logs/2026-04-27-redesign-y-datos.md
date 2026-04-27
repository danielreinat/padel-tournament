# Log — 2026-04-27 — Rediseño UI + Datos Open Estrella Galicia

## Resumen

Rediseño completo de la web publica al estilo openpadelalmansa.com, carga de datos reales del torneo Open Estrella Galicia, y correcciones de bugs.

## Archivos creados

- `scripts/seed-open-estrella.ts` — Script para insertar 73 equipos (146 jugadores) del PDF del Open Estrella Galicia

## Archivos modificados

### Rediseño UI (web publica)
- `apps/web/src/app/globals.css` — Importar Poppins, variables CSS (navy, cyan, cyan-light, cyan-pale)
- `apps/web/src/app/layout.tsx` — Degradado de fondo oscuro, header/footer con nuevo estilo
- `apps/web/src/app/page.tsx` — Landing con hero "Todo por el Padel", cards glassmorphism
- `apps/web/src/app/torneo/[slug]/page.tsx` — Detalle torneo con cards translucidas, iconos secciones
- `apps/web/src/app/torneo/[slug]/inscripcion/page.tsx` — Formulario glassmorphism, inputs translucidos
- `apps/web/src/app/torneo/[slug]/estado/page.tsx` — Consulta inscripcion con nuevo estilo
- `apps/web/src/app/torneo/[slug]/grupos/page.tsx` — Tablas de grupos con estilo oscuro
- `apps/web/src/app/torneo/[slug]/cuadro/page.tsx` — Bracket con cards glassmorphism
- `apps/web/src/app/torneo/[slug]/partidos/page.tsx` — Lista partidos con estilo cyan
- `apps/web/src/app/torneo/[slug]/directo/page.tsx` — Streams con cards translucidas
- `apps/web/src/app/torneo/[slug]/directo/[key]/page.tsx` — Player con bordes redondeados

### Bugfixes
- `apps/api/src/routers/tournament.router.ts` — Convertir dateStart/dateEnd/registrationDeadline a Date() para Prisma
- `apps/api/src/routers/group.router.ts` — Fallback round-robin si optimizer no disponible; validacion numGroups flexible

### Documentacion
- `docs/02-estado-proyecto.md` — Actualizado con rediseño, bugfixes, datos de prueba
- `logs/2026-04-27-redesign-y-datos.md` — Este log

## Errores encontrados y resueltos

1. **tournament.create 500**: Prisma esperaba DateTime ISO-8601 pero recibia solo fecha ("2026-05-21"). Fix: `new Date(input.dateStart)`.
2. **group.generate 500**: El optimizer Python (puerto 8000) no estaba corriendo. Fix: fallback round-robin integrado en el router.
3. **Fondo claro ilegible**: Texto blanco sobre degradado claro. Fix: oscurecido el degradado (navy → azul medio → azul → cyan → gris).

## Datos cargados en DB

- Torneo: Open Estrella Galicia (slug: open-estrella-galicia, status: CLOSED)
- 5 categorias: 1ª Masculina, 2ª Masculina, 3ª Masculina, Mixto, Femenino
- 73 equipos con 146 jugadores (emails ficticios playerXa/b@open.local)
- Todas las inscripciones en estado CONFIRMED

## Estado final

- Web publica funcionando en localhost:3003 con nuevo diseño
- Admin funcionando en localhost:3002
- API funcionando en localhost:3001
- Torneo listo para generar grupos (status CLOSED)
