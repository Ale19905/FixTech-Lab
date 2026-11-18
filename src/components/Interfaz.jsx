import { Link } from 'react-router';
import { nombreEtapa } from '../domain/ordenes.js';

export function Encabezado({ titulo, descripcion, accion, volver }) {
  return (
    <header className="encabezado">
      <div>
        {volver && <Link className="volver" to={volver.ruta}>{volver.texto}</Link>}
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {accion}
    </header>
  );
}

export function NuevaOrden() {
  return <Link className="boton boton-primario" to="/recepcion"><span aria-hidden="true">+</span> Nueva orden</Link>;
}

export function EstadoOrden({ estado }) {
  return <span className={`estado estado-${estado}`}><i aria-hidden="true" />{nombreEtapa(estado)}</span>;
}

export function AvisoError({ error, recargar }) {
  return (
    <div className="aviso-error" role="alert">
      <p>{error.message}</p>
      {recargar && <button type="button" className="boton boton-secundario" onClick={recargar}>Volver a consultar</button>}
    </div>
  );
}

export function Cargando({ texto = 'Cargando datos…' }) {
  return <p className="mensaje-vacio" role="status">{texto}</p>;
}
