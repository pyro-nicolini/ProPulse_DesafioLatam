import { createContext, useContext, useMemo, useRef, useState } from "react";
import { getProducts, getProduct } from "../api/proPulseApi";

const CatalogCtx = createContext(null);
export const useCatalog = () => useContext(CatalogCtx);

export function CatalogProvider({ children }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());

  const fetchProducts = async (params = {}) => {
    const key = JSON.stringify(params || {});
    if (cache.current.has(key)) { const data = cache.current.get(key); setList(data); return data; }
    setLoading(true);
    const { data } = await getProducts(params);
    cache.current.set(key, data);
    setList(data);
    setLoading(false);
    return data;
  };

  const fetchProduct = async (id) => {
    const key = `id:${id}`;
    if (cache.current.has(key)) return cache.current.get(key);
    const { data } = await getProduct(id);
    cache.current.set(key, data);
    return data;
  };

  const value = useMemo(() => ({
    products: list,
    loading,
    getProducts: fetchProducts,
    getProduct: fetchProduct
  }), [list, loading]);

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}
