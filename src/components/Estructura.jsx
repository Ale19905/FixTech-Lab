import { NavLink, Outlet } from 'react-router';

export default function Estructura() {
  return (
    <div className="estructura">
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <aside className="lateral">
        <NavLink to="/" end className="marca">
          <span className="marca-simbolo" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>FixTech Lab<span className="marca-subtitulo">Gestión de reparaciones</span></span>
        </NavLink>
        <nav className="navegacion" aria-label="Navegación principal">
          <NavLink to="/" end><span className="icono-nav icono-panel" aria-hidden="true" />Panel</NavLink>
          <NavLink to="/ordenes"><span className="icono-nav icono-ordenes" aria-hidden="true" />Órdenes</NavLink>
          <NavLink to="/recepcion"><span className="icono-nav icono-recepcion" aria-hidden="true" />Recepción</NavLink>
        </nav>
      </aside>
      <main id="contenido" className="contenido" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
