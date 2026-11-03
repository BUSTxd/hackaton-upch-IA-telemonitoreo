import type { MotivoFallo } from './api/cliente';
import type { EstadoGuardado } from './useBorrador';
import type { ErrorGrabadora } from './useGrabadora';

export const AVISO_CONEXION = 'Backend sin conectar: la transcripción, la extracción y el guardado en el servidor aún no funcionan. Lo que escribas se queda como borrador en este dispositivo. Solo datos ficticios.';

export const BARRA = { salir: 'Salir', historial: 'Registros' };

export const PASOS = ['Entrevista', 'Procesamiento', 'Revisión'];

export const HISTORIAL = {
  titulo: 'Registros familiares',
  nueva: 'Nueva entrevista',
  ejemplo: 'Ver ejemplo ficticio',
  soloDispositivo: 'Solo se ven los registros guardados desde este dispositivo y navegador.',
  vacio: 'Todavía no hay registros en este dispositivo. Empieza con una nueva entrevista.',
  cargando: 'Cargando registros…',
  errorLocal: 'No se pudieron leer los registros de este dispositivo. Puede que el navegador tenga bloqueado el almacenamiento.',
  sinNumero: 'Familia sin número',
  integrantes: (n: number) => (n === 1 ? '1 integrante' : `${n} integrantes`),
};

export const SERVIDOR = {
  comprobando: 'Comprobando servidor…',
  ok: 'Servidor disponible',
  sin_config: 'Servidor sin configurar',
  red: 'Sin conexión con el servidor',
  servidor: 'El servidor respondió con error',
};

export const ENTREVISTA = {
  familia: 'Familia',
  nuevaFamilia: 'Familia nueva',
  elegirFamilia: 'Elegir una familia registrada',
  numero: 'Número de familia',
  numeroAyuda: 'Si aún no lo sabes, puedes dictarlo o completarlo después.',
  grabacion: 'Grabación',
  grabar: 'Grabar',
  detener: 'Detener',
  pidiendo: 'Pidiendo permiso para el micrófono…',
  grabando: 'Grabando',
  sinAudio: 'Graba la entrevista o carga un archivo de audio.',
  conAudio: 'Audio listo. Escúchalo o procésalo.',
  cargar: 'Cargar archivo de audio',
  quitar: 'Quitar audio',
  quitarSeguro: 'Sí, quitar el audio',
  procesar: 'Procesar audio',
  manual: 'Llenar la ficha a mano',
  errores: {
    inseguro: 'El navegador solo permite el micrófono en HTTPS o en localhost. Puedes cargar un archivo de audio.',
    no_soportado: 'Este navegador no puede grabar audio. Puedes cargar un archivo.',
    permiso: 'No se dio permiso para usar el micrófono. Actívalo en los ajustes del navegador o carga un archivo.',
    sin_microfono: 'No se encontró un micrófono. Puedes cargar un archivo de audio.',
    fallo: 'La grabación falló. Vuelve a intentarlo o carga un archivo.',
  } satisfies Record<ErrorGrabadora, string>,
  noEsAudio: 'Ese archivo no es de audio.',
};

export const PROCESO = {
  titulo: 'Procesamiento',
  transcripcion: 'Transcripción',
  extraccion: 'Extracción de datos',
  estados: { espera: 'En espera', curso: 'En curso…', listo: 'Lista', fallo: 'No se pudo', sin_conectar: 'Sin conectar' },
  enCurso: 'Enviando el audio. Puede tardar unos minutos; no cierres esta pantalla.',
  transcripcionObtenida: 'Transcripción obtenida',
  sinTranscripcion: 'El servidor no devolvió la transcripción.',
  revisar: 'Revisar la ficha',
  reintentar: 'Reintentar',
  volver: 'Volver a la entrevista',
  conservado: 'El audio y la ficha siguen guardados en este dispositivo.',
};

export const FALLOS: Record<MotivoFallo, string> = {
  sin_contrato: 'Backend sin conectar: esta función aún no está disponible. No se envió nada.',
  sin_config: 'Falta configurar la dirección del servidor (NEXT_PUBLIC_API_URL).',
  red: 'No se pudo contactar al servidor. Revisa tu conexión e inténtalo de nuevo.',
  servidor: 'El servidor respondió con un error.',
  local: 'No se pudo leer o guardar en este dispositivo.',
};

export const REVISION = {
  avisoIa: 'Datos extraídos por IA, pendientes de revisión: nada está confirmado hasta que lo revises y lo guardes.',
  transcripcion: 'Ver transcripción',
  anterior: 'Anterior',
  siguiente: 'Siguiente',
  revise: 'Revisé los datos y son correctos según la entrevista.',
  confirmar: 'Confirmar y guardar',
  confirmando: 'Guardando en el servidor…',
  bloqueado: 'Para confirmar:',
  sinConectar: 'Backend sin conectar: al confirmar no se enviará nada y la ficha quedará como borrador en este dispositivo.',
  ejemplo: 'Ejemplo ficticio: no proviene de la IA y no se puede guardar.',
};

export const FICHA = {
  ia: 'IA',
  revisar: 'Revisar',
  falta: 'Falta',
  aceptar: 'Está bien así',
  corregido: 'Corregido por ti',
  vacio: '—',
  integrante: (n: number) => `Integrante ${n}`,
  visita: (n: number) => `Visita ${n}`,
  agregarIntegrante: 'Agregar integrante',
  agregarVisita: 'Agregar visita',
  sinIntegrantes: 'Aún no hay integrantes.',
  sinVisitas: 'Aún no hay visitas.',
  quitar: 'Quitar',
  quitarSeguro: 'Sí, quitar',
  cancelar: 'Cancelar',
  faltan: (n: number) => (n === 1 ? '1 falta' : `${n} faltan`),
  resumen: ({ faltan, revisar }: { faltan: number; revisar: number }) =>
    [revisar && `${revisar} por revisar`, faltan && FICHA.faltan(faltan)].filter(Boolean).join(' · ') || 'Completo',
};

export const SECCIONES = {
  identificacion: { letra: 'A', titulo: 'Identificación del registro', corto: 'Registro' },
  hogar: { letra: 'B', titulo: 'Información del hogar', corto: 'Hogar' },
  integrantes: { letra: 'C', titulo: 'Integrantes de la familia', corto: 'Familia' },
  visitas: { letra: 'D', titulo: 'Historial de visitas', corto: 'Visitas' },
};

export const GUARDADO: Record<EstadoGuardado, string> = {
  cargando: 'Cargando…',
  al_dia: 'Sin cambios',
  pendiente: 'Guardando en este dispositivo…',
  guardado: 'Guardado en este dispositivo',
  error: 'No se pudo guardar en este dispositivo',
};

export const RESULTADO = {
  titulo: 'Registro confirmado',
  texto: (id: string) => `El servidor guardó la ficha con el número de registro ${id}.`,
  volver: 'Ver registros',
};

export const DETALLE = {
  cargando: 'Cargando ficha…',
  noEncontrada: 'Esta ficha no está en este dispositivo.',
  editar: 'Editar ficha',
  nuevaVisita: 'Registrar nueva visita',
  eliminar: 'Eliminar borrador',
  eliminarSeguro: 'Sí, eliminar el borrador',
  servidor: 'Datos guardados en el servidor',
  noDisponible: 'No se pudieron traer los datos del servidor.',
  registro: (id: string) => `Registro ${id}`,
  actualizado: (fecha: string) => `Actualizado: ${fecha}`,
};

export const fechaCorta = (ms: number) =>
  new Date(ms).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
