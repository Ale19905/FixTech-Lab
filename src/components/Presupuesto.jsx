import { useRef, useState } from 'react';
import { mostrarImporte, totalPresupuesto } from '../domain/ordenes.js';
import { AvisoError } from './Interfaz.jsx';

export function FormularioPresupuesto({ guardar, guardando }) {
  const [diagnostico, setDiagnostico] = useState('');
  const [manoObra, setManoObra] = useState('');
  const [piezas, setPiezas] = useState([]);
  const [error, setError] = useState(null);
  const siguienteId = useRef(0);
  const piezasCalculadas = piezas.map(({ descripcion, cantidad, precio }) => ({
    descripcion: descripcion.trim(), cantidad: Number(cantidad), precio: Number(precio),
  }));
  const total = totalPresupuesto(Number(manoObra), piezasCalculadas);

  function agregarPieza() {
    const id = siguienteId.current++;
    setPiezas((actuales) => [...actuales, { id, descripcion: '', cantidad: '1', precio: '' }]);
  }

  function cambiarPieza(id, campo, valor) {
    setPiezas((actuales) => actuales.map((pieza) => pieza.id === id ? { ...pieza, [campo]: valor } : pieza));
  }

  function enviar(evento) {
    evento.preventDefault();
    setError(null);
    const piezaInvalida = piezasCalculadas.some((pieza) => !pieza.descripcion || !Number.isSafeInteger(pieza.cantidad) || pieza.cantidad < 1);
    if (!diagnostico.trim() || piezaInvalida || !Number.isFinite(total)) {
      setError(new Error('Revisa el diagnóstico, los importes y los datos de cada pieza.'));
      return;
    }
    guardar({ estado: 'presupuestada', diagnostico: diagnostico.trim(), manoObra: Number(manoObra), piezas: piezasCalculadas });
  }

  return (
    <form className="formulario-presupuesto" onSubmit={enviar}>
      <fieldset disabled={guardando}>
        <label className="campo">
          <span>Diagnóstico</span>
          <textarea required maxLength={4000} rows={3} value={diagnostico} onChange={(evento) => setDiagnostico(evento.target.value)} />
        </label>
        <label className="campo mano-obra">
          <span>Mano de obra</span>
          <input required type="number" min="0" step="any" inputMode="decimal" value={manoObra} onChange={(evento) => setManoObra(evento.target.value)} />
        </label>
        <div className="cabecera-piezas">
          <h3>Piezas</h3>
          <button className="boton boton-secundario" type="button" onClick={agregarPieza}>Agregar pieza</button>
        </div>
        {piezas.length === 0 && <p className="ayuda-campo">Puedes guardar un presupuesto sin piezas.</p>}
        <div className="lista-piezas">
          {piezas.map((pieza, indice) => (
            <div className="fila-pieza" key={pieza.id} aria-label={`Pieza ${indice + 1}`} role="group">
              <label className="campo">
                <span>Descripción</span>
                <input required value={pieza.descripcion} onChange={(evento) => cambiarPieza(pieza.id, 'descripcion', evento.target.value)} />
              </label>
              <label className="campo">
                <span>Cantidad</span>
                <input type="number" required min="1" step="1" value={pieza.cantidad} onChange={(evento) => cambiarPieza(pieza.id, 'cantidad', evento.target.value)} />
              </label>
              <label className="campo">
                <span>Precio unitario</span>
                <input type="number" required min="0" step="any" inputMode="decimal" value={pieza.precio} onChange={(evento) => cambiarPieza(pieza.id, 'precio', evento.target.value)} />
              </label>
              <button type="button" className="boton-texto quitar-pieza" onClick={() => setPiezas((actuales) => actuales.filter(({ id }) => id !== pieza.id))} aria-label={`Quitar pieza ${indice + 1}`}>Quitar</button>
            </div>
          ))}
        </div>
        <div className="total-presupuesto"><span>Total del presupuesto</span><output>{Number.isFinite(total) ? mostrarImporte(total) : '—'}</output></div>
      </fieldset>
      {error && <AvisoError error={error} />}
      <button type="submit" className="boton boton-primario" disabled={guardando}>{guardando ? 'Guardando…' : 'Registrar presupuesto'}</button>
    </form>
  );
}

export function PresupuestoGuardado({ diagnostico, manoObra, piezas }) {
  return (
    <section className="panel panel-detalle">
      <h2>Presupuesto</h2>
      <dl className="datos-detalle">
        <div><dt>Diagnóstico</dt><dd className="texto-multilinea">{diagnostico}</dd></div>
        <div><dt>Mano de obra</dt><dd>{mostrarImporte(manoObra)}</dd></div>
      </dl>
      {piezas.length > 0 ? (
        <div className="tabla-contenedor tabla-piezas">
          <table>
            <thead><tr><th scope="col">Pieza</th><th scope="col">Cantidad</th><th scope="col">Precio unitario</th></tr></thead>
            <tbody>
              {piezas.map(({ descripcion, cantidad, precio }, indice) => (
                <tr key={indice}><td>{descripcion}</td><td>{cantidad}</td><td>{mostrarImporte(precio)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="ayuda-campo">Sin piezas.</p>}
      <div className="total-presupuesto"><span>Total del presupuesto</span><strong>{mostrarImporte(totalPresupuesto(manoObra, piezas))}</strong></div>
    </section>
  );
}
