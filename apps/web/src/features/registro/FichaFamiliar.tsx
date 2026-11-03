import { GrupoCampos } from './CampoFicha';
import { FICHA, SECCIONES } from './contenido';
import {
  CAMPOS_HOGAR, CAMPOS_IDENTIFICACION, CAMPOS_INTEGRANTE, CAMPOS_VISITA, integranteVacio, visitaVacia,
  type Campo, type DefCampo, type FichaFamiliar as Ficha, type Fila, type Seccion,
} from './ficha';
import type { Hallazgos, Resumen } from './reglas';
import { AccionDoble, BOTON_SECUNDARIO, TARJETA } from './ui';

export const ORDEN_SECCIONES: Seccion[] = ['identificacion', 'hogar', 'integrantes', 'visitas'];

/** Pestañas A a D, con lo que falta o hay por revisar en cada una. */
export function PestanasSecciones({ actual, resumen, alElegir }: {
  actual: Seccion;
  resumen: Record<Seccion, Resumen>;
  alElegir: (s: Seccion) => void;
}) {
  return (
    <nav aria-label="Secciones de la ficha" className="sticky top-0 z-10 -mx-4 bg-fondo/95 px-4 py-2 backdrop-blur">
      <ol className="grid grid-cols-4 gap-1.5">
        {ORDEN_SECCIONES.map((s) => {
          const { revisar, faltan } = resumen[s];
          return (
            <li key={s}>
              <button
                type="button"
                onClick={() => alElegir(s)}
                aria-current={s === actual ? 'step' : undefined}
                className={`flex min-h-14 w-full cursor-pointer flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-acento ${s === actual ? 'border-acento bg-acento text-white' : 'border-linea bg-white text-tinta'}`}
              >
                <span className="text-sm font-semibold">{SECCIONES[s].letra}. {SECCIONES[s].corto}</span>
                <span className={`text-xs ${s === actual ? 'text-white/85' : revisar ? 'font-semibold text-prioridad-alta' : 'text-suave'}`}>
                  {revisar ? `${revisar} revisar` : faltan ? FICHA.faltan(faltan) : '✓'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** La ficha familiar, una sección a la vez: en el teléfono, cuatro pantallas cortas en vez de una interminable. */
export default function FichaFamiliar({ ficha, seccion, hallazgos, resumen, alCambiar }: {
  ficha: Ficha;
  seccion: Seccion;
  hallazgos: Hallazgos;
  resumen: Resumen;
  alCambiar: (cambio: (f: Ficha) => Ficha) => void;
}) {
  const editarGrupo = (sec: 'identificacion' | 'hogar') => (id: string, cambio: (c: Campo) => Campo) =>
    alCambiar((f) => ({ ...f, [sec]: { ...f[sec], [id]: cambio((f[sec] as Record<string, Campo>)[id]) } }));

  const editarFila = (sec: 'integrantes' | 'visitas', filaId: string) => (id: string, cambio: (c: Campo) => Campo) =>
    alCambiar((f) => ({
      ...f,
      [sec]: (f[sec] as Fila<string>[]).map((fila) => (fila.id === filaId ? { ...fila, campos: { ...fila.campos, [id]: cambio(fila.campos[id]) } } : fila)),
    }));

  const quitarFila = (sec: 'integrantes' | 'visitas', filaId: string) =>
    alCambiar((f) => ({ ...f, [sec]: (f[sec] as Fila<string>[]).filter((fila) => fila.id !== filaId) }));

  const { titulo, letra } = SECCIONES[seccion];

  return (
    <section aria-labelledby="titulo-seccion" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id="titulo-seccion" className="text-lg font-semibold text-tinta">{letra}. {titulo}</h2>
        <p className="text-sm text-suave">{FICHA.resumen(resumen)}</p>
      </div>

      {seccion === 'identificacion' && (
        <div className={TARJETA}>
          <GrupoCampos defs={CAMPOS_IDENTIFICACION} grupo={ficha.identificacion} seccion="identificacion" hallazgos={hallazgos} alEditar={editarGrupo('identificacion')} />
        </div>
      )}
      {seccion === 'hogar' && (
        <div className={TARJETA}>
          <GrupoCampos defs={CAMPOS_HOGAR} grupo={ficha.hogar} seccion="hogar" hallazgos={hallazgos} alEditar={editarGrupo('hogar')} />
        </div>
      )}
      {seccion === 'integrantes' && (
        <Filas
          filas={ficha.integrantes}
          defs={CAMPOS_INTEGRANTE}
          seccion="integrantes"
          hallazgos={hallazgos}
          titulo={(fila, i) => [fila.campos.nombres.valor, fila.campos.apellidos.valor].join(' ').trim() || FICHA.integrante(i + 1)}
          vacio={FICHA.sinIntegrantes}
          agregar={FICHA.agregarIntegrante}
          alAgregar={() => alCambiar((f) => ({ ...f, integrantes: [...f.integrantes, integranteVacio()] }))}
          alEditar={(id) => editarFila('integrantes', id)}
          alQuitar={(id) => quitarFila('integrantes', id)}
        />
      )}
      {seccion === 'visitas' && (
        <Filas
          filas={ficha.visitas}
          defs={CAMPOS_VISITA}
          seccion="visitas"
          hallazgos={hallazgos}
          titulo={(fila, i) => `${FICHA.visita(i + 1)}${fila.campos.fecha.valor ? ` · ${fila.campos.fecha.valor}` : ''}`}
          vacio={FICHA.sinVisitas}
          agregar={FICHA.agregarVisita}
          alAgregar={() => alCambiar((f) => ({ ...f, visitas: [...f.visitas, visitaVacia()] }))}
          alEditar={(id) => editarFila('visitas', id)}
          alQuitar={(id) => quitarFila('visitas', id)}
        />
      )}
    </section>
  );
}

/** Integrantes o visitas: tarjetas plegables que se agregan y quitan. */
function Filas<K extends string>({ filas, defs, seccion, hallazgos, titulo, vacio, agregar, alAgregar, alEditar, alQuitar }: {
  filas: Fila<K>[];
  defs: DefCampo<K>[];
  seccion: 'integrantes' | 'visitas';
  hallazgos: Hallazgos;
  titulo: (fila: Fila<K>, i: number) => string;
  vacio: string;
  agregar: string;
  alAgregar: () => void;
  alEditar: (filaId: string) => (id: K, cambio: (c: Campo) => Campo) => void;
  alQuitar: (filaId: string) => void;
}) {
  return (
    <>
      {!filas.length && <p className={`${TARJETA} border-dashed border-prioridad-media text-suave`}>{vacio}</p>}
      {filas.map((fila, i) => (
        <details key={fila.id} open className={`${TARJETA} group`}>
          <summary className="flex min-h-10 cursor-pointer items-center justify-between gap-3 font-semibold text-tinta">
            <span className="truncate">{titulo(fila, i)}</span>
            <span aria-hidden="true" className="text-suave transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3">
            <GrupoCampos defs={defs} grupo={fila.campos} seccion={seccion} filaId={fila.id} hallazgos={hallazgos} alEditar={alEditar(fila.id)} />
            <div className="mt-4 flex justify-end">
              <AccionDoble texto={FICHA.quitar} seguro={FICHA.quitarSeguro} cancelar={FICHA.cancelar} alConfirmar={() => alQuitar(fila.id)} />
            </div>
          </div>
        </details>
      ))}
      <button type="button" onClick={alAgregar} className={`${BOTON_SECUNDARIO} w-full`}>+ {agregar}</button>
    </>
  );
}
