import axios from "axios";

const API = axios.create({
  // Backend real: VITE_API_BASE_URL="http://localhost:3000/api"
  // Mock sin prefijo: VITE_API_BASE_URL="http://localhost:3000"
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

API.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const me = () => API.get("/auth/me");
export const logout = () => API.post("/auth/logout");
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

export const getUser = (id) => API.get(`/usuarios/${id}`);
export const updateUser = (id, d) => API.put(`/usuarios/${id}`, d);
export const deleteUser = (id) => API.delete(`/usuarios/${id}`);

export const getProducts = (params) => API.get("/productos", { params });
export const getProduct = async (id) => {
  // Si estás en mock, busca por id_producto
  if (!import.meta.env.VITE_API_BASE_URL?.includes("/api")) {
    const { data } = await API.get(`/productos`, {
      params: { id_producto: id },
    });
    return { data: data[0] || null };
  }
  // Si es backend real, usa la ruta normal
  return API.get(`/productos/${id}`);
};

export const createProduct = (data) => API.post("/admin/productos", data);
export const updateProduct = (id, data) =>
  API.put(`/admin/productos/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/productos/${id}`);
export const setProductoDestacado = (id, destacado) =>
  API.put(`/admin/productos/${id}/destacado`, { destacado });

export const crearCarrito = (data = {}) => {
  // Si estamos en mock, forzar id_usuario: 1
  if (!import.meta.env.VITE_API_BASE_URL?.includes("/api")) {
    return API.post("/carritos", { ...data, id_usuario: 1 });
  }
  return API.post("/carritos", data);
};
export const getMiCarrito = () => API.get("/carritos/me");
export const borrarCarrito = (id) => API.delete(`/carritos/${id}`);
export const updateCarrito = (id, data) => API.put(`/carritos/${id}`, data);

export const agregarItemCarrito = (id, data) =>
  API.post(`/carritos/${id}/items`, data);
export const updateItemCarrito = (id, id_item, data) =>
  API.put(`/carritos/${id}/items/${id_item}`, data);
export const borrarItemCarrito = (id, id_item) =>
  API.delete(`/carritos/${id}/items/${id_item}`);

export const crearPedido = (data) => API.post("/pedidos", data);
export const obtenerPedido = (id) => API.get(`/pedidos/${id}`);
export const historialPedidos = (params) => API.get("/pedidos", { params });

export const adminUpdatePedido = (id, data) =>
  API.put(`/admin/pedidos/${id}`, data);

export const getResena = (productId, params) =>
  API.get(`/productos/${productId}/resenas`, { params });
export const postResena = (productId, data) =>
  API.post(`/productos/${productId}/resenas`, data);

export const addLike = (productId) =>
  API.post("/favoritos", { id_producto: productId });
export const getLikes = () => API.get("/favoritos?_expand=producto");
export const deleteLike = (id) => API.delete(`/favoritos/${id}`);
export const getLikesCount = (id) => API.get(`/productos/${id}/likes`);

export default API;



