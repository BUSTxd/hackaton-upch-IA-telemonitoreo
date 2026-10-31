import { useEffect, useRef } from 'react';
import { LISTA, PRIORIDAD } from './contenido';
import type { Paciente } from './demo';
import type { Prioridad, Resultado } from './reglas';

const COLOR: Record<Prioridad, string> = {
  alta: 'bg-prioridad-alta',
  media: 'bg-prioridad-media',
  baja: 'bg-prioridad-baja',
};

/** Hasta lg es una fila que se desliza de lado; en pantalla grande, una columna. */
export default function ListaPacientes({ pacientes, activo, alElegir }: {
  pacientes: (Paciente & { resultado?: Resultado })[];
  activo: string;
  alElegir: (id: string) => void;
}) {
  const lista = useRef<HTMLUListElement>(null);

  // En la fila, el paciente activo se centra: al guardar se pasa solo a otro que podría estar fuera de vista.
  useEffect(() => {
    const ul = lista.current, el = ul?.querySelector<HTMLElement>('[aria-current]');
    if (ul && el) ul.scrollTo({ left: el.offsetLeft - (ul.clientWidth - el.offsetWidth) / 2 });
  }, [activo, pacientes]);

  return (
    <section aria-labelledby="titulo-lista" className="min-w-0 rounded-2xl border border-linea bg-white p-2 lg:p-3">
      <h2 id="titulo-lista" className="sr-only lg:not-sr-only lg:px-2 lg:py-1 lg:text-sm lg:font-semibold lg:text-suave">{LISTA.titulo}</h2>
      <ul ref={lista} className="relative flex gap-1 overflow-x-auto lg:mt-1 lg:flex-col lg:overflow-visible">
        {pacientes.map((p) => (
          <li key={p.id} className="w-44 shrink-0 lg:w-auto">
            <button
              type="button"
              onClick={() => alElegir(p.id)}
              aria-current={p.id === activo ? 'true' : undefined}
              className={`w-full cursor-pointer rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acento lg:py-2.5 ${p.id === activo ? 'bg-acento/10' : 'hover:bg-fondo'}`}
            >
              <span className="block truncate text-sm font-medium text-tinta lg:text-base">{p.nombre}</span>
              <span className="hidden text-sm text-suave lg:block">{p.detalle}</span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-suave lg:mt-1 lg:text-sm">
                {p.resultado && <span className={`size-2.5 rounded-full ${COLOR[p.resultado.prioridad]}`} aria-hidden="true" />}
                {p.resultado ? PRIORIDAD[p.resultado.prioridad] : LISTA.pendiente}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
