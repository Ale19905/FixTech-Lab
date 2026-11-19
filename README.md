# Taller de reparaciones

Aplicación interna para registrar equipos y seguir las órdenes desde la recepción hasta la entrega. El frontend usa React, Vite y React Router. PocketBase almacena los clientes, las órdenes, las fotos y el historial.

## Requisitos

- Node.js 22.12 o posterior y npm.
- El ejecutable de PocketBase para tu sistema operativo y arquitectura. [PocketBase 0.40.6](https://github.com/pocketbase/pocketbase/releases/tag/v0.40.6)

## Arranque en modo desarrollo

Clonar el repo y coloca `pocketbase.exe` en Windows, o `pocketbase` en Linux o macOS, en la misma carpeta que `package.json`, `pb_migrations/` y `pb_hooks/`. Ejecuta los comandos desde esa carpeta.

1. Instala las dependencias con `npm ci` o `npm install` .
2. En la primera terminal, inicia PocketBase y déjalo en ejecución.

   **Windows (CMD)**

   ```cmd
   pocketbase.exe serve --http=127.0.0.1:8090
   ```

   En PowerShell, usa `.\pocketbase.exe` como nombre del ejecutable.

   **Linux o macOS**

   ```bash
   chmod +x pocketbase
   ./pocketbase serve --http=127.0.0.1:8090
   ```

3. En una segunda terminal, inicia Vite.

   ```bash
   npm run dev
   ```

4. Abre el taller en la URL que muestre Vite. Por defecto, usa [http://localhost:5173](http://localhost:5173).

El taller abre directamente y funciona sin cuenta. Si visitas `http://127.0.0.1:8090/_/`, PocketBase muestra su panel de administración. Si necesitas usar ese panel por primera vez, abre el enlace de configuración que aparece en la terminal de PocketBase y crea una cuenta de superusuario.

En desarrollo, Vite reenvía las peticiones de `/api` a `http://127.0.0.1:8090`. Si PocketBase se ejecuta en otra dirección, copia `.env.example` a `.env.local`, configura `VITE_POCKETBASE_URL` y reinicia Vite.

## Datos de ejemplo

Al iniciar, PocketBase crea `pb_data/` y aplica las migraciones pendientes en orden.

| Migración | Qué hace |
| --- | --- |
| `1760000000_crear_colecciones.js` | Crea las colecciones `clientes`, `ordenes` y `eventos`, con sus relaciones y reglas de acceso. |
| `1760000001_cargar_datos_demo.js` | Registra dos clientes, tres órdenes y sus cambios de etapa. |

En **Órdenes** puedes comprobar estos registros después del primer arranque.

| Cliente | Equipo | Etapa inicial | Cambios en el historial |
| --- | --- | --- | --- |
| Ana Torres | Samsung Galaxy A54 | Solicitada | 0 |
| Marcos Díaz | Laptop Lenovo IdeaPad | Presupuestada | 2 |
| Ana Torres | Televisor LG 43″ | Lista | 5 |

Si actualizas desde la versión que cargaba los ejemplos con un script, conserva `pb_data/`, copia la segunda migración a `pb_migrations/` y vuelve a iniciar PocketBase. La migración usa los mismos identificadores, añade los ejemplos que falten y conserva el avance de las órdenes existentes. Al revertir la segunda migración se conservan los registros que ya se hayan cargado.

### Probar el primer arranque con una base nueva

1. Detén PocketBase con **Ctrl+C**.
2. Renombra `pb_data` a `pb_data_respaldo`. Esa carpeta contiene los datos, las fotos, las cuentas de administración y el registro de las migraciones ya aplicadas.

   **Windows (CMD)**

   ```cmd
   ren pb_data pb_data_respaldo
   ```

   **Linux o macOS**

   ```bash
   mv pb_data pb_data_respaldo
   ```

3. Inicia PocketBase con el comando habitual. Se creará un `pb_data` nuevo y se volverán a cargar los ejemplos. Recarga el taller en el navegador.

Para recuperar el respaldo, detén PocketBase, renombra la carpeta nueva `pb_data` a `pb_data_prueba` y vuelve a nombrar `pb_data_respaldo` como `pb_data`. Inicia PocketBase de nuevo.

## Cómo usar el taller

1. En **Recepción**, elige un cliente existente o registra uno nuevo. Indica el equipo y la falla reportada. Puedes adjuntar hasta tres fotos JPG, PNG, WebP, GIF o AVIF de hasta 5 MB cada una.
2. En el detalle de la orden, selecciona **Iniciar diagnóstico**. Para presupuestar, escribe el diagnóstico, la mano de obra y las piezas. Si el trabajo no requiere piezas, deja la lista vacía.
3. Registra la decisión del cliente. Si aprueba, inicia la reparación, marca el equipo como listo y registra la entrega. El rechazo cierra la orden. La cancelación está disponible mientras la orden esté solicitada.
4. En **Órdenes** puedes filtrar por etapa y buscar por equipo, código, cliente o teléfono. El detalle muestra el presupuesto, las fotos y el historial con fecha y hora.

Cada pieza tiene una descripción, una cantidad entera positiva y un precio unitario no negativo. El frontend calcula el total sumando la mano de obra y los subtotales de las piezas. Los importes se muestran sin símbolo de moneda.

## Compilar y servir con PocketBase

Ejecuta `npm run build`, detén la instancia anterior de PocketBase y arráncala con `--publicDir=dist` para servir la compilación.

**Windows (CMD)**

```cmd
pocketbase.exe serve --http=127.0.0.1:8090 --publicDir=dist
```

**Linux o macOS**

```bash
./pocketbase serve --http=127.0.0.1:8090 --publicDir=dist
```

En este modo, el taller se abre en [http://127.0.0.1:8090](http://127.0.0.1:8090). PocketBase sirve el frontend, la API y las fotos desde el mismo origen. Las rutas de detalle también funcionan al recargar.

## Estructura y reglas de negocio

- `src/pages/` contiene el panel, la bandeja de órdenes, la recepción, el detalle y la página para rutas desconocidas.
- `src/components/` reúne los formularios, los componentes reutilizables y el diseño común con `Outlet`.
- `src/services/` concentra las solicitudes `fetch` a PocketBase y la actualización de los datos al abrir una vista o volver a una pestaña visible.
- `pb_migrations/` versiona el esquema y la carga de ejemplos. Las órdenes tienen fechas automáticas de creación y actualización. Cada evento registra la fecha de su cambio de etapa.
- `pb_hooks/taller.pb.js` y `pb_hooks/reglas-ordenes.js` implementan las reglas de recepción, presupuesto y transiciones.

El cambio de etapa y su evento se guardan en una sola transacción. Si falla el guardado de la orden, el evento se revierte. El presupuesto se guarda una sola vez y las órdenes cerradas quedan bloqueadas. La API bloquea la creación manual, la edición y la eliminación de eventos, así como la eliminación de órdenes.

### Comprobar la API

Con PocketBase en ejecución, consulta el presupuesto y el historial de la laptop de ejemplo.

```text
http://127.0.0.1:8090/api/taller/ordenes/ordendemopc0002
```

Para comprobar la validación de etapas, intenta pasar la orden del Samsung directamente de `solicitada` a `aprobada` en una base recién inicializada. La API devuelve `400`.

```cmd
curl.exe -i -X PATCH http://127.0.0.1:8090/api/collections/ordenes/records/ordendemomv0003 -H "Content-Type: application/json" -d "{\"estado\":\"aprobada\"}"
```

