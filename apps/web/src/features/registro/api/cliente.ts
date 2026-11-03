import type { DatosFicha, FichaFamiliar } from '../ficha';
import { API_URL } from './config';
import { CAMPO_AUDIO, CONTRATO_DISPONIBLE, fichaAPayload, idDeRegistro, respuestaARegistro, respuestaDeProceso } from './contrato';

/**
 * Lo único que toca la red. Nunca lanza: las pantallas siempre reciben un resultado que pueden
 * explicar, y nunca un éxito que no haya pasado de verdad.
 */

export type MotivoFallo =
  | 'sin_contrato' // Aún no se conoce el JSON del backend: no se hizo la petición.
  | 'sin_config' // Falta NEXT_PUBLIC_API_URL.
  | 'red' // No se pudo contactar al servidor, o tardó demasiado.
  | 'servidor' // El servidor respondió con error, o algo inesperado.
  | 'local'; // No se pudo leer o escribir en este dispositivo.

export type Resultado<T> = { ok: true; datos: T } | { ok: false; motivo: MotivoFallo; detalle?: string };

const fallo = (motivo: MotivoFallo, detalle?: string) => ({ ok: false, motivo, detalle }) as const;

const SEGUNDOS = 1000;
const LIMITE_CORTO = 5 * SEGUNDOS, LIMITE_NORMAL = 30 * SEGUNDOS, LIMITE_AUDIO = 300 * SEGUNDOS;

async function pedir(ruta: string, init: RequestInit, limite: number): Promise<Resultado<Response>> {
  if (!API_URL) return fallo('sin_config');
  try {
    const res = await fetch(`${API_URL}${ruta}`, { ...init, signal: AbortSignal.timeout(limite) });
    return res.ok ? { ok: true, datos: res } : fallo('servidor', `HTTP ${res.status}`);
  } catch (e) {
    return fallo('red', e instanceof Error ? e.name : undefined);
  }
}

/** Lee el JSON y lo pasa por su mapeo: una respuesta inesperada es un fallo, no un dato a medias. */
async function leer<T>(res: Response, mapear: (json: unknown) => T): Promise<Resultado<T>> {
  try {
    return { ok: true, datos: mapear(await res.json()) };
  } catch {
    return fallo('servidor', 'Respuesta inesperada del servidor');
  }
}

/** `GET /health`. Solo mira si responde OK: no hace falta conocer su JSON. */
export async function comprobarSalud(): Promise<Resultado<null>> {
  const res = await pedir('/health', {}, LIMITE_CORTO);
  return res.ok ? { ok: true, datos: null } : res;
}

/** `POST /audio/process`: transcribe y extrae. NO guarda nada: eso pasa solo al confirmar. */
export async function procesarAudio(audio: Blob, nombre: string): Promise<Resultado<{ transcripcion?: string; datos: DatosFicha }>> {
  if (!CONTRATO_DISPONIBLE || !CAMPO_AUDIO) return fallo('sin_contrato');
  const cuerpo = new FormData();
  cuerpo.append(CAMPO_AUDIO, audio, nombre);
  const res = await pedir('/audio/process', { method: 'POST', body: cuerpo }, LIMITE_AUDIO);
  return res.ok ? leer(res.datos, respuestaDeProceso) : res;
}

const comoJson = (ficha: FichaFamiliar): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(fichaAPayload(ficha)),
});

/** `POST /records`. Devuelve el `record_id`. */
export async function crearRegistro(ficha: FichaFamiliar): Promise<Resultado<string>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');
  const res = await pedir('/records', { method: 'POST', ...comoJson(ficha) }, LIMITE_NORMAL);
  return res.ok ? leer(res.datos, idDeRegistro) : res;
}

/** `GET /records/{record_id}`. */
export async function leerRegistro(recordId: string): Promise<Resultado<DatosFicha>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');
  const res = await pedir(`/records/${encodeURIComponent(recordId)}`, {}, LIMITE_NORMAL);
  return res.ok ? leer(res.datos, respuestaARegistro) : res;
}

/** `PUT /records/{record_id}`. Devuelve el mismo `record_id`. */
export async function actualizarRegistro(recordId: string, ficha: FichaFamiliar): Promise<Resultado<string>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');
  const res = await pedir(`/records/${encodeURIComponent(recordId)}`, { method: 'PUT', ...comoJson(ficha) }, LIMITE_NORMAL);
  return res.ok ? { ok: true, datos: recordId } : res;
}
