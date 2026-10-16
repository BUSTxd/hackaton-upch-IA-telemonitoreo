# Hackatón UPCH · IA de telemonitoreo por voz

Agente de voz con IA que realiza el telemonitoreo de pacientes en nombre del médico
y ordena los casos por prioridad clínica.

> ⚠️ Herramienta de **apoyo al triaje**, no de diagnóstico. Usar solo **datos ficticios**.

## Arquitectura

```
PACIENTE ──voz (WebRTC)──▶ AGENTE DE VOZ (apps/agent)
                            STT → LLM → TTS
                            │ tool calls (signos, síntomas)
                            ▼
                         MOTOR DE REGLAS (rules/) → prioridad 🔴🟡🟢 + motivo
                            ▼
                         SUPABASE (Postgres + Realtime)
                            ▼
                         FRONTEND (apps/web)
                           • /llamada → animación de la IA hablando
                           • /medico  → cola por prioridad, transcripción, resumen
```

- **El LLM conversa y extrae datos; las reglas deciden la prioridad** (auditable).
- El médico siempre toma la decisión final.

## Estructura

| Carpeta        | Qué contiene                                   |
|----------------|------------------------------------------------|
| `apps/web`     | Frontend Next.js (dashboard médico + llamada)  |
| `apps/agent`   | Agente de voz en Python (LiveKit Agents)       |
| `rules/`       | Umbrales clínicos en JSON                      |
| `supabase/`    | Esquema y migraciones de la base de datos      |

## Desarrollo local

1. Copiar `.env.example` a `.env.local` y rellenar las claves (pedirlas al equipo, nunca por el repo).
2. Frontend: `cd apps/web && npm install && npm run dev` → http://localhost:3000
3. Agente: `cd apps/agent && python agent.py dev`

## Flujo de trabajo en equipo

1. `git pull` antes de empezar.
2. Crear una rama: `git checkout -b nombre/feature` (ej. `fernando/dashboard`).
3. Commits pequeños → `git push -u origin nombre/feature`.
4. Abrir un Pull Request en GitHub hacia `main`; otro integrante lo revisa.
