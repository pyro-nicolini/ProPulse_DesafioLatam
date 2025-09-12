// src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  crearCarrito,
  getMiCarrito,
  borrarCarrito,
  agregarItemCarrito,
  updateItemCarrito,
  borrarItemCarrito,
  crearPedido,
  getProduct,
} from "../api/proPulseApi";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);

  // Boot: cargar carrito + detalle
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMiCarrito();
        if (data?.id_carrito) {
          setCartId(data.id_carrito);
          if (Array.isArray(data.carrito_detalle)) {
            setItems(data.carrito_detalle);
          } else {
            try {
              const res = await fetch(`/carrito_detalle?id_carrito=${data.id_carrito}`);
              const detalles = await res.json();
              setItems(detalles);
            } catch {
              setItems([]);
            }
          }
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.error("Error al obtener carrito:", err);
        }
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (acc, it) => acc + Number(it.precio_unitario) * Number(it.cantidad),
      0
    );
    return { subtotal, envio: 0, total: subtotal };
  }, [items]);

  const ensureCart = async () => {
    if (cartId) return cartId;
    const { data } = await crearCarrito({});
    setCartId(data.id_carrito);
    return data.id_carrito;
  };

  // ===== Helpers de reglas =====
  const _esServicio = (ref) => (ref?.tipo ?? null) === "servicio";

  // Revalida contra backend: stock y 1× para servicios
  const validateItems = async () => {
    const errores = [];
    for (const it of items) {
      try {
        const { data: p } = await getProduct(it.id_producto);
        const esServicio = _esServicio(p) || _esServicio(it);
        const stock = Number.isFinite(p?.stock) ? Number(p.stock) : Infinity;
        const cant = Number(it.cantidad) || 1;

        if (esServicio && cant !== 1) {
          errores.push({ id_producto: it.id_producto, motivo: "Servicio: solo 1 por carrito." });
        }
        if (Number.isFinite(stock) && cant > stock) {
          errores.push({
            id_producto: it.id_producto,
            motivo: `Stock insuficiente. Disponible: ${stock}.`,
          });
        }
      } catch {
        errores.push({ id_producto: it.id_producto, motivo: "No se pudo validar el producto." });
      }
    }
    if (errores.length) {
      const err = new Error("Validación de carrito fallida");
      err.detalle = errores;
      throw err;
    }
  };

  // ===== Acciones =====
  const addItem = async (product, qty = 1) => {
    const id = await ensureCart();
    const pid = Number(product?.id_producto ?? product?.id);
    const precio = Number(product?.precio ?? product?.precio_unitario);
    if (!Number.isFinite(pid)) throw new Error("id de producto inválido");
    if (!Number.isFinite(precio)) throw new Error("precio inválido");
    if (!Number.isFinite(qty) || qty <= 0) throw new Error("cantidad inválida");

    const existing = items.find((i) => i.id_producto === pid);
    const esServicio = _esServicio(product);

    // Regla: servicio = máximo 1
    if (esServicio && existing) {
      // ya existe, no sumamos más
      return existing;
    }

    if (!existing) {
      const payload = {
        id_producto: pid,
        cantidad: esServicio ? 1 : qty,
        precio_unitario: precio,
        // opcionales para mostrar sin volver a pedir: (si tu backend los ignora, no pasa nada)
        titulo: product.titulo ?? product.nombre ?? undefined,
        tipo: product.tipo ?? undefined,
        imagen_url: product.imagen_url ?? product.url_image ?? undefined,
      };
      const { data: created } = await agregarItemCarrito(id, payload);
      setItems((prev) => [...prev, created]);
      return created;
    } else {
      const itemId = existing.id_detalle ?? existing.id_item;
      const nuevaCantidad = esServicio ? 1 : existing.cantidad + qty;
      const { data: updated } = await updateItemCarrito(id, itemId, {
        cantidad: nuevaCantidad,
      });
      setItems((prev) =>
        prev.map((i) => ((i.id_detalle ?? i.id_item) === itemId ? { ...i, ...updated } : i))
      );
      return updated;
    }
  };

  const updateItem = async (itemId, { cantidad }) => {
    // Clamp mínimo
    if (cantidad <= 0) return removeItem(itemId);

    // Si el item es servicio, fuerza a 1
    const current = items.find((i) => (i.id_detalle ?? i.id_item) === itemId);
    const esServicio = _esServicio(current);
    const nextCantidad = esServicio ? 1 : cantidad;

    await updateItemCarrito(cartId, itemId, { cantidad: nextCantidad });
    setItems((prev) =>
      prev.map((i) =>
        (i.id_detalle ?? i.id_item) === itemId ? { ...i, cantidad: nextCantidad } : i
      )
    );
  };

  const removeItem = async (itemId) => {
    await borrarItemCarrito(cartId, itemId);
    setItems((prev) => prev.filter((i) => (i.id_detalle ?? i.id_item) !== itemId));
  };

  const clear = async () => {
    if (cartId) await borrarCarrito(cartId);
    setCartId(null);
    setItems([]);
  };

  // Checkout con validación previa
  const checkout = async ({ direccion_envio, metodo_pago = "tarjeta" }) => {
    await validateItems(); // lanza si hay errores
    const { data: pedido } = await crearPedido({
      id_carrito: cartId,
      direccion_envio,
      metodo_pago,
      total: totals.total,
      // opcional: copia de items para auditoría rápida
      items: items.map((it) => ({
        id_producto: it.id_producto,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        tipo: it.tipo ?? null,
        titulo: it.titulo ?? null,
      })),
    });
    await clear();
    return pedido;
  };

  return (
    <CartCtx.Provider
      value={{
        cartId,
        items,
        totals,
        addItem,
        updateItem,
        removeItem,
        clear,
        checkout,
        validateItems, // útil para una pantalla previa
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}
