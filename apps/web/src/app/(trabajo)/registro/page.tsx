import type { Metadata } from 'next';
import { ASISTENTE } from '@/config/marca';
import Historial from '@/features/registro/Historial';

export const metadata: Metadata = { title: `Registros · ${ASISTENTE}` };

export default function Page() {
  return <Historial />;
}
