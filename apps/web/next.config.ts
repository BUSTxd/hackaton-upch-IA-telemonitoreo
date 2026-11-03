import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio estático (carpeta `out/`) para GitHub Pages: sin servidor, todo se resuelve en el navegador.
  output: "export",
  // Pages sirve cada ruta como carpeta con su index.html.
  trailingSlash: true,
  // En Pages la web vive en /<repo>; la Action lo define. En local queda en la raíz.
  basePath: process.env.PAGES_BASE_PATH || undefined,
  turbopack: {
    rules: {
      // Solo la hoja de Tailwind: con "*.css", los CSS modules perdían sus clases (salían `undefined`).
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
