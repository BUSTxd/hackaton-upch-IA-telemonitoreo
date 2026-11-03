'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listarFamilias, type EntradaFamilia } from './acciones';
import { comprobarSalud, type MotivoFallo } from './api/cliente';
import { HISTORIAL, SERVIDOR } from './contenido';
import ListaFamilias from './ListaFamilias';
import { Aviso, BOTON_PRIMARIO, ENLACE, Marco } from './ui';

type Salud = 'comprobando' | 'ok' | Exclude<MotivoFallo, 'sin_contrato' | 'local'>;

/** Paso 4: los registros de este dispositivo. El backend no tiene `GET /records`, así que no hay otra lista. */
export default function Historial() {
  const [familias, setFamilias] = useState<EntradaFamilia[] | null>(null);
  const [errorLocal, setErrorLocal] = useState(false);
  const [salud, setSalud] = useState<Salud>('comprobando');

  useEffect(() => {
    listarFamilias().then(setFamilias, () => { setErrorLocal(true); setFamilias([]); });
  }, []);

  useEffect(() => {
    const comprobar = () => comprobarSalud().then((r) => setSalud(r.ok ? 'ok' : (r.motivo as Salud)));
    comprobar();
    window.addEventListener('online', comprobar);
    window.addEventListener('offline', comprobar);
    return () => {
      window.removeEventListener('online', comprobar);
      window.removeEventListener('offline', comprobar);
    };
  }, []);

  return (
    <Marco titulo={HISTORIAL.titulo}>
      <p role="status" className="flex items-center gap-2 text-sm text-tinta">
        <span
          className={`size-2.5 rounded-full ${salud === 'ok' ? 'bg-prioridad-baja' : salud === 'comprobando' ? 'bg-linea' : 'bg-prioridad-alta'}`}
          aria-hidden="true"
        />
        {SERVIDOR[salud]}
      </p>
      <p className="text-sm text-suave">{HISTORIAL.soloDispositivo}</p>
      {errorLocal && <Aviso tono="error">{HISTORIAL.errorLocal}</Aviso>}

      {familias === null ? (
        <p className="text-suave">{HISTORIAL.cargando}</p>
      ) : familias.length ? (
        <ListaFamilias familias={familias} />
      ) : (
        !errorLocal && <p className="rounded-2xl border border-dashed border-linea bg-white p-6 text-center text-suave">{HISTORIAL.vacio}</p>
      )}

      {process.env.NODE_ENV === 'development' && (
        <Link href="/registro/nueva?ejemplo=1" className={`self-center text-sm ${ENLACE}`}>{HISTORIAL.ejemplo}</Link>
      )}

      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-linea bg-white/95 p-4 backdrop-blur">
        <Link href="/registro/nueva" className={`${BOTON_PRIMARIO} w-full`}>+ {HISTORIAL.nueva}</Link>
      </div>
    </Marco>
  );
}
