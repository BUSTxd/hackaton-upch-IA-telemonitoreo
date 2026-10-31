import { useMemo } from 'react';
import Mascota, { type OrdenMascota } from '@/components/mascota/Mascota';
import { VOZ } from './contenido';
import { CAMPOS, fichaLista, type Ficha } from './ficha';

export default function PanelVoz({ ficha, dictando, transcripcion, orden, alDictar, alDetener }: {
  ficha: Ficha;
  dictando: boolean;
  transcripcion: string;
  orden: OrdenMascota;
  alDictar: () => void;
  alDetener: () => void;
}) {
  // Cada palabra re-renderiza el panel: la mascota, solo cuando cambia lo que se le pide.
  const mascota = useMemo(
    () => <Mascota pausado={false} cls="block h-full w-full" detalle={1} ratos orden={orden} hablando={dictando} />,
    [orden, dictando],
  );

  const porRevisar = CAMPOS.filter(({ id }) => ficha[id].estado === 'revisar').length;
  const estado = dictando ? VOZ.estado.escuchando
    : !transcripcion ? VOZ.estado.inicio
    : porRevisar ? VOZ.estado.revisar(porRevisar)
    : fichaLista(ficha) ? VOZ.estado.listo
    : VOZ.estado.faltan;

  return (
    // Hasta lg es una barra compacta fija arriba, para ver la ficha llenarse mientras se dicta.
    <section className="sticky top-0 z-10 flex flex-col gap-2 rounded-2xl border border-linea bg-white p-3 shadow-md lg:static lg:gap-0 lg:p-6 lg:shadow-none">
      <div className="flex items-center gap-3 lg:flex-col lg:gap-0">
        <div className="size-14 shrink-0 [--dot-cuerpo:#fff] drop-shadow-[0_6px_10px_rgb(15_31_61/0.18)] lg:size-40">{mascota}</div>
        <p role="status" className="min-w-0 flex-1 text-sm font-medium text-tinta lg:mt-4 lg:flex-none lg:text-center lg:text-lg">{estado}</p>
        <button
          type="button"
          onClick={dictando ? alDetener : alDictar}
          aria-pressed={dictando}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento lg:mt-5 lg:gap-2 lg:px-8 lg:py-3.5 lg:text-lg ${dictando ? 'bg-prioridad-alta' : 'bg-acento hover:bg-tinta'}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
          {dictando ? VOZ.detener : transcripcion ? (
            <>
              <span className="lg:hidden">{VOZ.repetirCorto}</span>
              <span className="hidden lg:inline">{VOZ.repetir}</span>
            </>
          ) : VOZ.dictar}
        </button>
      </div>
      <div className="lg:mt-6 lg:w-full">
        <h2 className="sr-only lg:not-sr-only lg:text-sm lg:font-semibold lg:text-suave">{VOZ.transcripcion}</h2>
        {/* En la barra caben dos líneas: alineado abajo, lo último que se dijo es lo que queda a la vista. */}
        <p className="flex h-12 flex-col justify-end overflow-hidden rounded-xl bg-fondo px-3 py-1.5 text-sm leading-snug text-tinta lg:mt-2 lg:block lg:h-auto lg:min-h-28 lg:p-4 lg:text-base lg:leading-relaxed">
          {transcripcion ? <span>{transcripcion}</span> : <span className="text-suave">{VOZ.vacio}</span>}
        </p>
      </div>
    </section>
  );
}
