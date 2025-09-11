import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createCart, getMyCart, addCartItem, updateCartItem, deleteCartItem, deleteCart
} from "../api/proPulseApi";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setCart(null); return null; }
    setLoading(true);
    const { data } = await getMyCart(); // backend debe devolver carrito activo del usuario
    setCart(data ?? null);
    setLoading(false);
    return data;
  };

  const ensureCart = async () => {
    if (cart?.id_carrito && cart?.estado === "activo") return cart;
    const { data } = await createCart({});
    setCart(data);
    return data;
  };

  const addItem = async ({ id_producto, cantidad, precio_unitario }) => {
    const c = await ensureCart();
    await addCartItem(c.id_carrito, { id_producto, cantidad, precio_unitario });
    return refresh();
  };

  const updateItemQty = async (id_item, cantidad) => {
    await updateCartItem(cart.id_carrito, id_item, { cantidad });
    return refresh();
  };

  const removeItem = async (id_item) => {
    await deleteCartItem(cart.id_carrito, id_item);
    return refresh();
  };

  const clearCart = async () => {
    if (!cart?.id_carrito) return;
    await deleteCart(cart.id_carrito);
    setCart(null);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id_usuario]);

  const items = cart?.items ?? cart?.carrito_detalle ?? [];
  const total = useMemo(() =>
    items.reduce((acc, it) => acc + (it.subtotal ?? (it.cantidad * it.precio_unitario)), 0)
  , [items]);

  return (
    <CartCtx.Provider value={{
      cart, items, loading, total,
      refresh, addItem, updateItemQty, removeItem, clearCart
    }}>
      {children}
    </CartCtx.Provider>
  );
}
