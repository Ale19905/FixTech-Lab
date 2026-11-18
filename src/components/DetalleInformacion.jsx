import { etapas, mostrarFecha, nombreEtapa } from '../domain/ordenes.js';
import { urlFoto } from '../services/pocketbase.js';

export function InformacionOrden({ orden, cliente }) {
  return (
    <section className="panel panel-detalle">
      <h2>Datos de recepción</h2>
      <dl className="datos-detalle">
        <div className="datos-cliente">
          <div><dt>Cliente</dt><dd>{cliente?.nombre ?? '—'}</dd></div>
          <div><dt>Teléfono</dt><dd>{cliente?.telefono ?? '—'}</dd></div>
          <div><dt>Fecha de recepción</dt><dd>{mostrarFecha(orden.created, true)}</dd></div>
        </div>
        <div><dt>Problema reportado</dt><dd className="texto-multilinea">{orden.problema}</dd></div>
      </dl>
      {orden.fotos.length > 0 && (
        <div className="fotos-orden">
          <h3>Fotos del equipo</h3>
          <ul>
            {orden.fotos.map((archivo, indice) => (
              <li key={archivo}>
                <a href={urlFoto(orden, archivo)} target="_blank" rel="noreferrer" aria-label={`Abrir foto ${indice + 1} en una pestaña nueva`}>
                  <img src={urlFoto(orden, archivo)} alt={`Foto ${indice + 1} de ${orden.equipo}`} loading="lazy" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function HistorialOrden({ eventos, fechaRecepcion }) {
  const secuencia = Object.fromEntries(etapas.map(({ valor }, posicion) => [valor, posicion]));
  const cambios = [...eventos].sort((primero, segundo) =>
    primero.created.localeCompare(segundo.created) || secuencia[primero.de] - secuencia[segundo.de]);

  return (
    <section className="panel panel-detalle historial">
      <h2>Historial</h2>
      <ol className="linea-tiempo">
        <li>
          <strong>Recepción registrada</strong>
          <time dateTime={fechaRecepcion.replace(' ', 'T')}>{mostrarFecha(fechaRecepcion, true)}</time>
        </li>
        {cambios.map((evento) => (
          <li key={evento.id}>
            <strong>{nombreEtapa(evento.a)}</strong>
            <span>Desde {nombreEtapa(evento.de).toLocaleLowerCase('es')}</span>
            <time dateTime={evento.created.replace(' ', 'T')}>{mostrarFecha(evento.created, true)}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}
