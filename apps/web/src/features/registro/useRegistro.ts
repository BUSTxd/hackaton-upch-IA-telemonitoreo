import { useEffect, useMemo, useState } from 'react';
import type { OrdenMascota } from '@/components/mascota/Mascota';
import { PACIENTES, type Frase } from './demo';
import { fichaLista, fichaVacia, type CampoId, type Ficha } from './ficha';
import { prioridadDe, validar, type Prioridad, type Resultado } from './reglas';

const POR_PALABRA = 130, ENTRE_FRASES = 350;
const RANGO: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

const porPaciente = <T,>(crear: () => T) => Object.fromEntries(PACIENTES.map((p) => [p.id, crear()])) as Record<string, T>;
const guionDe = (id: string) => PACIENTES.find((p) => p.id === id)?.guion ?? [];

/** Lo que entendió la IA de una frase, ya validado. */
function rellenar(ficha: Ficha, { campo, valor, sugerencia, fuente }: NonNullable<Frase['rellena']>): Ficha {
  const nota = validar(campo, valor) ?? undefined;
  return { ...ficha, [campo]: { valor, estado: nota ? 'revisar' : 'ia', nota, sugerencia: nota ? sugerencia : undefined, fuente } };
}

/** El estado de la pantalla. Solo vive en memoria: al recargar vuelve a empezar. */
export function useRegistro() {
  const [activo, setActivo] = useState(PACIENTES[0].id);
  const [fichas, setFichas] = useState(() => porPaciente(fichaVacia));
  const [guardados, setGuardados] = useState<Record<string, Resultado>>({});
  const [avance, setAvance] = useState(() => porPaciente(() => ({ frase: 0, palabras: 0 })));
  const [dictando, setDictando] = useState(false);
  const [orden, setOrden] = useState<OrdenMascota>({ n: 0, tipo: 'saludo' });
  const ordenar = (tipo: OrdenMascota['tipo']) => setOrden((o) => ({ n: o.n + 1, tipo }));

  // El guion avanza palabra a palabra; al acabar cada frase, la IA rellena su campo.
  useEffect(() => {
    if (!dictando) return;
    const { frase, palabras } = avance[activo];
    const actual = guionDe(activo)[frase];
    const total = actual ? actual.texto.split(' ').length : 0;
    const t = window.setTimeout(() => {
      if (!actual) { setDictando(false); ordenar('listo'); return; }
      if (palabras < total) { setAvance((a) => ({ ...a, [activo]: { frase, palabras: palabras + 1 } })); return; }
      const { rellena } = actual;
      if (rellena) setFichas((f) => ({ ...f, [activo]: rellenar(f[activo], rellena) }));
      setAvance((a) => ({ ...a, [activo]: { frase: frase + 1, palabras: 0 } }));
    }, !actual ? 0 : palabras < total ? POR_PALABRA : ENTRE_FRASES);
    return () => clearTimeout(t);
  }, [dictando, activo, avance]);

  const seleccionar = (id: string) => { setDictando(false); setActivo(id); };

  /** La ficha cambió: lo guardado ya no vale hasta volver a confirmar. */
  const olvidarGuardado = () => setGuardados((g) => {
    const resto = { ...g };
    delete resto[activo];
    return resto;
  });

  const dictar = () => {
    setFichas((f) => ({ ...f, [activo]: fichaVacia() }));
    olvidarGuardado();
    setAvance((a) => ({ ...a, [activo]: { frase: 0, palabras: 0 } }));
    setDictando(true);
  };

  const detener = () => setDictando(false);

  const editar = (id: CampoId, valor: string) => {
    olvidarGuardado();
    setFichas((f) => {
      const nota = validar(id, valor) ?? undefined;
      const antes = f[activo][id];
      return {
        ...f,
        [activo]: {
          ...f[activo],
          [id]: {
            valor,
            estado: nota ? 'revisar' : valor.trim() ? 'editado' : 'vacio',
            nota,
            // Sigue ofreciendo la sugerencia mientras el dato siga mal.
            sugerencia: nota ? antes.sugerencia : undefined,
            corregido: antes.corregido || antes.estado === 'ia' || antes.estado === 'revisar',
          },
        },
      };
    });
  };

  const guardar = () => {
    const resultado = prioridadDe(fichas[activo]);
    if (!resultado || !fichaLista(fichas[activo])) return;
    const nuevos = { ...guardados, [activo]: resultado };
    setGuardados(nuevos);
    setDictando(false);
    ordenar('listo');
    // Pasa solo al siguiente pendiente.
    const siguiente = PACIENTES.find((p) => !nuevos[p.id]);
    if (siguiente) setActivo(siguiente.id);
  };

  // Lo urgente arriba; lo pendiente, después y en su orden.
  const pacientes = useMemo(
    () => PACIENTES
      .map((p, i) => ({ ...p, resultado: guardados[p.id] as Resultado | undefined, i }))
      .sort((a, b) => (a.resultado ? RANGO[a.resultado.prioridad] : 3) - (b.resultado ? RANGO[b.resultado.prioridad] : 3) || a.i - b.i),
    [guardados],
  );

  const { frase, palabras } = avance[activo];
  const guion = guionDe(activo);
  const transcripcion = [
    ...guion.slice(0, frase).map((f) => f.texto),
    ...(guion[frase] ? [guion[frase].texto.split(' ').slice(0, palabras).join(' ')] : []),
  ].join(' ').trim();

  return {
    activo, pacientes, ficha: fichas[activo], guardado: guardados[activo], dictando, transcripcion, orden,
    seleccionar, dictar, detener, editar, guardar,
  };
}
