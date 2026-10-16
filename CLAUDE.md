# CLAUDE.md

## Sobre el usuario (léelo primero)

- **Recién empieza a trabajar con ramas y en proyectos compartidos con git.** Explica cada comando de git antes de ejecutarlo, en español y sin jerga innecesaria.
- Se encarga del **frontend** y de la **arquitectura básica del agente**.
- Necesita **localhost** con recarga rápida para iterar los cambios.
- Responder siempre en español.

## Proyecto

Hackatón UPCH: **IA agéntica de voz que hace el telemonitoreo** de pacientes en nombre del médico y **los ordena por prioridad** clínica.

**Principio clave: el LLM conversa y extrae datos; el motor de reglas decide la prioridad.**
- LLM: conversa con el paciente, extrae los datos estructurados (signos vitales, síntomas) mediante tool calls y redacta el resumen para el médico.
- Motor de reglas (`rules/`, JSON): asigna la prioridad 🔴 / 🟡 / 🟢 + motivo. Es determinista y auditable.
- El médico siempre toma la decisión final. Es apoyo al triaje, **no** diagnóstico.

## Arquitectura

```
Paciente ─voz WebRTC─▶ apps/agent (Python · LiveKit Agents)
                        STT Deepgram → LLM Claude (Haiku 5.5, baja latencia) → TTS Cartesia/ElevenLabs
                        tools: registrar_signos, registrar_sintomas, finalizar_llamada
                        ▼
                     rules/ → prioridad + motivo
                        ▼
                     Supabase (Postgres + Realtime)
                        ▼
                     apps/web (Next.js + TypeScript + Tailwind)
                        /llamada → animación de la IA (escuchando / pensando / hablando)
                        /medico  → cola por prioridad, transcripción, resumen
```

- Animación de la IA: orbe que reacciona al audio (canvas/WebGL) como primera opción; un personaje en Rive si sobra tiempo. Evitar el avatar 3D.
- Alternativa más rápida si LiveKit se complica: Vapi o Retell.

## Estructura y desarrollo local

| Carpeta | Contenido | Comando de desarrollo |
|---|---|---|
| `apps/web` | Frontend Next.js | `npm run dev` → http://localhost:3000 |
| `apps/agent` | Agente de voz Python | `python agent.py dev` |
| `rules/` | Umbrales clínicos JSON | — |
| `supabase/` | Esquema y migraciones | — |

- Estado actual: solo la estructura (README en cada carpeta). Aún no hay código.
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
- En un repo personal solo el dueño puede invitar. Para que otros también puedan invitar, hay que mover el repo a una Organización de GitHub y darles el rol Admin.
