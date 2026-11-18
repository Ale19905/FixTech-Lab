const urlPocketBase = (process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/+$/, '');

const clientes = [
  { id: 'clientedemo0001', nombre: 'Ana Torres', telefono: '555-0101' },
  { id: 'clientedemo0002', nombre: 'Marcos Díaz', telefono: '555-0102' },
];

const ordenes = [
  {
    id: 'ordendemotv0001', cliente: clientes[0].id, equipo: 'Televisor LG 43″',
    problema: 'El equipo tiene sonido, pero la pantalla se queda oscura.',
    pasos: [
      { estado: 'en_diagnostico' },
      { estado: 'presupuestada', diagnostico: 'Retroiluminación dañada.', manoObra: 35,
        piezas: [{ descripcion: 'Tira LED', cantidad: 2, precio: 12.5 }] },
      { estado: 'aprobada' },
      { estado: 'en_reparacion' },
      { estado: 'lista' },
    ],
  },
  {
    id: 'ordendemopc0002', cliente: clientes[1].id, equipo: 'Laptop Lenovo IdeaPad',
    problema: 'La batería no carga al conectar el adaptador.',
    pasos: [
      { estado: 'en_diagnostico' },
      { estado: 'presupuestada', diagnostico: 'Conector de carga con holgura.', manoObra: 20,
        piezas: [{ descripcion: 'Conector de carga', cantidad: 1, precio: 14.5 }] },
    ],
  },
  {
    id: 'ordendemomv0003', cliente: clientes[0].id, equipo: 'Samsung Galaxy A54',
    problema: 'La pantalla táctil falla después de una caída.',
    pasos: [],
  },
];

async function solicitar(coleccion, { id = '', metodo = 'GET', datos } = {}) {
  const ruta = `/api/collections/${coleccion}/records${id ? `/${id}` : ''}`;
  const respuesta = await fetch(`${urlPocketBase}${ruta}`, {
    method: metodo,
    headers: datos ? { 'Content-Type': 'application/json' } : undefined,
    body: datos ? JSON.stringify(datos) : undefined,
  });
  const resultado = await respuesta.json();
  if (metodo === 'GET' && respuesta.status === 404) return null;
  if (!respuesta.ok) throw new Error(`${metodo} ${coleccion}: ${resultado.message} ${JSON.stringify(resultado.data ?? {})}`);
  return resultado;
}

async function crearSiFalta(coleccion, datos) {
  const registro = await solicitar(coleccion, { id: datos.id });
  return registro ?? solicitar(coleccion, { metodo: 'POST', datos });
}

async function cargarDemostracion() {
  for (const cliente of clientes) await crearSiFalta('clientes', cliente);

  for (const { pasos, ...datosOrden } of ordenes) {
    const orden = await crearSiFalta('ordenes', datosOrden);
    const etapasDemo = ['solicitada', ...pasos.map(({ estado }) => estado)];
    const posicionActual = etapasDemo.indexOf(orden.estado);
    if (posicionActual === -1) {
      console.log(`${orden.equipo}: ${orden.estado} (se conserva el avance existente).`);
      continue;
    }
    let estado = orden.estado;
    for (const paso of pasos.slice(posicionActual)) {
      const resultado = await solicitar('ordenes', { id: orden.id, metodo: 'PATCH', datos: paso });
      estado = resultado.estado;
    }
    console.log(`${orden.equipo}: ${estado}.`);
  }
}

try {
  await cargarDemostracion();
} catch (error) {
  console.error(`No se completó la carga de prueba en ${urlPocketBase}. ${error.message}`);
  process.exitCode = 1;
}
