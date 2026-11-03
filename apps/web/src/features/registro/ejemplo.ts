import type { Borrador } from './almacen';
import { combinarDatos, fichaVacia, type DatosFicha } from './ficha';

/**
 * SOLO EN DESARROLLO: una extracción inventada para ver la pantalla de revisión sin backend.
 * Familia y personas ficticias. Lleva errores a propósito (edad, teléfono, sexo) y campos sin
 * mencionar, para ver cómo se marcan. Nunca se guarda: la pantalla lo abre sin persistir.
 */

const TRANSCRIPCION = 'Buenos días, venimos del centro de salud. ¿Me dice su número de familia? Es el cero cero cuarenta y dos. '
  + 'Vivimos en el sector tres, en la calle Los Ejemplos ciento veinte. Llevamos como cinco años aquí. Al centro llegamos en mototaxi, '
  + 'unos quince minutos. Mi teléfono es nueve ocho siete seis cinco. En la casa estamos yo, Ana Prueba Ficticia, nací el doce de marzo '
  + 'del noventa, tengo veinte años, y mi hijo Luis, de ocho meses.';

const DATOS: DatosFicha = {
  identificacion: { numeroFamilia: '0042', informantes: 'Ana Prueba Ficticia' },
  hogar: {
    sector: 'Sector 3',
    direccion: 'Calle Los Ejemplos 120',
    tiempoResidencia: '5 años',
    tiempoTraslado: '15 minutos',
    medioTransporte: 'Mototaxi',
    telefono: '98765',
  },
  integrantes: [
    { nombres: 'Ana', apellidos: 'Prueba Ficticia', fechaNacimiento: '1990-03-12', edad: '20', sexo: 'Femenino', parentesco: 'Jefa de hogar' },
    { nombres: 'Luis', apellidos: 'Prueba Ficticia', edad: '8 meses', sexo: 'M', parentesco: 'Hijo' },
  ],
};

export const borradorEjemplo = (): Borrador => ({
  id: 'ejemplo',
  estado: 'pendiente_revision',
  paso: 'revision',
  ficha: combinarDatos(fichaVacia(), DATOS, 'ia'),
  transcripcion: TRANSCRIPCION,
  actualizado: Date.now(),
});
