import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ASISTENTE } from '@/config/marca';
import AsistenteEntrevista from '@/features/registro/AsistenteEntrevista';

export const metadata: Metadata = { title: `Nueva entrevista · ${ASISTENTE}` };

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({ searchParams }: PageProps<'/registro/nueva'>) {
  const params = await searchParams;
  // El ejemplo ficticio solo existe al desarrollar.
  if (uno(params.ejemplo) && process.env.NODE_ENV === 'development') return <AsistenteEntrevista key="ejemplo" id="ejemplo" ejemplo />;
  const ficha = uno(params.ficha);
  // El id va en la URL desde el principio: al recargar se recupera el mismo borrador.
  if (!ficha) redirect(`/registro/nueva?ficha=${crypto.randomUUID()}`);
  return <AsistenteEntrevista key={ficha} id={ficha} />;
}
