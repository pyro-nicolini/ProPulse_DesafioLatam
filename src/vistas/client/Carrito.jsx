// src/vistas/client/Carrito.jsx
import { useCart } from "../../contexts/CartContext";
import ConfirmBar from "../../componentes/ConfirmBar";
import { getProduct } from "../../api/proPulseApi";
import { useEffect, useState } from "react";

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Carrito() {
  const { items, updateItem, removeItem, totals } = useCart();
  const [productos, setProductos] = useState({}); // { [id_producto]: producto }

  // Traer productos faltantes sólo si no vienen embebidos en el item
  useEffect(() => {
    if (!items.length) return;
    const faltantes = Array.from(
      new Set(
        items
          .filter((it) => !it.producto) // no viene expandido
          .map((it) => it.id_producto)
          .filter((id) => id && !productos[id]) // no está en cache
      )
    );

    if (!faltantes.length) return;

    (async () => {
      try {
        const results = await Promise.allSettled(
          faltantes.map((id) => getProduct(id))
        );
        const nuevos = {};
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value?.data?.id_producto) {
            const p = r.value.data;
            nuevos[p.id_producto] = p;
          }
        });
        if (Object.keys(nuevos).length) {
          setProductos((prev) => ({ ...prev, ...nuevos }));
        }
      } catch (e) {
        console.error("Error cargando productos para el carrito:", e);
      }
    })();
  }, [items, productos]);

  if (!items.length) return <p>Tu carrito está vacío.</p>;

  return (
    <div className="container w-full">
      {items.map((it) => {
        const itemId = it.id_detalle ?? it.id_item; // clave del detalle
        const idProducto = it.id_producto;

        // Producto “resuelto”: embebido -> cache -> campos del item
        const p =
          it.producto ??
          productos[idProducto] ??
          {
            id_producto: idProducto,
            titulo: it.titulo,
            imagen_url: it.imagen_url,
            stock: it.stock,
            tipo: it.tipo,
            precio: it.precio_unitario,
          };

        const titulo = p?.titulo || it.titulo || "Producto";
        const thumb = p?.imagen_url || it.imagen_url || "";
        const esServicio = (p?.tipo ?? it.tipo) === "servicio";

        // Stock
        const stockOriginal =
          typeof p?.stock === "number" && Number.isFinite(p.stock)
            ? p.stock
            : Infinity;

        const cantidad = Number(it.cantidad) || 1;
        const stockRestante =
          stockOriginal === Infinity
            ? Infinity
            : Math.max(0, stockOriginal - cantidad);
        const agotado = stockOriginal !== Infinity && cantidad >= stockOriginal;

        const incrementar = () => {
          if (esServicio) return; // servicios: máx 1
          updateItem(itemId, { cantidad: Math.min(cantidad + 1, stockOriginal) });
        };

        const decrementar = () => {
          if (esServicio) return;
          updateItem(itemId, { cantidad: Math.max(1, cantidad - 1) });
        };

        const btnMasDisabled = esServicio || agotado;
        const btnMenosDisabled = esServicio || cantidad <= 1;

        return (
          <div
            key={itemId}
            className="card w-full flex gap-4 items-start py-3 border-b"
          >
            {thumb && (
              <img
                src={thumb}
                alt={titulo}
                className="png4"
              />
            )}

            <div className="flex-1">
              <p className="text-xs text-gray-500">ID: {idProducto}</p>
              <h3 className="font-semibold">
                {titulo}
                {esServicio && (
                  <span className="text-xs text-gray-500"> — servicio (máx. 1)</span>
                )}
              </h3>

              <p className="mt-1">{fmtCLP.format(it.precio_unitario)}</p>

              {!esServicio && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock restante:{" "}
                  {stockOriginal === Infinity ? "∞" : Math.max(0, stockRestante)}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={decrementar}
                  disabled={btnMenosDisabled}
                  className="px-2 border rounded"
                  title="Restar 1"
                >
                  −
                </button>
                <span className="min-w-8 text-center">{cantidad}</span>
                <button
                  onClick={incrementar}
                  disabled={btnMasDisabled}
                  className="px-2 border rounded"
                  title="Sumar 1"
                >
                  +
                </button>
              </div>

              {!esServicio && (agotado || stockRestante === 0) && (
                <span className="text-xs text-red-600 mt-1 inline-block">
                  Sin stock
                </span>
              )}

              <p className="mt-2 text-sm">
                Subtotal:{" "}
                <strong>
                  {fmtCLP.format(it.subtotal || cantidad * it.precio_unitario)}
                </strong>
              </p>
            </div>

            <button
              onClick={() => removeItem(itemId)}
              className="text-red-600 hover:underline"
              title="Eliminar del carrito"
            >
              Eliminar
            </button>
          </div>
        );
      })}

      <ConfirmBar items={items} totals={totals} />
    </div>
  );
}
