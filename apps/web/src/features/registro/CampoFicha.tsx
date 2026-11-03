import { FICHA } from './contenido';
import { aceptarCampo, editarCampo, type Campo, type DefCampo, type Grupo, type Seccion } from './ficha';
import { claveCampo, type Hallazgos } from './reglas';

const ENTRADA = 'mt-1 block min-h-12 w-full rounded-lg border px-3 py-2.5 text-base text-tinta outline-none transition-colors placeholder:text-suave/60 focus:border-acento';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Un campo de la ficha: dice de dónde viene el dato (IA o persona), si falta y si hay que revisarlo. */
export function CampoFicha({ def, campo, nota, htmlId, alCambiar, alAceptar }: {
  def: DefCampo;
  campo: Campo;
  /** Lo que encontró la validación. */
  nota?: string;
  htmlId: string;
  alCambiar: (valor: string) => void;
  alAceptar: () => void;
}) {
  const aviso = nota ?? campo.nota;
  const revisar = !!nota || campo.estado === 'revisar';
  const falta = !campo.valor.trim();
  const borde = revisar ? 'border-prioridad-alta bg-prioridad-alta/5'
    : falta ? 'border-dashed border-prioridad-media'
    : campo.estado === 'ia' ? 'border-acento/50 bg-acento/5'
    : 'border-linea bg-white';
  const comun = {
    id: htmlId,
    value: campo.valor,
    autoComplete: 'off',
    'aria-invalid': revisar,
    'aria-describedby': aviso ? `${htmlId}-nota` : undefined,
    className: `${ENTRADA} ${borde}`,
  };

  let entrada;
  if (def.tipo === 'opciones') {
    // Si la IA trajo algo que no está en la lista, se muestra igual para poder corregirlo.
    const opciones = def.opciones ?? [];
    entrada = (
      <select {...comun} onChange={(e) => alCambiar(e.target.value)}>
        <option value="">{FICHA.vacio}</option>
        {campo.valor && !opciones.includes(campo.valor) && <option value={campo.valor}>{campo.valor}</option>}
        {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (def.tipo === 'largo') {
    entrada = <textarea {...comun} rows={2} onChange={(e) => alCambiar(e.target.value)} />;
  } else {
    // Una fecha dictada que no está en AAAA-MM-DD se muestra como texto: el selector de fecha la escondería.
    const tipo = def.tipo === 'fecha' ? (falta || ISO.test(campo.valor) ? 'date' : 'text')
      : def.tipo === 'correo' ? 'email' : def.tipo === 'telefono' ? 'tel' : 'text';
    const modo = def.tipo === 'numero' ? 'numeric' : def.tipo === 'telefono' ? 'tel' : undefined;
    entrada = <input {...comun} type={tipo} inputMode={modo} onChange={(e) => alCambiar(e.target.value)} />;
  }

  return (
    <div className={def.medio ? undefined : 'col-span-2'}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <label htmlFor={htmlId} className="text-sm font-medium text-tinta">{def.etiqueta}</label>
        <span className="flex gap-1">
          {revisar && <Etiqueta clase="bg-prioridad-alta text-white">{FICHA.revisar}</Etiqueta>}
          {!revisar && campo.estado === 'ia' && <Etiqueta clase="bg-acento/10 text-acento">{FICHA.ia}</Etiqueta>}
          {falta && <Etiqueta clase="bg-prioridad-media/20 text-tinta">{FICHA.falta}</Etiqueta>}
        </span>
      </div>
      {entrada}
      {aviso && (
        <p id={`${htmlId}-nota`} className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-prioridad-alta">
          <span>{aviso}</span>
          {/* Lo marcado por un choque con el dato anterior puede estar bien: se acepta sin reescribirlo. */}
          {!nota && campo.estado === 'revisar' && (
            <button type="button" onClick={alAceptar} className="min-h-10 cursor-pointer font-semibold underline">{FICHA.aceptar}</button>
          )}
        </p>
      )}
      {campo.corregido && campo.estado === 'editado' && <p className="mt-1 text-xs text-suave">{FICHA.corregido}</p>}
    </div>
  );
}

const Etiqueta = ({ clase, children }: { clase: string; children: string }) => (
  <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${clase}`}>{children}</span>
);

/** Los campos de un grupo (una sección, un integrante o una visita), de dos en dos los cortos. */
export function GrupoCampos<K extends string>({ defs, grupo, seccion, filaId, hallazgos, alEditar }: {
  defs: DefCampo<K>[];
  grupo: Grupo<K>;
  seccion: Seccion;
  filaId?: string;
  hallazgos: Hallazgos;
  alEditar: (id: K, cambio: (c: Campo) => Campo) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      {defs.map((def) => {
        const clave = claveCampo(seccion, def.id, filaId);
        return (
          <CampoFicha
            key={def.id}
            def={def}
            campo={grupo[def.id]}
            nota={hallazgos[clave]}
            htmlId={`campo-${clave}`}
            alCambiar={(valor) => alEditar(def.id, (c) => editarCampo(c, valor))}
            alAceptar={() => alEditar(def.id, aceptarCampo)}
          />
        );
      })}
    </div>
  );
}
