import { useCart } from "../../contexts/CartContext";
import { useEffect, useState } from "react";
import { getProduct } from "../../api/proPulseApi";
import ConfirmBar from "../../componentes/ConfirmBar";

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Carrito() {
  const { items, updateItem, removeItem, totals } = useCart();
  const [productos, setProductos] = useState({});

  useEffect(() => {
    (async () => {
      if (!items.length) return;
      const idsFaltantes = Array.from(
        new Set(items.map((it) => it.id_producto).filter((id) => !(id in productos)))
      );
      if (!idsFaltantes.length) return;

      const resultados = await Promise.all(
        idsFaltantes.map(async (id) => {
          try {
            const { data } = await getProduct(id);
            return [id, data ?? null];
          } catch {
            return [id, null];
          }
        })
      );
      setProductos((prev) => {
        const copy = { ...prev };
        for (const [id, data] of resultados) copy[id] = data;
        return copy;
      });
    })();
  }, [items, productos]);

  if (!items.length) return <p>Tu carrito está vacío.</p>;

  return (
    <div className="container w-full">
      {items.map((it) => {
        const itemId = it.id_detalle ?? it.id_item ?? `${it.id_producto}-${it.precio_unitario}`;
        const producto = productos[it.id_producto];

        const esServicio = (producto?.tipo ?? it.tipo) === "servicio";
        const stockBase =
          typeof producto?.stock === "number" && Number.isFinite(producto.stock)
            ? producto.stock
            : Infinity;
        const stockOriginal = esServicio ? 1 : stockBase;

        const cantidad = Number(it.cantidad) || 1;
        const stockRestante =
          stockOriginal === Infinity ? Infinity : Math.max(0, stockOriginal - cantidad);
        const agotado = stockOriginal !== Infinity && cantidad >= stockOriginal;

        const incrementar = () => {
          if (esServicio) return;
          updateItem(itemId, { cantidad: Math.min(cantidad + 1, stockOriginal) });
        };
        const decrementar = () => {
          if (esServicio) return;
          updateItem(itemId, { cantidad: Math.max(1, cantidad - 1) });
        };

        const btnMasDisabled = esServicio || agotado;
        const btnMenosDisabled = esServicio || cantidad <= 1;

        return (
          <div key={itemId} className="card w-full">
            <div>
              <p>ID: {producto?.id_producto ?? it.id_producto}</p>
              <p>
                {producto?.titulo || it.titulo || "Producto"}
                {esServicio && <span> (Servicio: solo 1 por carrito)</span>}
              </p>
              <p>{fmtCLP.format(it.precio_unitario)}</p>

              {!esServicio && (
                <p>
                  Stock restante:{" "}
                  {stockOriginal === Infinity ? "∞" : stockRestante <= 0 ? 0 : stockRestante}
                  {producto === undefined && <span>(cargando…)</span>}
                </p>
              )}

              <div>
                <button onClick={decrementar} disabled={btnMenosDisabled}>-</button>
                <span>{cantidad}</span>
                <button onClick={incrementar} disabled={btnMasDisabled}>+</button>
              </div>

              {!esServicio && (agotado || stockRestante === 0) && <span>Sin stock</span>}
            </div>

            <button onClick={() => removeItem(itemId)}>Eliminar</button>
          </div>
        );
      })}

      {/* Barra de confirmación y siguiente paso */}
      <ConfirmBar items={items} totals={totals} />
    </div>
  );
}
