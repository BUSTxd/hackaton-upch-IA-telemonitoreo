'use client';
import { useRouter } from 'next/navigation';
import { DEMO, INGRESO } from './contenido';

const CAMPO = 'mt-1 w-full rounded-lg border border-linea px-3 py-2.5 text-tinta outline-none focus:border-acento';

/** Solo la apariencia del ingreso: no comprueba nada y pasa directo a la pantalla de trabajo. */
export default function FormularioIngreso() {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push('/registro'); }}
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor="correo" className="text-sm font-medium text-tinta">{INGRESO.correo}</label>
        <input id="correo" type="email" required defaultValue={DEMO.correo} autoComplete="off" className={CAMPO} />
      </div>
      <div>
        <label htmlFor="contrasena" className="text-sm font-medium text-tinta">{INGRESO.contrasena}</label>
        <input id="contrasena" type="password" required defaultValue={DEMO.contrasena} autoComplete="off" className={CAMPO} />
      </div>
      <button
        type="submit"
        className="mt-1 cursor-pointer rounded-full bg-acento px-6 py-3 font-medium text-white transition-colors hover:bg-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        {INGRESO.entrar}
      </button>
    </form>
  );
}
