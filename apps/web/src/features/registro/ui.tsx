'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ASISTENTE } from '@/config/marca';
import { CONTRATO_DISPONIBLE } from './api/contrato';
import { AVISO_CONEXION, BARRA } from './contenido';
import { ESTADOS, type EstadoFicha } from './estados';

/** Piezas compartidas por las pantallas de trabajo. Botones de al menos 48 px de alto, pensados para el pulgar. */

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento';
export const BOTON = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed ${FOCO}`;
export const BOTON_PRIMARIO = `${BOTON} bg-acento text-white hover:bg-tinta disabled:bg-linea disabled:text-suave`;
export const BOTON_SECUNDARIO = `${BOTON} border border-linea bg-white text-tinta hover:border-acento disabled:text-suave`;
export const BOTON_PELIGRO = `${BOTON} bg-prioridad-alta text-white hover:bg-tinta`;
export const ENLACE = `cursor-pointer font-medium text-acento underline-offset-2 hover:underline ${FOCO}`;
export const TARJETA = 'rounded-2xl border border-linea bg-white p-4 sm:p-5';

/** La pantalla de trabajo: barra arriba, aviso de conexión y una columna centrada. */
export function Marco({ titulo, volver, children }: { titulo: string; volver?: { href: string; texto: string }; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-linea bg-white px-4 py-3">
        <div className="min-w-0">
          {volver ? (
            <Link href={volver.href} className={`text-sm ${ENLACE}`}>← {volver.texto}</Link>
          ) : (
            <p className="text-sm font-semibold text-acento">{ASISTENTE}</p>
          )}
          <h1 className="truncate text-lg font-semibold text-tinta">{titulo}</h1>
        </div>
        <Link href="/ingresar" className={`shrink-0 text-sm ${ENLACE}`}>{BARRA.salir}</Link>
      </header>
      {!CONTRATO_DISPONIBLE && (
        <p className="border-b border-linea bg-prioridad-media/15 px-4 py-2 text-sm text-tinta">{AVISO_CONEXION}</p>
      )}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">{children}</main>
    </div>
  );
}

export function EstadoChip({ estado }: { estado: EstadoFicha }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-fondo px-2.5 py-1 text-xs font-semibold text-tinta">
      <span className={`size-2 rounded-full ${ESTADOS[estado].punto}`} aria-hidden="true" />
      {ESTADOS[estado].etiqueta}
    </span>
  );
}

/** Acción que borra algo: pide un segundo toque en vez de un diálogo del navegador. */
export function AccionDoble({ texto, seguro, cancelar, alConfirmar, className }: {
  texto: string;
  seguro: string;
  cancelar: string;
  alConfirmar: () => void;
  className?: string;
}) {
  const [preguntando, setPreguntando] = useState(false);
  if (!preguntando) {
    return <button type="button" onClick={() => setPreguntando(true)} className={className ?? BOTON_SECUNDARIO}>{texto}</button>;
  }
  return (
    <span className="flex flex-wrap gap-2">
      <button type="button" onClick={() => { setPreguntando(false); alConfirmar(); }} className={BOTON_PELIGRO}>{seguro}</button>
      <button type="button" onClick={() => setPreguntando(false)} className={BOTON_SECUNDARIO}>{cancelar}</button>
    </span>
  );
}

/** Un aviso con su tono: error, atención o información. */
export function Aviso({ tono = 'info', children }: { tono?: 'error' | 'atencion' | 'info'; children: ReactNode }) {
  const color = { error: 'border-prioridad-alta bg-prioridad-alta/5', atencion: 'border-prioridad-media bg-prioridad-media/10', info: 'border-linea bg-fondo' }[tono];
  return <div role={tono === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3 py-2.5 text-sm text-tinta ${color}`}>{children}</div>;
}
