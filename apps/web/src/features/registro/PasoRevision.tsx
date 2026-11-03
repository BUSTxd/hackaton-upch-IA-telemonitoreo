import { useMemo, useState } from 'react';
import type { Resultado } from './api/cliente';
import { CONTRATO_DISPONIBLE } from './api/contrato';
import type { Borrador } from './almacen';
import { FALLOS, REVISION } from './contenido';
import FichaFamiliar, { ORDEN_SECCIONES, PestanasSecciones } from './FichaFamiliar';
import type { FichaFamiliar as Ficha, Seccion } from './ficha';
import { bloqueosConfirmar, resumirSecciones, revisarFicha } from './reglas';
import { Aviso, BOTON_PRIMARIO, BOTON_SECUNDARIO } from './ui';

/** Paso 3: una persona revisa, corrige y confirma. Nada extraído por IA se guarda sin esto. */
export default function PasoRevision({ borrador, ejemplo, confirmando, falloConfirmar, alCambiarFicha, alConfirmar }: {
  borrador: Borrador;
  ejemplo: boolean;
  confirmando: boolean;
  falloConfirmar: Extract<Resultado<unknown>, { ok: false }> | null;
  alCambiarFicha: (cambio: (f: Ficha) => Ficha) => void;
  alConfirmar: () => void;
}) {
  const [seccion, setSeccion] = useState<Seccion>('identificacion');
  const [revisado, setRevisado] = useState(false);
  const { ficha } = borrador;
  const hallazgos = useMemo(() => revisarFicha(ficha), [ficha]);
  const resumen = useMemo(() => resumirSecciones(ficha, hallazgos), [ficha, hallazgos]);
  const bloqueos = bloqueosConfirmar(ficha, hallazgos);
  const i = ORDEN_SECCIONES.indexOf(seccion);
  const ultima = i === ORDEN_SECCIONES.length - 1;

  const ir = (s: Seccion) => { setSeccion(s); window.scrollTo({ top: 0 }); };
  // Cualquier cambio después de marcar «revisé» obliga a volver a revisarlo.
  const cambiar = (cambio: (f: Ficha) => Ficha) => { setRevisado(false); alCambiarFicha(cambio); };

  return (
    <>
      {borrador.estado === 'pendiente_revision' && !ejemplo && <Aviso tono="atencion">{REVISION.avisoIa}</Aviso>}
      {ejemplo && <Aviso tono="atencion">{REVISION.ejemplo}</Aviso>}
      {borrador.transcripcion && (
        <details className="rounded-xl border border-linea bg-white px-3 py-2">
          <summary className="min-h-10 cursor-pointer content-center font-medium text-acento">{REVISION.transcripcion}</summary>
          <p className="mt-2 max-h-64 overflow-y-auto pb-2 leading-relaxed whitespace-pre-wrap text-tinta">{borrador.transcripcion}</p>
        </details>
      )}

      <PestanasSecciones actual={seccion} resumen={resumen} alElegir={ir} />
      <FichaFamiliar ficha={ficha} seccion={seccion} hallazgos={hallazgos} resumen={resumen[seccion]} alCambiar={cambiar} />

      {ultima && !ejemplo && (
        <section aria-label="Confirmación" className="flex flex-col gap-3 rounded-2xl border border-linea bg-white p-4">
          {bloqueos.length > 0 && (
            <Aviso tono="atencion">
              <p className="font-semibold">{REVISION.bloqueado}</p>
              <ul className="mt-1 list-disc pl-5">{bloqueos.map((b) => <li key={b}>{b}</li>)}</ul>
            </Aviso>
          )}
          <label className="flex min-h-12 cursor-pointer items-start gap-3 text-tinta">
            <input type="checkbox" checked={revisado} onChange={(e) => setRevisado(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-acento" />
            <span>{REVISION.revise}</span>
          </label>
          {!CONTRATO_DISPONIBLE && <p className="text-sm text-suave">{REVISION.sinConectar}</p>}
          {falloConfirmar && (
            <Aviso tono={falloConfirmar.motivo === 'sin_contrato' ? 'atencion' : 'error'}>
              {FALLOS[falloConfirmar.motivo]}{falloConfirmar.detalle ? ` (${falloConfirmar.detalle})` : ''}
            </Aviso>
          )}
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 mt-auto flex gap-2 border-t border-linea bg-white/95 p-4 backdrop-blur">
        {i > 0 && <button type="button" onClick={() => ir(ORDEN_SECCIONES[i - 1])} className={`${BOTON_SECUNDARIO} flex-1`}>{REVISION.anterior}</button>}
        {!ultima ? (
          <button type="button" onClick={() => ir(ORDEN_SECCIONES[i + 1])} className={`${BOTON_PRIMARIO} flex-[2]`}>{REVISION.siguiente}</button>
        ) : !ejemplo && (
          <button
            type="button"
            onClick={alConfirmar}
            disabled={confirmando || !revisado || bloqueos.length > 0}
            className={`${BOTON_PRIMARIO} flex-[2]`}
          >
            {confirmando ? REVISION.confirmando : REVISION.confirmar}
          </button>
        )}
      </div>
    </>
  );
}
