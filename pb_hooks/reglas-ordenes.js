const cambiosPermitidos = {
  solicitada: ['en_diagnostico', 'cancelada'],
  en_diagnostico: ['presupuestada'],
  presupuestada: ['aprobada', 'rechazada'],
  aprobada: ['en_reparacion'],
  en_reparacion: ['lista'],
  lista: ['entregada'],
  entregada: [],
  rechazada: [],
  cancelada: [],
};

function leerPiezas(orden) {
  const valor = orden.getString('piezas');
  return valor ? JSON.parse(valor) : null;
}

function presupuestoDe(orden) {
  return {
    diagnostico: orden.getString('diagnostico'),
    manoObra: orden.getFloat('manoObra'),
    piezas: leerPiezas(orden),
  };
}

function datosDe(orden) {
  return JSON.stringify([
    orden.getString('updated'),
    orden.getString('estado'),
    orden.getString('cliente'),
    orden.getString('equipo'),
    orden.getString('problema'),
    orden.getStringSlice('fotos'),
    presupuestoDe(orden),
  ]);
}

function limpiarRecepcion(orden) {
  for (const campo of ['equipo', 'problema']) {
    orden.set(campo, orden.getString(campo).trim());
  }
}

function prepararOrdenNueva(orden) {
  const estado = orden.getString('estado');
  if (estado && estado !== 'solicitada') {
    throw new BadRequestError('Toda orden nueva debe iniciar como solicitada.');
  }

  const { diagnostico, manoObra, piezas } = presupuestoDe(orden);
  if (diagnostico || manoObra !== 0 || (piezas !== null && !(Array.isArray(piezas) && piezas.length === 0))) {
    throw new BadRequestError('El presupuesto se registra después del diagnóstico.');
  }

  limpiarRecepcion(orden);
  orden.set('estado', 'solicitada');
  orden.set('piezas', JSON.stringify([]));
}

function prepararPresupuesto(orden, datosEnviados) {
  const { diagnostico, manoObra, piezas } = presupuestoDe(orden);
  const importeEnviado = datosEnviados.manoObra;
  const importeValido = Number.isFinite(manoObra) && (
    typeof importeEnviado === 'number' && importeEnviado === manoObra ||
    typeof importeEnviado === 'string' && importeEnviado.trim() !== '' && Number(importeEnviado) === manoObra
  );

  if (!diagnostico.trim() || !importeValido || manoObra < 0 || !Array.isArray(piezas)) {
    throw new BadRequestError('Completa el diagnóstico, la mano de obra y la lista de piezas.');
  }

  let total = manoObra;
  for (const pieza of piezas) {
    if (!pieza || typeof pieza.descripcion !== 'string' || !pieza.descripcion.trim() ||
        !Number.isSafeInteger(pieza.cantidad) || pieza.cantidad < 1 ||
        !Number.isFinite(pieza.precio) || pieza.precio < 0) {
      throw new BadRequestError('Cada pieza requiere descripción, cantidad entera positiva y precio no negativo.');
    }
    total += pieza.cantidad * pieza.precio;
  }
  if (!Number.isFinite(total)) {
    throw new BadRequestError('El total del presupuesto supera el rango admitido.');
  }

  orden.set('diagnostico', diagnostico.trim());
  orden.set('piezas', JSON.stringify(piezas.map(({ descripcion, cantidad, precio }) => ({
    descripcion: descripcion.trim(), cantidad, precio,
  }))));
}

function validarActualizacion(ordenActual, ordenPropuesta, datosEnviados) {
  if (datosDe(ordenActual) !== datosDe(ordenPropuesta.original())) {
    throw new BadRequestError('La orden cambió en otra solicitud. Actualiza la página e inténtalo de nuevo.');
  }

  const estadoActual = ordenActual.getString('estado');
  const estadoPropuesto = ordenPropuesta.getString('estado');
  const siguientesEstados = cambiosPermitidos[estadoActual];

  if (siguientesEstados.length === 0) {
    throw new BadRequestError('Una orden cerrada no se puede modificar.');
  }
  if (estadoActual !== estadoPropuesto && !siguientesEstados.includes(estadoPropuesto)) {
    throw new BadRequestError('Ese cambio de etapa no está permitido.');
  }

  limpiarRecepcion(ordenPropuesta);
  if (estadoActual === 'en_diagnostico' && estadoPropuesto === 'presupuestada') {
    prepararPresupuesto(ordenPropuesta, datosEnviados);
  } else if (JSON.stringify(presupuestoDe(ordenActual)) !== JSON.stringify(presupuestoDe(ordenPropuesta))) {
    throw new BadRequestError('El presupuesto solo se escribe al pasar a presupuestada.');
  }
}

function registrarCambio(app, orden, estadoAnterior, estadoNuevo) {
  const evento = new Record(app.findCollectionByNameOrId('eventos'));
  evento.set('orden', orden.id);
  evento.set('de', estadoAnterior);
  evento.set('a', estadoNuevo);
  app.save(evento);
}

module.exports = { prepararOrdenNueva, validarActualizacion, registrarCambio };
