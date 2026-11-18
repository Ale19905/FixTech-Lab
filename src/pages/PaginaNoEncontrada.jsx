import { Link } from 'react-router';
import { Encabezado } from '../components/Interfaz.jsx';

export default function PaginaNoEncontrada() {
  return (
    <>
      <Encabezado titulo="Página no encontrada" descripcion="La dirección que abriste no corresponde a una página del taller." />
      <Link className="boton boton-primario" to="/">Volver al panel</Link>
    </>
  );
}
