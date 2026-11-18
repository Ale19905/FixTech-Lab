import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import CampoFotos from '../components/CampoFotos.jsx';
import { AvisoError, Encabezado } from '../components/Interfaz.jsx';
import { listarClientes, registrarRecepcion } from '../services/pocketbase.js';
import { useDatosRemotos } from '../services/useDatosRemotos.js';

const camposIniciales = { cliente: '', nombre: '', telefono: '', equipo: '', problema: '' };

export default function Recepcion() {
  const navegar = useNavigate();
  const { datos: clientes, error: errorClientes, cargando, recargar } = useDatosRemotos(listarClientes);
  const [campos, setCampos] = useState(camposIniciales);
  const [fotos, setFotos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setCampos((actuales) => ({ ...actuales, [name]: value }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;
    setError(null);
    const datos = new FormData();
    for (const [nombre, valor] of Object.entries(campos)) datos.set(nombre, valor.trim());
    if (!datos.get('equipo') || !datos.get('problema') || (!datos.get('cliente') && (!datos.get('nombre') || !datos.get('telefono')))) {
      setError(new Error('Completa los datos del cliente y del equipo.'));
      return;
    }
    for (const foto of fotos) datos.append('fotos', foto);

    setGuardando(true);
    try {
      const orden = await registrarRecepcion(datos);
      navegar(`/ordenes/${orden.id}`, { replace: true, state: { recepcionConfirmada: true } });
    } catch (fallo) {
      setError(fallo);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Encabezado titulo="Nueva orden" descripcion="Registra el cliente y el equipo que ingresa al taller." volver={{ ruta: '/ordenes', texto: 'Volver a órdenes' }} />
      <form className="panel formulario-recepcion" onSubmit={guardar}>
        <fieldset disabled={guardando}>
          <legend>Cliente</legend>
          <label className="campo">
            <span>Seleccionar cliente</span>
            <select name="cliente" value={campos.cliente} onChange={cambiarCampo}>
              <option value="">Registrar un cliente nuevo</option>
              {clientes?.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} · {cliente.telefono}</option>)}
            </select>
          </label>
          {cargando && !clientes && <p className="ayuda-campo" role="status">Cargando clientes existentes…</p>}
          {errorClientes && <AvisoError error={errorClientes} recargar={recargar} />}
          {!campos.cliente && (
            <div className="campos-dobles">
              <label className="campo">
                <span>Nombre</span>
                <input required maxLength={120} name="nombre" autoComplete="name" value={campos.nombre} onChange={cambiarCampo} />
              </label>
              <label className="campo">
                <span>Teléfono</span>
                <input required maxLength={40} type="tel" name="telefono" autoComplete="tel" value={campos.telefono} onChange={cambiarCampo} />
              </label>
            </div>
          )}
        </fieldset>
        <fieldset disabled={guardando}>
          <legend>Equipo</legend>
          <label className="campo">
            <span>Equipo, marca y modelo</span>
            <input required maxLength={160} name="equipo" value={campos.equipo} onChange={cambiarCampo} placeholder="Ej. Samsung Galaxy A54" />
          </label>
          <label className="campo">
            <span>Problema reportado</span>
            <textarea required maxLength={4000} name="problema" rows={4} value={campos.problema} onChange={cambiarCampo} placeholder="Describe la falla que reporta el cliente" />
          </label>
          <CampoFotos fotos={fotos} cambiarFotos={setFotos} />
        </fieldset>
        {error && <AvisoError error={error} />}
        <div className="acciones-formulario">
          <Link className="boton boton-secundario" to="/ordenes">Volver</Link>
          <button className="boton boton-primario" type="submit" disabled={guardando}>{guardando ? 'Registrando…' : 'Registrar orden'}</button>
        </div>
      </form>
    </>
  );
}
