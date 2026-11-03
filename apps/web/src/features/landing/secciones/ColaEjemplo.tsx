import s from '../antesala/antesala.module.css';
import { COLA_EJEMPLO, type EstadoEjemplo } from '../contenido';

const COLOR: Record<EstadoEjemplo, string> = {
  borrador: 'bg-suave',
  pendiente: 'bg-prioridad-media',
  confirmado: 'bg-prioridad-baja',
};

export default function ColaEjemplo() {
  return (
    <section className={`${s.entra} mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1.4fr] md:items-center md:py-20`}>
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">{COLA_EJEMPLO.titulo}</h2>
        <p className="mt-4 text-lg text-suave">{COLA_EJEMPLO.descripcion}</p>
        <p className="mt-4 text-sm text-suave">{COLA_EJEMPLO.aviso}</p>
      </div>
      <ol className="divide-y divide-linea rounded-2xl border border-linea bg-white">
        {COLA_EJEMPLO.casos.map((caso) => (
          <li key={caso.familia} className="flex items-start gap-4 p-5">
            <span className={`mt-1.5 size-3 shrink-0 rounded-full ${COLOR[caso.estado]}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-semibold text-tinta">{caso.familia}</h3>
                <span className="text-sm font-medium text-suave">{caso.etiqueta}</span>
              </div>
              <p className="mt-1 text-suave">{caso.detalle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
