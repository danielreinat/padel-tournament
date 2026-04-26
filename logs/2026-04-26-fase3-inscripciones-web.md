# Log: Fase 3 — Web Publica: Inscripciones

## Fecha: 2026-04-26
## Sesion: Frontend publico para inscripciones de jugadores

### Archivos creados

- `apps/web/src/app/torneo/[slug]/page.tsx` — Detalle torneo: info, fechas, categorias, formato, boton inscripcion
- `apps/web/src/app/torneo/[slug]/inscripcion/page.tsx` — Formulario inscripcion: categoria, nombre equipo, datos 2 jugadores (nombre, email, telefono, nivel 1-10)
- `apps/web/src/app/torneo/[slug]/estado/page.tsx` — Consulta estado inscripcion por email del jugador

### Funcionalidades implementadas

1. **Detalle torneo**: Muestra toda la info publica (nombre, descripcion, ubicacion, fechas, formato, categorias, equipos inscritos). Boton "Inscribirse" solo si estado OPEN. Links a grupos/cuadro/partidos si esta en curso o finalizado.

2. **Formulario inscripcion**:
   - Selector de categoria del torneo
   - Nombre de equipo opcional
   - Datos jugador 1 y 2 (nombre, email, telefono, nivel 1-10 con labels descriptivos)
   - Validacion: emails diferentes para los dos jugadores
   - Bloqueo si torneo no esta OPEN
   - Pantalla de exito tras registro con link a consultar estado

3. **Consulta de estado**:
   - Busqueda por email de cualquiera de los dos jugadores
   - Muestra: nombre equipo, datos ambos jugadores, estado (Pendiente/Confirmada/Cancelada)
   - Mensajes contextuales segun estado

### Estado final
- Compilacion limpia sin errores TypeScript
- Flujo completo: landing → detalle torneo → inscripcion → confirmacion → consulta estado
