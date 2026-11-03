/** La URL del backend solo se lee aquí. Sin barra final, para poder concatenar las rutas. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || null;
