import type { Metadata } from 'next';
import { ASISTENTE } from '@/config/marca';
import { PaginaNueva } from '@/features/registro/paginas';

export const metadata: Metadata = { title: `Nueva entrevista · ${ASISTENTE}` };

export default function Page() {
  return <PaginaNueva />;
}
