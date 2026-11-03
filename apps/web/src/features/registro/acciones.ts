import { leerRegistro, type Resultado } from './api/cliente';
import { guardarBorrador, leerBorrador, leerEntrada, listarBorradores, listarIndice, type Borrador } from './almacen';
import type { EstadoFicha } from './estados';
import { combinarDatos, fichaVacia, lugarFicha, nombreFicha, nuevoId, visitaVacia } from './ficha';

export type EntradaFamilia = {
  /** El id de `/registro/ficha?id=`: el del borrador, o el `record_id` si solo está en el índice. */
  id: string;
  numero: string;
  lugar: string;
  integrantes: number;
  estado: EstadoFicha;
  actualizado: number;
};

/** Las familias de este dispositivo: borradores y registros confirmados, lo más reciente arriba. */
export async function listarFamilias(): Promise<EntradaFamilia[]> {
  const [borradores, indice] = await Promise.all([listarBorradores(), listarIndice()]);
  // Si un registro confirmado tiene cambios sin confirmar, se muestra el borrador.
  const enBorrador = new Set(borradores.map((b) => b.recordId).filter(Boolean));
  return [
    ...borradores.map((b): EntradaFamilia => ({
      id: b.id,
      numero: nombreFicha(b.ficha),
      lugar: lugarFicha(b.ficha),
      integrantes: b.ficha.integrantes.length,
      estado: b.estado,
      actualizado: b.actualizado,
    })),
    ...indice.filter((e) => !enBorrador.has(e.recordId)).map((e): EntradaFamilia => ({
      id: e.recordId,
      numero: e.numero,
      lugar: e.lugar,
      integrantes: e.integrantes,
      estado: 'confirmado',
      actualizado: e.actualizado,
    })),
  ].sort((a, b) => b.actualizado - a.actualizado);
}

/**
 * Deja listo un borrador para editar la ficha o registrar una nueva visita, y devuelve su id.
 * Si la ficha solo está en el servidor, primero la trae con `GET /records/{record_id}`.
 */
export async function prepararBorrador(id: string, modo: 'editar' | 'visita'): Promise<Resultado<string>> {
  try {
    let b: Borrador | null = await leerBorrador(id);
    if (!b) {
      const entrada = await leerEntrada(id);
      if (!entrada) return { ok: false, motivo: 'local', detalle: 'No está en este dispositivo' };
      const remoto = await leerRegistro(entrada.recordId);
      if (!remoto.ok) return remoto;
      b = {
        id: nuevoId(),
        recordId: entrada.recordId,
        estado: 'borrador',
        paso: 'revision',
        ficha: combinarDatos(fichaVacia(), remoto.datos, 'editado'),
        actualizado: Date.now(),
      };
    }
    const listo: Borrador = modo === 'visita'
      ? { ...b, paso: 'entrevista', ficha: { ...b.ficha, visitas: [...b.ficha.visitas, visitaVacia()] }, actualizado: Date.now() }
      : { ...b, paso: 'revision', actualizado: Date.now() };
    await guardarBorrador(listo);
    return { ok: true, datos: listo.id };
  } catch {
    return { ok: false, motivo: 'local' };
  }
}
