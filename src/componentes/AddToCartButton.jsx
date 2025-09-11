// src/componentes/AddToCartButton.jsx
import { useState } from "react";
import { useCart } from "../contexts/CartContext";

export default function AddToCartButton({ producto }) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const onAdd = async () => {
    try {
      setLoading(true);
      await addItem({
        id_producto: producto.id,
        cantidad: 1,
        precio_unitario: producto.precio,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={onAdd} disabled={loading} className="btn btn-primary">
      {loading ? "Agregando..." : "Agregar al carrito"}
    </button>
  );
}