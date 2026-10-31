'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { ASISTENTE } from '@/config/marca';
import { AVISO_DEMO, AVISO_DEMO_CORTO, BARRA } from './contenido';
import { CENTRO } from './demo';
import FichaPaciente from './FichaPaciente';
import ListaPacientes from './ListaPacientes';
import PanelVoz from './PanelVoz';
import { useRegistro } from './useRegistro';

/** La pantalla de trabajo: pacientes a un lado, dictado al centro y la ficha que se va llenando. */
export default function EspacioRegistro() {
  const r = useRegistro();

  // Al pasar a otro paciente (también al guardar) se vuelve arriba: en el teléfono la ficha es larga.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [r.activo]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-linea bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-semibold text-tinta">{ASISTENTE}</p>
          <p className="truncate text-sm text-suave">{CENTRO}</p>
        </div>
        <Link href="/ingresar" className="shrink-0 text-sm font-medium text-acento hover:underline">{BARRA.salir}</Link>
      </header>
      <p className="border-b border-linea bg-prioridad-media/10 px-4 py-2 text-sm text-tinta sm:px-6">
        <span className="sm:hidden">{AVISO_DEMO_CORTO}</span>
        <span className="hidden sm:inline">{AVISO_DEMO}</span>
      </p>
      {/* En columna y no en rejilla hasta lg: dentro de una rejilla, la barra de dictado no se quedaría fija. */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)_400px] lg:items-start">
        <ListaPacientes pacientes={r.pacientes} activo={r.activo} alElegir={r.seleccionar} />
        <PanelVoz
          ficha={r.ficha}
          dictando={r.dictando}
          transcripcion={r.transcripcion}
          orden={r.orden}
          alDictar={r.dictar}
          alDetener={r.detener}
        />
        <FichaPaciente ficha={r.ficha} guardado={r.guardado} alEditar={r.editar} alGuardar={r.guardar} />
      </main>
    </div>
  );
}
