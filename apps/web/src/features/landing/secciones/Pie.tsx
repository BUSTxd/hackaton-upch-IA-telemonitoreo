import s from '../antesala/antesala.module.css';
import { PIE } from '../contenido';

export default function Pie() {
  return (
    <footer className={`${s.entra} mt-auto border-t border-linea bg-white`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-suave md:flex-row md:justify-between">
        <p>{PIE.evento} · {PIE.equipo.join(' · ')}</p>
        <p>{PIE.aviso}</p>
      </div>
    </footer>
  );
}
