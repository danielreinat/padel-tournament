# Arquitectura Inicial - Plataforma Torneos de Padel

## Fecha: 2026-04-26

## Resumen

Se ha creado la estructura base completa del proyecto como monorepo Turborepo.

## Decisiones Tecnicas

### Monorepo vs Multi-repo
- **Elegido**: Monorepo con Turborepo
- **Alternativa**: Repositorios separados por app
- **Motivo**: Tipos compartidos sin publicar paquetes npm, un solo docker compose, desarrollo mas agil para equipo pequeno

### Backend: Hono + tRPC vs Express vs Fastify
- **Elegido**: Hono + tRPC con fetch adapter
- **Motivo**: Hono es ligero y rapido, tRPC da type-safety end-to-end con los frontends Next.js. El fetch adapter es compatible con tRPC v11 sin dependencias extra.

### Frontend: Next.js 15 App Router
- **Elegido**: Next.js 15 con App Router para ambos frontends
- **Motivo**: SSR para SEO en web publica, RSC para rendimiento, shadcn/ui para UI rapida

### ORM: Prisma
- **Elegido**: Prisma con PostgreSQL
- **Motivo**: Migraciones declarativas, client tipado, Prisma Studio para debug

### Auth: JWT simple con jose
- **Elegido**: JWT firmado con HS256 via jose
- **Alternativa**: Better Auth, NextAuth
- **Motivo**: Solo admins necesitan auth, no se necesita OAuth ni SSO. JWT simple es suficiente.

### Streaming: MediaMTX
- **Elegido**: MediaMTX (RTMP in → HLS out)
- **Alternativa**: nginx-rtmp-module, Cloudflare Stream
- **Motivo**: Ligero, Docker-ready, open-source, soporta multiples streams

## Estructura del Proyecto

```
padel-tournament/
├── apps/
│   ├── web/          (Next.js 15, puerto 3000)
│   ├── admin/        (Next.js 15, puerto 3002)
│   └── api/          (Hono + tRPC, puerto 3001)
├── packages/
│   ├── db/           (Prisma schema + client)
│   └── shared/       (Zod schemas + tipos)
├── services/
│   ├── optimizer/    (Python + OR-Tools, futuro)
│   └── media/        (MediaMTX config)
└── docker-compose.yml
```

## Base de Datos

12 tablas definidas en Prisma:
- admins, tournaments, categories, players, teams, registrations
- groups, group_standings, matches, match_sets, courts, streams

5 enums: TournamentStatus, RegistrationStatus, PaymentMethod, MatchPhase, MatchStatus, StreamStatus, AdminRole

## API Endpoints (tRPC routers)

### auth
- `login` — Login admin con email/password, devuelve JWT
- `me` — Datos del admin autenticado

### tournament
- `list` (publico) — Torneos visibles (OPEN, IN_PROGRESS, FINISHED)
- `bySlug` (publico) — Torneo por slug
- `adminList` (admin) — Todos los torneos
- `byId` (admin) — Torneo con detalles completos
- `create` (admin) — Crear torneo
- `update` (admin) — Actualizar torneo
- `addCategory/deleteCategory` (admin) — Gestionar categorias
- `addCourt/deleteCourt` (admin) — Gestionar pistas

### registration
- `register` (publico) — Inscripcion completa (jugadores + equipo)
- `checkStatus` (publico) — Consultar estado de inscripcion por email
- `listByTournament` (admin) — Inscripciones de un torneo
- `confirm` (admin) — Confirmar inscripcion
- `cancel` (admin) — Cancelar inscripcion
