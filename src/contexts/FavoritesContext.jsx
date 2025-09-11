import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addFavorite, getFavorites, deleteFavorite } from "../api/proPulseApi";
import { useAuth } from "./AuthContext";

const FavsCtx = createContext(null);
export const useFavorites = () => useContext(FavsCtx);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setFavorites([]); return; }
    setLoading(true);
    const { data } = await getFavorites(); // lista del usuario autenticado
    setFavorites(data ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id_usuario]);

  const isFavorite = (id_producto) =>
    favorites?.some?.(f => (f.id_producto ?? f?.producto?.id_producto) === id_producto);

  const toggle = async (id_producto) => {
    if (isFavorite(id_producto)) {
      await deleteFavorite(id_producto);   // DELETE /likes/:id_producto
    } else {
      await addFavorite({ id_producto });  // POST /likes
    }
    await refresh();
  };

  const value = useMemo(() => ({ favorites, loading, refresh, isFavorite, toggle }), [favorites, loading]);

  return <FavsCtx.Provider value={value}>{children}</FavsCtx.Provider>;
}
