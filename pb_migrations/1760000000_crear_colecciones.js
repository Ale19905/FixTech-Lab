/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const clientes = new Collection({
    type: 'base',
    name: 'clientes',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: 'nombre', type: 'text', required: true, max: 120 },
      { name: 'telefono', type: 'text', required: true, max: 40 },
    ],
  });
  app.save(clientes);

  const ordenes = new Collection({
    type: 'base',
    name: 'ordenes',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: null,
    fields: [
      { name: 'cliente', type: 'relation', collectionId: clientes.id, required: true, maxSelect: 1 },
      { name: 'equipo', type: 'text', required: true, max: 160 },
      { name: 'problema', type: 'text', required: true, max: 4000 },
      {
        name: 'estado',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['solicitada', 'en_diagnostico', 'presupuestada', 'aprobada', 'rechazada',
          'en_reparacion', 'lista', 'entregada', 'cancelada'],
      },
      { name: 'diagnostico', type: 'text', max: 4000 },
      { name: 'manoObra', type: 'number', min: 0 },
      { name: 'piezas', type: 'json', maxSize: 65536 },
      {
        name: 'fotos',
        type: 'file',
        maxSelect: 3,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
      },
      { name: 'created', type: 'autodate', onCreate: true },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    indexes: ['CREATE INDEX idx_ordenes_estado ON ordenes (estado)'],
  });
  app.save(ordenes);

  const eventos = new Collection({
    type: 'base',
    name: 'eventos',
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: 'orden', type: 'relation', collectionId: ordenes.id, required: true, maxSelect: 1 },
      { name: 'de', type: 'text', required: true },
      { name: 'a', type: 'text', required: true },
      { name: 'created', type: 'autodate', onCreate: true },
    ],
    indexes: ['CREATE INDEX idx_eventos_orden_fecha ON eventos (orden, created)'],
  });
  app.save(eventos);
}, (app) => {
  for (const nombre of ['eventos', 'ordenes', 'clientes']) {
    app.delete(app.findCollectionByNameOrId(nombre));
  }
});
