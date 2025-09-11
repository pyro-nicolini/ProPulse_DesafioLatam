// src/api/marketplaceApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api"
});


// Interceptor: agrega token si existe
API.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


// ========== AUTH ==========
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const me = () => API.get("/auth/me");
export const logout = () => API.post("/auth/logout");


// ========== USUARIOS ==========
// (crear usuario YA NO: lo hace /auth/register)
export const getUser = (id) => API.get(`/usuarios/${id}`);
export const updateUser = (id, data) => API.put(`/usuarios/${id}`, data);
export const deleteUser = (id) => API.delete(`/usuarios/${id}`);


// ========== PRODUCTOS ==========
// Public
export const getProducts = (params) => API.get("/productos", { params });
export const getProduct = (id) => API.get(`/productos/${id}`);

// Admin (unico admin)
export const createProduct = (data) => API.post("/admin/productos", data);
export const updateProduct = (id, data) => API.put(`/admin/productos/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/productos/${id}`);
export const setProductFeatured = (id, destacado) =>
  API.put(`/admin/productos/${id}/destacado`, { destacado });


// ========== CARRITO ==========
export const createCart = (data) => API.post("/carritos", data); // crea/retorna activo
export const getMyCart = () => API.get("/carritos/me");
export const addCartItem = (id_carrito, data) =>
  API.post(`/carritos/${id_carrito}/items`, data);
export const updateCartItem = (id_carrito, id_item, data) =>
  API.put(`/carritos/${id_carrito}/items/${id_item}`, data);
export const deleteCartItem = (id_carrito, id_item) =>
  API.delete(`/carritos/${id_carrito}/items/${id_item}`);
export const deleteCart = (id_carrito) => API.delete(`/carritos/${id_carrito}`);


// ========== PEDIDOS ==========
export const createOrder = (data) => API.post("/pedidos", data);
export const getOrder = (id) => API.get(`/pedidos/${id}`);
export const getMyOrders = (params) => API.get("/pedidos", { params });
// Admin: cambiar estado
export const updateOrderAdmin = (id, data) =>
  API.put(`/admin/pedidos/${id}`, data);


// ========== RESENAS ==========
export const createReview = (data) => API.post("/resenas", data);
export const getReviewsByProduct = (id_producto, params) =>
  API.get(`/resenas/${id_producto}`, { params });


// ========== FAVORITOS (LIKES) ==========
export const addFavorite = (data) => API.post("/likes", data);
export const getFavorites = () => API.get("/likes"); // del usuario autenticado
export const deleteFavorite = (id_producto) => API.delete(`/likes/${id_producto}`);
