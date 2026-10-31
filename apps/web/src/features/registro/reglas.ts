import type { CampoId, Ficha } from './ficha';

/**
 * Validación y prioridad: código determinista, sin IA, como pide el principio del proyecto.
 * LOS UMBRALES SON DE EJEMPLO y no están validados clínicamente. Los definitivos irán en `rules/`.
 */

const RANGOS: Partial<Record<CampoId, { min: number; max: number; nombre: string }>> = {
  fc: { min: 30, max: 220, nombre: 'La frecuencia cardiaca' },
  temperatura: { min: 34, max: 43, nombre: 'La temperatura' },
  saturacion: { min: 50, max: 100, nombre: 'La saturación' },
};

const numero = (valor: string) => Number(valor.replace(',', '.').trim());

const presion = (valor: string) => {
  const m = /^(\d{2,3})\s*\/\s*(\d{2,3})$/.exec(valor.trim());
  return m ? { sistolica: Number(m[1]), diastolica: Number(m[2]) } : null;
};

/** Qué tiene de raro el valor de un campo; `null` si está bien. */
export function validar(id: CampoId, valor: string): string | null {
  if (!valor.trim()) return null;
  if (id === 'presion') {
    const p = presion(valor);
    if (!p) return 'Escríbela como sistólica/diastólica, por ejemplo 120/80.';
    if (p.sistolica < 60 || p.sistolica > 260 || p.diastolica < 30 || p.diastolica > 150 || p.diastolica >= p.sistolica) {
      return 'Esta presión no parece posible.';
    }
    return null;
  }
  const rango = RANGOS[id];
  if (!rango) return null;
  const n = numero(valor);
  if (Number.isNaN(n)) return 'Tiene que ser un número.';
  if (n < rango.min || n > rango.max) return `${rango.nombre} está fuera de lo posible (${rango.min} a ${rango.max}).`;
  return null;
}

export type Prioridad = 'alta' | 'media' | 'baja';
export type Resultado = { prioridad: Prioridad; motivo: string };

/** La prioridad y su motivo; `null` mientras falte algún signo vital válido. */
export function prioridadDe(ficha: Ficha): Resultado | null {
  const p = presion(ficha.presion.valor);
  const fc = numero(ficha.fc.valor), temperatura = numero(ficha.temperatura.valor), saturacion = numero(ficha.saturacion.valor);
  const vitales: CampoId[] = ['presion', 'fc', 'temperatura', 'saturacion'];
  if (!p || vitales.some((id) => !ficha[id].valor.trim() || validar(id, ficha[id].valor))) return null;

  const alta: string[] = [], media: string[] = [];
  const texto = `${p.sistolica}/${p.diastolica}`;
  if (saturacion < 90) alta.push(`Saturación de ${saturacion} %`);
  else if (saturacion < 94) media.push(`Saturación de ${saturacion} %`);
  if (p.sistolica >= 180 || p.diastolica >= 120) alta.push(`Presión de ${texto}`);
  else if (p.sistolica >= 140 || p.diastolica >= 90) media.push(`Presión de ${texto}`);
  if (temperatura >= 39) media.push(`Temperatura de ${temperatura} °C`);
  if (fc > 120 || fc < 50) media.push(`Frecuencia cardiaca de ${fc} lpm`);

  if (alta.length) return { prioridad: 'alta', motivo: alta.join(' · ') };
  if (media.length) return { prioridad: 'media', motivo: media.join(' · ') };
  return { prioridad: 'baja', motivo: 'Signos en rango' };
}
