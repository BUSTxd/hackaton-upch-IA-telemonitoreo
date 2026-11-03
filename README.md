# Hackatón UPCH · Asistente para la recopilación de datos en campo

Aplicación móvil para trabajadores de salud que hacen entrevistas familiares en campo:
graban la entrevista, la IA la transcribe y ordena los datos en una ficha familiar, y la
persona los revisa, corrige y confirma.

> ⚠️ **No diagnostica** ni hace telemonitoreo clínico: solo ayuda a recopilar, ordenar y validar
> datos. La confirmación final siempre es de una persona. Usar solo **datos ficticios** (Ley 29733).

## Flujo

```
Entrevista (grabar o cargar audio)
   ▼  POST /audio/process  → transcripción + datos extraídos (pending_review, NO se guarda)
Revisión humana de la ficha (A. identificación · B. hogar · C. integrantes · D. visitas)
   ▼  POST /records  o  PUT /records/{record_id}  → solo al confirmar
Historial de fichas y nuevas visitas
```

## Estructura

| Carpeta      | Qué contiene                                              |
|--------------|-----------------------------------------------------------|
| `apps/web`   | Frontend Next.js, mobile-first. Detalle en su README      |
| `apps/agent` | Estructura del agente de voz del alcance anterior         |
| `rules/`     | Estructura para reglas (del alcance anterior)             |
| `supabase/`  | Estructura para esquema y migraciones                     |

El backend FastAPI (`/health`, `/records`, `/audio/*`) **no está en este repo**. Hasta tener
su contrato, el frontend no se conecta a `/records` ni a `/audio/*` (ver `apps/web/README.md`).

## Desarrollo local

1. Crear `apps/web/.env.local` con `NEXT_PUBLIC_API_URL` (plantilla en `.env.example`).
2. Frontend: `cd apps/web && npm install && npm run dev` → http://localhost:3000

## Flujo de trabajo en equipo

1. `git pull` antes de empezar.
2. Crear una rama: `git checkout -b nombre/feature` (ej. `fernando/dashboard`).
3. Commits pequeños → `git push -u origin nombre/feature`.
4. Abrir un Pull Request en GitHub hacia `main`; otro integrante lo revisa.
