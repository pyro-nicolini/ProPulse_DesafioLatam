import { createContext, useContext } from "react";
import {
  createProduct, updateProduct, deleteProduct, setProductFeatured
} from "../api/proPulseApi";
import { useAuth } from "./AuthContext";

const AdminProdCtx = createContext(null);
export const useAdminProducts = () => useContext(AdminProdCtx);

export function AdminProductsProvider({ children }) {
  const { isAdmin } = useAuth();
  const assertAdmin = () => { if (!isAdmin) throw new Error("No autorizado"); };

  const createOne = async (payload) => { assertAdmin(); return (await createProduct(payload)).data; };
  const updateOne = async (id, payload) => { assertAdmin(); return (await updateProduct(id, payload)).data; };
  const deleteOne = async (id) => { assertAdmin(); return (await deleteProduct(id)).data; };
  const setFeatured = async (id, destacado) => { assertAdmin(); return (await setProductFeatured(id, destacado)).data; };

  return (
    <AdminProdCtx.Provider value={{ createOne, updateOne, deleteOne, setFeatured }}>
      {children}
    </AdminProdCtx.Provider>
  );
}
