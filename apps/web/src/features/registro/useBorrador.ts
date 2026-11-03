import { useCallback, useEffect, useRef, useState } from 'react';
import { eliminarBorrador, guardarBorrador, leerBorrador, type Borrador } from './almacen';
import { fichaVacia } from './ficha';

const ESPERA_MS = 400;

export type EstadoGuardado = 'cargando' | 'al_dia' | 'pendiente' | 'guardado' | 'error';

export const borradorNuevo = (id: string): Borrador => ({
  id,
  estado: 'borrador',
  paso: 'entrevista',
  ficha: fichaVacia(),
  actualizado: Date.now(),
});

/** Una recarga corta lo que estaba en curso: se vuelve a donde se puede seguir sin perder nada. */
const alRecuperar = (b: Borrador): Borrador =>
  b.paso === 'procesando' ? { ...b, paso: b.transcripcion ? 'revision' : 'entrevista' } : b;

/**
 * El borrador abierto, guardado solo en este dispositivo: poco después de cada cambio, y de
 * inmediato al ocultar o cerrar la página. No se escribe hasta el primer cambio, así que abrir
 * una entrevista y salir no deja borradores vacíos.
 */
export function useBorrador(id: string, { persistir = true, crear }: { persistir?: boolean; crear?: () => Borrador } = {}) {
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [guardado, setGuardado] = useState<EstadoGuardado>('cargando');
  const actual = useRef<Borrador | null>(null);
  const sucio = useRef(false);
  const descartado = useRef(false);
  const espera = useRef<number | undefined>(undefined);

  const guardar = useCallback(() => {
    clearTimeout(espera.current);
    if (!persistir || !sucio.current || descartado.current || !actual.current) return;
    sucio.current = false;
    guardarBorrador(actual.current).then(
      () => { if (!sucio.current) setGuardado('guardado'); },
      () => setGuardado('error'),
    );
  }, [persistir]);

  useEffect(() => {
    let vivo = true;
    const inicial = () => crear?.() ?? borradorNuevo(id);
    const poner = (b: Borrador, estado: EstadoGuardado) => {
      if (!vivo) return;
      actual.current = b;
      setBorrador(b);
      setGuardado(estado);
    };
    if (!persistir) { Promise.resolve().then(() => poner(inicial(), 'al_dia')); }
    else {
      leerBorrador(id).then(
        (b) => (b ? poner(alRecuperar(b), 'guardado') : poner(inicial(), 'al_dia')),
        () => poner(inicial(), 'error'),
      );
    }
    return () => { vivo = false; };
    // `crear` solo importa al abrir: no debe volver a cargar el borrador si cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, persistir]);

  useEffect(() => {
    const alOcultar = () => { if (document.visibilityState === 'hidden') guardar(); };
    document.addEventListener('visibilitychange', alOcultar);
    window.addEventListener('pagehide', guardar);
    return () => {
      document.removeEventListener('visibilitychange', alOcultar);
      window.removeEventListener('pagehide', guardar);
      guardar();
    };
  }, [guardar]);

  const actualizar = useCallback((cambio: (b: Borrador) => Borrador) => {
    if (!actual.current) return;
    const nuevo = { ...cambio(actual.current), actualizado: Date.now() };
    actual.current = nuevo;
    sucio.current = true;
    setBorrador(nuevo);
    if (!persistir) return;
    setGuardado('pendiente');
    clearTimeout(espera.current);
    espera.current = window.setTimeout(guardar, ESPERA_MS);
  }, [guardar, persistir]);

  /** Lo borra del dispositivo y evita que un guardado pendiente lo reviva. */
  const descartar = useCallback(async () => {
    descartado.current = true;
    clearTimeout(espera.current);
    if (persistir) await eliminarBorrador(id);
  }, [id, persistir]);

  return { borrador, guardado, actualizar, guardar, descartar };
}
