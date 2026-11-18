/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((evento) => {
  const { prepararOrdenNueva } = require(`${__hooks}/reglas-ordenes.js`);
  prepararOrdenNueva(evento.record);
  evento.next();
}, 'ordenes');

onRecordUpdateRequest((solicitud) => {
  const { validarActualizacion, registrarCambio } = require(`${__hooks}/reglas-ordenes.js`);
  const aplicacion = solicitud.app;

  try {
    aplicacion.runInTransaction((appTransaccion) => {
      solicitud.app = appTransaccion;
      const ordenPropuesta = solicitud.record;
      const ordenActual = appTransaccion.findRecordById('ordenes', ordenPropuesta.id);
      const estadoAnterior = ordenActual.getString('estado');
      const estadoNuevo = ordenPropuesta.getString('estado');

      // PocketBase convierte valores no numéricos a cero al preparar el campo.
      let importeEnviado;
      if (estadoAnterior === 'en_diagnostico' && estadoNuevo === 'presupuestada') {
        const presupuestoEnviado = new DynamicModel({ manoObra: nullFloat() });
        try {
          solicitud.bindBody(presupuestoEnviado);
        } catch (_) {
          throw new BadRequestError('La mano de obra debe ser un número.');
        }
        importeEnviado = JSON.parse(toString(presupuestoEnviado)).manoObra;
      }
      validarActualizacion(ordenActual, ordenPropuesta, importeEnviado);

      if (estadoAnterior !== estadoNuevo) {
        registrarCambio(appTransaccion, ordenPropuesta, estadoAnterior, estadoNuevo);
      }

      // La API de PocketBase guarda la orden y responde después de confirmar la transacción.
      solicitud.next();
    });
  } finally {
    solicitud.app = aplicacion;
  }
}, 'ordenes');

onRecordCreateRequest(() => {
  throw new ForbiddenError('El historial lo genera el taller al cambiar de etapa.');
}, 'eventos');

onRecordUpdate(() => {
  throw new ForbiddenError('Los eventos del historial son inmutables.');
}, 'eventos');

onRecordDelete(() => {
  throw new ForbiddenError('Las órdenes y su historial no se pueden borrar.');
}, 'ordenes', 'eventos');

onRecordCreate((evento) => {
  for (const campo of ['nombre', 'telefono']) {
    evento.record.set(campo, evento.record.getString(campo).trim());
  }
  evento.next();
}, 'clientes');

routerAdd('POST', '/api/taller/recepciones', (solicitud) => {
  const datos = new DynamicModel({ cliente: '', nombre: '', telefono: '', equipo: '', problema: '' });
  solicitud.bindBody(datos);
  const fotos = solicitud.request.multipartForm?.file?.fotos?.length
    ? solicitud.findUploadedFiles('fotos')
    : [];

  let orden;
  try {
    solicitud.app.runInTransaction((appTransaccion) => {
      let clienteId = datos.cliente.trim();
      if (!clienteId) {
        const cliente = new Record(appTransaccion.findCollectionByNameOrId('clientes'));
        cliente.set('nombre', datos.nombre);
        cliente.set('telefono', datos.telefono);
        appTransaccion.save(cliente);
        clienteId = cliente.id;
      }

      orden = new Record(appTransaccion.findCollectionByNameOrId('ordenes'));
      orden.set('cliente', clienteId);
      orden.set('equipo', datos.equipo);
      orden.set('problema', datos.problema);
      if (fotos.length) orden.set('fotos', fotos);
      appTransaccion.save(orden);
    });
  } catch (error) {
    throw new BadRequestError('No se pudo registrar la recepción. Revisa los datos y las fotos.', error);
  }
  return solicitud.json(201, orden);
}, $apis.bodyLimit(17 * 1024 * 1024));

routerAdd('GET', '/api/taller/ordenes/{id}', (solicitud) => {
  const id = solicitud.request.pathValue('id');
  let detalle;
  solicitud.app.runInTransaction((appTransaccion) => {
    let orden;
    try {
      orden = appTransaccion.findRecordById('ordenes', id);
    } catch (_) {
      throw new NotFoundError('Orden no encontrada.');
    }
    const cliente = appTransaccion.findRecordById('clientes', orden.getString('cliente'));
    const eventos = appTransaccion.findRecordsByFilter('eventos', 'orden = {:ordenId}', 'created,id', 0, 0, { ordenId: id });
    // La orden y el historial se leen en la misma transacción.
    detalle = { orden: orden.publicExport(), cliente: cliente.publicExport(), eventos: eventos.map((evento) => evento.publicExport()) };
  });
  return solicitud.json(200, detalle);
});
