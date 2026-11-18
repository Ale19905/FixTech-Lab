export const etapas = [
  { valor: 'solicitada', nombre: 'Solicitada' },
  { valor: 'en_diagnostico', nombre: 'En diagnóstico' },
  { valor: 'presupuestada', nombre: 'Presupuestada' },
  { valor: 'aprobada', nombre: 'Aprobada' },
  { valor: 'en_reparacion', nombre: 'En reparación' },
  { valor: 'lista', nombre: 'Lista' },
  { valor: 'entregada', nombre: 'Entregada' },
  { valor: 'rechazada', nombre: 'Rechazada' },
  { valor: 'cancelada', nombre: 'Cancelada' },
];

export const etapasActivas = etapas.slice(0, 6);

export function nombreEtapa(valor) {
  return etapas.find((etapa) => etapa.valor === valor)?.nombre ?? valor;
}

export function codigoOrden(id) {
  return `#${id.toUpperCase()}`;
}

export function totalPresupuesto(manoObra, piezas) {
  return piezas.reduce((total, pieza) => total + pieza.cantidad * pieza.precio, manoObra);
}

const formatoImporte = new Intl.NumberFormat('es', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const formatoFecha = new Intl.DateTimeFormat('es', { dateStyle: 'medium' });
const formatoFechaHora = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function mostrarImporte(importe) {
  return formatoImporte.format(importe);
}

export function mostrarFecha(fecha, incluirHora = false) {
  if (!fecha) return '—';
  const fechaPocketBase = new Date(fecha.replace(' ', 'T'));
  return (incluirHora ? formatoFechaHora : formatoFecha).format(fechaPocketBase);
}
