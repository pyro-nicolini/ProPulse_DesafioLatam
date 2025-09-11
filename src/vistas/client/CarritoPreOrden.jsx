// src/vistas/client/CarritoPreOrden.jsx (o tu ruta de carrito)
import { useCart } from "../../contexts/CartContext";

export default function CarritoPreOrden() {
  const { items, total, setQty, removeItem, clear, loading } = useCart();

  if (loading) return <div className="p-4">Cargando carrito...</div>;
  if (!items.length) return <div className="p-4">Tu carrito está vacío.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">Tu carrito</h1>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id_item} className="border p-2 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">Producto #{it.id_producto}</div>
              <div>PU: ${it.precio_unitario} | Subtotal: ${it.subtotal}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(it.id_item, Math.max(1, (it.cantidad ?? 1) - 1))}>-</button>
              <span>{it.cantidad}</span>
              <button onClick={() => setQty(it.id_item, (it.cantidad ?? 1) + 1)}>+</button>
              <button onClick={() => removeItem(it.id_item)} className="text-red-600">Quitar</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <div className="text-lg font-semibold">Total: ${total}</div>
        <button onClick={clear} className="mt-2">Vaciar carrito</button>
      </div>
    </div>
  );
}