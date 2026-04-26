# CLAUDE.md - Plataforma Torneos de Padel

## Descripcion del Proyecto

Plataforma web completa para gestion de torneos de padel. Dos audiencias:
- **Jugadores**: inscripcion, consultar cuadros/grupos, ver partidos en directo
- **Organizadores**: gestion completa del torneo, generacion de grupos con IA/OR-Tools, resultados en vivo

## Arquitectura

Monorepo Turborepo con **dos frontends + backend comun + microservicio Python**.

```
padel-tournament/
├── apps/
│   ├── web/                # Next.js 15 — Web publica (puerto 3000)
│   ├── admin/              # Next.js 15 — Panel admin (puerto 3002)
│   └── api/                # Hono + tRPC — Backend API (puerto 3001)
├── packages/
│   ├── db/                 # Prisma schema + client + migrations
│   └── shared/             # Types TypeScript + validaciones Zod
├── services/
│   ├── optimizer/          # Python + FastAPI + OR-Tools (puerto 8000)
│   └── media/              # MediaMTX config (RTMP 1935, HLS 8888)
├── docker-compose.yml      # PostgreSQL, MediaMTX, optimizer
├── turbo.json
├── package.json
└── .env
```

## Stack Tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Monorepo | Turborepo |
| Frontends | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| Backend API | Hono + tRPC (type-safe end-to-end) |
| ORM | Prisma |
| Base de datos | PostgreSQL 16 |
| Auth admin | JWT simple (jose) |
| Tiempo real | Server-Sent Events (SSE) |
| Optimizer | Python 3.12 + FastAPI + OR-Tools |
| Streaming | MediaMTX (RTMP → HLS) + hls.js |
| Deploy | Docker Compose + Cloudflare Tunnel |

## Comandos Principales

```bash
# Desarrollo
npm run dev              # Arranca todo (turbo dev)
npm run dev --filter=web # Solo web publica
npm run dev --filter=admin # Solo admin
npm run dev --filter=api # Solo API

# Base de datos
cd packages/db && npx prisma migrate dev    # Crear/aplicar migracion
cd packages/db && npx prisma studio         # UI visual de la BD
cd packages/db && npx prisma generate       # Regenerar client

# Docker (PostgreSQL + MediaMTX)
docker compose up -d        # Levantar servicios
docker compose down         # Parar servicios
docker compose logs -f      # Ver logs

# Build
npm run build               # Build de todo
npm run lint                # Lint de todo
npm run typecheck           # Type checking
```

## Convenciones de Codigo

### General
- **Idioma de comunicacion**: Espanol
- **Idioma de codigo**: Ingles (variables, funciones, comentarios en codigo)
- **TypeScript strict** en todo el proyecto
- **Imports**: Usar path aliases (`@/` para cada app, `@padel/db`, `@padel/shared`)

### API (apps/api)
- Routers tRPC organizados por dominio: `tournament.router.ts`, `player.router.ts`, etc.
- Validacion con Zod en todos los inputs (schemas en `packages/shared`)
- Errores tipados con TRPCError

### Frontends (apps/web y apps/admin)
- App Router de Next.js (carpeta `app/`)
- Server Components por defecto, `"use client"` solo cuando sea necesario
- Componentes shadcn/ui en `components/ui/`
- Componentes de negocio en `components/`
- Estilos: solo Tailwind CSS, no CSS custom

### Base de Datos
- UUIDs como primary keys
- Timestamps `created_at` y `updated_at` en todas las tablas
- Enums para estados: `TournamentStatus`, `MatchStatus`, `RegistrationStatus`, etc.
- Relaciones explicitas con `onDelete` definido

## Esquema de Base de Datos (tablas principales)

- `admins` — Usuarios administradores
- `tournaments` — Torneos (con status: draft/open/closed/in_progress/finished)
- `categories` — Categorias por torneo (masculina, femenina, mixta...)
- `players` — Jugadores registrados
- `teams` — Parejas (2 jugadores)
- `registrations` — Inscripciones de equipos a torneos
- `groups` — Grupos dentro de fase de grupos
- `group_standings` — Clasificacion de cada equipo en su grupo
- `matches` — Partidos (fase grupos y eliminatoria)
- `match_sets` — Sets de cada partido
- `courts` — Pistas disponibles
- `streams` — Streams de video activos

## Flujo del Torneo

1. Admin crea torneo → `draft`
2. Admin configura categorias, pistas, parametros
3. Admin abre inscripciones → `open`
4. Jugadores se inscriben (datos + pareja + categoria)
5. Admin confirma inscripciones (pago externo: Bizum/efectivo/transferencia)
6. Admin cierra inscripciones → `closed`
7. Admin genera grupos con OR-Tools (equilibrados por nivel)
8. OR-Tools genera calendario de partidos
9. Torneo comienza → `in_progress`
10. Admin registra resultados → clasificaciones se actualizan via SSE
11. Fase de grupos termina → se genera bracket eliminatorio automaticamente
12. Eliminatorias con bracket actualizado en tiempo real
13. Torneo finaliza → `finished`

## Streaming

```
OBS → RTMP (:1935) → MediaMTX → HLS (:8888) → hls.js (navegador)
```
- Cada stream tiene un `stream_key` unico
- OBS publica a `rtmp://servidor:1935/{stream_key}`
- Frontend consume `http://servidor:8888/{stream_key}/index.m3u8`

## Rutas Web Publica

| Ruta | Contenido |
|------|-----------|
| `/` | Landing con torneos activos |
| `/torneo/[slug]` | Detalle torneo |
| `/torneo/[slug]/inscripcion` | Formulario inscripcion |
| `/torneo/[slug]/grupos` | Grupos y clasificaciones |
| `/torneo/[slug]/cuadro` | Bracket eliminatorio |
| `/torneo/[slug]/partidos` | Lista de partidos |
| `/torneo/[slug]/directo` | Streams en vivo |

## Rutas Panel Admin

| Ruta | Contenido |
|------|-----------|
| `/login` | Login administrador |
| `/dashboard` | Resumen torneos |
| `/torneos` | Lista torneos |
| `/torneos/nuevo` | Crear torneo |
| `/torneos/[id]/*` | Gestion torneo (inscripciones, grupos, calendario, resultados, bracket, streaming) |
| `/configuracion` | Gestion de admins |

## Instrucciones para Claude

### Antes de cualquier cambio
1. Leer los archivos afectados antes de modificarlos
2. Respetar los patrones existentes en el codigo
3. No hacer cambios sin aprobacion explicita de Daniel

### Documentacion obligatoria
Toda sesion de trabajo DEBE generar documentacion sin que el usuario lo pida:

#### 1. Documentacion tecnica (`docs/`)
Registrar en `docs/` lo implementado:
- Que se ha cambiado y por que
- Decisiones tecnicas (alternativas consideradas)
- Nuevas funcionalidades (que hacen, como se usan)
- Configuraciones nuevas o modificadas
- Dependencias anadidas
- Problemas encontrados y resolucion
- Arquitectura y flujos si cambian

#### 2. Logs de acciones (`logs/`)
Registro cronologico en `logs/` de cada sesion:
- Fecha y hora
- Archivos creados, modificados o eliminados
- Comandos ejecutados relevantes
- Errores encontrados y resolucion
- Estado final (que funciona, que queda pendiente)

### Al crear nuevas rutas API (tRPC)
1. Definir schema Zod de input/output en `packages/shared`
2. Crear el router en `apps/api/src/routers/`
3. Registrar en el appRouter principal
4. El frontend consume via el client tRPC tipado

### Al crear nuevas paginas
1. Crear la ruta en `app/` del frontend correspondiente
2. Server Component por defecto
3. Usar componentes shadcn/ui existentes
4. Responsive desde el inicio (mobile-first)

### Al modificar la base de datos
1. Editar `packages/db/prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name descripcion_cambio`
3. Ejecutar `npx prisma generate`
4. Actualizar types en `packages/shared` si es necesario

### Al trabajar con el optimizer (Python)
1. El microservicio esta en `services/optimizer/`
2. Usa FastAPI + OR-Tools
3. Se comunica con la API Node via HTTP interno (puerto 8000)
4. Probar con `curl` antes de integrar

### Deploy
- Todo corre en Docker Compose
- Cloudflare Tunnel expone web publica y admin
- Variables de entorno en `.env` (nunca commitear secretos)

## Variables de Entorno (.env)

```env
# PostgreSQL
DATABASE_URL=postgresql://padel:padel@localhost:5432/padel_tournament
POSTGRES_USER=padel
POSTGRES_PASSWORD=padel
POSTGRES_DB=padel_tournament

# API
API_PORT=3001
JWT_SECRET=cambiar-en-produccion

# Apps
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STREAM_URL=http://localhost:8888

# Optimizer
OPTIMIZER_URL=http://localhost:8000
```
