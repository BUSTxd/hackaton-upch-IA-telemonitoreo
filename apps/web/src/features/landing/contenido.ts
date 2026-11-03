import { ASISTENTE } from '@/config/marca';

export const ANTESALA = {
  frase: 'Graba la entrevista y la IA ordena la ficha familiar.',
  entrar: 'Entrar',
};

export const HERO = {
  antetitulo: 'Recopilación de datos en campo',
  titulo: 'Entrevista. La ficha se ordena. Tú confirmas.',
  descripcion: `${ASISTENTE} transcribe la entrevista con la familia, ordena los datos en la ficha y marca lo que falta o hay que revisar. Nada se guarda sin que lo confirmes.`,
  accion: 'Ver cómo funciona',
  ingresar: 'Ingresar',
};

export const COMO_FUNCIONA = {
  titulo: 'Cómo funciona',
  pasos: [
    { titulo: 'Graba', texto: 'Durante la visita, el trabajador de salud graba la entrevista desde su celular o carga el audio.' },
    { titulo: 'Se transcribe', texto: `${ASISTENTE} convierte el audio en texto y extrae los datos que se mencionaron.` },
    { titulo: 'Se revisa', texto: 'Los datos se ordenan en la ficha familiar. Lo que falta o no cuadra queda marcado para corregirlo.' },
    { titulo: 'Se guarda', texto: 'La persona confirma la ficha y, en cada nueva visita, la actualiza.' },
  ],
};

export type EstadoEjemplo = 'borrador' | 'pendiente' | 'confirmado';

export const COLA_EJEMPLO = {
  titulo: 'Cada ficha, con su estado',
  descripcion: 'Así vería el trabajador de salud sus registros familiares: lo que aún es borrador, lo que espera revisión y lo ya confirmado.',
  aviso: 'Familias y datos ficticios, solo de ejemplo.',
  casos: [
    { familia: 'Familia ficticia 0042', estado: 'pendiente', etiqueta: 'Pendiente de revisión', detalle: 'Datos extraídos de la entrevista: 2 por revisar.' },
    { familia: 'Familia ficticia 0017', estado: 'borrador', etiqueta: 'Borrador', detalle: 'Ficha empezada a mano: faltan datos del hogar.' },
    { familia: 'Familia ficticia 0008', estado: 'confirmado', etiqueta: 'Confirmado', detalle: '4 integrantes, 3 visitas registradas.' },
  ] satisfies { familia: string; estado: EstadoEjemplo; etiqueta: string; detalle: string }[],
};

export const PRINCIPIO = {
  titulo: 'La IA escucha y ordena. La persona revisa y decide.',
  puntos: [
    { titulo: 'La IA escucha', texto: 'Transcribe la entrevista y extrae solo lo que se mencionó: lo demás queda vacío.' },
    { titulo: 'La ficha avisa', texto: 'Lo que falta, lo que no cuadra y lo que vino de la IA queda marcado.' },
    { titulo: 'La persona decide', texto: 'Nada extraído por IA se da por confirmado hasta que una persona lo revisa y lo guarda.' },
  ],
};

export const PIE = {
  evento: 'Hackatón UPCH',
  aviso: 'Apoyo para recopilar y ordenar datos. No diagnostica.',
  equipo: ['BUSTxd', 'Jenny Cabrera Palomino'],
};
