import { createContext, useContext, useRef } from "react";
import { createReview, getReviewsByProduct } from "../api/proPulseApi";

const ReviewCtx = createContext(null);
export const useReviews = () => useContext(ReviewCtx);

export function ReviewProvider({ children }) {
  const cache = useRef(new Map()); // id_producto -> reviews

  const listByProduct = async (id_producto, params = {}) => {
    const key = `${id_producto}:${JSON.stringify(params)}`;
    if (cache.current.has(key)) return cache.current.get(key);
    const { data } = await getReviewsByProduct(id_producto, params);
    cache.current.set(key, data);
    return data;
  };

  const addReview = async ({ id_producto, comentario, calificacion }) => {
    const { data } = await createReview({ id_producto, comentario, calificacion });
    cache.current.clear();
    return data;
  };

  return (
    <ReviewCtx.Provider value={{ listByProduct, addReview }}>
      {children}
    </ReviewCtx.Provider>
  );
}
