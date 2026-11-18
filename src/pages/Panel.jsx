import { Link } from 'react-router';
import { AvisoError, Cargando, Encabezado, EstadoOrden, NuevaOrden } from '../components/Interfaz.jsx';
import TablaOrdenes from '../components/TablaOrdenes.jsx';
import { etapas, etapasActivas } from '../domain/ordenes.js';
import { listarOrdenes } from '../services/pocketbase.js';
import { useDatosRemotos } from '../services/useDatosRemotos.js';

function Resumen({ ordenes }) {
  const cantidadPorEtapa = Object.fromEntries(etapas.map(({ valor }) => [valor, 0]));
  for (const orden of ordenes) cantidadPorEtapa[orden.estado] += 1;
  const totalActivas = etapasActivas.reduce((total, { valor }) => total + cantidadPorEtapa[valor], 0);
  const tarjetas = [
    { nombre: 'Órdenes activas', valor: totalActivas, estilo: 'general', filtro: 'activas' },
    { nombre: 'Esperando respuesta', valor: cantidadPorEtapa.presupuestada, estilo: 'espera', filtro: 'presupuestada' },
    { nombre: 'En reparación', valor: cantidadPorEtapa.en_reparacion, estilo: 'reparacion', filtro: 'en_reparacion' },
    { nombre: 'Listas para entregar', valor: cantidadPorEtapa.lista, estilo: 'lista', filtro: 'lista' },
  ];

  return (
    <>
      <section className="tarjetas" aria-label="Resumen del taller">
        {tarjetas.map(({ nombre, valor, estilo, filtro }) => (
          <Link className={`tarjeta-metrica metrica-${estilo}`} key={estilo} to={`/ordenes?etapa=${filtro}`}>
            <span>{nombre}</span><strong>{valor}</strong>
          </Link>
        ))}
      </section>
      <div className="panel-columnas">
        <section className="panel">
          <div className="titulo-panel">
            <h2>Órdenes recientes</h2>
            <Link className="enlace" to="/ordenes">Ver todas</Link>
          </div>
          <TablaOrdenes ordenes={ordenes.slice(0, 6)} compacta textoVacio="Todavía no hay órdenes registradas." />
        </section>
        <section className="panel panel-flujo">
          <div className="titulo-panel"><h2>Órdenes por etapa</h2></div>
          <ul className="lista-etapas">
            {etapas.map(({ valor }, indice) => (
              <li key={valor} className={indice === etapasActivas.length ? 'etapas-cerradas' : undefined}>
                <Link to={`/ordenes?etapa=${valor}`}>
                  <EstadoOrden estado={valor} />
                  <strong>{cantidadPorEtapa[valor]}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function Panel() {
  const { datos: ordenes, error, cargando, recargar } = useDatosRemotos(listarOrdenes);
  return (
    <>
      <Encabezado titulo="Panel de trabajo" descripcion="Consulta el estado de los equipos y el trabajo pendiente del taller." accion={<NuevaOrden />} />
      {error && <AvisoError error={error} recargar={recargar} />}
      {cargando && !ordenes && <Cargando texto="Cargando el panel…" />}
      {ordenes && !error && <Resumen ordenes={ordenes} />}
    </>
  );
}
