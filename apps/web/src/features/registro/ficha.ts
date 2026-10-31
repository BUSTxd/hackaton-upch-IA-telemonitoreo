export type CampoId = 'presion' | 'fc' | 'temperatura' | 'saturacion' | 'sintomas' | 'medicacion';

/**
 * vacio: sin dato · ia: lo puso la IA y no hay nada raro · revisar: fuera de rango, no se
 * puede guardar así · editado: lo escribió o aceptó una persona.
 */
export type EstadoCampo = 'vacio' | 'ia' | 'revisar' | 'editado';

export type Campo = {
  valor: string;
  estado: EstadoCampo;
  /** Por qué hay que revisarlo. */
  nota?: string;
  /** Lo que la IA cree que se quiso decir. */
  sugerencia?: string;
  /** De dónde sacó la IA el valor (lo que en la versión real vendría del RAG). */
  fuente?: string;
  /** Una persona cambió lo que puso la IA. */
  corregido?: boolean;
};

export type Ficha = Record<CampoId, Campo>;

export const CAMPOS: { id: CampoId; etiqueta: string; unidad?: string; ejemplo: string; obligatorio: boolean; numerico: boolean }[] = [
  { id: 'presion', etiqueta: 'Presión', unidad: 'mmHg', ejemplo: '120/80', obligatorio: true, numerico: false },
  { id: 'fc', etiqueta: 'Frec. cardiaca', unidad: 'lpm', ejemplo: '80', obligatorio: true, numerico: true },
  { id: 'temperatura', etiqueta: 'Temperatura', unidad: '°C', ejemplo: '36.5', obligatorio: true, numerico: true },
  { id: 'saturacion', etiqueta: 'Saturación', unidad: '%', ejemplo: '98', obligatorio: true, numerico: true },
  { id: 'sintomas', etiqueta: 'Síntomas', ejemplo: 'Sin síntomas nuevos', obligatorio: false, numerico: false },
  { id: 'medicacion', etiqueta: 'Medicación', ejemplo: 'Nombre y dosis', obligatorio: false, numerico: false },
];

export const fichaVacia = (): Ficha => ({
  presion: { valor: '', estado: 'vacio' },
  fc: { valor: '', estado: 'vacio' },
  temperatura: { valor: '', estado: 'vacio' },
  saturacion: { valor: '', estado: 'vacio' },
  sintomas: { valor: '', estado: 'vacio' },
  medicacion: { valor: '', estado: 'vacio' },
});

/** Se puede guardar si no queda nada por revisar y están todos los obligatorios. */
export const fichaLista = (ficha: Ficha) =>
  CAMPOS.every(({ id, obligatorio }) => ficha[id].estado !== 'revisar' && (!obligatorio || ficha[id].valor.trim() !== ''));
