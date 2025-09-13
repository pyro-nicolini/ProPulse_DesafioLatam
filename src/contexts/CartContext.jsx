// src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  getMiCarrito,
  agregarItemCarrito,
  updateItemCarrito,
  borrarItemCarrito,
  updateCarrito,
  crearPedido,
} from "../api/proPulseApi";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);

  // ========== cargar carrito cuando hay usuario ==========
  useEffect(() => {
    if (!user || (typeof token !== "undefined" && !token)) {
      setCartId(null);
      setItems([]);
      return;
    }
    (async () => {
      try {
        const { data } = await getMiCarrito();
        if (data?.id_carrito) {
          setCartId(data.id_carrito);
          setItems(data.items || []);
        } else {
          setCartId(null);
          setItems([]);
        }
      } catch (err) {
        console.error("Error al cargar carrito:", err);
        setCartId(null);
        setItems([]);
      }
    })();
  }, [user, token]);

  // Refuerzo: limpiar carrito si sessionStorage se limpia (logout en otra pestaña)
  useEffect(() => {
    const handler = () => {
      const raw = sessionStorage.getItem("loggedUser");
      if (!raw) {
        setCartId(null);
        setItems([]);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ========== acciones ==========
  const addItem = async (producto, cantidad = 1) => {
    if (!cartId) return;
    try {
      // Siempre usa id_producto (no id) para el backend
      const id_producto = Number(producto.id_producto ?? producto.id);
      const { data } = await agregarItemCarrito(cartId, {
        id_producto,
        cantidad,
      });
      setItems((prev) => [...prev, data]);
    } catch (err) {
      console.error("Error al agregar item:", err);
    }
  };

  const updateItem = async (id_detalle, cambios) => {
    if (!cartId) return;
    try {
      const { data } = await updateItemCarrito(cartId, id_detalle, cambios);
      setItems((prev) =>
        prev.map((it) => (it.id_detalle === id_detalle ? data : it))
      );
    } catch (err) {
      console.error("Error al actualizar item:", err);
    }
  };

  const removeItem = async (id_detalle) => {
    if (!cartId) return;
    try {
      await borrarItemCarrito(cartId, id_detalle);
      setItems((prev) => prev.filter((it) => it.id_detalle !== id_detalle));
    } catch (err) {
      console.error("Error al eliminar item:", err);
    }
  };

  const clearCart = async () => {
    if (!cartId) return;
    try {
      await updateCarrito(cartId, { estado: "cancelado" });
      setItems([]);
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
    }
  };

  const checkout = async () => {
    if (!cartId) return null;
    try {
      const { data } = await crearPedido({ id_carrito: cartId });
      setItems([]);
      return data;
    } catch (err) {
      console.error("Error al crear pedido:", err);
      return null;
    }
  };

  // ========== totales ==========
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    return { subtotal, cantidad: items.length };
  }, [items]);

  return (
    <CartCtx.Provider
      value={{
        cartId,
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        checkout,
        totals,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}
