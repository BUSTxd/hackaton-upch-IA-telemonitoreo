import type { EstadoBorrador } from './estados';
import type { FichaFamiliar } from './ficha';

/**
 * Lo que se queda en este dispositivo (IndexedDB), para no perder nada si se corta la conexión:
 * los borradores con su audio, y el índice de `record_id`, porque el backend no tiene
 * `GET /records` para listarlos. Sin cifrar: solo datos ficticios.
 */

export type PasoBorrador = 'entrevista' | 'procesando' | 'revision';

export type Borrador = {
  id: string;
  /** Si ya existe en el servidor: confirmar lo actualiza en vez de crearlo. */
  recordId?: string;
  estado: EstadoBorrador;
  paso: PasoBorrador;
  ficha: FichaFamiliar;
  transcripcion?: string;
  audio?: Blob;
  audioNombre?: string;
  actualizado: number;
};

/** Un registro que el servidor aceptó, tal como se recuerda en este dispositivo. */
export type EntradaIndice = {
  recordId: string;
  numero: string;
  lugar: string;
  integrantes: number;
  actualizado: number;
};

const BASE = 'registro-familiar', VERSION = 1, BORRADORES = 'borradores', INDICE = 'indice';

let conexion: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  conexion ??= new Promise((resolver, rechazar) => {
    if (typeof indexedDB === 'undefined') { rechazar(new Error('IndexedDB no disponible')); return; }
    const pedido = indexedDB.open(BASE, VERSION);
    pedido.onupgradeneeded = () => {
      pedido.result.createObjectStore(BORRADORES, { keyPath: 'id' });
      pedido.result.createObjectStore(INDICE, { keyPath: 'recordId' });
    };
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
    pedido.onblocked = () => rechazar(new Error('IndexedDB bloqueado'));
  });
  // Si falló, que el siguiente intento vuelva a probar.
  conexion.catch(() => { conexion = null; });
  return conexion;
}

async function operar<T>(almacen: string, modo: IDBTransactionMode, hacer: (a: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction(almacen, modo);
    const pedido = hacer(tx.objectStore(almacen));
    // Se resuelve al cerrar la transacción: ahí el dato ya está escrito de verdad.
    tx.oncomplete = () => resolver(pedido.result);
    tx.onerror = () => rechazar(tx.error);
    tx.onabort = () => rechazar(tx.error);
  });
}

export const leerBorrador = async (id: string) => (await operar<Borrador | undefined>(BORRADORES, 'readonly', (a) => a.get(id))) ?? null;
export const listarBorradores = () => operar<Borrador[]>(BORRADORES, 'readonly', (a) => a.getAll());
export const guardarBorrador = async (b: Borrador) => { await operar(BORRADORES, 'readwrite', (a) => a.put(b)); };
export const eliminarBorrador = async (id: string) => { await operar(BORRADORES, 'readwrite', (a) => a.delete(id)); };

export const leerEntrada = async (recordId: string) => (await operar<EntradaIndice | undefined>(INDICE, 'readonly', (a) => a.get(recordId))) ?? null;
export const listarIndice = () => operar<EntradaIndice[]>(INDICE, 'readonly', (a) => a.getAll());
export const guardarEntrada = async (e: EntradaIndice) => { await operar(INDICE, 'readwrite', (a) => a.put(e)); };
