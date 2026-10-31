import type { CampoId } from './ficha';

/**
 * Lo que hoy está simulado: pacientes ficticios y lo que «se dicta» de cada uno.
 * El día que haya voz e IA de verdad, esto se sustituye por sus respuestas: cada frase
 * transcrita con los datos que la IA extrajo de ella.
 */

export type Frase = {
  texto: string;
  rellena?: {
    campo: CampoId;
    /** Lo que entendió la IA, aunque esté mal: la validación es la que lo detecta. */
    valor: string;
    sugerencia?: string;
    fuente?: string;
  };
};

export type Paciente = { id: string; nombre: string; detalle: string; guion: Frase[] };

const CATALOGO = 'Catálogo de medicamentos del centro (RAG simulado)';

export const CENTRO = 'Centro de salud de ejemplo · Lima';

export const PACIENTES: Paciente[] = [
  {
    id: 'a',
    nombre: 'Paciente ficticio A',
    detalle: 'Control de EPOC',
    guion: [
      { texto: 'Presión ciento treinta sobre ochenta y cinco.', rellena: { campo: 'presion', valor: '130/85' } },
      { texto: 'Pulso ciento cuatro.', rellena: { campo: 'fc', valor: '104' } },
      { texto: 'Temperatura treinta y siete coma nueve.', rellena: { campo: 'temperatura', valor: '379', sugerencia: '37.9' } },
      { texto: 'Saturación ochenta y ocho.', rellena: { campo: 'saturacion', valor: '88' } },
      { texto: 'Refiere falta de aire en reposo.', rellena: { campo: 'sintomas', valor: 'Falta de aire en reposo' } },
    ],
  },
  {
    id: 'b',
    nombre: 'Paciente ficticio B',
    detalle: 'Control de diabetes',
    guion: [
      { texto: 'Presión ciento cincuenta sobre noventa y cinco.', rellena: { campo: 'presion', valor: '150/95' } },
      { texto: 'Pulso ochenta y dos.', rellena: { campo: 'fc', valor: '820', sugerencia: '82' } },
      { texto: 'Temperatura treinta y seis coma ocho.', rellena: { campo: 'temperatura', valor: '36.8' } },
      { texto: 'Saturación noventa y seis.', rellena: { campo: 'saturacion', valor: '96' } },
      { texto: 'Tiene mareos desde ayer.', rellena: { campo: 'sintomas', valor: 'Mareos desde ayer' } },
      { texto: 'Toma metformina de ochocientos cincuenta.', rellena: { campo: 'medicacion', valor: 'Metformina 850 mg', fuente: CATALOGO } },
    ],
  },
  {
    id: 'c',
    nombre: 'Paciente ficticio C',
    detalle: 'Control de hipertensión',
    guion: [
      { texto: 'Presión ciento dieciocho sobre setenta y seis.', rellena: { campo: 'presion', valor: '118/76' } },
      { texto: 'Pulso setenta y dos.', rellena: { campo: 'fc', valor: '72' } },
      { texto: 'Temperatura treinta y seis coma cinco.', rellena: { campo: 'temperatura', valor: '36.5' } },
      { texto: 'Saturación noventa y ocho.', rellena: { campo: 'saturacion', valor: '98' } },
      { texto: 'Sin síntomas nuevos.', rellena: { campo: 'sintomas', valor: 'Sin síntomas nuevos' } },
      { texto: 'Sigue con losartán de cincuenta.', rellena: { campo: 'medicacion', valor: 'Losartán 50 mg', fuente: CATALOGO } },
    ],
  },
];
