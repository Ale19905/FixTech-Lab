/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const clientes = [
    { id: 'clientedemo0001', nombre: 'Ana Torres', telefono: '555-0101' },
    { id: 'clientedemo0002', nombre: 'Marcos Díaz', telefono: '555-0102' },
  ];

  const ordenes = [
    {
      id: 'ordendemotv0001',
      cliente: clientes[0].id,
      equipo: 'Televisor LG 43″',
      problema: 'El equipo tiene sonido, pero la pantalla se queda oscura.',
      etapas: ['en_diagnostico', 'presupuestada', 'aprobada', 'en_reparacion', 'lista'],
      presupuesto: {
        diagnostico: 'Retroiluminación dañada.',
        manoObra: 35,
        piezas: [{ descripcion: 'Tira LED', cantidad: 2, precio: 12.5 }],
      },
    },
    {
      id: 'ordendemopc0002',
      cliente: clientes[1].id,
      equipo: 'Laptop Lenovo IdeaPad',
      problema: 'La batería no carga al conectar el adaptador.',
      etapas: ['en_diagnostico', 'presupuestada'],
      presupuesto: {
        diagnostico: 'Conector de carga con holgura.',
        manoObra: 20,
        piezas: [{ descripcion: 'Conector de carga', cantidad: 1, precio: 14.5 }],
      },
    },
    {
      id: 'ordendemomv0003',
      cliente: clientes[0].id,
      equipo: 'Samsung Galaxy A54',
      problema: 'La pantalla táctil falla después de una caída.',
      etapas: [],
    },
  ];

  const coleccionClientes = app.findCollectionByNameOrId('clientes');
  const coleccionOrdenes = app.findCollectionByNameOrId('ordenes');
  const coleccionEventos = app.findCollectionByNameOrId('eventos');

  function existeRegistro(coleccion, id) {
    return app.findRecordsByFilter(coleccion, 'id = {:id}', '', 1, 0, { id }).length > 0;
  }

  function crearRegistro(coleccion, campos) {
    const registro = new Record(coleccion);
    for (const [campo, valor] of Object.entries(campos)) registro.set(campo, valor);
    app.save(registro);
    return registro;
  }

  for (const cliente of clientes) {
    if (!existeRegistro(coleccionClientes, cliente.id)) crearRegistro(coleccionClientes, cliente);
  }

  for (const { etapas, presupuesto, ...datosOrden } of ordenes) {
    if (existeRegistro(coleccionOrdenes, datosOrden.id)) continue;

    const orden = crearRegistro(coleccionOrdenes, {
      ...datosOrden,
      estado: 'solicitada',
      piezas: '[]',
    });

    for (const estadoNuevo of etapas) {
      const estadoAnterior = orden.getString('estado');
      orden.set('estado', estadoNuevo);
      if (estadoNuevo === 'presupuestada') {
        orden.set('diagnostico', presupuesto.diagnostico);
        orden.set('manoObra', presupuesto.manoObra);
        orden.set('piezas', JSON.stringify(presupuesto.piezas));
      }
      app.save(orden);

      // Los guardados de la migración suceden fuera del hook HTTP que registra los cambios.
      crearRegistro(coleccionEventos, { orden: orden.id, de: estadoAnterior, a: estadoNuevo });
    }
  }
}, () => {
  // Se conservan las órdenes y los clientes porque el taller podría haber trabajado con ellos.
});
