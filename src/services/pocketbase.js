const origen = (import.meta.env.VITE_POCKETBASE_URL ?? '').trim().replace(/\/+$/, '');

async function solicitar(ruta, { metodo = 'GET', datos, signal } = {}) {
  const enviarJson = datos !== undefined && !(datos instanceof FormData);
  let respuesta;

  try {
    respuesta = await fetch(`${origen}/api${ruta}`, {
      method: metodo,
      headers: enviarJson ? { 'Content-Type': 'application/json' } : undefined,
      body: enviarJson ? JSON.stringify(datos) : datos,
      signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo conectar con PocketBase. Comprueba que el servidor esté en ejecución.');
  }

  const resultado = await respuesta.json().catch(() => null);
  if (!respuesta.ok || resultado === null) {
    const detalle = Object.values(resultado?.data ?? {}).find((campo) => campo?.message)?.message;
    const mensaje = respuesta.status >= 500
      ? 'PocketBase no está disponible en este momento. Comprueba el estado del servidor.'
      : detalle || resultado?.message || 'PocketBase devolvió una respuesta inesperada.';
    const error = new Error(mensaje);
    error.estado = respuesta.status;
    throw error;
  }
  return resultado;
}

async function listarColeccion(coleccion, filtros, signal) {
  const registros = [];
  let pagina = 1;
  let totalPaginas;
  do {
    const parametros = new URLSearchParams({ perPage: '100', page: String(pagina), ...filtros });
    const resultado = await solicitar(`/collections/${coleccion}/records?${parametros}`, { signal });
    registros.push(...resultado.items);
    totalPaginas = resultado.totalPages;
    pagina += 1;
  } while (pagina <= totalPaginas);
  return registros;
}

export function listarOrdenes(_, signal) {
  return listarColeccion('ordenes', { sort: '-created,-id', expand: 'cliente' }, signal);
}

export function listarClientes(_, signal) {
  return listarColeccion('clientes', { sort: 'nombre,id' }, signal);
}

export function buscarOrden(id, signal) {
  return solicitar(`/taller/ordenes/${encodeURIComponent(id)}`, { signal });
}

export function registrarRecepcion(datos, signal) {
  return solicitar('/taller/recepciones', { metodo: 'POST', datos, signal });
}

export function actualizarOrden(id, datos, signal) {
  return solicitar(`/collections/ordenes/records/${encodeURIComponent(id)}`, {
    metodo: 'PATCH', datos, signal,
  });
}

export function urlFoto(orden, archivo) {
  return `${origen}/api/files/${encodeURIComponent(orden.collectionId)}/${encodeURIComponent(orden.id)}/${encodeURIComponent(archivo)}`;
}
