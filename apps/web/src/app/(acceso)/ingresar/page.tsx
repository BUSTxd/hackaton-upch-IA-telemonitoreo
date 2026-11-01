import type { Metadata } from 'next';
import Link from 'next/link';
import Mascota from '@/components/mascota/Mascota';
import { ASISTENTE } from '@/config/marca';
import { INGRESO } from '@/features/acceso/contenido';
import FormularioIngreso from '@/features/acceso/FormularioIngreso';

export const metadata: Metadata = { title: `Ingresar · ${ASISTENTE}` };

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-linea bg-white p-6 sm:p-8">
        <div className="mx-auto size-24 [--dot-cuerpo:#fff] drop-shadow-[0_8px_14px_rgb(15_31_61/0.18)]">
          <Mascota guion="vivo" detalle={1} pausado={false} cls="block h-full w-full" />
        </div>
        <h1 className="mt-4 mb-6 text-center text-2xl font-semibold tracking-tight text-tinta">{INGRESO.titulo}</h1>
        <FormularioIngreso />
        <p className="mt-5 text-sm text-suave">{INGRESO.aviso}</p>
        <p className="mt-2 text-sm text-suave">{INGRESO.demo}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-acento hover:underline">{INGRESO.volver}</Link>
      </div>
    </main>
  );
}
