import { FICHA, PRIORIDAD } from './contenido';
import { CAMPOS, fichaLista, type CampoId, type EstadoCampo, type Ficha } from './ficha';
import { prioridadDe, type Prioridad, type Resultado } from './reglas';

const BORDE: Record<EstadoCampo, string> = {
  vacio: 'border-linea',
  ia: 'border-acento/50 bg-acento/5',
  revisar: 'border-prioridad-alta bg-prioridad-alta/5',
  editado: 'border-linea',
};

const COLOR: Record<Prioridad, string> = {
  alta: 'border-prioridad-alta bg-prioridad-alta/10',
  media: 'border-prioridad-media bg-prioridad-media/10',
  baja: 'border-prioridad-baja bg-prioridad-baja/10',
};

export default function FichaPaciente({ ficha, guardado, alEditar, alGuardar }: {
  ficha: Ficha;
  guardado?: Resultado;
  alEditar: (id: CampoId, valor: string) => void;
  alGuardar: () => void;
}) {
  const resultado = prioridadDe(ficha);
  const lista = fichaLista(ficha);

  return (
    <section aria-labelledby="titulo-ficha" className="rounded-2xl border border-linea bg-white p-4 lg:p-5">
      <h2 id="titulo-ficha" className="text-lg font-semibold text-tinta">{FICHA.titulo}</h2>
      {/* Los signos vitales, de dos en dos: en el teléfono la ficha entra casi entera en pantalla. */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 lg:mt-4 lg:gap-y-4">
        {CAMPOS.map(({ id, etiqueta, unidad, ejemplo, obligatorio, numerico }) => {
          const campo = ficha[id];
          return (
            <div key={id} className={obligatorio ? undefined : 'col-span-2'}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <label htmlFor={`campo-${id}`} className="text-sm font-medium text-tinta">
                  {etiqueta}{unidad && <span className="font-normal text-suave"> ({unidad})</span>}
                  {obligatorio && <span className="sr-only"> ({FICHA.obligatorio})</span>}
                </label>
                {campo.estado === 'ia' && <span className="text-xs font-semibold text-acento">{FICHA.iaEtiqueta}</span>}
                {campo.estado === 'revisar' && <span className="text-xs font-semibold text-prioridad-alta">{FICHA.revisarEtiqueta}</span>}
              </div>
              <input
                id={`campo-${id}`}
                value={campo.valor}
                onChange={(e) => alEditar(id, e.target.value)}
                placeholder={ejemplo}
                inputMode={numerico ? 'decimal' : undefined}
                autoComplete="off"
                aria-invalid={campo.estado === 'revisar'}
                aria-describedby={campo.nota ? `nota-${id}` : undefined}
                className={`mt-1 w-full scroll-mt-44 rounded-lg border px-3 py-2 text-tinta transition-colors outline-none placeholder:text-suave/60 focus:border-acento lg:scroll-mt-0 ${BORDE[campo.estado]}`}
              />
              {campo.nota && (
                <div id={`nota-${id}`} className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-prioridad-alta">
                  <span>{campo.nota}</span>
                  {campo.sugerencia && (
                    <button type="button" onClick={() => alEditar(id, campo.sugerencia ?? '')} className="cursor-pointer font-semibold underline">
                      {FICHA.usar(campo.sugerencia)}
                    </button>
                  )}
                </div>
              )}
              {campo.fuente && <p className="mt-1 text-xs text-suave">{campo.fuente}</p>}
              {campo.corregido && campo.estado === 'editado' && <p className="mt-1 text-xs text-suave">{FICHA.corregido}</p>}
            </div>
          );
        })}
      </div>

      {resultado && (
        <div className={`mt-5 rounded-xl border p-3 ${COLOR[resultado.prioridad]}`}>
          <p className="font-semibold text-tinta">{PRIORIDAD[resultado.prioridad]}</p>
          <p className="text-sm text-tinta">{resultado.motivo}</p>
        </div>
      )}

      {!lista && <p className="mt-4 text-center text-sm text-suave">{FICHA.falta}</p>}
      {/* Hasta lg se queda a la vista al fondo de la pantalla mientras se recorre la ficha. */}
      <button
        type="button"
        onClick={alGuardar}
        disabled={!lista}
        className="sticky bottom-3 z-10 mt-3 w-full cursor-pointer rounded-full bg-acento px-6 py-3 font-medium text-white transition-colors hover:bg-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento disabled:cursor-not-allowed disabled:bg-linea disabled:text-suave lg:static"
      >
        {guardado ? FICHA.guardado : FICHA.guardar}
      </button>
    </section>
  );
}
