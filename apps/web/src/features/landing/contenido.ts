import { ASISTENTE } from '@/config/marca';

export const ANTESALA = {
  frase: 'Dicta los datos del paciente y la IA completa la ficha.',
  entrar: 'Entrar',
};

export const HERO = {
  antetitulo: 'Telemonitoreo con IA de voz',
  titulo: 'Dicta. La ficha se completa. Lo urgente va primero.',
  descripcion: `${ASISTENTE} escucha al personal de salud, completa la ficha del paciente y avisa si un dato parece mal antes de guardarlo.`,
  accion: 'Ver cómo funciona',
  ingresar: 'Ingresar',
};

export const COMO_FUNCIONA = {
  titulo: 'Cómo funciona',
  pasos: [
    { titulo: 'Dicta', texto: 'El personal de salud dice en voz alta los signos y síntomas del paciente.' },
    { titulo: 'Se completa', texto: `${ASISTENTE} transcribe lo que oye y llena cada campo de la ficha.` },
    { titulo: 'Se revisa', texto: 'Lo que parece mal queda marcado, y no se guarda hasta que una persona lo corrija.' },
    { titulo: 'Se prioriza', texto: 'Las reglas clínicas ordenan a los pacientes y explican el motivo.' },
  ],
};

export type Prioridad = 'alta' | 'media' | 'baja';

export const COLA_EJEMPLO = {
  titulo: 'Lo urgente, arriba',
  descripcion: 'Así vería el personal de salud la lista de pacientes al guardar cada ficha.',
  aviso: 'Pacientes y datos ficticios, solo de ejemplo.',
  casos: [
    { paciente: 'Paciente ficticio A', prioridad: 'alta', etiqueta: 'Alta', motivo: 'Saturación de 88 % con falta de aire en reposo.' },
    { paciente: 'Paciente ficticio B', prioridad: 'media', etiqueta: 'Media', motivo: 'Presión de 150/95 y mareos desde ayer.' },
    { paciente: 'Paciente ficticio C', prioridad: 'baja', etiqueta: 'Baja', motivo: 'Signos en rango y sin síntomas nuevos.' },
  ] satisfies { paciente: string; prioridad: Prioridad; etiqueta: string; motivo: string }[],
};

export const PRINCIPIO = {
  titulo: 'La IA escucha. Las reglas priorizan. El personal de salud decide.',
  puntos: [
    { titulo: 'La IA escucha', texto: 'Transcribe lo dictado, llena la ficha y señala lo dudoso.' },
    { titulo: 'Las reglas priorizan', texto: 'La prioridad sale de reglas clínicas deterministas y auditables, no del modelo.' },
    { titulo: 'El personal decide', texto: 'Nada se guarda sin una persona, y la decisión clínica nunca es de la IA.' },
  ],
};

export const PIE = {
  evento: 'Hackatón UPCH',
  aviso: 'Herramienta de apoyo al triaje, no de diagnóstico.',
  equipo: ['BUSTxd', 'Jenny Cabrera Palomino'],
};
