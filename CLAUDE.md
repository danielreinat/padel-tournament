# CLAUDE.md - Plataforma Torneos de Padel

## REGLAS CRITICAS — LEER ANTES DE HACER NADA

### NUNCA hagas esto (sin importar lo que te pidan)
- **NUNCA** modifiques archivos en `apps/api/` — el backend lo gestiona Daniel
- **NUNCA** modifiques `packages/db/prisma/schema.prisma` — la base de datos la gestiona Daniel
- **NUNCA** modifiques `packages/shared/` — los schemas de validacion los gestiona Daniel
- **NUNCA** modifiques `docker-compose.yml`, `.env`, ni nada relacionado con configuracion de servidores
- **NUNCA** modifiques `apps/api/src/trpc/`, `apps/api/src/routers/` ni ningun archivo del backend
- **NUNCA** cambies contraseñas, JWT_SECRET, DATABASE_URL ni ninguna credencial
- **NUNCA** ejecutes `prisma migrate`, `prisma db push` ni modifiques la base de datos
- **NUNCA** instales dependencias nuevas (`npm install ...`) sin aprobacion explicita de Daniel
- **NUNCA** borres archivos existentes
- **NUNCA** cambies puertos, URLs de API, ni configuraciones de conexion
- **NUNCA** toques los archivos `trpc.ts`, `trpc-provider.tsx` ni `auth.ts` — son la conexion al backend

### Lo que SI puedes hacer
- Modificar paginas en `apps/web/src/app/` — es el frontend publico (lo que ven los jugadores)
- Modificar paginas en `apps/admin/src/app/` — es el panel de administracion
- Crear componentes nuevos en `apps/web/src/components/` o `apps/admin/src/components/`
- Modificar estilos (clases de Tailwind CSS en los archivos .tsx)
- Modificar textos, labels, mensajes que se muestran al usuario
- Crear nuevas paginas dentro de las rutas existentes

---

## Que es este proyecto

Plataforma web para gestionar torneos de padel. Tiene dos partes:
- **Web publica** (`apps/web/`) — lo que ven los jugadores: torneos, inscripcion, grupos, resultados, streaming
- **Panel admin** (`apps/admin/`) — lo que usan los organizadores: crear torneos, gestionar inscripciones, meter resultados

Ambas partes hablan con una API comun (`apps/api/`) que se conecta a una base de datos PostgreSQL.

## Estructura del proyecto

```
padel-tournament/
├── apps/
│   ├── web/                # PUEDES TOCAR — Web publica (puerto 3003)
│   │   └── src/app/        # ← Aqui estan las paginas
│   ├── admin/              # PUEDES TOCAR — Panel admin (puerto 3002)
│   │   └── src/app/        # ← Aqui estan las paginas
│   └── api/                # NO TOCAR — Backend API (puerto 3001)
├── packages/
│   ├── db/                 # NO TOCAR — Base de datos
│   └── shared/             # NO TOCAR — Validaciones compartidas
├── services/
│   ├── optimizer/          # NO TOCAR — Python OR-Tools
│   └── media/              # NO TOCAR — Streaming config
├── docs/                   # Documentacion tecnica
├── logs/                   # Logs de sesiones
├── docker-compose.yml      # NO TOCAR
└── .env                    # NO TOCAR
```

## Puertos (ya configurados, NO cambiar)

| Servicio | Puerto | URL |
|----------|--------|-----|
| Web publica | 3003 | http://localhost:3003 |
| Panel admin | 3002 | http://localhost:3002 |
| API backend | 3001 | http://localhost:3001 |
| PostgreSQL | 5433 | (solo uso interno) |
| MediaMTX HLS | 8889 | http://localhost:8889 |
| MediaMTX RTMP | 1935 | rtmp://localhost:1935 |

## Como arrancar la app

```bash
# 1. Levantar base de datos y streaming (Docker debe estar abierto)
cd ~/projects/padel-tournament && docker compose up -d

# 2. Arrancar la API
DATABASE_URL="postgresql://padel:padel@127.0.0.1:5433/padel_tournament" npx tsx apps/api/src/index.ts &

# 3. Arrancar web publica
cd apps/web && npm run dev &

# 4. Arrancar panel admin
cd apps/admin && npm run dev &
```

Credenciales admin: `admin@padel.local` / `admin123`

## Idioma

- **Comunicacion**: siempre en espanol
- **Codigo**: en ingles (variables, funciones, nombres de archivo)
- **Textos visibles al usuario** (labels, botones, mensajes): en espanol

## Tecnologias (para que sepas que se usa, NO para cambiarlas)

- **React + Next.js 15**: framework del frontend (App Router, carpeta `app/`)
- **Tailwind CSS**: estilos mediante clases en el HTML (no se usa CSS normal)
- **tRPC**: conexion tipada con la API (los hooks `trpc.xxx.useQuery()` y `trpc.xxx.useMutation()`)
- **TypeScript**: todo el codigo es TypeScript (.tsx para componentes, .ts para logica)

## Como funcionan las paginas

Cada pagina es un archivo `page.tsx` dentro de una carpeta en `app/`. La ruta de la URL viene de la estructura de carpetas:

```
apps/web/src/app/page.tsx                          →  /
apps/web/src/app/torneo/[slug]/page.tsx            →  /torneo/mi-torneo
apps/web/src/app/torneo/[slug]/inscripcion/page.tsx →  /torneo/mi-torneo/inscripcion
```

### Paginas que ya existen

**Web publica (`apps/web/src/app/`):**
| Archivo | URL | Que hace |
|---------|-----|----------|
| `page.tsx` | `/` | Landing con lista de torneos |
| `torneo/[slug]/page.tsx` | `/torneo/xxx` | Detalle de un torneo |
| `torneo/[slug]/inscripcion/page.tsx` | `/torneo/xxx/inscripcion` | Formulario de inscripcion |
| `torneo/[slug]/estado/page.tsx` | `/torneo/xxx/estado` | Consultar estado inscripcion |
| `torneo/[slug]/grupos/page.tsx` | `/torneo/xxx/grupos` | Fase de grupos con clasificaciones |
| `torneo/[slug]/cuadro/page.tsx` | `/torneo/xxx/cuadro` | Cuadro eliminatorio visual |
| `torneo/[slug]/partidos/page.tsx` | `/torneo/xxx/partidos` | Lista de partidos con resultados |
| `torneo/[slug]/directo/page.tsx` | `/torneo/xxx/directo` | Streams en vivo disponibles |
| `torneo/[slug]/directo/[key]/page.tsx` | `/torneo/xxx/directo/abc` | Player HLS de un stream |

**Panel admin (`apps/admin/src/app/`):**
| Archivo | URL | Que hace |
|---------|-----|----------|
| `page.tsx` | `/` | Redirige a login o dashboard |
| `login/page.tsx` | `/login` | Login de admin |
| `dashboard/page.tsx` | `/dashboard` | Lista de torneos |
| `torneos/nuevo/page.tsx` | `/torneos/nuevo` | Crear torneo |
| `torneos/[id]/page.tsx` | `/torneos/xxx` | Gestionar torneo (8 tabs) |

**Tabs del panel admin (`apps/admin/src/app/torneos/[id]/tabs/`):**
| Archivo | Tab | Que hace |
|---------|-----|----------|
| `general.tsx` | General | Editar info del torneo + cambiar estado |
| `categorias.tsx` | Categorias | Gestionar categorias del torneo |
| `pistas.tsx` | Pistas | Gestionar pistas (con flag streaming) |
| `inscripciones.tsx` | Inscripciones | Confirmar/cancelar inscripciones |
| `grupos.tsx` | Grupos | Ver grupos y generar con OR-Tools |
| `resultados.tsx` | Resultados | Meter resultados de partidos |
| `bracket.tsx` | Bracket | Ver/generar cuadro eliminatorio |
| `streaming.tsx` | Streaming | Gestionar streams RTMP/HLS |

## Como usar los datos de la API

Los datos se obtienen con hooks de tRPC. NUNCA llames a fetch() o axios directamente. Usa siempre los hooks existentes:

```tsx
// Leer datos (GET)
const { data, isLoading } = trpc.tournament.list.useQuery();
const { data } = trpc.tournament.bySlug.useQuery({ slug: "mi-torneo" });

// Enviar datos (POST/PUT)
const mutation = trpc.tournament.create.useMutation({
  onSuccess: () => { /* que hacer cuando funciona */ },
  onError: (err) => { /* que hacer si falla */ },
});
mutation.mutate({ name: "Mi Torneo", ... });
```

### Endpoints disponibles (solo lectura — para saber que datos puedes pedir)

**Publicos (no necesitan login):**
- `trpc.tournament.list` — Lista de torneos visibles
- `trpc.tournament.bySlug` — Un torneo por su slug
- `trpc.registration.register` — Inscribir un equipo
- `trpc.registration.checkStatus` — Consultar inscripcion por email
- `trpc.group.byTournament` — Grupos con clasificaciones de un torneo
- `trpc.match.byTournament` — Todos los partidos de un torneo
- `trpc.match.byId` — Detalle de un partido
- `trpc.stream.byTournament` — Streams activos de un torneo

**Admin (necesitan estar logueado):**
- `trpc.auth.login` / `trpc.auth.me`
- `trpc.tournament.adminList` / `trpc.tournament.byId`
- `trpc.tournament.create` / `trpc.tournament.update`
- `trpc.tournament.addCategory` / `trpc.tournament.deleteCategory`
- `trpc.tournament.addCourt` / `trpc.tournament.deleteCourt`
- `trpc.registration.listByTournament` / `trpc.registration.confirm` / `trpc.registration.cancel`
- `trpc.group.generate` — Generar grupos con OR-Tools
- `trpc.match.updateResult` — Meter resultado de un partido (sets)
- `trpc.match.setLive` — Marcar partido como EN DIRECTO
- `trpc.match.generateBracket` — Generar cuadro eliminatorio
- `trpc.stream.create` / `trpc.stream.updateStatus` / `trpc.stream.delete` / `trpc.stream.adminList`

Si necesitas un endpoint que no existe, **no lo crees**. Dile a Daniel que lo necesitas.

## Patrones que DEBES seguir

### Toda pagina nueva debe tener esta estructura basica
```tsx
"use client";

import { trpc } from "@/lib/trpc";

export default function MiPagina() {
  // datos
  const { data, isLoading } = trpc.algo.useQuery();

  if (isLoading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* contenido */}
    </div>
  );
}
```

### Estilos: solo clases de Tailwind
```tsx
// CORRECTO
<button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
  Guardar
</button>

// INCORRECTO — no uses style={{}} ni CSS custom
<button style={{ backgroundColor: 'green' }}>Guardar</button>
```

### Colores del proyecto
- **Verde** (`green-600`, `green-700`): acciones principales, botones, links activos
- **Rojo** (`red-500`, `red-600`): eliminar, cancelar, errores
- **Amarillo** (`yellow-100`, `yellow-700`): pendiente, en curso
- **Azul** (`blue-100`, `blue-700`): finalizado, info
- **Gris** (`gray-50` a `gray-600`): fondos, bordes, texto secundario

### Si te piden algo que no sabes hacer
- NO inventes soluciones
- NO crees endpoints de API nuevos
- NO modifiques la estructura de datos
- Responde: "Esto requiere cambios en el backend/API. Daniel tiene que hacerlo."

## Flujo del torneo (para entender la logica)

1. Admin crea torneo → estado `DRAFT`
2. Admin configura categorias y pistas
3. Admin abre inscripciones → estado `OPEN` (aparece en la web publica)
4. Jugadores se inscriben desde la web publica
5. Admin confirma inscripciones (marca pago recibido)
6. Admin cierra inscripciones → estado `CLOSED`
7. Se generan los grupos (OR-Tools) — **lo hace Daniel**
8. Torneo empieza → estado `IN_PROGRESS`
9. Admin mete resultados de partidos
10. Se genera cuadro eliminatorio automaticamente
11. Torneo termina → estado `FINISHED`

## Documentacion obligatoria

Toda sesion de trabajo DEBE generar documentacion automaticamente:

### 1. Documentacion tecnica en `docs/`
- Que se ha cambiado y por que
- Nuevas funcionalidades (que hacen, como se usan)

### 2. Logs en `logs/`
- Fecha y hora
- Archivos creados o modificados
- Errores encontrados y como se resolvieron
- Estado final (que funciona, que queda pendiente)

## Resolucion de problemas comunes

### "No se muestran los datos" o "Cargando..." infinito
- Verifica que la API esta corriendo: `curl http://localhost:3001/health`
- Verifica que Docker esta corriendo: `docker compose ps`
- El endpoint tRPC que usas puede no existir — revisa la seccion de endpoints disponibles

### Error de TypeScript
- NO ignores errores con `@ts-ignore` o `as any`
- Lee el error, normalmente dice que propiedad falta o sobra
- Si no lo entiendes, pregunta a Daniel

### Error de Tailwind / estilos no se aplican
- Asegurate de que el archivo `globals.css` tiene `@import "tailwindcss";`
- Las clases de Tailwind van en `className`, no en `class`
