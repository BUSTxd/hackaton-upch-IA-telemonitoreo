'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { OrdenMascota } from '@/components/mascota/Mascota';
import { listarFamilias, prepararBorrador, type EntradaFamilia } from './acciones';
import { actualizarRegistro, crearRegistro, procesarAudio, type Resultado } from './api/cliente';
import { guardarEntrada, type PasoBorrador } from './almacen';
import { BARRA, FALLOS, GUARDADO, HISTORIAL, PASOS, RESULTADO } from './contenido';
import { borradorEjemplo } from './ejemplo';
import { combinarDatos, lugarFicha, nombreFicha } from './ficha';
import PasoEntrevista from './PasoEntrevista';
import PasoProcesamiento, { type Proceso } from './PasoProcesamiento';
import PasoRevision from './PasoRevision';
import { useBorrador } from './useBorrador';
import { Aviso, BOTON_PRIMARIO, EstadoChip, Marco, TARJETA } from './ui';

const INDICE_PASO: Record<PasoBorrador, number> = { entrevista: 0, procesando: 1, revision: 2 };

type Fallo = Extract<Resultado<unknown>, { ok: false }>;

/** Pasos 1 a 3: entrevista → procesamiento → revisión. Todo queda en el borrador de este dispositivo. */
export default function AsistenteEntrevista({ id, ejemplo = false }: { id: string; ejemplo?: boolean }) {
  const router = useRouter();
  const { borrador, guardado, actualizar, guardar, descartar } = useBorrador(id, {
    persistir: !ejemplo,
    crear: ejemplo ? borradorEjemplo : undefined,
  });
  const [familias, setFamilias] = useState<EntradaFamilia[]>([]);
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [falloConfirmar, setFalloConfirmar] = useState<Fallo | null>(null);
  const [falloFamilia, setFalloFamilia] = useState<Fallo | null>(null);
  const [confirmado, setConfirmado] = useState<string | null>(null);
  const [orden, setOrden] = useState<OrdenMascota>({ n: 0, tipo: 'saludo' });
  const ordenar = (tipo: OrdenMascota['tipo']) => setOrden((o) => ({ n: o.n + 1, tipo }));

  useEffect(() => {
    if (ejemplo) return;
    listarFamilias().then((lista) => setFamilias(lista.filter((f) => f.id !== id)), () => {});
  }, [id, ejemplo]);

  const paso = borrador?.paso ?? 'entrevista';
  useEffect(() => { window.scrollTo({ top: 0 }); }, [paso, confirmado]);

  const irA = (p: PasoBorrador) => actualizar((b) => ({ ...b, paso: p }));

  const procesar = async () => {
    if (!borrador?.audio) return;
    // Antes de mandar nada, el audio queda escrito en el dispositivo.
    guardar();
    irA('procesando');
    setProceso({ fase: 'enviando' });
    ordenar('pensar');
    const r = await procesarAudio(borrador.audio, borrador.audioNombre ?? 'entrevista.webm');
    if (!r.ok) { setProceso({ fase: 'fallo', motivo: r.motivo, detalle: r.detalle }); return; }
    actualizar((b) => ({
      ...b,
      estado: 'pendiente_revision',
      transcripcion: r.datos.transcripcion,
      ficha: combinarDatos(b.ficha, r.datos.datos, 'ia'),
    }));
    setProceso({ fase: 'listo', transcripcion: r.datos.transcripcion });
    ordenar('listo');
  };

  const confirmar = async () => {
    if (!borrador) return;
    setConfirmando(true);
    setFalloConfirmar(null);
    const r = borrador.recordId ? await actualizarRegistro(borrador.recordId, borrador.ficha) : await crearRegistro(borrador.ficha);
    if (!r.ok) { setConfirmando(false); setFalloConfirmar(r); return; }
    // El servidor ya lo tiene: desde aquí, solo se recuerda en el índice.
    try {
      await guardarEntrada({
        recordId: r.datos,
        numero: nombreFicha(borrador.ficha),
        lugar: lugarFicha(borrador.ficha),
        integrantes: borrador.ficha.integrantes.length,
        actualizado: Date.now(),
      });
      await descartar();
    } catch { /* El servidor lo guardó; si falla el índice, solo no aparecerá en la lista de este dispositivo. */ }
    setConfirmando(false);
    setConfirmado(r.datos);
    ordenar('listo');
  };

  const elegirFamilia = async (otra: string) => {
    setFalloFamilia(null);
    const r = await prepararBorrador(otra, 'visita');
    if (r.ok) router.push(`/registro/nueva?ficha=${encodeURIComponent(r.datos)}`);
    else setFalloFamilia(r);
  };

  const volver = { href: '/registro', texto: BARRA.historial };

  if (confirmado) {
    return (
      <Marco titulo={RESULTADO.titulo} volver={volver}>
        <section className={`${TARJETA} flex flex-col gap-3`}>
          <EstadoChip estado="confirmado" />
          <p className="text-tinta">{RESULTADO.texto(confirmado)}</p>
          <Link href="/registro" className={`${BOTON_PRIMARIO} w-full`}>{RESULTADO.volver}</Link>
        </section>
      </Marco>
    );
  }

  return (
    <Marco titulo={ejemplo ? HISTORIAL.ejemplo : HISTORIAL.nueva} volver={volver}>
      <ol className="flex gap-1.5" aria-label="Pasos">
        {PASOS.map((nombre, i) => (
          <li
            key={nombre}
            aria-current={i === INDICE_PASO[paso] ? 'step' : undefined}
            className={`flex-1 border-t-4 pt-1.5 text-xs font-semibold ${i <= INDICE_PASO[paso] ? 'border-acento text-acento' : 'border-linea text-suave'}`}
          >
            {i + 1}. {nombre}
          </li>
        ))}
      </ol>

      {!borrador ? (
        <p className="text-suave">{GUARDADO.cargando}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <EstadoChip estado={borrador.estado} />
            {!ejemplo && (
              <p role="status" className={`text-sm ${guardado === 'error' ? 'font-semibold text-prioridad-alta' : 'text-suave'}`}>{GUARDADO[guardado]}</p>
            )}
          </div>
          {falloFamilia && <Aviso tono="error">{FALLOS[falloFamilia.motivo]}</Aviso>}

          {paso === 'entrevista' && (
            <PasoEntrevista
              borrador={borrador}
              familias={familias}
              orden={orden}
              alCambiar={actualizar}
              alElegirFamilia={elegirFamilia}
              alProcesar={procesar}
              alManual={() => irA('revision')}
            />
          )}
          {paso === 'procesando' && (
            <PasoProcesamiento
              proceso={proceso ?? { fase: 'listo', transcripcion: borrador.transcripcion }}
              orden={orden}
              alRevisar={() => irA('revision')}
              alReintentar={procesar}
              alVolver={() => irA('entrevista')}
              alManual={() => irA('revision')}
            />
          )}
          {paso === 'revision' && (
            <PasoRevision
              borrador={borrador}
              ejemplo={ejemplo}
              confirmando={confirmando}
              falloConfirmar={falloConfirmar}
              alCambiarFicha={(cambio) => { setFalloConfirmar(null); actualizar((b) => ({ ...b, ficha: cambio(b.ficha) })); }}
              alConfirmar={confirmar}
            />
          )}
        </>
      )}
    </Marco>
  );
}
