# Taller de reparaciones

Aplicación interna para registrar equipos, consultar órdenes y seguirlas desde la recepción hasta la entrega. El frontend usa React, Vite y React Router. PocketBase almacena clientes, órdenes, fotos e historial. El personal entra directamente al panel.

## Requisitos

- Node.js 22.12 o posterior y npm.
- [PocketBase 0.40.6](https://github.com/pocketbase/pocketbase/releases/tag/v0.40.6), en la variante de tu sistema operativo y arquitectura.

## Puesta en marcha

1. Descomprime el ZIP. Extrae el ejecutable de PocketBase y colócalo en la carpeta `taller-reparaciones`, junto a `package.json`, `pb_migrations` y `pb_hooks`.
2. Abre una terminal en esa carpeta y ejecuta `npm ci`.
3. En la primera terminal, inicia PocketBase. En Linux o macOS, si hace falta, da permiso de ejecución con `chmod +x pocketbase`.

   **Linux o macOS**

   ```bash
   ./pocketbase serve --http=127.0.0.1:8090
   ```

   **Windows PowerShell**

   ```powershell
   .\pocketbase.exe serve --http=127.0.0.1:8090
   ```

   PocketBase crea `pb_data/`, aplica la migración y carga los hooks al iniciar. Puedes usar la aplicación y cargar los datos de ejemplo sin crear un superusuario.

4. Con PocketBase en ejecución, abre una segunda terminal en la misma carpeta.

   ```bash
   npm run datos:demo
   npm run dev
   ```

5. Abre [http://localhost:5173](http://localhost:5173) o la dirección que indique Vite. La carga de ejemplo se puede omitir para empezar con una base vacía.

### Datos de ejemplo

| Cliente | Teléfono | Equipo | Etapa inicial del ejemplo |
| --- | --- | --- | --- |
| Ana Torres | 555-0101 | Samsung Galaxy A54 | Solicitada |
| Marcos Díaz | 555-0102 | Laptop Lenovo IdeaPad | Presupuestada |
| Ana Torres | 555-0101 | Televisor LG 43″ | Lista |

El script utiliza identificadores fijos y avanza las órdenes por la API, así que el historial de ejemplo se crea con los mismos hooks que el historial real. Se puede ejecutar de nuevo sin duplicar los clientes ni las órdenes. Si una orden ya pasó a una etapa fuera del recorrido del ejemplo, conserva ese avance.

### Compilar y servir con PocketBase

Ejecuta `npm run build`. Detén la instancia de PocketBase que estabas usando y vuelve a abrirla con `--publicDir=dist`.

```bash
./pocketbase serve --http=127.0.0.1:8090 --publicDir=dist
```

En PowerShell usa `.\pocketbase.exe` en lugar de `./pocketbase`. Abre [http://127.0.0.1:8090](http://127.0.0.1:8090). PocketBase sirve el frontend, la API y las fotos desde ese mismo origen. La URL de detalle funciona al recargar porque PocketBase redirige las rutas de la SPA a `index.html`.

En desarrollo Vite redirige `/api` a `127.0.0.1:8090`. Si necesitas otra dirección, copia `.env.example` a `.env.local`, ajusta `VITE_POCKETBASE_URL` y reinicia Vite o vuelve a compilar. Para el script de demostración puedes indicar el mismo servidor mediante la variable `POCKETBASE_URL`.

## Cómo usar la aplicación

1. En **Recepción**, elige un cliente existente o registra uno nuevo. Escribe el equipo y la falla reportada. Puedes adjuntar hasta tres fotos JPG, PNG, WebP, GIF o AVIF de hasta 5 MB cada una.
2. Abre la orden y selecciona **Iniciar diagnóstico**. Registra el diagnóstico, la mano de obra y las piezas. Usa una lista vacía si el trabajo no requiere piezas.
3. Registra la aprobación o el rechazo del cliente. Si aprueba, inicia la reparación, marca el equipo como listo y registra la entrega. Si el cliente pide cancelarla antes del diagnóstico, usa **Cancelar orden**.
4. Consulta **Órdenes** para filtrar por etapa o buscar por código, equipo o datos del cliente. El detalle muestra el presupuesto, las fotos y el historial con fecha y hora.

Los importes se muestran sin símbolo de moneda porque el enunciado no fija una. Cada pieza usa `{ descripcion, cantidad, precio }`, con una cantidad entera positiva y un precio unitario no negativo. El frontend calcula el total sumando la mano de obra y los subtotales de cada pieza.

## Estructura y reglas de negocio

- `src/pages/` contiene el panel, la bandeja, la recepción, el detalle y la página de rutas desconocidas.
- `src/components/` contiene los componentes reutilizables, los formularios y el diseño común con `Outlet`.
- `src/services/` concentra las peticiones `fetch` y la sincronización con PocketBase. La interfaz vuelve a consultar los datos al abrir cada vista y al volver a una pestaña visible.
- `pb_migrations/` define `clientes`, `ordenes` y `eventos`, sus relaciones, las fotos y las reglas de acceso. `created` y `updated` son fechas automáticas de PocketBase en las órdenes. Los eventos usan `created` como fecha del cambio.
- `pb_hooks/taller.pb.js` conecta los hooks, la recepción y la lectura del detalle. `pb_hooks/reglas-ordenes.js` valida la etapa inicial, las transiciones y el presupuesto.

El cambio de etapa y su evento se guardan en una sola transacción. Si falla el guardado de la orden, el evento se revierte. El detalle lee la orden y el historial dentro de otra transacción. La creación de un cliente nuevo y su orden de recepción también es atómica.

PocketBase permite consultar el historial. La API pública bloquea la creación manual, edición y eliminación de eventos y la eliminación de órdenes. Los hooks validan las actualizaciones directas, bloquean los cambios a órdenes cerradas y permiten guardar el presupuesto una sola vez. La configuración de arranque escucha en `127.0.0.1`, ya que el sistema del taller funciona sin autenticación.

### Comprobación por la API

Con los datos de ejemplo cargados, esta petición al servidor debe devolver `400` porque intenta pasar de solicitada a aprobada directamente.

```bash
curl -i -X PATCH http://127.0.0.1:8090/api/collections/ordenes/records/ordendemomv0003 \
  -H 'Content-Type: application/json' \
  -d '{"estado":"aprobada"}'
```

Ejecuta el siguiente comando para consultar el presupuesto y el historial de una orden.

```bash
curl http://127.0.0.1:8090/api/taller/ordenes/ordendemopc0002
```

## Historial local del proyecto

El ZIP incluye el repositorio Git local. Tras extraerlo, `git log --oneline` muestra los commits de la implementación.
