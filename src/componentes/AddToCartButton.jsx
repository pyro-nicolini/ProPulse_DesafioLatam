// src/componentes/AddCartButton.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function AddCartButton({
  product,
  qty = 1,
  children = "Agregar",
}) {
  const { items, addItem, updateItem } = useCart();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const notify = (t, ms = 1600) => {
    setMsg(t);
    setTimeout(() => setMsg(""), ms);
  };

  const onAdd = async () => {
    if (!user) {
      notify("Inicia sesión para agregar");
      return;
    }

    const id_producto = Number(product?.id_producto ?? product?.id);
    if (!Number.isFinite(id_producto)) {
      console.error("AddCartButton: producto sin id válido", product);
      notify("Producto inválido");
      return;
    }

    const cantidad = Math.max(1, Number(qty) || 1);
    const existente = items.find((i) => Number(i.id_producto) === id_producto);

    setBusy(true);
    try {
      if (existente) {
        const id_linea = existente.id_detalle ?? existente.id_item;
        const nueva = Number(existente.cantidad || 1) + cantidad;
        await updateItem(id_linea, { cantidad: nueva });
        notify("Cantidad actualizada");
      } else {
        await addItem(product, cantidad); // el backend fija precio_unitario/subtotal
        notify("Agregado al carrito");
      }
    } catch (e) {
      console.error("AddCartButton error:", e);
      notify("No se pudo agregar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        className="btn btn-primary"
        onClick={onAdd}
        disabled={busy}
        title="Agregar al carrito"
      >
        {busy ? "Agregando…" : "🛒"} {children}
      </button>
      {msg && <small className="text-gray-600">{msg}</small>}
    </div>
  );
}
