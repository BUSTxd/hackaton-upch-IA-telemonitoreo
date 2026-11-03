import { useEffect, useMemo, useRef, useState } from 'react';
import Mascota, { type OrdenMascota } from '@/components/mascota/Mascota';
import type { EntradaFamilia } from './acciones';
import type { Borrador } from './almacen';
import { ENTREVISTA, FICHA, HISTORIAL } from './contenido';
import { editarCampo } from './ficha';
import { useGrabadora } from './useGrabadora';
import { AccionDoble, Aviso, BOTON_PRIMARIO, BOTON_SECUNDARIO, TARJETA } from './ui';

const reloj = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Paso 1: a qué familia corresponde y el audio de la entrevista, grabado o cargado. */
export default function PasoEntrevista({ borrador, familias, orden, alCambiar, alElegirFamilia, alProcesar, alManual }: {
  borrador: Borrador;
  familias: EntradaFamilia[];
  orden: OrdenMascota;
  alCambiar: (cambio: (b: Borrador) => Borrador) => void;
  alElegirFamilia: (id: string) => void;
  alProcesar: () => void;
  alManual: () => void;
}) {
  const [errorArchivo, setErrorArchivo] = useState(false);
  const grabadora = useGrabadora((audio, nombre) => alCambiar((b) => ({ ...b, audio, audioNombre: nombre })));
  const grabando = grabadora.estado === 'grabando';
  const tieneAudio = !!borrador.audio;
  // Una ficha ya empezada (o del servidor) es esa familia: no tiene sentido cambiarla aquí.
  const esNueva = !borrador.recordId && !borrador.ficha.integrantes.length && !borrador.ficha.visitas.length;

  // El reloj re-renderiza cada medio segundo: la mascota, solo cuando cambia lo que se le pide.
  const mascota = useMemo(
    () => <Mascota pausado={false} cls="block h-full w-full" detalle={1} ratos orden={orden} hablando={grabando} />,
    [orden, grabando],
  );

  const alCargar = (archivo: File | undefined) => {
    if (!archivo) return;
    const esAudio = archivo.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|oga|webm|aac|amr|3gp|opus)$/i.test(archivo.name);
    setErrorArchivo(!esAudio);
    if (esAudio) alCambiar((b) => ({ ...b, audio: archivo, audioNombre: archivo.name }));
  };

  return (
    <>
      <section aria-labelledby="titulo-familia" className={TARJETA}>
        <h2 id="titulo-familia" className="font-semibold text-tinta">{ENTREVISTA.familia}</h2>
        {esNueva && familias.length > 0 && (
          <div className="mt-3">
            <label htmlFor="elegir-familia" className="text-sm font-medium text-tinta">{ENTREVISTA.elegirFamilia}</label>
            <select
              id="elegir-familia"
              value=""
              onChange={(e) => e.target.value && alElegirFamilia(e.target.value)}
              className="mt-1 block min-h-12 w-full rounded-lg border border-linea bg-white px-3 text-base text-tinta outline-none focus:border-acento"
            >
              <option value="">{ENTREVISTA.nuevaFamilia}</option>
              {familias.map((f) => (
                <option key={f.id} value={f.id}>{f.numero || HISTORIAL.sinNumero}{f.lugar ? ` · ${f.lugar}` : ''}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-3">
          <label htmlFor="numero-familia" className="text-sm font-medium text-tinta">{ENTREVISTA.numero}</label>
          <input
            id="numero-familia"
            value={borrador.ficha.identificacion.numeroFamilia.valor}
            onChange={(e) => {
              const valor = e.target.value;
              alCambiar((b) => ({
                ...b,
                ficha: { ...b.ficha, identificacion: { ...b.ficha.identificacion, numeroFamilia: editarCampo(b.ficha.identificacion.numeroFamilia, valor) } },
              }));
            }}
            autoComplete="off"
            aria-describedby="numero-ayuda"
            className="mt-1 block min-h-12 w-full rounded-lg border border-linea bg-white px-3 text-base text-tinta outline-none focus:border-acento"
          />
          <p id="numero-ayuda" className="mt-1 text-sm text-suave">{ENTREVISTA.numeroAyuda}</p>
        </div>
      </section>

      <section aria-labelledby="titulo-grabacion" className={`${TARJETA} flex flex-col items-center gap-3 text-center`}>
        <h2 id="titulo-grabacion" className="self-start font-semibold text-tinta">{ENTREVISTA.grabacion}</h2>
        <div className="size-28 [--dot-cuerpo:#fff] drop-shadow-[0_6px_10px_rgb(15_31_61/0.18)]">{mascota}</div>
        <p role="status" className="min-h-6 font-medium text-tinta">
          {grabando ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 animate-pulse rounded-full bg-prioridad-alta" aria-hidden="true" />
              {ENTREVISTA.grabando} · <span className="tabular-nums">{reloj(grabadora.segundos)}</span>
            </span>
          ) : grabadora.estado === 'pidiendo' ? ENTREVISTA.pidiendo
            : tieneAudio ? ENTREVISTA.conAudio : ENTREVISTA.sinAudio}
        </p>

        {!tieneAudio && (
          <button
            type="button"
            onClick={grabando ? grabadora.detener : grabadora.iniciar}
            disabled={grabadora.estado === 'pidiendo'}
            aria-pressed={grabando}
            className={`${BOTON_PRIMARIO} min-h-16 w-full max-w-xs text-lg ${grabando ? 'bg-prioridad-alta' : ''}`}
          >
            {grabando ? (
              <><span className="size-4 rounded-sm bg-white" aria-hidden="true" />{ENTREVISTA.detener}</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
                {ENTREVISTA.grabar}
              </>
            )}
          </button>
        )}

        {grabadora.error && <Aviso tono="error">{ENTREVISTA.errores[grabadora.error]}</Aviso>}
        {errorArchivo && <Aviso tono="error">{ENTREVISTA.noEsAudio}</Aviso>}

        {borrador.audio && (
          <div className="flex w-full flex-col gap-2">
            <Reproductor audio={borrador.audio} />
            {borrador.audioNombre && <p className="truncate text-xs text-suave">{borrador.audioNombre}</p>}
            <AccionDoble
              texto={ENTREVISTA.quitar}
              seguro={ENTREVISTA.quitarSeguro}
              cancelar={FICHA.cancelar}
              alConfirmar={() => alCambiar((b) => ({ ...b, audio: undefined, audioNombre: undefined }))}
            />
          </div>
        )}

        {!tieneAudio && !grabando && (
          <label className={`${BOTON_SECUNDARIO} w-full max-w-xs`}>
            {ENTREVISTA.cargar}
            <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { alCargar(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t border-linea bg-white/95 p-4 backdrop-blur">
        <button type="button" onClick={alProcesar} disabled={!tieneAudio || grabando} className={`${BOTON_PRIMARIO} w-full`}>{ENTREVISTA.procesar}</button>
        <button type="button" onClick={alManual} disabled={grabando} className={`${BOTON_SECUNDARIO} w-full`}>{ENTREVISTA.manual}</button>
      </div>
    </>
  );
}

/** El reproductor crea su URL y la libera él mismo: así funciona también con el doble montaje de desarrollo. */
function Reproductor({ audio }: { audio: Blob }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(audio);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [audio]);
  return <audio ref={ref} controls preload="metadata" className="w-full" />;
}
