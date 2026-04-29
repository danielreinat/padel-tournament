# Guia para empezar a trabajar en el proyecto Padel Tournament

Esta guia esta pensada para alguien que no tiene experiencia programando. Sigue los pasos en orden y al final tendras todo funcionando para poder trabajar con Claude en Visual Studio Code.

---

## Que es este proyecto

Es una plataforma web para gestionar torneos de padel. Tiene tres partes:

- **Web publica** — lo que ven los jugadores: lista de torneos, inscripcion, grupos, resultados, streaming en directo
- **Panel admin** — lo que usan los organizadores: crear torneos, gestionar inscripciones, meter resultados
- **API backend** — el servidor que conecta todo con la base de datos (esto lo gestiona Daniel)

Tu trabajo sera modificar las paginas web (la parte visual), no el backend.

---

## Paso 1: Instalar los programas necesarios

Necesitas instalar estas cosas en tu ordenador. Sigue el orden.

### 1.1 Visual Studio Code (el editor de codigo)

1. Ve a https://code.visualstudio.com
2. Descarga la version para tu sistema operativo (Windows / Mac)
3. Instalalo como cualquier programa (siguiente, siguiente, instalar)

### 1.2 Git (para descargar y gestionar el codigo)

**En Mac:**
1. Abre la app "Terminal"
2. Escribe `git --version` y pulsa Enter
3. Si no esta instalado, te pedira instalarlo automaticamente. Acepta.

**En Windows:**
1. Ve a https://git-scm.com/download/win
2. Descarga e instala con las opciones por defecto

### 1.3 Node.js (para ejecutar el proyecto)

1. Ve a https://nodejs.org
2. Descarga la version **LTS** (la que dice "Recommended")
3. Necesitas la version **20 o superior**. Compruebalo despues de instalar abriendo un terminal y escribiendo:
   ```
   node --version
   ```
   Debe mostrar algo como `v20.x.x` o superior.

### 1.4 Docker Desktop (para la base de datos y servicios)

1. Ve a https://www.docker.com/products/docker-desktop/
2. Descarga la version para tu sistema operativo
3. Instalalo y abrelo
4. Dejalo abierto (tiene que estar corriendo de fondo siempre que trabajes en el proyecto)

---

## Paso 2: Configurar GitHub

El codigo esta en un repositorio de GitHub. Necesitas acceso.

### 2.1 Crear cuenta en GitHub (si no tienes)

1. Ve a https://github.com
2. Crea una cuenta gratuita

### 2.2 Pedir acceso

Dile a Daniel tu nombre de usuario de GitHub para que te de acceso al repositorio.

### 2.3 Instalar GitHub CLI (recomendado)

Esto hace que sea mas facil autenticarse.

**En Mac** (abre Terminal):
```
brew install gh
```

**En Windows** (abre PowerShell como administrador):
```
winget install --id GitHub.cli
```

Despues, en el terminal:
```
gh auth login
```
Sigue las instrucciones (elige GitHub.com, HTTPS, y autenticate con el navegador).

---

## Paso 3: Descargar el proyecto

Abre un terminal (Terminal en Mac, o PowerShell en Windows) y ejecuta estos comandos uno por uno:

```bash
# Ir a tu carpeta de proyectos (o donde quieras guardarlo)
cd ~/Desktop

# Descargar el repositorio
git clone https://github.com/TU-ORGANIZACION/padel-tournament.git

# Entrar en la carpeta del proyecto
cd padel-tournament

# Instalar todas las dependencias
npm install
```

> **Nota:** Daniel te dira la URL exacta del repositorio para el comando `git clone`. Reemplaza `https://github.com/TU-ORGANIZACION/padel-tournament.git` por la URL real.

El `npm install` puede tardar unos minutos. Es normal.

---

## Paso 4: Abrir el proyecto en Visual Studio Code

Opcion A — Desde el terminal:
```bash
code .
```

Opcion B — Desde Visual Studio Code:
1. Abre Visual Studio Code
2. Ve a Archivo > Abrir carpeta
3. Selecciona la carpeta `padel-tournament`

---

## Paso 5: Instalar extensiones de Visual Studio Code

Cuando abras el proyecto, instala estas extensiones. Ve al icono de cuadraditos en la barra lateral izquierda (o pulsa `Ctrl+Shift+X` / `Cmd+Shift+X`):

| Extension | Para que sirve |
|-----------|---------------|
| **Claude Code** | El agente de IA que te ayuda a programar |
| **Tailwind CSS IntelliSense** | Autocompletado de estilos |
| **Prisma** | Resaltado del schema de base de datos |
| **ES7+ React/Redux/React-Native snippets** | Atajos para crear componentes |

### Instalar la extension de Claude Code

1. En la barra de extensiones busca "Claude Code" (de Anthropic)
2. Dale a "Install"
3. Tras instalarla, aparecera un icono de Claude en la barra lateral

---

## Paso 6: Configurar las variables de entorno

El proyecto necesita un archivo `.env` para saber como conectarse a la base de datos. Pidele a Daniel que te pase el archivo `.env` o crealo con este contenido:

Crea un archivo llamado `.env` en la raiz del proyecto (`padel-tournament/.env`) con:

```
DATABASE_URL="postgresql://padel:padel@127.0.0.1:5433/padel_tournament"
JWT_SECRET="un-secreto-para-desarrollo"
```

---

## Paso 7: Arrancar el proyecto

Cada vez que quieras trabajar en el proyecto, necesitas seguir estos pasos:

### 7.1 Asegurate de que Docker Desktop esta abierto

Abrerlo si no lo esta. Espera a que diga "Docker is running".

### 7.2 Abre un terminal en Visual Studio Code

Pulsa `` Ctrl+` `` (la tecla de acento grave, debajo del Escape) para abrir el terminal integrado.

### 7.3 Levanta los servicios de Docker

```bash
docker compose up -d
```

Esto arranca la base de datos PostgreSQL, el servidor de streaming y el optimizador. Solo tarda la primera vez.

### 7.4 Genera el cliente de Prisma (solo la primera vez)

```bash
npm run db:generate
```

### 7.5 Arranca todo el proyecto de golpe

```bash
npm run dev
```

Este comando arranca las tres aplicaciones a la vez:

| Servicio | URL | Que es |
|----------|-----|--------|
| Web publica | http://localhost:3003 | Lo que ven los jugadores |
| Panel admin | http://localhost:3002 | Lo que usan los organizadores |
| API backend | http://localhost:3001 | El servidor (no necesitas abrirlo) |

Abre tu navegador y entra en:
- http://localhost:3003 — para ver la web publica
- http://localhost:3002 — para ver el panel admin (usuario: `admin@padel.local`, contraseña: `admin123`)

### 7.6 Para parar todo

En el terminal donde ejecutaste `npm run dev`, pulsa `Ctrl+C`.

Para parar Docker:
```bash
docker compose down
```

---

## Paso 8: Usar Claude en Visual Studio Code

Claude es tu asistente de programacion. Le puedes pedir en espanol que haga cambios en el codigo y el los hace por ti.

### 8.1 Abrir Claude

- Haz clic en el icono de Claude en la barra lateral izquierda
- O usa el atajo `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac) y escribe "Claude"

### 8.2 Como hablarle a Claude

Escribele en espanol, de forma clara, lo que necesitas. Ejemplos:

- "Cambia el color del boton de inscripcion a azul"
- "Anade un texto de bienvenida en la pagina principal"
- "Haz que la tabla de grupos se vea mejor en moviles"
- "Pon un icono de telefono al lado del campo de telefono en el formulario"

### 8.3 Cosas importantes al usar Claude

1. **Claude sabe que archivos puede tocar y cuales no**. El proyecto tiene un archivo `CLAUDE.md` que le dice sus limites. No te preocupes por eso.

2. **Revisa siempre los cambios antes de aceptarlos**. Claude te mostrara que quiere cambiar. Lee la diferencia (en verde lo nuevo, en rojo lo eliminado) y acepta o rechaza.

3. **Si algo no funciona, diselo a Claude**. Por ejemplo: "El boton que has cambiado no se ve bien, hazlo mas grande".

4. **Claude NO puede**:
   - Crear endpoints de API nuevos
   - Modificar la base de datos
   - Instalar paquetes nuevos

   Si necesitas algo de eso, habla con Daniel.

### 8.4 Flujo de trabajo recomendado

1. Abre Claude en VS Code
2. Dile que quieres hacer (en espanol)
3. Claude te propondra cambios en archivos
4. Revisa los cambios y acepta/rechaza
5. Mira el resultado en el navegador (la pagina se actualiza sola)
6. Si no te gusta, dile a Claude que lo cambie
7. Cuando estes contento, guarda tu trabajo con Git (ver siguiente seccion)

---

## Paso 9: Guardar tu trabajo con Git

Git es como un sistema de "versiones" de tu codigo. Cada vez que hagas cambios importantes, guardas una version.

### 9.1 Desde Visual Studio Code (lo mas facil)

1. Haz clic en el icono de la rama (tercer icono en la barra lateral, o `Ctrl+Shift+G`)
2. Veras los archivos que has cambiado
3. Escribe un mensaje describiendo lo que hiciste (ej: "Cambiado color del boton de inscripcion")
4. Dale al boton de check (commit)
5. Dale a "Sync Changes" para subirlo a GitHub

### 9.2 Desde el terminal (alternativa)

```bash
# Ver que archivos has cambiado
git status

# Agregar todos los cambios
git add .

# Guardar la version con un mensaje
git commit -m "Descripcion de lo que has cambiado"

# Subir los cambios a GitHub
git push
```

### 9.3 Antes de empezar a trabajar cada dia

Siempre que empieces a trabajar, baja los ultimos cambios que haya subido otra persona:

```bash
git pull
```

---

## Estructura de archivos que vas a tocar

Solo vas a trabajar en estas carpetas:

```
padel-tournament/
├── apps/
│   ├── web/src/app/           <-- Paginas de la web publica
│   │   ├── page.tsx           <-- Pagina principal (/)
│   │   └── torneo/[slug]/     <-- Paginas de cada torneo
│   │       ├── page.tsx
│   │       ├── inscripcion/
│   │       ├── estado/
│   │       ├── grupos/
│   │       ├── cuadro/
│   │       ├── partidos/
│   │       └── directo/
│   │
│   └── admin/src/app/         <-- Paginas del panel admin
│       ├── login/
│       ├── dashboard/
│       └── torneos/
│           ├── nuevo/
│           └── [id]/tabs/     <-- Las 8 pestanas de gestion
```

Cada archivo `.tsx` es una pagina o componente visual.

---

## Resolucion de problemas

### "npm install" da error
- Asegurate de tener Node.js 20 o superior (`node --version`)
- Borra la carpeta `node_modules` y vuelve a ejecutar `npm install`

### "docker compose up -d" da error
- Asegurate de que Docker Desktop esta abierto y corriendo
- Si dice que el puerto esta ocupado, cierra otros programas o reinicia Docker

### La pagina web no carga o dice "Cargando..." infinito
- Verifica que ejecutaste `npm run dev` y que sigue corriendo en el terminal
- Verifica que Docker esta corriendo: `docker compose ps` (debe mostrar los contenedores "running")
- Abre http://localhost:3001/health en el navegador. Si responde, la API funciona

### Claude no responde o da error
- Asegurate de tener la extension Claude Code instalada y configurada
- Puede que necesites iniciar sesion con tu cuenta de Anthropic

### "Permission denied" o errores de permisos
- En Mac, intenta agregar `sudo` delante del comando
- En Windows, ejecuta PowerShell como Administrador

### No puedo hacer git push
- Asegurate de que Daniel te ha dado acceso al repositorio
- Ejecuta `gh auth login` para autenticarte

---

## Resumen rapido (cheatsheet)

```bash
# Arrancar todo (hacer esto cada vez que empieces a trabajar)
docker compose up -d        # Levantar base de datos
npm run dev                  # Arrancar las apps

# Ver el proyecto
# http://localhost:3003      Web publica
# http://localhost:3002      Panel admin (admin@padel.local / admin123)

# Guardar cambios
git add .
git commit -m "Descripcion del cambio"
git push

# Actualizar el codigo (bajar cambios de otros)
git pull

# Parar todo
Ctrl+C                      # Parar npm run dev
docker compose down          # Parar Docker
```
