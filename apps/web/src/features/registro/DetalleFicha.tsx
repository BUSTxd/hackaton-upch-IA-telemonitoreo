'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { prepararBorrador } from './acciones';
import { leerRegistro, type Resultado } from './api/cliente';
import { eliminarBorrador, leerBorrador, leerEntrada, type Borrador, type EntradaIndice } from './almacen';
import { BARRA, DETALLE, FALLOS, FICHA, HISTORIAL, SECCIONES, fechaCorta } from './contenido';
import {
  CAMPOS_HOGAR, CAMPOS_IDENTIFICACION, CAMPOS_INTEGRANTE, CAMPOS_VISITA, combinarDatos, fichaVacia, nombreFicha,
  type DefCampo, type FichaFamiliar, type Grupo,
} from './ficha';
import { Aviso, AccionDoble, BOTON_PRIMARIO, BOTON_SECUNDARIO, EstadoChip, Marco, TARJETA } from './ui';

type Fallo = Extract<Resultado<unknown>, { ok: false }>;

type Carga =
  | { tipo: 'cargando' }
  | { tipo: 'borrador'; borrador: Borrador }
  | { tipo: 'servidor'; entrada: EntradaIndice; ficha: FichaFamiliar | null; fallo: Fallo | null }
  | { tipo: 'no_encontrada' };

/** Ver una ficha, su historial de visitas, y pasar a editarla o a registrar una nueva visita. */
export default function DetalleFicha({ id }: { id: string }) {
  const router = useRouter();
  const [carga, setCarga] = useState<Carga>({ tipo: 'cargando' });
  const [fallo, setFallo] = useState<Fallo | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const borrador = await leerBorrador(id);
        if (borrador) { if (vivo) setCarga({ tipo: 'borrador', borrador }); return; }
        const entrada = await leerEntrada(id);
        if (!entrada) { if (vivo) setCarga({ tipo: 'no_encontrada' }); return; }
        const r = await leerRegistro(entrada.recordId);
        if (vivo) setCarga({ tipo: 'servidor', entrada, ficha: r.ok ? combinarDatos(fichaVacia(), r.datos, 'editado') : null, fallo: r.ok ? null : r });
      } catch {
        if (vivo) setFallo({ ok: false, motivo: 'local' });
      }
    })();
    return () => { vivo = false; };
  }, [id]);

  const abrir = async (modo: 'editar' | 'visita') => {
    setFallo(null);
    const r = await prepararBorrador(id, modo);
    if (r.ok) router.push(`/registro/nueva?ficha=${encodeURIComponent(r.datos)}`);
    else setFallo(r);
  };

  const eliminar = async () => {
    try { await eliminarBorrador(id); router.push('/registro'); } catch { setFallo({ ok: false, motivo: 'local' }); }
  };

  const ficha = carga.tipo === 'borrador' ? carga.borrador.ficha : carga.tipo === 'servidor' ? carga.ficha : null;
  const numero = ficha ? nombreFicha(ficha) : carga.tipo === 'servidor' ? carga.entrada.numero : '';
  const volver = { href: '/registro', texto: BARRA.historial };

  return (
    <Marco titulo={numero ? `Familia ${numero}` : HISTORIAL.sinNumero} volver={volver}>
      {carga.tipo === 'cargando' && <p className="text-suave">{DETALLE.cargando}</p>}
      {carga.tipo === 'no_encontrada' && <Aviso tono="error">{DETALLE.noEncontrada}</Aviso>}
      {fallo && <Aviso tono="error">{FALLOS[fallo.motivo]}{fallo.detalle ? ` (${fallo.detalle})` : ''}</Aviso>}

      {carga.tipo === 'borrador' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <EstadoChip estado={carga.borrador.estado} />
          <p className="text-sm text-suave">{DETALLE.actualizado(fechaCorta(carga.borrador.actualizado))}</p>
        </div>
      )}
      {carga.tipo === 'servidor' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <EstadoChip estado="confirmado" />
            <p className="text-sm text-suave">{DETALLE.registro(carga.entrada.recordId)}</p>
          </div>
          {carga.fallo && <Aviso tono={carga.fallo.motivo === 'sin_contrato' ? 'atencion' : 'error'}>{DETALLE.noDisponible} {FALLOS[carga.fallo.motivo]}</Aviso>}
        </>
      )}

      {ficha && <ResumenFicha ficha={ficha} />}

      {carga.tipo === 'borrador' && (
        <div className="flex justify-center">
          <AccionDoble
            texto={DETALLE.eliminar}
            seguro={DETALLE.eliminarSeguro}
            cancelar={FICHA.cancelar}
            alConfirmar={eliminar}
            className="min-h-12 cursor-pointer px-4 text-sm font-medium text-prioridad-alta underline"
          />
        </div>
      )}

      {(carga.tipo === 'borrador' || carga.tipo === 'servidor') && (
        <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t border-linea bg-white/95 p-4 backdrop-blur">
          <button type="button" onClick={() => abrir('visita')} className={`${BOTON_PRIMARIO} w-full`}>{DETALLE.nuevaVisita}</button>
          <button type="button" onClick={() => abrir('editar')} className={`${BOTON_SECUNDARIO} w-full`}>{DETALLE.editar}</button>
        </div>
      )}
    </Marco>
  );
}

/** Solo lectura: lo que tiene la ficha, sección por sección, con las visitas como historial. */
function ResumenFicha({ ficha }: { ficha: FichaFamiliar }) {
  return (
    <>
      <Bloque titulo={SECCIONES.identificacion}><Datos defs={CAMPOS_IDENTIFICACION} grupo={ficha.identificacion} /></Bloque>
      <Bloque titulo={SECCIONES.hogar}><Datos defs={CAMPOS_HOGAR} grupo={ficha.hogar} /></Bloque>
      <Bloque titulo={SECCIONES.integrantes}>
        {ficha.integrantes.length ? ficha.integrantes.map((f, i) => (
          <details key={f.id} className="border-t border-linea py-2 first:border-t-0">
            <summary className="min-h-10 cursor-pointer content-center font-medium text-tinta">
              {[f.campos.nombres.valor, f.campos.apellidos.valor].join(' ').trim() || FICHA.integrante(i + 1)}
              {f.campos.parentesco.valor && <span className="font-normal text-suave"> · {f.campos.parentesco.valor}</span>}
            </summary>
            <Datos defs={CAMPOS_INTEGRANTE} grupo={f.campos} />
          </details>
        )) : <p className="text-suave">{FICHA.sinIntegrantes}</p>}
      </Bloque>
      <Bloque titulo={SECCIONES.visitas}>
        {ficha.visitas.length ? (
          <ol className="flex flex-col gap-3">
            {/* Lo más reciente arriba. */}
            {[...ficha.visitas].reverse().map((v, i) => (
              <li key={v.id} className="border-l-4 border-acento/40 pl-3">
                <p className="font-medium text-tinta">{v.campos.fecha.valor || FICHA.visita(ficha.visitas.length - i)}</p>
                <Datos defs={CAMPOS_VISITA.filter((d) => d.id !== 'fecha')} grupo={v.campos} />
              </li>
            ))}
          </ol>
        ) : <p className="text-suave">{FICHA.sinVisitas}</p>}
      </Bloque>
    </>
  );
}

const Bloque = ({ titulo, children }: { titulo: { letra: string; titulo: string }; children: ReactNode }) => (
  <section className={TARJETA}>
    <h2 className="mb-2 font-semibold text-tinta">{titulo.letra}. {titulo.titulo}</h2>
    {children}
  </section>
);

function Datos<K extends string>({ defs, grupo }: { defs: DefCampo<K>[]; grupo: Grupo<K> }) {
  return (
    <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-1.5 text-sm">
      {defs.map((d) => (
        <div key={d.id} className="contents">
          <dt className="text-suave">{d.etiqueta}</dt>
          <dd className={grupo[d.id].valor ? 'break-words text-tinta' : 'italic text-suave'}>
            {grupo[d.id].valor || FICHA.falta}
            {grupo[d.id].estado === 'ia' && <span className="ml-1.5 text-xs font-semibold text-acento">{FICHA.ia}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
