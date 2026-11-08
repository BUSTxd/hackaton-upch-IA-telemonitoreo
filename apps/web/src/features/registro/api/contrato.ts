import type {
  DatosFicha,
  FichaFamiliar,
  IdIntegrante,
  IdVisita,
} from '../ficha';

export const CONTRATO_DISPONIBLE = true;
export const CAMPO_AUDIO = 'file';

type Objeto = Record<string, unknown>;

const objeto = (valor: unknown): Objeto =>
  valor !== null && typeof valor === 'object' && !Array.isArray(valor)
    ? valor as Objeto
    : {};

const texto = (valor: unknown): string | undefined => {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number') return String(valor);
  return undefined;
};

const lista = (valor: unknown): unknown[] =>
  Array.isArray(valor) ? valor : [];

const compactar = <T extends Objeto>(datos: T): T =>
  Object.fromEntries(
    Object.entries(datos).filter(([, valor]) => valor !== undefined),
  ) as T;

/** Convierte el FamilyRecord del backend al formato de la ficha de Fernando. */
function recordADatosFicha(json: unknown): DatosFicha {
  const record = objeto(json);
  const hogar = objeto(record.household);

  const identificacion = compactar({
    numeroFamilia: texto(record.family_number),
    redSalud: texto(record.health_network),
    establecimiento: texto(record.health_establishment),
    informantes: Array.isArray(record.informants)
      ? record.informants.map(texto).filter(Boolean).join(', ')
      : texto(record.informants),
  });

  const datosHogar = compactar({
    departamentoProvincia: texto(hogar.province),
    distrito: texto(hogar.district),
    localidad: texto(hogar.locality),
    sector: texto(hogar.sector),
    areaResidencia: texto(hogar.residential_area),
    direccion: texto(hogar.address),
    tiempoResidencia: texto(hogar.residence_time),
    residenciasAnteriores: texto(hogar.previous_residences),
    tiempoTraslado: texto(hogar.travel_time_to_health_center),
    medioTransporte: texto(hogar.usual_transport),
    telefono: texto(hogar.phone),
    correo: texto(hogar.email),
  });

  const integrantes: Partial<Record<IdIntegrante, string>>[] =
    lista(record.members).map((item) => {
      const miembro = objeto(item);

      return compactar({
        nombres: texto(miembro.first_names),
        apellidos: texto(miembro.surnames),
        documento: texto(miembro.document_number),
        fechaNacimiento: texto(miembro.birth_date),
        edad: texto(miembro.age_years),
        sexo: miembro.sex === 'no_especificado'
          ? 'No especificado'
          : texto(miembro.sex),
        parentesco: texto(miembro.relationship),
        estadoCivil: texto(miembro.marital_status),
        nivelEducativo: texto(miembro.education_level),
        condicionOcupacional: texto(miembro.occupation_condition),
        seguroSalud: texto(miembro.health_insurance),
      });
    });

  const visitas: Partial<Record<IdVisita, string>>[] =
    lista(record.visits).map((item) => {
      const visita = objeto(item);

      return compactar({
        fecha: texto(visita.visit_date),
        responsable: texto(visita.responsible_person),
        resultado: texto(visita.result),
        proximaVisita: texto(visita.next_visit_date),
      });
    });

  return {
    identificacion,
    hogar: datosHogar,
    integrantes,
    visitas,
  };
}

/** Respuesta de POST /audio/process. */
export function respuestaDeProceso(json: unknown): {
  transcripcion?: string;
  datos: DatosFicha;
} {
  const respuesta = objeto(json);

  if (!respuesta.record || typeof respuesta.record !== 'object') {
    throw new Error('La respuesta no contiene record');
  }

  return {
    transcripcion: texto(respuesta.transcription),
    datos: recordADatosFicha(respuesta.record),
  };
}

const valor = (campo: { valor: string }): string | null =>
  campo.valor.trim() || null;

const edadComoNumero = (campo: { valor: string }): number | null => {
  const numero = Number(campo.valor.trim());
  return campo.valor.trim() && Number.isInteger(numero) && numero >= 0
    ? numero
    : null;
};

/** Convierte la ficha de Fernando al esquema FamilyRecord del backend. */
export function fichaAPayload(ficha: FichaFamiliar): unknown {
  const id = ficha.identificacion;
  const hogar = ficha.hogar;

  return {
    family_number: valor(id.numeroFamilia),
    health_network: valor(id.redSalud),
    health_establishment: valor(id.establecimiento),
    informants: id.informantes.valor
      .split(/[,;\n]/)
      .map((nombre) => nombre.trim())
      .filter(Boolean),

    household: {
      province: valor(hogar.departamentoProvincia),
      district: valor(hogar.distrito),
      locality: valor(hogar.localidad),
      sector: valor(hogar.sector),
      residential_area: valor(hogar.areaResidencia),
      address: valor(hogar.direccion),
      residence_time: valor(hogar.tiempoResidencia),
      previous_residences: valor(hogar.residenciasAnteriores),
      travel_time_to_health_center: valor(hogar.tiempoTraslado),
      usual_transport: valor(hogar.medioTransporte),
      phone: valor(hogar.telefono),
      email: valor(hogar.correo),
    },

    members: ficha.integrantes.map(({ campos }) => ({
      first_names: valor(campos.nombres),
      surnames: valor(campos.apellidos),
      document_number: valor(campos.documento),
      birth_date: valor(campos.fechaNacimiento),
      age_years: edadComoNumero(campos.edad),
      sex: campos.sexo.valor === 'No especificado'
        ? 'no_especificado'
        : campos.sexo.valor || null,
      relationship: valor(campos.parentesco),
      marital_status: valor(campos.estadoCivil),
      education_level: valor(campos.nivelEducativo),
      occupation_condition: valor(campos.condicionOcupacional),
      health_insurance: valor(campos.seguroSalud),
    })),

    visits: ficha.visitas.map(({ campos }) => ({
      visit_date: valor(campos.fecha),
      responsible_person: valor(campos.responsable),
      result: valor(campos.resultado),
      next_visit_date: valor(campos.proximaVisita),
    })),
  };
}

/** Respuesta de POST /records. */
export function idDeRegistro(json: unknown): string {
  const id = texto(objeto(json).id);

  if (!id) throw new Error('La respuesta no contiene el ID del registro');

  return id;
}

/** Respuesta de GET /records/{record_id}. */
export function respuestaARegistro(json: unknown): DatosFicha {
  const respuesta = objeto(json);

  if (!respuesta.data || typeof respuesta.data !== 'object') {
    throw new Error('La respuesta no contiene data');
  }

  return recordADatosFicha(respuesta.data);
}