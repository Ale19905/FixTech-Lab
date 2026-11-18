import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import Estructura from './components/Estructura.jsx';
import DetalleOrden from './pages/DetalleOrden.jsx';
import Ordenes from './pages/Ordenes.jsx';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada.jsx';
import Panel from './pages/Panel.jsx';
import Recepcion from './pages/Recepcion.jsx';
import './estilos.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Estructura />}>
          <Route index element={<Panel />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="ordenes/:id" element={<DetalleOrden />} />
          <Route path="recepcion" element={<Recepcion />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
