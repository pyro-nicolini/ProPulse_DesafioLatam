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
  const [feedback, setFeedback] = useState("");

  // Asegura que el id_producto sea correcto y consistente (siempre número)
  const idProducto = Number(product?.id_producto ?? product?.id);
  // Si el producto no tiene id_producto pero sí id, lo adaptamos
  const productoParaAgregar = {
    ...product,
    id_producto: idProducto,
    id: idProducto,
  };
  // Siempre compara id_producto como número
  const existente = items.find((i) => Number(i.id_producto) === idProducto);

  const esServicio = product?.tipo === "servicio";
  const stockNumerico =
    typeof product?.stock === "number" && Number.isFinite(product.stock);
  const maxStock = stockNumerico ? Number(product.stock) : Infinity;

  const enCarrito = Number(existente?.cantidad ?? 0);
  const stockRestante =
    maxStock === Infinity ? Infinity : Math.max(0, maxStock - enCarrito);

  const servicioLimitado = esServicio && enCarrito >= 1;
  const agotado = !esServicio && stockNumerico && stockRestante <= 0;
  const disabled = servicioLimitado || agotado;

  const notify = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 1800);
  };

  const onAdd = async () => {
    if (!user) {
      notify("Debes iniciar sesión para agregar productos al carrito");
      return;
    }
    if (!Number.isFinite(idProducto)) {
      notify("Producto inválido (ID no encontrado)");
      console.error("Intento de agregar producto sin id válido:", product);
      return;
    }

    if (servicioLimitado) {
      notify("Este servicio solo se puede agregar una vez");
      return;
    }
    if (agotado) {
      notify("No hay más stock disponible");
      return;
    }

    // Log de depuración para ver qué se intenta agregar
    console.log("Intentando agregar al carrito:", { productoParaAgregar, qty });

    try {
      const nQty = Math.max(1, Number(qty) || 1);

      if (esServicio) {
        // 1 unidad máx.
        if (existente) {
          notify("Este servicio ya está en tu carrito");
          return;
        }
        console.log("Agregando servicio:", productoParaAgregar);
        await addItem(productoParaAgregar, 1);
        notify("Servicio agregado");
        return;
      }

      // Producto físico
      if (existente) {
        const nueva = stockNumerico
          ? Math.min(Number(existente.cantidad) + nQty, maxStock)
          : Number(existente.cantidad) + nQty;

        if (nueva === Number(existente.cantidad)) {
          notify("Alcanzaste el stock disponible");
          return;
        }
        await updateItem(existente.id_detalle, { cantidad: nueva });
        notify("Cantidad actualizada");
        return;
      }
      // Si no existe, agregar nuevo item
      const inicial = stockNumerico ? Math.min(nQty, maxStock) : nQty;
      console.log("Agregando producto físico:", productoParaAgregar);
      await addItem(productoParaAgregar, inicial);
      notify("Producto agregado");
    } catch (e) {
      console.error(e);
      notify("No se pudo agregar. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        className="btn btn-primary"
        onClick={onAdd}
        disabled={disabled}
        title={
          servicioLimitado
            ? "Servicio ya agregado"
            : agotado
            ? "Sin stock"
            : undefined
        }
      >
        🛒 {children} {servicioLimitado && "(Ya agregado)"}{" "}
        {agotado && "(Sin stock)"}
      </button>

      {!esServicio && stockNumerico && (
        <small className={agotado ? "text-yellow-500" : "text-gray-500"}>
          Stock restante: {Math.max(0, stockRestante)}
        </small>
      )}

      {feedback && <small className="text-red-600">{feedback}</small>}
    </div>
  );
}
