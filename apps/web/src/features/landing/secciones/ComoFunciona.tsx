import s from '../antesala/antesala.module.css';
import { COMO_FUNCIONA } from '../contenido';

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className={`${s.entra} scroll-mt-6 border-t border-linea bg-white`}>
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">{COMO_FUNCIONA.titulo}</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMO_FUNCIONA.pasos.map((paso, i) => (
            <li key={paso.titulo}>
              <span className="flex size-9 items-center justify-center rounded-full bg-acento text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold text-tinta">{paso.titulo}</h3>
              <p className="mt-2 text-suave">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
