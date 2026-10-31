'use client';
import { useEffect, useRef } from 'react';
import Mascota from '@/components/mascota/Mascota';
import { useEntrada } from './Antesala';
import s from './antesala.module.css';

/**
 * El personaje, en su sitio real del hero. Durante la antesala un `transform` lo lleva al
 * centro de la pantalla; al entrar se quita y vuelve aquí. Es una sola instancia: la
 * animación no se corta, y luego se desplaza con la página como cualquier otro elemento.
 */
export default function MascotaViajera({ className }: { className?: string }) {
  const { fase, destino } = useEntrada();
  const hueco = useRef<HTMLDivElement>(null);
  const viajera = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viajera.current;
    if (!el) return;
    if (fase !== 'antesala') { el.style.transform = ''; return; }
    let destruido = false;
    const medir = () => {
      const de = hueco.current?.getBoundingClientRect(), a = destino.current?.getBoundingClientRect();
      if (destruido || !de || !a) return;
      const dx = a.left + a.width / 2 - (de.left + de.width / 2), dy = a.top + a.height / 2 - (de.top + de.height / 2);
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${a.width / de.width})`;
      el.dataset.lista = '';
    };
    medir();
    // La fuente definitiva puede mover el hero un poco.
    document.fonts.ready.then(medir);
    window.addEventListener('resize', medir);
    return () => {
      destruido = true;
      window.removeEventListener('resize', medir);
    };
  }, [fase, destino]);

  return (
    <div ref={hueco} className={`${s.hueco} ${className ?? ''}`}>
      <div ref={viajera} className={s.viajera}>
        <div className={s.aparece}>
          <Mascota guion="vivo" detalle={1} pausado={false} cls="block h-full w-full" />
        </div>
      </div>
    </div>
  );
}
