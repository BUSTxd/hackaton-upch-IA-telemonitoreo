/**
 * borrador: lo escribe una persona y aún no se confirma, solo existe en este dispositivo.
 * pendiente_revision: lleva datos extraídos por la IA que nadie ha confirmado.
 * confirmado: una persona lo confirmó y el servidor lo aceptó.
 *
 * Un borrador (`EstadoBorrador`) no puede ser `confirmado` ni por error: ese estado solo
 * existe en el índice, y al índice solo se entra con una respuesta correcta del servidor.
 */
export type EstadoFicha = 'borrador' | 'pendiente_revision' | 'confirmado';
export type EstadoBorrador = Exclude<EstadoFicha, 'confirmado'>;

export const ESTADOS: Record<EstadoFicha, { etiqueta: string; punto: string }> = {
  borrador: { etiqueta: 'Borrador', punto: 'bg-suave' },
  pendiente_revision: { etiqueta: 'Pendiente de revisión', punto: 'bg-prioridad-media' },
  confirmado: { etiqueta: 'Confirmado', punto: 'bg-prioridad-baja' },
};
