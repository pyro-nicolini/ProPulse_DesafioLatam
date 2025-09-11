import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
});

API.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
export const me = () => API.get("/me");
export const logout = () => API.post("/logout");

export const getUser = (id) => API.get(`/usuarios/${id}`);
export const updateUser = (id, data) => API.put(`/usuarios/${id}`, data);
export const deleteUser = (id) => API.delete(`/usuarios/${id}`);

export const getProducts = (params) => API.get("/productos", { params });
export const getProduct = (id) => API.get(`/productos/${id}`);

export const createProduct = (data) => API.post("/admin/productos", data);
export const updateProduct = (id, data) => API.put(`/admin/productos/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/productos/${id}`);
export const setProductFeatured = (id, destacado) =>
  API.put(`/admin/productos/${id}/destacado`, { destacado });

export const createCart = (data) => API.post("/carritos", data);
export const getMyCart = () => API.get("/carritos/me");
export const addCartItem = (id, data) =>
  API.post(`/carritos/${id}/items`, data);
export const updateCartItem = (id, id_item, data) =>
  API.put(`/carritos/${id}/items/${id_item}`, data);
export const deleteCartItem = (id, id_item) =>
  API.delete(`/carritos/${id}/items/${id_item}`);
export const deleteCart = (id) => API.delete(`/carritos/${id}`);

export const createOrder = (data) => API.post("/pedidos", data);
export const getOrder = (id) => API.get(`/pedidos/${id}`);
export const getMyOrders = (params) => API.get("/pedidos", { params });
export const updateOrderAdmin = (id, data) =>
  API.put(`/admin/pedidos/${id}`, data);

export const createReview = (data) => API.post("/resenas", data);
export const getReviewsByProduct = (id, params) =>
  API.get(`/resenas/${id}`, { params });

export const addFavorite = (data) => API.post("/likes", data);
export const getFavorites = () => API.get("/likes");
export const deleteFavorite = (id) => API.delete(`/likes/${id}`);
