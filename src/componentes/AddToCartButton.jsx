import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";

export default function AddCartButton({
  product,
  qty = 1,
  children = "Agregar",
}) {
  const { items, addItem } = useCart();

  // Buscar si ya está en el carrito
  const item = items.find(
    (i) => i.id_producto === (product.id_producto ?? product.id)
  );
  const cantidadEnCarrito = item?.cantidad || 0;

  // Stock normal (productos físicos)
  const maxStock =
    typeof product.stock === "number" ? product.stock : Infinity;
  const stockRestante = maxStock - cantidadEnCarrito;
  const agotado = typeof product.stock === "number" && stockRestante <= 0;

  // Caso especial: servicios (solo 1 permitido)
  const servicioLimitado =
    product.tipo === "servicio" && cantidadEnCarrito >= 1;

  const disabled = agotado || servicioLimitado;

  const [feedback, setFeedback] = useState("");
  const onAdd = () => {
    if (disabled) {
      setFeedback(
        agotado
          ? "No hay más stock disponible"
          : "Este servicio solo se puede agregar una vez"
      );
      return;
    }
    addItem(product, qty);
    setFeedback("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
      <button
        className="btn btn-primary"
        onClick={onAdd}
        disabled={disabled}
      >
        🛒 {children}{" "}
        {agotado && "(Sin stock)"} {servicioLimitado && "(Ya agregado)"}
      </button>

      {typeof product.stock === "number" && (
        <h3
          style={{
            fontSize: "0.9em",
            color: agotado ? "yellow" : "#ffffffff",
          }}
        >
          Stock restante: {stockRestante <= 0 ? 0 : stockRestante}
        </h3>
      )}

      {feedback && (
        <span style={{ color: "red", fontSize: "0.9em" }}>{feedback}</span>
      )}
    </div>
  );
}
