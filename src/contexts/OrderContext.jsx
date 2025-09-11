import { createContext, useContext, useMemo, useState } from "react";
import { createOrder, getOrder, getMyOrders, updateOrderAdmin } from "../api/proPulseApi";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const OrderCtx = createContext(null);
export const useOrders = () => useContext(OrderCtx);

export function OrderProvider({ children }) {
  const { isAdmin } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const listMyOrders = async (params = {}) => {
    setLoading(true);
    const { data } = await getMyOrders(params);
    setOrders(data ?? []);
    setLoading(false);
    return data;
  };

  const placeOrder = async (payload) => {
    // payload puede incluir direccion_envio, metodo_pago, etc.
    const { data } = await createOrder(payload);
    await refreshCart(); // carrito debería quedar inactivo/vacío
    return data;
  };

  const adminUpdateOrder = async (id, fields) => {
    if (!isAdmin) throw new Error("No autorizado");
    const { data } = await updateOrderAdmin(id, fields); // { estado }
    return data;
  };

  const fetchOrder = async (id) => {
    const { data } = await getOrder(id);
    return data;
  };

  const value = useMemo(() => ({
    orders, loading, listMyOrders, placeOrder, adminUpdateOrder, fetchOrder
  }), [orders, loading, isAdmin]);

  return <OrderCtx.Provider value={value}>{children}</OrderCtx.Provider>;
}
