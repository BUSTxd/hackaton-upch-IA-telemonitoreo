import type { DatosFicha, FichaFamiliar } from '../ficha';

/**
 * EL ÚNICO ARCHIVO POR COMPLETAR CUANDO LLEGUE EL CONTRATO DEL BACKEND.
 *
 * Aún no se conocen los JSON reales de `/records` y `/audio/process`, así que aquí no hay ni
 * un nombre de propiedad inventado. Mientras `CONTRATO_DISPONIBLE` sea `false`, `cliente.ts`
 * responde `sin_contrato` sin hacer la petición y ninguna pantalla simula un resultado.
 *
 * Para conectar, leer el `/openapi.json` del backend y:
 *   1. Poner en `CAMPO_AUDIO` el nombre del campo multipart de `/audio/process`.
 *   2. Implementar los cuatro mapeos de abajo.
 *   3. Cambiar `CONTRATO_DISPONIBLE` a `true`.
 */
export const CONTRATO_DISPONIBLE: boolean = false;

export const CAMPO_AUDIO: string | null = null;

const pendiente = (): never => {
  throw new Error('Contrato del backend pendiente: ver api/contrato.ts');
};

/** Respuesta de `POST /audio/process`. La transcripción es opcional hasta confirmar que viene en ella. */
export const respuestaDeProceso: (json: unknown) => { transcripcion?: string; datos: DatosFicha } = pendiente;

/** Cuerpo de `POST /records` y `PUT /records/{record_id}`. */
export const fichaAPayload: (ficha: FichaFamiliar) => unknown = pendiente;

/** El `record_id` en la respuesta de `POST /records`. */
export const idDeRegistro: (json: unknown) => string = pendiente;

/** Respuesta de `GET /records/{record_id}`. */
export const respuestaARegistro: (json: unknown) => DatosFicha = pendiente;
