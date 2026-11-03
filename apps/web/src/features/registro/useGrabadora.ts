import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoGrabadora = 'inactiva' | 'pidiendo' | 'grabando';
export type ErrorGrabadora = 'inseguro' | 'no_soportado' | 'permiso' | 'sin_microfono' | 'fallo';

const FORMATOS: [tipo: string, extension: string][] = [
  ['audio/webm;codecs=opus', 'webm'],
  ['audio/mp4', 'm4a'],
  ['audio/webm', 'webm'],
  ['audio/ogg;codecs=opus', 'ogg'],
];

/** Graba del micrófono. El navegador solo lo permite en HTTPS o en localhost (`inseguro`). */
export function useGrabadora(alTerminar: (audio: Blob, nombre: string) => void) {
  const [estado, setEstado] = useState<EstadoGrabadora>('inactiva');
  const [error, setError] = useState<ErrorGrabadora | null>(null);
  const [segundos, setSegundos] = useState(0);
  const grabadora = useRef<MediaRecorder | null>(null);
  const reloj = useRef<number | undefined>(undefined);
  const pantalla = useRef<WakeLockSentinel | null>(null);
  const terminar = useRef(alTerminar);
  useEffect(() => { terminar.current = alTerminar; });

  // Mantiene la pantalla encendida: en Android, al apagarse, la grabación se detiene.
  const pedirPantalla = useCallback(async () => {
    try { pantalla.current = (await navigator.wakeLock?.request('screen')) ?? null; } catch { /* Sin este permiso, igual se graba. */ }
  }, []);

  const soltarPantalla = useCallback(() => {
    pantalla.current?.release().catch(() => {});
    pantalla.current = null;
  }, []);

  const iniciar = useCallback(async () => {
    setError(null);
    if (!window.isSecureContext) { setError('inseguro'); return; }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('no_soportado'); return; }
    setEstado('pidiendo');
    let flujo: MediaStream;
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      const nombre = e instanceof DOMException ? e.name : '';
      setError(nombre === 'NotAllowedError' ? 'permiso' : nombre === 'NotFoundError' ? 'sin_microfono' : 'fallo');
      setEstado('inactiva');
      return;
    }
    const formato = FORMATOS.find(([tipo]) => MediaRecorder.isTypeSupported(tipo));
    const r = new MediaRecorder(flujo, formato ? { mimeType: formato[0] } : undefined);
    const trozos: Blob[] = [];
    r.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); };
    r.onerror = () => setError('fallo');
    r.onstop = () => {
      clearInterval(reloj.current);
      flujo.getTracks().forEach((t) => t.stop());
      soltarPantalla();
      grabadora.current = null;
      setEstado('inactiva');
      const audio = new Blob(trozos, { type: r.mimeType });
      if (!audio.size) { setError('fallo'); return; }
      terminar.current(audio, `entrevista-${new Date().toISOString().replace(/[:.]/g, '-')}.${formato?.[1] ?? 'webm'}`);
    };
    grabadora.current = r;
    r.start(1000);
    const inicio = Date.now();
    setSegundos(0);
    reloj.current = window.setInterval(() => setSegundos(Math.floor((Date.now() - inicio) / 1000)), 500);
    setEstado('grabando');
    pedirPantalla();
  }, [pedirPantalla, soltarPantalla]);

  const detener = useCallback(() => { grabadora.current?.stop(); }, []);

  // El bloqueo de pantalla se pierde al cambiar de app: se recupera al volver.
  useEffect(() => {
    const alVolver = () => { if (document.visibilityState === 'visible' && grabadora.current) pedirPantalla(); };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      if (grabadora.current?.state === 'recording') grabadora.current.stop();
    };
  }, [pedirPantalla]);

  return { estado, error, segundos, iniciar, detener };
}
