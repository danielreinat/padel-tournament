# Log: Fase 2 — Admin CRUD Torneos

## Fecha: 2026-04-26
## Sesion: Panel admin completo para gestion de torneos

### Archivos creados

- `apps/admin/src/app/torneos/nuevo/page.tsx` — Formulario crear torneo (info general, fechas, config)
- `apps/admin/src/app/torneos/[id]/page.tsx` — Pagina gestion torneo con tabs (General, Categorias, Pistas, Inscripciones)
- `apps/admin/src/app/torneos/[id]/tabs/general.tsx` — Tab editar info + cambiar estado (DRAFT→OPEN→CLOSED→IN_PROGRESS→FINISHED)
- `apps/admin/src/app/torneos/[id]/tabs/categorias.tsx` — Tab anadir/eliminar categorias (con presets rapidos)
- `apps/admin/src/app/torneos/[id]/tabs/pistas.tsx` — Tab anadir/eliminar pistas (con boton rapido +2/+4)
- `apps/admin/src/app/torneos/[id]/tabs/inscripciones.tsx` — Tab listar inscripciones, confirmar (con metodo pago), cancelar

### Funcionalidades implementadas

1. **Crear torneo**: Formulario con todos los campos, redirige a gestion tras crear
2. **Editar torneo**: Tab General con formulario editable + feedback "Guardado"
3. **Cambiar estado**: Botones contextuales segun estado actual (ej: DRAFT solo puede ir a OPEN)
4. **Categorias**: Lista, presets predefinidos (Masc/Fem/Mixta x Amateur/Intermedio/Avanzado), formulario custom
5. **Pistas**: Lista con badge STREAMING, botones rapidos +2/+4, formulario con checkbox streaming
6. **Inscripciones**: Stats (pendientes/confirmadas/canceladas), tabla con detalle jugadores, confirmar con selector de metodo pago (Bizum/Efectivo/Transferencia/Gratis), cancelar

### Errores encontrados y resolucion
- `onSuccess: refetch` en mutations de tRPC causa error de tipos porque el callback recibe parametros de la mutation. Fix: wrappear en arrow function `() => { refetch(); }`

### Estado final
- Panel admin funcional: crear torneos, editar, cambiar estado, gestionar categorias/pistas/inscripciones
- Compilacion limpia sin errores TypeScript en api, web y admin
- Pendiente: probar e2e con Docker + BD real
