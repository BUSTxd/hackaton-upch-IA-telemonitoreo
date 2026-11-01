# apps/web — Frontend (Next.js)

Hoy tiene la landing con su antesala, el ingreso (`/ingresar`) y la pantalla de dictado (`/registro`). Sin APIs ni base de datos: el ingreso no valida nada, y la voz y la IA están simuladas con un guion (`features/registro/demo.ts`). La validación y la prioridad (`features/registro/reglas.ts`) sí se calculan, con umbrales de ejemplo sin validar clínicamente.

```
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Dónde está cada cosa

```
src/
├── app/                  Solo rutas y archivos especiales de Next
│   ├── (marketing)/      La ruta "/" (los grupos no salen en la URL)
│   ├── (acceso)/         /ingresar
│   └── (trabajo)/        /registro
├── components/mascota/   El personaje, compartido entre pantallas
├── features/
│   ├── landing/          Antesala, secciones y sus textos
│   ├── acceso/           Formulario de ingreso y sus textos
│   └── registro/         Dictado, ficha, validación y prioridad
└── config/marca.ts       El nombre del asistente (provisional)
```

- **Cambiar el nombre del asistente**: solo en `src/config/marca.ts`.
- **Cambiar un texto**: en `src/features/landing/contenido.ts`.
- **Pantalla nueva**: la ruta en `src/app/` y su código en `src/features/<pantalla>/`.

## Pantallas previstas

- `/llamada` — interfaz de voz con animación de la IA (escuchando / pensando / hablando). `Mascota` ya trae lo necesario: las órdenes `pensar` y `listo`, y la prop `hablando`.
- `/medico` — cola de pacientes ordenada por prioridad, transcripción y resumen.
