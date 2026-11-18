import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import AccionesOrden from '../components/AccionesOrden.jsx';
import { HistorialOrden, InformacionOrden } from '../components/DetalleInformacion.jsx';
import { AvisoError, Cargando, Encabezado, EstadoOrden } from '../components/Interfaz.jsx';
import { PresupuestoGuardado } from '../components/Presupuesto.jsx';
import { codigoOrden, nombreEtapa } from '../domain/ordenes.js';
import { actualizarOrden, buscarOrden } from '../services/pocketbase.js';
import { useDatosRemotos } from '../services/useDatosRemotos.js';

const volverAOrdenes = { ruta: '/ordenes', texto: 'Volver a órdenes' };

function ContenidoOrden({ id }) {
  const ubicacion = useLocation();
  const { datos: detalle, cargando, error, recargar } = useDatosRemotos(buscarOrden, id);
  const [guardando, setGuardando] = useState(false);
  const [errorCambio, setErrorCambio] = useState(null);
  const [aviso, setAviso] = useState(ubicacion.state?.recepcionConfirmada ? 'Orden registrada.' : '');

  async function guardarCambio(datos) {
    if (guardando || cargando) return;
    setGuardando(true);
    setErrorCambio(null);
    setAviso('');
    try {
      const ordenGuardada = await actualizarOrden(id, datos);
      setAviso(`Etapa actualizada a ${nombreEtapa(ordenGuardada.estado).toLocaleLowerCase('es')}.`);
      recargar();
    } catch (fallo) {
      setErrorCambio(fallo);
    } finally {
      setGuardando(false);
    }
  }

  if (error || !detalle) {
    return (
      <>
        <Encabezado titulo={error?.estado === 404 ? 'Orden no encontrada' : 'Detalle de la orden'} volver={volverAOrdenes} />
        {error?.estado === 404 && <p className="mensaje-vacio">Revisa el código o vuelve a la bandeja de órdenes.</p>}
        {error && error.estado !== 404 && <AvisoError error={error} recargar={recargar} />}
        {!error && <Cargando texto="Cargando la orden…" />}
      </>
    );
  }

  const { orden, cliente, eventos } = detalle;
  return (
    <>
      <Encabezado titulo={orden.equipo} descripcion={codigoOrden(orden.id)} volver={volverAOrdenes} accion={<EstadoOrden estado={orden.estado} />} />
      {aviso && <p className="aviso-exito" role="status">{aviso}</p>}
      <div className="detalle-columnas">
        <div className="detalle-principal">
          <InformacionOrden orden={orden} cliente={cliente} />
          {orden.diagnostico && <PresupuestoGuardado diagnostico={orden.diagnostico} manoObra={orden.manoObra} piezas={orden.piezas ?? []} />}
          <AccionesOrden key={orden.estado} estado={orden.estado} guardar={guardarCambio} guardando={guardando || cargando} error={errorCambio} />
        </div>
        <HistorialOrden eventos={eventos} fechaRecepcion={orden.created} />
      </div>
    </>
  );
}

export default function DetalleOrden() {
  const { id } = useParams();
  return <ContenidoOrden key={id} id={id} />;
}
