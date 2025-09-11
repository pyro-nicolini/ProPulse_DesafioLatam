import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  createCart,
  getMyCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
} from "../api/proPulseApi";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);       // { id_carrito, id_usuario, estado, items: [...] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unpack = (resp) => resp?.data ?? resp;

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      setLoading(true); setError(null);
      const data = unpack(await getMyCart());   // GET /carritos/me
      setCart(data ?? null);
    } catch (e) {
      setCart(null); // si aún no tiene carrito, lo dejamos en null
    } finally { setLoading(false); }
  }, [user]);

  const ensureCart = useCallback(async () => {
    if (!user) throw new Error("Debes iniciar sesión para usar el carrito");
    if (cart?.id_carrito) return cart.id_carrito;
    const data = unpack(await createCart({ id_usuario: user.id })); // POST /carritos
    setCart((prev) => prev ?? { ...data, items: [] });
    return data.id_carrito;
  }, [cart, user]);

  const addItem = useCallback(
    async ({ id_producto, cantidad = 1, precio_unitario }) => {
      const id_carrito = await ensureCart();
      await addCartItem(id_carrito, { id_producto, cantidad, precio_unitario }); // POST /carritos/{id}/items
      await refresh();
    },
    [ensureCart, refresh]
  );

  const setQty = useCallback(
    async (id_item, cantidad) => {
      if (!cart?.id_carrito) return;
      await updateCartItem(cart.id_carrito, id_item, { cantidad }); // PUT /carritos/{id}/items/{id_item}
      await refresh();
    },
    [cart, refresh]
  );

  const removeItem = useCallback(
    async (id_item) => {
      if (!cart?.id_carrito) return;
      await deleteCartItem(cart.id_carrito, id_item); // DELETE /carritos/{id}/items/{id_item}
      await refresh();
    },
    [cart, refresh]
  );

  const clear = useCallback(
    async () => {
      if (!cart?.id_carrito) return;
      await deleteCart(cart.id_carrito); // DELETE /carritos/{id}
      setCart(null);
    },
    [cart]
  );

  const items = cart?.items ?? [];
  const count = useMemo(() => items.reduce((n, it) => n + Number(it.cantidad ?? 0), 0), [items]);
  const total = useMemo(
    () => items.reduce((t, it) => t + Number(it.subtotal ?? (it.precio_unitario ?? 0) * (it.cantidad ?? 1)), 0),
    [items]
  );

  useEffect(() => { refresh(); }, [refresh]);

  const value = {
    cart, items, count, total,
    loading, error,
    refresh, addItem, setQty, removeItem, clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
