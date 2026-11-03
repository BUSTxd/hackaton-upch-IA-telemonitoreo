import { useMemo } from 'react';
import Mascota, { type OrdenMascota } from '@/components/mascota/Mascota';
import type { MotivoFallo } from './api/cliente';
import { ENTREVISTA, FALLOS, PROCESO } from './contenido';
import { Aviso, BOTON_PRIMARIO, BOTON_SECUNDARIO, TARJETA } from './ui';

export type Proceso =
  | { fase: 'enviando' }
  | { fase: 'listo'; transcripcion?: string }
  | { fase: 'fallo'; motivo: MotivoFallo; detalle?: string };

/**
 * Paso 2. `/audio/process` transcribe y extrae en una sola petición: mientras dura, ambas
 * etapas se muestran en curso. No se inventa un avance por etapas que no se puede medir.
 */
export default function PasoProcesamiento({ proceso, orden, alRevisar, alReintentar, alVolver, alManual }: {
  proceso: Proceso;
  orden: OrdenMascota;
  alRevisar: () => void;
  alReintentar: () => void;
  alVolver: () => void;
  alManual: () => void;
}) {
  const mascota = useMemo(() => <Mascota pausado={false} cls="block h-full w-full" detalle={1} ratos orden={orden} />, [orden]);
  const etapa = proceso.fase === 'enviando' ? PROCESO.estados.curso
    : proceso.fase === 'listo' ? PROCESO.estados.listo
    : proceso.motivo === 'sin_contrato' ? PROCESO.estados.sin_conectar
    : PROCESO.estados.fallo;
  const color = proceso.fase === 'listo' ? 'bg-prioridad-baja' : proceso.fase === 'fallo' ? 'bg-prioridad-alta' : 'bg-prioridad-media animate-pulse';

  return (
    <>
      <section aria-labelledby="titulo-proceso" className={`${TARJETA} flex flex-col gap-4`}>
        <div className="flex items-center gap-3">
          <div className="size-16 shrink-0 [--dot-cuerpo:#fff] drop-shadow-[0_6px_10px_rgb(15_31_61/0.18)]">{mascota}</div>
          <h2 id="titulo-proceso" className="text-lg font-semibold text-tinta">{PROCESO.titulo}</h2>
        </div>
        <ul className="divide-y divide-linea rounded-xl border border-linea" aria-live="polite">
          {[PROCESO.transcripcion, PROCESO.extraccion].map((nombre) => (
            <li key={nombre} className="flex items-center justify-between gap-3 px-3 py-3">
              <span className="font-medium text-tinta">{nombre}</span>
              <span className="flex items-center gap-2 text-sm text-tinta">
                <span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />{etapa}
              </span>
            </li>
          ))}
        </ul>
        {proceso.fase === 'enviando' && <p className="text-sm text-suave">{PROCESO.enCurso}</p>}
        {proceso.fase === 'fallo' && (
          <Aviso tono={proceso.motivo === 'sin_contrato' ? 'atencion' : 'error'}>
            <p>{FALLOS[proceso.motivo]}{proceso.detalle ? ` (${proceso.detalle})` : ''}</p>
            <p className="mt-1">{PROCESO.conservado}</p>
          </Aviso>
        )}
        {proceso.fase === 'listo' && (
          <div>
            <h3 className="text-sm font-semibold text-suave">{PROCESO.transcripcionObtenida}</h3>
            <p className="mt-1 max-h-72 overflow-y-auto rounded-xl bg-fondo p-3 leading-relaxed whitespace-pre-wrap text-tinta">
              {proceso.transcripcion || <span className="text-suave">{PROCESO.sinTranscripcion}</span>}
            </p>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t border-linea bg-white/95 p-4 backdrop-blur">
        {proceso.fase === 'listo' && <button type="button" onClick={alRevisar} className={`${BOTON_PRIMARIO} w-full`}>{PROCESO.revisar}</button>}
        {proceso.fase === 'fallo' && (
          <>
            {proceso.motivo !== 'sin_contrato' && <button type="button" onClick={alReintentar} className={`${BOTON_PRIMARIO} w-full`}>{PROCESO.reintentar}</button>}
            <button type="button" onClick={alManual} className={`${proceso.motivo === 'sin_contrato' ? BOTON_PRIMARIO : BOTON_SECUNDARIO} w-full`}>{ENTREVISTA.manual}</button>
            <button type="button" onClick={alVolver} className={`${BOTON_SECUNDARIO} w-full`}>{PROCESO.volver}</button>
          </>
        )}
      </div>
    </>
  );
}
