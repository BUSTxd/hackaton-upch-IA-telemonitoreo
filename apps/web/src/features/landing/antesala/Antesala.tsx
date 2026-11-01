'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ASISTENTE } from '@/config/marca';
import { ANTESALA } from '../contenido';
import s from './antesala.module.css';

/** Lo que tarda el viaje del personaje, más lo que tardan en entrar las secciones. */
const DURACION_VIAJE = 1000;

type Fase = 'antesala' | 'viajando' | 'landing';
type Entrada = {
  fase: Fase;
  /** El sitio del centro de la pantalla al que se lleva el personaje durante la antesala. */
  destino: RefObject<HTMLDivElement | null>;
};

const EntradaContext = createContext<Entrada | null>(null);

export function useEntrada() {
  const entrada = useContext(EntradaContext);
  if (!entrada) throw new Error('useEntrada va dentro de <Antesala>');
  return entrada;
}

/**
 * La pantalla de entrada: tapa la landing con una capa y deja encima el personaje, su
 * nombre y «Entrar». Al pulsar, el personaje viaja a su sitio del hero y la capa se funde.
 * `children` son las secciones, que siguen siendo componentes de servidor.
 */
export default function Antesala({ children }: { children: ReactNode }) {
  const [fase, setFase] = useState<Fase>('antesala');
  const destino = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const temporizador = useRef(0);

  useEffect(() => {
    if (fase === 'landing') return;
    // Al recargar a media página el navegador volvería allí, y el hero quedaría fuera de vista.
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, [fase]);

  useEffect(() => {
    boton.current?.focus({ preventScroll: true });
    return () => clearTimeout(temporizador.current);
  }, []);

  const entrar = () => {
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setFase('viajando');
    temporizador.current = window.setTimeout(() => {
      setFase('landing');
      // El botón desaparece: el foco pasa al titular del hero.
      document.getElementById('inicio')?.focus({ preventScroll: true });
    }, reducido ? 0 : DURACION_VIAJE);
  };

  return (
    <EntradaContext.Provider value={{ fase, destino }}>
      <div data-fase={fase} className="flex flex-1 flex-col">
        {fase !== 'landing' && (
          <>
            <div className={s.capa} />
            <div className={s.escena}>
              <div ref={destino} className={s.destino} />
              <div className={s.texto}>
                <p className={`${s.nombre} text-4xl font-semibold tracking-tight text-tinta sm:text-5xl`}>{ASISTENTE}</p>
                <p className={`${s.frase} max-w-md text-base text-suave sm:text-lg`}>{ANTESALA.frase}</p>
                <button
                  ref={boton}
                  type="button"
                  onClick={entrar}
                  disabled={fase !== 'antesala'}
                  className={`${s.boton} mt-4 cursor-pointer rounded-full bg-acento px-9 py-3 text-base font-medium text-white transition-colors hover:bg-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento`}
                >
                  {ANTESALA.entrar}
                </button>
              </div>
            </div>
          </>
        )}
        <div inert={fase === 'antesala'} className="flex flex-1 flex-col">
          {children}
        </div>
      </div>
    </EntradaContext.Provider>
  );
}
