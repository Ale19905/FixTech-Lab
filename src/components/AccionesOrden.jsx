import { useState } from 'react';
import { AvisoError } from './Interfaz.jsx';
import { FormularioPresupuesto } from './Presupuesto.jsx';

const accionesPorEtapa = {
  solicitada: [
    { etapa: 'en_diagnostico', texto: 'Iniciar diagnóstico' },
    { etapa: 'cancelada', texto: 'Cancelar orden', confirmar: 'Confirma que el cliente solicitó cancelar la orden antes del diagnóstico.', estilo: 'peligro' },
  ],
  presupuestada: [
    { etapa: 'aprobada', texto: 'Registrar aprobación' },
    { etapa: 'rechazada', texto: 'Registrar rechazo', confirmar: 'La orden se cerrará sin reparar el equipo.', estilo: 'peligro' },
  ],
  aprobada: [{ etapa: 'en_reparacion', texto: 'Iniciar reparación' }],
  en_reparacion: [{ etapa: 'lista', texto: 'Marcar como lista' }],
  lista: [{ etapa: 'entregada', texto: 'Registrar entrega', confirmar: 'Confirma que el equipo ya se entregó al cliente.' }],
};

export default function AccionesOrden({ estado, guardar, guardando, error }) {
  const [pendiente, setPendiente] = useState(null);
  const acciones = accionesPorEtapa[estado];
  if (!acciones && estado !== 'en_diagnostico') return null;

  function ejecutar(accion) {
    if (accion.confirmar) setPendiente(accion);
    else guardar({ estado: accion.etapa });
  }

  return (
    <section className="panel panel-detalle acciones-orden">
      <h2>{estado === 'en_diagnostico' ? 'Preparar presupuesto' : 'Cambiar etapa'}</h2>
      {error && <AvisoError error={error} />}
      {estado === 'en_diagnostico' ? (
        <FormularioPresupuesto guardar={guardar} guardando={guardando} />
      ) : pendiente ? (
        <div className="confirmacion">
          <p>{pendiente.confirmar}</p>
          <div className="grupo-botones">
            <button type="button" className={`boton boton-${pendiente.estilo ?? 'primario'}`} disabled={guardando} onClick={() => guardar({ estado: pendiente.etapa })}>
              {guardando ? 'Guardando…' : pendiente.texto}
            </button>
            <button type="button" className="boton boton-secundario" disabled={guardando} onClick={() => setPendiente(null)}>Volver</button>
          </div>
        </div>
      ) : (
        <div className="grupo-botones">
          {acciones.map((accion) => (
            <button key={accion.etapa} type="button" className={`boton boton-${accion.estilo ?? 'primario'}`} disabled={guardando} onClick={() => ejecutar(accion)}>{accion.texto}</button>
          ))}
        </div>
      )}
    </section>
  );
}
