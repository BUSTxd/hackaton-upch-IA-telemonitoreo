import type { Metadata } from 'next';
import { ASISTENTE } from '@/config/marca';
import DetalleFicha from '@/features/registro/DetalleFicha';

export const metadata: Metadata = { title: `Ficha familiar · ${ASISTENTE}` };

export default async function Page({ params }: PageProps<'/registro/[id]'>) {
  const { id } = await params;
  return <DetalleFicha key={id} id={decodeURIComponent(id)} />;
}
