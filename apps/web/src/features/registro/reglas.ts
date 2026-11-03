import { SEXOS, type Campo, type FichaFamiliar, type Grupo, type IdIntegrante, type IdVisita, type Seccion } from './ficha';

/**
 * Validación determinista, sin IA: señala lo que no puede estar bien. No decide nada clínico,
 * y un dato vacío nunca es un error: lo no mencionado se deja vacío.
 */

export const hoyISO = () => new Date().toLocaleDateString('en-CA');

export const claveCampo = (seccion: Seccion, id: string, filaId?: string) => [seccion, filaId, id].filter(Boolean).join('.');

/** Por qué está mal cada campo, por clave de campo. */
export type Hallazgos = Record<string, string>;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const fechaValida = (v: string) => ISO.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v);

function revisarFecha(valor: string, hoy: string, { futura }: { futura: boolean }) {
  if (!fechaValida(valor)) return 'Escríbela como AAAA-MM-DD.';
  if (!futura && valor > hoy) return 'Esta fecha todavía no ha llegado.';
  return null;
}

/** Años cumplidos a `hoy`. */
function anios(nacimiento: string, hoy: string) {
  const edad = Number(hoy.slice(0, 4)) - Number(nacimiento.slice(0, 4));
  return hoy.slice(5) < nacimiento.slice(5) ? edad - 1 : edad;
}

function revisarIntegrante(g: Grupo<IdIntegrante>, hoy: string, anotar: (id: IdIntegrante, nota: string) => void) {
  const nacimiento = g.fechaNacimiento.valor.trim();
  if (nacimiento) {
    const nota = revisarFecha(nacimiento, hoy, { futura: false });
    if (nota) anotar('fechaNacimiento', nota);
  }
  const edad = g.edad.valor.trim();
  if (edad) {
    // Los lactantes se registran en meses o días; solo se compara con la fecha lo que va en años.
    const partes = /^(\d{1,3})(?:\s*(años?|mes(?:es)?|d[ií]as?))?$/i.exec(edad);
    if (!partes || Number(partes[1]) > 130) anotar('edad', 'Escribe un número, por ejemplo 34 o «8 meses».');
    else if ((!partes[2] || partes[2].toLowerCase().startsWith('a')) && nacimiento && fechaValida(nacimiento) && nacimiento <= hoy
      && Math.abs(anios(nacimiento, hoy) - Number(partes[1])) > 1) {
      anotar('edad', `No coincide con la fecha de nacimiento (daría ${anios(nacimiento, hoy)} años).`);
    }
  }
  const sexo = g.sexo.valor.trim();
  if (sexo && !(SEXOS as readonly string[]).includes(sexo)) anotar('sexo', 'Elige F, M o No especificado.');
}

function revisarVisita(g: Grupo<IdVisita>, hoy: string, anotar: (id: IdVisita, nota: string) => void) {
  const fecha = g.fecha.valor.trim(), proxima = g.proximaVisita.valor.trim();
  if (fecha) {
    const nota = revisarFecha(fecha, hoy, { futura: false });
    if (nota) anotar('fecha', nota);
  }
  if (proxima) {
    const nota = revisarFecha(proxima, hoy, { futura: true });
    if (nota) anotar('proximaVisita', nota);
    else if (fecha && fechaValida(fecha) && proxima <= fecha) anotar('proximaVisita', 'Tiene que ser después de la fecha de visita.');
  }
}

export function revisarFicha(ficha: FichaFamiliar, hoy = hoyISO()): Hallazgos {
  const hallazgos: Hallazgos = {};
  const telefono = ficha.hogar.telefono.valor.trim(), correo = ficha.hogar.correo.valor.trim();
  if (telefono && !/^\+?[\d\s-]{6,20}$/.test(telefono)) hallazgos[claveCampo('hogar', 'telefono')] = 'Revisa el número: solo dígitos, de 6 a 15.';
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) hallazgos[claveCampo('hogar', 'correo')] = 'No parece un correo, por ejemplo nombre@ejemplo.com.';
  for (const { id, campos } of ficha.integrantes) {
    revisarIntegrante(campos, hoy, (campo, nota) => { hallazgos[claveCampo('integrantes', campo, id)] = nota; });
  }
  for (const { id, campos } of ficha.visitas) {
    revisarVisita(campos, hoy, (campo, nota) => { hallazgos[claveCampo('visitas', campo, id)] = nota; });
  }
  return hallazgos;
}

export type Resumen = { faltan: number; revisar: number };

function contar(grupo: Record<string, Campo>, hallazgos: Hallazgos, seccion: Seccion, filaId?: string): Resumen {
  const resumen: Resumen = { faltan: 0, revisar: 0 };
  for (const [id, campo] of Object.entries(grupo)) {
    if (campo.estado === 'revisar' || hallazgos[claveCampo(seccion, id, filaId)]) resumen.revisar++;
    if (!campo.valor.trim()) resumen.faltan++;
  }
  return resumen;
}

const sumar = (a: Resumen, b: Resumen): Resumen => ({ faltan: a.faltan + b.faltan, revisar: a.revisar + b.revisar });

/** Cuánto falta y cuánto hay por revisar en cada sección. Una sección de filas sin filas también falta. */
export function resumirSecciones(ficha: FichaFamiliar, hallazgos: Hallazgos): Record<Seccion, Resumen> {
  const filas = (seccion: 'integrantes' | 'visitas'): Resumen => {
    const lista = ficha[seccion];
    if (!lista.length) return { faltan: 1, revisar: 0 };
    return lista.map(({ id, campos }) => contar(campos, hallazgos, seccion, id)).reduce(sumar);
  };
  return {
    identificacion: contar(ficha.identificacion, hallazgos, 'identificacion'),
    hogar: contar(ficha.hogar, hallazgos, 'hogar'),
    integrantes: filas('integrantes'),
    visitas: filas('visitas'),
  };
}

/** Lo que impide confirmar. Los demás faltantes se resaltan pero no bloquean: una entrevista puede no cubrirlo todo. */
export function bloqueosConfirmar(ficha: FichaFamiliar, hallazgos: Hallazgos): string[] {
  const bloqueos: string[] = [];
  if (!ficha.identificacion.numeroFamilia.valor.trim()) bloqueos.push('Falta el número de familia.');
  const revisar = Object.values(resumirSecciones(ficha, hallazgos)).reduce((total, r) => total + r.revisar, 0);
  if (revisar) bloqueos.push(revisar === 1 ? 'Hay 1 dato por revisar.' : `Hay ${revisar} datos por revisar.`);
  return bloqueos;
}
