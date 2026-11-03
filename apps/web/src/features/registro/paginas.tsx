'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import AsistenteEntrevista from './AsistenteEntrevista';
import { GUARDADO } from './contenido';
import DetalleFicha from './DetalleFicha';
import { nuevoId } from './ficha';

/**
 * El sitio es estático (GitHub Pages): no hay servidor que lea la URL, así que los ids van en
 * la query y se leen aquí, en el navegador. `useSearchParams` necesita su `Suspense`.
 */

const Cargando = () => <p className="p-4 text-suave">{GUARDADO.cargando}</p>;

function Nueva() {
  const params = useSearchParams();
  const router = useRouter();
  const ficha = params.get('ficha');
  // El ejemplo ficticio solo existe al desarrollar.
  const ejemplo = process.env.NODE_ENV === 'development' && params.has('ejemplo');

  // El id va en la URL desde el principio: al recargar se recupera el mismo borrador.
  useEffect(() => {
    if (!ficha && !ejemplo) router.replace(`/registro/nueva?ficha=${encodeURIComponent(nuevoId())}`);
  }, [ficha, ejemplo, router]);

  if (ejemplo) return <AsistenteEntrevista key="ejemplo" id="ejemplo" ejemplo />;
  return ficha ? <AsistenteEntrevista key={ficha} id={ficha} /> : <Cargando />;
}

function Ficha() {
  const id = useSearchParams().get('id');
  return id ? <DetalleFicha key={id} id={id} /> : <DetalleFicha id="" />;
}

export function PaginaNueva() {
  return <Suspense fallback={<Cargando />}><Nueva /></Suspense>;
}

export function PaginaFicha() {
  return <Suspense fallback={<Cargando />}><Ficha /></Suspense>;
}
