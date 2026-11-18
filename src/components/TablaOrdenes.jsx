import { Link } from 'react-router';
import { codigoOrden, mostrarFecha } from '../domain/ordenes.js';
import { EstadoOrden } from './Interfaz.jsx';

export default function TablaOrdenes({ ordenes, textoVacio, compacta = false }) {
  if (ordenes.length === 0) return <p className="mensaje-vacio">{textoVacio}</p>;

  return (
    <div className="tabla-contenedor">
      <table className="tabla-ordenes">
        <thead>
          <tr>
            <th scope="col">Equipo y orden</th>
            {!compacta && <th scope="col">Cliente</th>}
            <th scope="col">Etapa</th>
            <th scope="col" className="fecha-columna">Recepción</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>
                <Link to={`/ordenes/${orden.id}`} className="enlace-orden">{orden.equipo}</Link>
                <span className="dato-secundario codigo">{codigoOrden(orden.id)}</span>
              </td>
              {!compacta && (
                <td className="cliente-columna">
                  {orden.expand?.cliente?.nombre ?? '—'}
                  <span className="dato-secundario">{orden.expand?.cliente?.telefono}</span>
                </td>
              )}
              <td><EstadoOrden estado={orden.estado} /></td>
              <td className="fecha-columna">{mostrarFecha(orden.created)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
