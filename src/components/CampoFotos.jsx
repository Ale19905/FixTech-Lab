import { useEffect, useRef, useState } from 'react';

const tiposAdmitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const maximoBytes = 5 * 1024 * 1024;

export default function CampoFotos({ fotos, cambiarFotos }) {
  const selector = useRef(null);
  const [error, setError] = useState('');
  const [miniaturas, setMiniaturas] = useState([]);

  useEffect(() => {
    const urls = fotos.map((foto) => URL.createObjectURL(foto));
    setMiniaturas(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [fotos]);

  function agregarFotos(evento) {
    const nuevasFotos = Array.from(evento.target.files);
    selector.current.value = '';
    if (nuevasFotos.length + fotos.length > 3) {
      setError('Puedes adjuntar hasta 3 fotos.');
      return;
    }
    if (nuevasFotos.some((foto) => !tiposAdmitidos.includes(foto.type) || foto.size > maximoBytes)) {
      setError('Usa imágenes JPG, PNG, WebP, GIF o AVIF de hasta 5 MB.');
      return;
    }
    setError('');
    cambiarFotos([...fotos, ...nuevasFotos]);
  }

  return (
    <div className="campo-fotos">
      <label className="campo">
        <span>Fotos <small>Opcional</small></span>
        <input type="file" ref={selector} multiple accept={tiposAdmitidos.join(',')} onChange={agregarFotos} aria-describedby="ayuda-fotos" disabled={fotos.length === 3} />
      </label>
      <p id="ayuda-fotos" className="ayuda-campo">Hasta 3 imágenes de 5 MB cada una.</p>
      {error && <p className="error-campo" role="alert">{error}</p>}
      {fotos.length > 0 && (
        <ul className="miniaturas">
          {fotos.map((foto, indice) => (
            <li key={miniaturas[indice] ?? `${foto.name}-${indice}`}>
              {miniaturas[indice] && <img src={miniaturas[indice]} alt="" />}
              <span title={foto.name}>{foto.name}</span>
              <button type="button" className="boton-texto" onClick={() => {
                setError('');
                cambiarFotos(fotos.filter((_, posicion) => posicion !== indice));
              }} aria-label={`Quitar ${foto.name}`}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
