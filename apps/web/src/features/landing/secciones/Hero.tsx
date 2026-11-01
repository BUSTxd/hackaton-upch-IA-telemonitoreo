import Link from 'next/link';
import MascotaViajera from '../antesala/MascotaViajera';
import s from '../antesala/antesala.module.css';
import { HERO } from '../contenido';

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pt-14 pb-16 md:grid-cols-[1.2fr_1fr] md:pt-24 md:pb-24">
      <MascotaViajera className="mx-auto w-[clamp(170px,48vw,240px)] md:order-2 md:w-[clamp(240px,30vw,340px)]" />
      <div className={`${s.entra} text-center md:order-1 md:text-left`}>
        <p className="text-sm font-medium tracking-wide text-acento uppercase">{HERO.antetitulo}</p>
        <h1 id="inicio" tabIndex={-1} className="mt-4 text-4xl font-semibold tracking-tight text-balance text-tinta outline-none sm:text-5xl lg:text-6xl">
          {HERO.titulo}
        </h1>
        <p className="mt-6 text-lg text-pretty text-suave">{HERO.descripcion}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <Link
            href="/ingresar"
            className="rounded-full bg-acento px-7 py-3 font-medium text-white transition-colors hover:bg-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            {HERO.ingresar}
          </Link>
          <a
            href="#como-funciona"
            className="rounded-full border border-linea bg-white px-7 py-3 font-medium text-tinta transition-colors hover:border-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            {HERO.accion}
          </a>
        </div>
      </div>
    </section>
  );
}
