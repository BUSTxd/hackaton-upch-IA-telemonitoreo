export const AVISO_DEMO = 'Demo: la voz y la IA están simuladas con un guion. La validación y la prioridad sí se calculan. Umbrales de ejemplo, sin validar clínicamente. Solo datos ficticios.';

export const AVISO_DEMO_CORTO = 'Demo: voz e IA simuladas, umbrales de ejemplo y datos ficticios.';

export const VOZ = {
  dictar: 'Dictar',
  detener: 'Detener',
  repetir: 'Volver a dictar',
  repetirCorto: 'Repetir',
  vacio: 'Aquí aparecerá lo que dictes.',
  transcripcion: 'Lo que escuché',
  estado: {
    inicio: 'Pulsa «Dictar» y di los datos.',
    escuchando: 'Te escucho…',
    revisar: (n: number) => (n === 1 ? 'Revisa el dato marcado antes de guardar.' : `Revisa los ${n} datos marcados antes de guardar.`),
    faltan: 'Faltan signos vitales. Díctalos o escríbelos.',
    listo: 'Todo listo. Confirma y guarda.',
  },
};

export const FICHA = {
  titulo: 'Ficha del paciente',
  guardar: 'Confirmar y guardar',
  guardado: 'Guardado',
  falta: 'Completa los signos vitales y revisa lo marcado para poder guardar.',
  usar: (v: string) => `Usar ${v}`,
  corregido: 'Corregido por ti. En la versión real, esto ayudaría a mejorar a la IA.',
  iaEtiqueta: 'IA',
  revisarEtiqueta: 'Revisar',
  obligatorio: 'obligatorio',
};

export const LISTA = {
  titulo: 'Pacientes del turno',
  pendiente: 'Pendiente',
};

export const PRIORIDAD = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' };

export const BARRA = { salir: 'Salir' };
