# Estado del Proyecto — 2026-04-26

## Resumen

Plataforma de gestion de torneos de padel. Monorepo Turborepo con dos frontends Next.js, API Hono+tRPC, PostgreSQL, y MediaMTX para streaming.

## Completado

### Fase 1 — Cimientos
- Monorepo Turborepo configurado con workspaces
- Docker Compose (PostgreSQL 16 + MediaMTX)
- Prisma schema completo: 12 tablas, 7 enums
- API backend con Hono + tRPC (3 routers: auth, tournament, registration)
- Auth admin con JWT (jose)
- Prisma client generado, todo compila sin errores
- Repo en GitHub: github.com/danielreinat/padel-tournament

### Fase 2 — Admin: CRUD Torneos
- Pagina crear torneo (`/torneos/nuevo`) con formulario completo
- Pagina gestion torneo (`/torneos/[id]`) con 4 tabs:
  - **General**: Editar info del torneo + cambiar estado (DRAFT → OPEN → CLOSED → IN_PROGRESS → FINISHED)
  - **Categorias**: Anadir/eliminar con presets rapidos (Masc/Fem/Mixta x Amateur/Intermedio/Avanzado)
  - **Pistas**: Anadir/eliminar con flag streaming y botones rapidos (+2/+4)
  - **Inscripciones**: Stats, tabla con jugadores, confirmar pago (Bizum/Efectivo/Transferencia/Gratis), cancelar
- Dashboard admin con lista de torneos y acceso a gestion

### Fase 3 — Web Publica: Inscripciones
- Landing page con lista de torneos disponibles (OPEN, IN_PROGRESS, FINISHED)
- Detalle torneo (`/torneo/[slug]`) con info, categorias, formato, equipos inscritos
- Formulario inscripcion (`/torneo/[slug]/inscripcion`): categoria, nombre equipo, datos 2 jugadores con nivel 1-10
- Consulta estado inscripcion (`/torneo/[slug]/estado`) por email
- Pantalla de exito post-inscripcion

## Pendiente

### Fase 4 — Generacion de Grupos con OR-Tools (pospuesta)
- Microservicio Python + FastAPI + OR-Tools
- Algoritmo de equilibrado de grupos por nivel
- Generacion de calendario de partidos (pistas + horarios)
- Integracion con API backend
- Vista de grupos en admin y web publica
- **Nota**: Requiere pensar bien la logica antes de implementar

### Fase 5 — Resultados en Tiempo Real
- Panel en admin para meter resultados (scores por set)
- SSE para actualizaciones en vivo
- Clasificaciones de grupo auto-calculadas
- Generacion automatica de bracket tras fase de grupos
- **Depende de**: Fase 4 (necesita grupos y partidos creados)

### Fase 6 — Cuadro Eliminatorio
- Componente visual de bracket
- Avance automatico de ganadores
- Resultados en tiempo real en bracket
- **Depende de**: Fase 4 y 5

### Fase 7 — Streaming (independiente)
- Config MediaMTX para RTMP → HLS
- CRUD de streams en admin (crear stream keys, vincular a partidos)
- Player HLS (hls.js) en web publica
- Indicador "EN DIRECTO" en partidos
- **No tiene dependencias**, se puede hacer ya

### Fase 8 — Polish
- Responsive design completo
- SEO meta tags
- Cloudflare Tunnel config
- Testing end-to-end
- Notificaciones (email o Telegram, opcional)

## URLs de la app

| Servicio | URL | Puerto |
|----------|-----|--------|
| Web publica | http://localhost:3000 | 3000 |
| API backend | http://localhost:3001 | 3001 |
| Panel admin | http://localhost:3002 | 3002 |
| MediaMTX HLS | http://localhost:8888 | 8888 |
| MediaMTX RTMP | rtmp://localhost:1935 | 1935 |
| PostgreSQL | localhost:5432 | 5432 |

## Credenciales desarrollo

- **Admin**: admin@padel.local / admin123
- **PostgreSQL**: padel / padel / padel_tournament
