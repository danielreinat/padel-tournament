# Estado del Proyecto — 2026-04-26

## Resumen

Plataforma de gestion de torneos de padel. Monorepo Turborepo con dos frontends Next.js, API Hono+tRPC, PostgreSQL, MediaMTX para streaming, y microservicio Python OR-Tools para generacion de grupos.

## Completado

### Fase 1 — Cimientos
- Monorepo Turborepo configurado con workspaces
- Docker Compose (PostgreSQL 16 + MediaMTX + optimizer)
- Prisma schema completo: 12 tablas, 7 enums
- API backend con Hono + tRPC (6 routers: auth, tournament, registration, group, match, stream)
- Auth admin con JWT (jose)
- Prisma client generado, todo compila sin errores
- Repo en GitHub: github.com/danielreinat/padel-tournament

### Fase 2 — Admin: CRUD Torneos
- Pagina crear torneo (`/torneos/nuevo`) con formulario completo
- Pagina gestion torneo (`/torneos/[id]`) con 8 tabs:
  - **General**: Editar info del torneo + cambiar estado (DRAFT → OPEN → CLOSED → IN_PROGRESS → FINISHED)
  - **Categorias**: Anadir/eliminar con presets rapidos (Masc/Fem/Mixta x Amateur/Intermedio/Avanzado)
  - **Pistas**: Anadir/eliminar con flag streaming y botones rapidos (+2/+4)
  - **Inscripciones**: Stats, tabla con jugadores, confirmar pago (Bizum/Efectivo/Transferencia/Gratis), cancelar
  - **Grupos**: Ver grupos generados + boton para generar con OR-Tools
  - **Resultados**: Meter resultados de partidos (3 sets), marcar EN DIRECTO
  - **Bracket**: Visualizar/generar cuadro eliminatorio
  - **Streaming**: CRUD de streams (crear keys, vincular a partidos, cambiar estado)
- Dashboard admin con lista de torneos y acceso a gestion

### Fase 3 — Web Publica: Inscripciones
- Landing page con lista de torneos disponibles (OPEN, IN_PROGRESS, FINISHED)
- Detalle torneo (`/torneo/[slug]`) con info, categorias, formato, equipos inscritos
- Formulario inscripcion (`/torneo/[slug]/inscripcion`): categoria, nombre equipo, datos 2 jugadores con nivel 1-10
- Consulta estado inscripcion (`/torneo/[slug]/estado`) por email
- Pantalla de exito post-inscripcion

### Fase 4 — Generacion de Grupos con OR-Tools
- Microservicio Python + FastAPI + OR-Tools (`services/optimizer/`)
- Algoritmo CP-SAT para equilibrado de grupos por nivel promedio
- Generacion de calendario round-robin con asignacion de pistas sin conflictos
- Router `group.generate` en API (crea grupos, standings y partidos en transaccion)
- Vista de grupos en admin (tab Grupos) y web publica (`/torneo/[slug]/grupos`)
- Soporte multi-categoria

### Fase 5 — Resultados en Tiempo Real
- Panel en admin para meter resultados (scores por set, hasta 3 sets)
- Boton "Marcar EN DIRECTO" para partidos
- Clasificaciones de grupo auto-recalculadas al meter resultado (3 pts por victoria, desempate por sets/juegos)
- Pagina publica de partidos (`/torneo/[slug]/partidos`) agrupados por estado (directo/proximos/finalizados)

### Fase 6 — Cuadro Eliminatorio
- Generacion automatica de bracket desde clasificaciones de grupo
- Soporte para byes cuando el numero de equipos no es potencia de 2
- Avance automatico de ganadores al siguiente round
- Componente visual de bracket horizontal en admin y web publica (`/torneo/[slug]/cuadro`)
- Naming automatico de fases (ROUND_OF_16, QUARTER, SEMI, FINAL, etc.)

### Fase 7 — Streaming
- MediaMTX configurado en Docker (RTMP :1935 → HLS :8889)
- CRUD de streams en admin: crear key, vincular a partido, cambiar estado (INACTIVE/LIVE/ENDED)
- Muestra URL RTMP para OBS y URL HLS para el navegador
- Listado de streams en vivo en web publica (`/torneo/[slug]/directo`)
- Player HLS con hls.js + fallback nativo Safari (`/torneo/[slug]/directo/[key]`)
- Badge "EN DIRECTO" en partidos con stream activo

### Fase 8 — Polish
- SEO meta tags (Open Graph, robots, theme-color)
- Viewport responsivo configurado
- Footer en web publica
- Admin panel con robots noindex/nofollow
- Enlace a "En Directo" desde la pagina del torneo
- CLAUDE.md actualizado con todos los endpoints y paginas

## Pendiente / Mejoras futuras

- SSE (Server-Sent Events) para actualizaciones push en tiempo real sin recargar
- Cloudflare Tunnel configuracion para produccion
- Testing end-to-end
- Notificaciones (email o Telegram, opcional)
- PWA / app movil

## URLs de la app

| Servicio | URL | Puerto |
|----------|-----|--------|
| Web publica | http://localhost:3003 | 3003 |
| API backend | http://localhost:3001 | 3001 |
| Panel admin | http://localhost:3002 | 3002 |
| Optimizer | http://localhost:8000 | 8000 |
| MediaMTX HLS | http://localhost:8889 | 8889 |
| MediaMTX RTMP | rtmp://localhost:1935 | 1935 |
| PostgreSQL | localhost:5433 | 5433 |

## Credenciales desarrollo

- **Admin**: admin@padel.local / admin123
- **PostgreSQL**: padel / padel / padel_tournament
