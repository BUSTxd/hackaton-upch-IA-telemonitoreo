import s from '../antesala/antesala.module.css';
import { PRINCIPIO } from '../contenido';

export default function Principio() {
  return (
    <section className={`${s.entra} bg-tinta text-white`}>
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{PRINCIPIO.titulo}</h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {PRINCIPIO.puntos.map((punto) => (
            <li key={punto.titulo}>
              <h3 className="text-lg font-semibold">{punto.titulo}</h3>
              <p className="mt-2 text-white/75">{punto.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
