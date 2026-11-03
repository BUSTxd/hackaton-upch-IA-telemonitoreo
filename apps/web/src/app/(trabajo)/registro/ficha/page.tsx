import type { Metadata } from 'next';
import { ASISTENTE } from '@/config/marca';
import { PaginaFicha } from '@/features/registro/paginas';

export const metadata: Metadata = { title: `Ficha familiar · ${ASISTENTE}` };

/** `/registro/ficha?id=…`: en un sitio estático no puede haber `/registro/[id]` con ids desconocidos. */
export default function Page() {
  return <PaginaFicha />;
}
