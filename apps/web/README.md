# apps/web — Frontend (Next.js)

App mobile-first para registrar fichas familiares en campo: entrevista → transcripción →
extracción → revisión humana → guardado. Más la landing (`/`) y el ingreso (`/ingresar`, que
aún no valida nada).

```
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Para probar el micrófono desde un celular en la misma red hace falta HTTPS
(`npx next dev --experimental-https`): por `http://192.168.x.x` el navegador no da el micrófono.
Mientras tanto se puede cargar un archivo de audio.

## Publicación (GitHub Pages)

https://bustxd.github.io/hackaton-upch-IA-telemonitoreo/

Se publica sola con cada push a `main` (`.github/workflows/pages.yml`). Es un sitio estático
(`output: "export"`): sin servidor, por eso los ids van en la query (`/registro/ficha?id=…`).
La URL del backend se toma de la variable del repo `NEXT_PUBLIC_API_URL`
(Settings → Secrets and variables → Actions → Variables) al compilar. Al ser HTTPS, el
micrófono funciona desde el celular.

## Configuración

`apps/web/.env.local` (no se sube):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Estado de la conexión con el backend

**Contrato pendiente.** No se conocen los JSON reales de `/records` ni de `/audio/process`, así
que no se inventó ninguno. Todo lo que depende de ellos vive en un solo archivo:
`src/features/registro/api/contrato.ts`. Mientras `CONTRATO_DISPONIBLE` sea `false`:

| Endpoint | Estado |
|---|---|
| `GET /health` | Conectado: solo mira si responde OK (chip en `/registro`) |
| `POST /audio/process` | Sin conectar: no se envía; el Paso 2 muestra «Sin conectar» |
| `POST /records`, `PUT /records/{id}` | Sin conectar: confirmar no envía nada; la ficha queda como borrador |
| `GET /records/{id}` | Sin conectar |
| `POST /audio/upload`, `POST /audio/transcribe` | No se usan: `/audio/process` ya hace ambas cosas |

Para conectar: leer el `/openapi.json` del backend, completar los mapeos de `contrato.ts` y
poner `CONTRATO_DISPONIBLE = true`. Ninguna pantalla cambia. El backend debe permitir CORS
desde el origen del frontend.

## Estados de una ficha

- **Borrador**: solo en este dispositivo, escrita por una persona.
- **Pendiente de revisión**: lleva datos extraídos por IA que nadie confirmó.
- **Confirmado**: solo tras una respuesta correcta del servidor a `POST`/`PUT /records`.

Los borradores (con su audio) se guardan en IndexedDB, para no perderlos si se corta la
conexión o se recarga. **No hay modo offline completo**: la app necesita cargar, y procesar o
guardar en el servidor requiere conexión. Los borradores no están cifrados: solo datos ficticios.

El backend no tiene `GET /records`, así que el historial muestra solo lo guardado desde este
dispositivo (borradores e índice de `record_id`).

## Dónde está cada cosa

```
src/
├── app/                        Solo rutas
│   ├── (marketing)/            /
│   ├── (acceso)/               /ingresar
│   └── (trabajo)/registro/     /registro (historial), /registro/nueva, /registro/ficha?id=
├── components/mascota/         El personaje, compartido
├── features/
│   ├── landing/                Antesala, secciones y sus textos
│   ├── acceso/                 Formulario de ingreso
│   └── registro/
│       ├── api/                config.ts (URL), cliente.ts (fetch), contrato.ts (por completar)
│       ├── ficha.ts            Estructura de la ficha familiar y cómo combinar datos extraídos
│       ├── reglas.ts           Validación determinista (fechas, edad, teléfono, correo)
│       ├── estados.ts          Borrador / pendiente de revisión / confirmado
│       ├── almacen.ts          IndexedDB: borradores e índice
│       ├── useBorrador.ts      Guardado automático en el dispositivo
│       ├── useGrabadora.ts     Grabación con MediaRecorder
│       ├── ejemplo.ts          Extracción ficticia, solo en desarrollo (`/registro/nueva?ejemplo=1`)
│       └── *.tsx               Pantallas y piezas
└── config/marca.ts             El nombre del asistente (provisional)
```

- **Cambiar un texto**: `features/<pantalla>/contenido.ts`.
- **Cambiar los campos de la ficha**: `features/registro/ficha.ts`.
