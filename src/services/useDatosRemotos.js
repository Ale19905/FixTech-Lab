import { useEffect, useState } from 'react';

export function useDatosRemotos(cargar, identificador) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [revision, setRevision] = useState(0);

  function recargar() {
    setRevision((actual) => actual + 1);
  }

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    cargar(identificador, controlador.signal)
      .then((resultado) => {
        if (!controlador.signal.aborted) setDatos(resultado);
      })
      .catch((fallo) => {
        if (!controlador.signal.aborted) setError(fallo);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [cargar, identificador, revision]);

  useEffect(() => {
    function alVolver() {
      if (document.visibilityState === 'visible') setRevision((actual) => actual + 1);
    }
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, []);

  return { datos, error, cargando, recargar };
}
