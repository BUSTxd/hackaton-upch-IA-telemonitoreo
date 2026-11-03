/**
 * vacio: sin dato · ia: lo extrajo la IA y nadie lo ha confirmado · revisar: la IA y lo que ya
 * había no coinciden · editado: lo escribió o aceptó una persona.
 */
export type EstadoCampo = 'vacio' | 'ia' | 'revisar' | 'editado';

export type Campo = {
  valor: string;
  estado: EstadoCampo;
  /** Por qué hay que revisarlo. */
  nota?: string;
  /** Una persona cambió lo que puso la IA. */
  corregido?: boolean;
};

export type TipoCampo = 'texto' | 'largo' | 'fecha' | 'numero' | 'telefono' | 'correo' | 'opciones';

export type DefCampo<K extends string = string> = {
  id: K;
  etiqueta: string;
  tipo: TipoCampo;
  opciones?: readonly string[];
  /** Ocupa media fila: para datos cortos que conviene ver de dos en dos. */
  medio?: boolean;
};

export type IdIdentificacion = 'numeroFamilia' | 'redSalud' | 'establecimiento' | 'informantes';

export type IdHogar =
  | 'departamentoProvincia' | 'distrito' | 'localidad' | 'sector' | 'areaResidencia' | 'direccion'
  | 'tiempoResidencia' | 'residenciasAnteriores' | 'tiempoTraslado' | 'medioTransporte' | 'telefono' | 'correo';

export type IdIntegrante =
  | 'nombres' | 'apellidos' | 'documento' | 'fechaNacimiento' | 'edad' | 'sexo' | 'parentesco'
  | 'estadoCivil' | 'nivelEducativo' | 'condicionOcupacional' | 'seguroSalud';

export type IdVisita = 'fecha' | 'responsable' | 'resultado' | 'proximaVisita';

export const SEXOS = ['F', 'M', 'No especificado'] as const;

export const CAMPOS_IDENTIFICACION: DefCampo<IdIdentificacion>[] = [
  { id: 'numeroFamilia', etiqueta: 'Número de familia', tipo: 'texto' },
  { id: 'redSalud', etiqueta: 'Red de salud', tipo: 'texto' },
  { id: 'establecimiento', etiqueta: 'Establecimiento de salud', tipo: 'texto' },
  { id: 'informantes', etiqueta: 'Informantes', tipo: 'largo' },
];

export const CAMPOS_HOGAR: DefCampo<IdHogar>[] = [
  { id: 'departamentoProvincia', etiqueta: 'Departamento/provincia', tipo: 'texto' },
  { id: 'distrito', etiqueta: 'Distrito', tipo: 'texto', medio: true },
  { id: 'localidad', etiqueta: 'Localidad', tipo: 'texto', medio: true },
  { id: 'sector', etiqueta: 'Sector', tipo: 'texto', medio: true },
  { id: 'areaResidencia', etiqueta: 'Área de residencia', tipo: 'texto', medio: true },
  { id: 'direccion', etiqueta: 'Dirección', tipo: 'texto' },
  { id: 'tiempoResidencia', etiqueta: 'Tiempo de residencia', tipo: 'texto' },
  { id: 'residenciasAnteriores', etiqueta: 'Residencias anteriores', tipo: 'largo' },
  { id: 'tiempoTraslado', etiqueta: 'Tiempo de traslado al centro de salud', tipo: 'texto' },
  { id: 'medioTransporte', etiqueta: 'Medio de transporte habitual', tipo: 'texto' },
  { id: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono' },
  { id: 'correo', etiqueta: 'Correo electrónico', tipo: 'correo' },
];

export const CAMPOS_INTEGRANTE: DefCampo<IdIntegrante>[] = [
  { id: 'nombres', etiqueta: 'Nombres', tipo: 'texto' },
  { id: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto' },
  { id: 'documento', etiqueta: 'Número de documento', tipo: 'numero' },
  { id: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'fecha', medio: true },
  { id: 'edad', etiqueta: 'Edad', tipo: 'texto', medio: true },
  { id: 'sexo', etiqueta: 'Sexo', tipo: 'opciones', opciones: SEXOS, medio: true },
  { id: 'parentesco', etiqueta: 'Parentesco', tipo: 'texto', medio: true },
  { id: 'estadoCivil', etiqueta: 'Estado civil', tipo: 'texto' },
  { id: 'nivelEducativo', etiqueta: 'Nivel educativo', tipo: 'texto' },
  { id: 'condicionOcupacional', etiqueta: 'Condición ocupacional', tipo: 'texto' },
  { id: 'seguroSalud', etiqueta: 'Seguro de salud', tipo: 'texto' },
];

export const CAMPOS_VISITA: DefCampo<IdVisita>[] = [
  { id: 'fecha', etiqueta: 'Fecha de visita', tipo: 'fecha' },
  { id: 'responsable', etiqueta: 'Responsable', tipo: 'texto' },
  { id: 'resultado', etiqueta: 'Resultado de la visita', tipo: 'largo' },
  { id: 'proximaVisita', etiqueta: 'Fecha de próxima visita', tipo: 'fecha' },
];

export type Grupo<K extends string> = Record<K, Campo>;
export type Fila<K extends string> = { id: string; campos: Grupo<K> };

export type FichaFamiliar = {
  identificacion: Grupo<IdIdentificacion>;
  hogar: Grupo<IdHogar>;
  integrantes: Fila<IdIntegrante>[];
  visitas: Fila<IdVisita>[];
};

export type Seccion = keyof FichaFamiliar;

/** Datos sueltos, ya sin nombres del backend. Lo no mencionado simplemente no está. */
export type DatosFicha = {
  identificacion?: Partial<Record<IdIdentificacion, string>>;
  hogar?: Partial<Record<IdHogar, string>>;
  integrantes?: Partial<Record<IdIntegrante, string>>[];
  visitas?: Partial<Record<IdVisita, string>>[];
};

/** Sin `crypto.randomUUID` a secas: esa función no existe por http en la red local. */
export const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const grupoVacio = <K extends string>(defs: DefCampo<K>[]) =>
  Object.fromEntries(defs.map(({ id }) => [id, { valor: '', estado: 'vacio' }])) as Grupo<K>;

export const integranteVacio = (): Fila<IdIntegrante> => ({ id: nuevoId(), campos: grupoVacio(CAMPOS_INTEGRANTE) });
export const visitaVacia = (): Fila<IdVisita> => ({ id: nuevoId(), campos: grupoVacio(CAMPOS_VISITA) });

export const fichaVacia = (): FichaFamiliar => ({
  identificacion: grupoVacio(CAMPOS_IDENTIFICACION),
  hogar: grupoVacio(CAMPOS_HOGAR),
  integrantes: [],
  visitas: [],
});

/** Una persona escribió en el campo. */
export const editarCampo = (campo: Campo, valor: string): Campo => ({
  valor,
  estado: valor.trim() ? 'editado' : 'vacio',
  corregido: campo.corregido || campo.estado === 'ia' || campo.estado === 'revisar',
});

/** Una persona da por bueno lo que estaba marcado, sin cambiarlo. */
export const aceptarCampo = (campo: Campo): Campo => ({ valor: campo.valor, estado: 'editado', corregido: campo.corregido });

const normal = (s: string) => s.trim().toLowerCase();

/**
 * Pone lo extraído sobre lo que ya hay. Nunca borra ni pisa en silencio: lo no mencionado se
 * queda como estaba, y si el dato nuevo choca con el anterior, queda marcado para revisar.
 */
function mezclar<K extends string>(grupo: Grupo<K>, defs: DefCampo<K>[], datos: Partial<Record<K, string>>, origen: 'ia' | 'editado'): Grupo<K> {
  const nuevo = { ...grupo };
  for (const { id } of defs) {
    const valor = datos[id]?.trim();
    if (!valor) continue;
    const actual = grupo[id];
    if (!actual.valor.trim()) nuevo[id] = { valor, estado: origen };
    else if (normal(actual.valor) !== normal(valor)) nuevo[id] = { valor, estado: 'revisar', nota: `Antes decía: ${actual.valor}` };
  }
  return nuevo;
}

function mezclarFilas<K extends string>(
  filas: Fila<K>[],
  defs: DefCampo<K>[],
  datos: Partial<Record<K, string>>[],
  vacia: () => Fila<K>,
  misma: (fila: Fila<K>, dato: Partial<Record<K, string>>) => boolean,
  origen: 'ia' | 'editado',
) {
  const resultado = [...filas];
  for (const dato of datos) {
    const i = resultado.findIndex((f) => misma(f, dato));
    if (i >= 0) {
      resultado[i] = { ...resultado[i], campos: mezclar(resultado[i].campos, defs, dato, origen) };
    } else {
      const fila = vacia();
      resultado.push({ ...fila, campos: mezclar(fila.campos, defs, dato, origen) });
    }
  }
  return resultado;
}

const coincide = (a: string | undefined, b: string | undefined) => !!a?.trim() && !!b?.trim() && normal(a) === normal(b);

export function combinarDatos(ficha: FichaFamiliar, datos: DatosFicha, origen: 'ia' | 'editado'): FichaFamiliar {
  return {
    identificacion: mezclar(ficha.identificacion, CAMPOS_IDENTIFICACION, datos.identificacion ?? {}, origen),
    hogar: mezclar(ficha.hogar, CAMPOS_HOGAR, datos.hogar ?? {}, origen),
    integrantes: mezclarFilas(ficha.integrantes, CAMPOS_INTEGRANTE, datos.integrantes ?? [], integranteVacio, ({ campos }, d) =>
      coincide(campos.documento.valor, d.documento)
      || (coincide(campos.nombres.valor, d.nombres) && coincide(campos.apellidos.valor, d.apellidos)), origen),
    visitas: mezclarFilas(ficha.visitas, CAMPOS_VISITA, datos.visitas ?? [], visitaVacia, ({ campos }, d) =>
      coincide(campos.fecha.valor, d.fecha), origen),
  };
}

/** Cómo llamar a una ficha en una lista. */
export const nombreFicha = (ficha: FichaFamiliar) => ficha.identificacion.numeroFamilia.valor.trim();
export const lugarFicha = (ficha: FichaFamiliar) =>
  [ficha.hogar.localidad.valor, ficha.hogar.distrito.valor].map((s) => s.trim()).filter(Boolean).join(', ');
