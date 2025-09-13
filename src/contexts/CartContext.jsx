// src/contexts/CartContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  // itemsRaw: lo que viene del backend (puede ser items o carrito_detalle)
  const [itemsRaw, setItemsRaw] = useState([]);

  // Mutex simple por id_producto para evitar condiciones de carrera
  const inflight = useRef(new Map()); // id_producto -> Promise en curso

  // ---------- cargar carrito ----------
  useEffect(() => {
    (async () => {
      if (!user || (typeof token !== "undefined" && !token)) {
        setCartId(null);
        setItemsRaw([]);
        return;
      }
      try {
        const { data } = await getMiCarrito();
        const id = data?.id_carrito ?? data?.id ?? null;
        // Siempre usar items del backend, si existen
        let detalle = [];
        if (Array.isArray(data?.items) && data.items.length) {
          detalle = data.items;
        } else if (
          Array.isArray(data?.carrito_detalle) &&
          data.carrito_detalle.length
        ) {
          detalle = data.carrito_detalle;
        }
        setCartId(id);
        setItemsRaw(detalle);
      } catch (e) {
        console.error("getMiCarrito() falló:", e);
        setCartId(null);
        setItems([]);
      }
    })();
  }, [user, token]);

  const refresh = async () => {
    try {
      const { data } = await getMiCarrito();
      const id = data?.id_carrito ?? data?.id ?? null;
      const detalle = data?.items ?? data?.carrito_detalle ?? [];
      setCartId(id);
      setItemsRaw(Array.isArray(detalle) ? detalle : []);
      return { id, detalle: Array.isArray(detalle) ? detalle : [] };
    } catch (e) {
      console.error("refresh carrito falló:", e);
      return { id: null, detalle: [] };
    }
  };

  // ============ núcleo anti-409 ============
  // Garantiza que, si ya existe la línea en server, se actualiza; si no existe, se crea.
  const ensureLine = async (id_producto, deltaCantidad = 1) => {
    if (!cartId) return;

    // serializar por producto para evitar overlap de clicks
    const running = inflight.current.get(id_producto);
    if (running) return running; // reusar la promesa en curso

    const job = (async () => {
      // 1) siempre parte con estado FRESCO del server
      const { detalle: d1 } = await refresh();
      const linea1 = d1.find(
        (it) => Number(it.id_producto) === Number(id_producto)
      );

      if (linea1) {
        const id_linea = linea1.id_detalle ?? linea1.id_item;
        const nueva = Number(linea1.cantidad || 1) + Number(deltaCantidad || 0);
        await updateItem(id_linea, { cantidad: nueva });
        return;
      }

      // 2) si NO existe, intenta CREAR (en mock enviamos id_carrito en el body)
      try {
        await agregarItemCarrito(cartId, {
          id_carrito: cartId,
          id_producto,
          cantidad: Math.max(1, Number(deltaCantidad) || 1),
        });
        await refresh();
        return;
      } catch (e) {
        // 3) si el server dice ITEM_DUPLICADO (409), refresca y ACTUALIZA la real
        if (e?.response?.status === 409) {
          const { detalle: d2 } = await refresh();
          const linea2 = d2.find(
            (it) => Number(it.id_producto) === Number(id_producto)
          );
          if (linea2) {
            const id_linea = linea2.id_detalle ?? linea2.id_item;
            const nueva =
              Number(linea2.cantidad || 1) +
              Math.max(1, Number(deltaCantidad) || 1);
            await updateItem(id_linea, { cantidad: nueva });
            return;
          }
        }
        console.error("ensureLine error:", e);
      }
    })();

    inflight.current.set(id_producto, job);
    try {
      await job;
    } finally {
      inflight.current.delete(id_producto);
    }
  };

  // ---------- acciones públicas ----------
  const addItem = async (product, qty = 1) => {
    if (!cartId) return;
    const id_producto = Number(product?.id_producto ?? product?.id);
    if (!Number.isFinite(id_producto)) {
      console.error("addItem: id_producto inválido", product);
      return;
    }
    await ensureLine(id_producto, Math.max(1, Number(qty) || 1));
  };

  const updateItem = async (id_detalle, patch) => {
    if (!cartId) return;
    const body = { ...patch };
    if (typeof body.cantidad === "number" && body.cantidad < 1) {
      return removeItem(id_detalle);
    }
    try {
      const { data } = await updateItemCarrito(cartId, id_detalle, body);
      if (data && (data.id_detalle ?? data.id_item) === id_detalle) {
        setItemsRaw((prev) =>
          prev.map((it) =>
            (it.id_detalle ?? it.id_item) === id_detalle ? data : it
          )
        );
      } else {
        await refresh();
      }
    } catch (e) {
      console.error("updateItem error:", e);
      await refresh();
    }
  };

  const removeItem = async (id_detalle) => {
    if (!cartId) return;
    try {
      await borrarItemCarrito(cartId, id_detalle);
      setItemsRaw((prev) =>
        prev.filter((it) => (it.id_detalle ?? it.id_item) !== id_detalle)
      );
    } catch (e) {
      console.error("removeItem error:", e);
      await refresh();
    }
  };

  const clearCart = async () => {
    if (!cartId) return;
    try {
      await updateCarrito(cartId, { estado: "cancelado" });
      await refresh();
    } catch (e) {
      console.error("clearCart error:", e);
    }
  };

  const checkout = async () => {
    if (!cartId) return null;
    try {
      const { data } = await crearPedido({ id_carrito: cartId });
      await refresh();
      return data;
    } catch (e) {
      console.error("checkout error:", e);
      return null;
    }
  };

  // ---------- totales ----------
  const totals = useMemo(() => {
    const subtotal = itemsRaw.reduce(
      (acc, it) =>
        acc +
        Number(
          it.subtotal ??
            Number(it.precio_unitario || 0) * Number(it.cantidad || 0)
        ),
      0
    );
    return { subtotal, cantidad_lineas: itemsRaw.length };
  }, [itemsRaw]);

  // items: siempre un array de líneas de carrito, sin importar el nombre del campo
  const items = useMemo(() => {
    if (Array.isArray(itemsRaw)) return itemsRaw;
    return [];
  }, [itemsRaw]);

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
        refresh,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}
