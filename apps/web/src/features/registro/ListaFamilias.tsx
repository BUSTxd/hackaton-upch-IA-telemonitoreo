import Link from 'next/link';
import type { EntradaFamilia } from './acciones';
import { fechaCorta, HISTORIAL } from './contenido';
import { EstadoChip } from './ui';

export default function ListaFamilias({ familias }: { familias: EntradaFamilia[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {familias.map((f) => (
        <li key={f.id}>
          <Link
            href={`/registro/ficha?id=${encodeURIComponent(f.id)}`}
            className="flex min-h-16 flex-col gap-1 rounded-2xl border border-linea bg-white px-4 py-3 transition-colors hover:border-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate font-semibold text-tinta">{f.numero ? `Familia ${f.numero}` : HISTORIAL.sinNumero}</span>
              <EstadoChip estado={f.estado} />
            </span>
            <span className="text-sm text-suave">
              {[f.lugar, HISTORIAL.integrantes(f.integrantes), fechaCorta(f.actualizado)].filter(Boolean).join(' · ')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
