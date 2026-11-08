
import type { DatosFicha, FichaFamiliar } from '../ficha';
import { API_URL } from './config';
import {
  CONTRATO_DISPONIBLE,
  fichaAPayload,
  idDeRegistro,
  respuestaARegistro,
  respuestaDeProceso,
} from './contrato';

/**
 * Lo único que toca la red. Nunca lanza: las pantallas siempre reciben un resultado que pueden
 * explicar, y nunca un éxito que no haya pasado de verdad.
 */

export type MotivoFallo =
  | 'sin_contrato'
  | 'sin_config'
  | 'red'
  | 'servidor'
  | 'local';

export type Resultado<T> =
  | { ok: true; datos: T }
  | { ok: false; motivo: MotivoFallo; detalle?: string };

const fallo = (motivo: MotivoFallo, detalle?: string) =>
  ({ ok: false, motivo, detalle }) as const;

const SEGUNDOS = 1000;
const LIMITE_CORTO = 5 * SEGUNDOS;
const LIMITE_NORMAL = 30 * SEGUNDOS;
const LIMITE_AUDIO = 300 * SEGUNDOS;

async function pedir(
  ruta: string,
  init: RequestInit,
  limite: number,
): Promise<Resultado<Response>> {
  if (!API_URL) return fallo('sin_config');

  try {
    const res = await fetch(`${API_URL}${ruta}`, {
      ...init,
      signal: AbortSignal.timeout(limite),
    });

    return res.ok
      ? { ok: true, datos: res }
      : fallo('servidor', `HTTP ${res.status}`);
  } catch (e) {
    return fallo('red', e instanceof Error ? e.name : undefined);
  }
}

/** Lee el JSON y lo pasa por su mapeo. */
async function leer<T>(
  res: Response,
  mapear: (json: unknown) => T,
): Promise<Resultado<T>> {
  try {
    return { ok: true, datos: mapear(await res.json()) };
  } catch {
    return fallo('servidor', 'Respuesta inesperada del servidor');
  }
}

/** GET /health */
export async function comprobarSalud(): Promise<Resultado<null>> {
  const res = await pedir('/health', {}, LIMITE_CORTO);
  return res.ok ? { ok: true, datos: null } : res;
}

/**
 * Sube el audio y después lo procesa.
 * La ficha NO se guarda hasta que la persona confirme.
 */
export async function procesarAudio(
  audio: Blob,
  nombre: string,
): Promise<Resultado<{ transcripcion?: string; datos: DatosFicha }>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');

  // 1. Subir el archivo al backend.
  const cuerpo = new FormData();
  cuerpo.append('file', audio, nombre);

  const subida = await pedir(
    '/audio/upload',
    { method: 'POST', body: cuerpo },
    LIMITE_AUDIO,
  );

  if (!subida.ok) return subida;

  // 2. Obtener el filename generado por el backend.
  const guardado = await leer(subida.datos, (json) => {
    if (
      json === null ||
      typeof json !== 'object' ||
      !('filename' in json) ||
      typeof json.filename !== 'string'
    ) {
      throw new Error('La subida no devolvió un filename válido');
    }

    return json.filename;
  });

  if (!guardado.ok) return guardado;

  // 3. Procesar el archivo guardado.
  const procesado = await pedir(
    `/audio/process?filename=${encodeURIComponent(guardado.datos)}`,
    { method: 'POST' },
    LIMITE_AUDIO,
  );

  return procesado.ok
    ? leer(procesado.datos, respuestaDeProceso)
    : procesado;
}

const comoJson = (ficha: FichaFamiliar): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(fichaAPayload(ficha)),
});

/** POST /records. Devuelve el ID del registro. */
export async function crearRegistro(
  ficha: FichaFamiliar,
): Promise<Resultado<string>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');

  const res = await pedir(
    '/records',
    { method: 'POST', ...comoJson(ficha) },
    LIMITE_NORMAL,
  );

  return res.ok ? leer(res.datos, idDeRegistro) : res;
}

/** GET /records/{record_id} */
export async function leerRegistro(
  recordId: string,
): Promise<Resultado<DatosFicha>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');

  const res = await pedir(
    `/records/${encodeURIComponent(recordId)}`,
    {},
    LIMITE_NORMAL,
  );

  return res.ok ? leer(res.datos, respuestaARegistro) : res;
}

/** PUT /records/{record_id} */
export async function actualizarRegistro(
  recordId: string,
  ficha: FichaFamiliar,
): Promise<Resultado<string>> {
  if (!CONTRATO_DISPONIBLE) return fallo('sin_contrato');

  const res = await pedir(
    `/records/${encodeURIComponent(recordId)}`,
    { method: 'PUT', ...comoJson(ficha) },
    LIMITE_NORMAL,
  );

  return res.ok ? { ok: true, datos: recordId } : res;
}
