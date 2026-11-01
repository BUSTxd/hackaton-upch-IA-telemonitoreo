import type { Metadata } from 'next';
import { ASISTENTE } from '@/config/marca';
import EspacioRegistro from '@/features/registro/EspacioRegistro';

export const metadata: Metadata = { title: `Registro · ${ASISTENTE}` };

export default function Page() {
  return <EspacioRegistro />;
}
