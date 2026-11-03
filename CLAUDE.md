# CLAUDE.md

## Sobre el usuario (léelo primero)

- **Recién empieza a trabajar con ramas y en proyectos compartidos con git.** Explica cada comando de git antes de ejecutarlo, en español y sin jerga innecesaria.
- Se encarga del **frontend** y de la **arquitectura básica del agente**.
- Necesita **localhost** con recarga rápida para iterar los cambios.
- Responder siempre en español.

## Proyecto

Hackatón UPCH: **asistente para la recopilación de datos familiares en campo**. El trabajador de salud graba la entrevista, la IA la transcribe y ordena los datos en una ficha familiar, y la persona revisa, corrige y confirma. (Desde el 2026-11-02 reemplaza al alcance anterior de telemonitoreo por voz y prioridad clínica.)

**Principio clave: la IA solo recopila y ordena; no diagnostica ni prioriza.** Lo no mencionado queda vacío, lo extraído por IA nunca se presenta como confirmado, y confirmar siempre es de una persona.

## Arquitectura

```
apps/web (Next.js, mobile-first)
  /registro/nueva → grabar o cargar audio
     ▼ POST /audio/process (FastAPI) → transcripción + datos, pending_review, NO guarda
  revisión humana de la ficha (A–D)
     ▼ POST /records | PUT /records/{record_id} → solo al confirmar
  /registro → historial (solo este dispositivo: no hay GET /records)
```

- El backend FastAPI **no está en este repo** y su contrato JSON aún no se conoce. Todo lo que depende de él está en `apps/web/src/features/registro/api/contrato.ts` (`CONTRATO_DISPONIBLE = false`). Ver la tabla de endpoints en `apps/web/README.md`.
- La cara de la IA es el personaje de MedGO: SVG animado con código, sin dependencias (`apps/web/src/components/mascota/Mascota.tsx`).

## Estructura y desarrollo local

| Carpeta | Contenido | Comando de desarrollo |
|---|---|---|
| `apps/web` | Frontend Next.js | `npm run dev` → http://localhost:3000 |
| `apps/agent` | Estructura del alcance anterior | — |
| `rules/` | Estructura del alcance anterior | — |
| `supabase/` | Esquema y migraciones | — |

- Estado actual: `apps/web` tiene la landing, `/ingresar` (sin validar nada) y el flujo de ficha familiar (`/registro`, `/registro/nueva`, `/registro/[id]`). Los borradores se guardan en IndexedDB. Solo `GET /health` está conectado; `/records` y `/audio/process` esperan el contrato.
- La URL del backend va en `apps/web/.env.local` como `NEXT_PUBLIC_API_URL`.
- En `apps/web/src`: `app/` solo para rutas, `components/` para lo compartido y `features/<pantalla>/` para el código de cada pantalla. Detalle en `apps/web/README.md`.
- El nombre del asistente es provisional y vive en `apps/web/src/config/marca.ts`.
- Ubicación: `C:\dev\hackaton-upch-IA-telemonitoreo`. **No mover a OneDrive**, porque corrompe `.git` y hace lento `node_modules`.
- Las claves van en `.env.local` (plantilla en `.env.example`) y **nunca se suben**. Si se sube una por error, hay que rotarla.
- Solo **datos ficticios** de pacientes (Ley 29733, Perú).

## Flujo de trabajo con git (explicarlo cada vez que se use)

- Repo **privado**: https://github.com/BUSTxd/hackaton-upch-IA-telemonitoreo (dueño: BUSTxd).
- **Nadie trabaja directo en `main`.** Ciclo de cada tarea:
  1. `git checkout main` + `git pull`
  2. `git checkout -b nombre/tarea` (ej. `fernando/dashboard-medico`)
  3. Commits pequeños: `git add .` + `git commit -m "..."`
  4. `git push -u origin nombre/tarea`
  5. Pull Request en GitHub hacia `main`; lo revisa otro integrante.
  6. Merge, y de vuelta al paso 1.
- Antes de abrir un PR, traer los cambios de `main`: `git checkout main && git pull && git checkout <rama> && git merge main`.
- Para evitar conflictos, el trabajo se reparte por carpetas (web / agent / rules).
- Antes de hacer commit, revisar `git status` para que no se cuele `.env.local` ni `node_modules`.

### Para Claude
- Antes de hacer cambios, confirmar en qué rama se está (`git branch`). Si es `main`, proponer crear una rama.
- No hacer `push`, `merge` ni abrir PRs sin pedírselo al usuario.
- Si aparece un conflicto, explicarle qué pasó y qué opciones tiene antes de resolverlo.

## Equipo

- **BUSTxd**: dueño del repo; frontend y arquitectura del agente.
- **Jennycbrpl** (Jenny Cabrera Palomino): colaboradora con permiso de escritura.
- **mikepimez**: colaborador (se unió el 2026-11-01).
- En un repo personal solo el dueño puede invitar. Para que otros también puedan invitar, hay que mover el repo a una Organización de GitHub y darles el rol Admin.
