import { useSearchParams } from 'react-router';
import { AvisoError, Cargando, Encabezado, NuevaOrden } from '../components/Interfaz.jsx';
import TablaOrdenes from '../components/TablaOrdenes.jsx';
import { etapas, etapasActivas } from '../domain/ordenes.js';
import { listarOrdenes } from '../services/pocketbase.js';
import { useDatosRemotos } from '../services/useDatosRemotos.js';

function normalizarBusqueda(texto) {
  return texto.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export default function Ordenes() {
  const [parametros, setParametros] = useSearchParams();
  const { datos: ordenes, error, cargando, recargar } = useDatosRemotos(listarOrdenes);
  const busqueda = parametros.get('buscar') ?? '';
  const etapa = parametros.get('etapa') ?? '';
  const filtroActivo = etapa === 'activas' || etapas.some(({ valor }) => valor === etapa) ? etapa : '';

  function cambiarFiltro(nombre, valor) {
    const nuevosParametros = new URLSearchParams(parametros);
    if (valor) nuevosParametros.set(nombre, valor);
    else nuevosParametros.delete(nombre);
    setParametros(nuevosParametros, { replace: true });
  }

  const palabras = normalizarBusqueda(busqueda).trim().split(/\s+/).filter(Boolean);
  const ordenesVisibles = ordenes?.filter((orden) => {
    if (filtroActivo === 'activas' && !etapasActivas.some(({ valor }) => valor === orden.estado)) return false;
    if (filtroActivo && filtroActivo !== 'activas' && orden.estado !== filtroActivo) return false;
    const cliente = orden.expand?.cliente;
    const datosBuscables = normalizarBusqueda([orden.equipo, `#${orden.id}`, cliente?.nombre, cliente?.telefono].join(' '));
    return palabras.every((palabra) => datosBuscables.includes(palabra));
  });

  return (
    <>
      <Encabezado titulo="Órdenes" descripcion="Busca por equipo, código de orden, cliente o teléfono." accion={<NuevaOrden />} />
      <section className="panel" aria-label="Bandeja de órdenes">
        <div className="filtros">
          <label className="campo buscador">
            <span>Buscar orden</span>
            <input type="search" value={busqueda} onChange={(evento) => cambiarFiltro('buscar', evento.target.value)} placeholder="Equipo, cliente, código o teléfono" />
          </label>
          <label className="campo filtro-etapa">
            <span>Etapa</span>
            <select value={filtroActivo} onChange={(evento) => cambiarFiltro('etapa', evento.target.value)}>
              <option value="">Todas las etapas</option>
              <option value="activas">Órdenes activas</option>
              {etapas.map(({ valor, nombre }) => <option key={valor} value={valor}>{nombre}</option>)}
            </select>
          </label>
          <button type="button" className="boton boton-secundario" onClick={recargar} disabled={cargando}>Actualizar</button>
        </div>
        {error && <AvisoError error={error} recargar={recargar} />}
        {cargando && !ordenes && <Cargando texto="Cargando órdenes…" />}
        {ordenesVisibles && !error && (
          <>
            <p className="conteo-resultados" aria-live="polite">{ordenesVisibles.length} {ordenesVisibles.length === 1 ? 'orden' : 'órdenes'}</p>
            <TablaOrdenes ordenes={ordenesVisibles} textoVacio="No hay órdenes que coincidan con la búsqueda." />
          </>
        )}
      </section>
    </>
  );
}
