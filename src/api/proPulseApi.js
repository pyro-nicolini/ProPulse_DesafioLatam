// src/api/proPulseApi.js
import axios from "axios";

const API = axios.create({
  // Real: VITE_API_BASE_URL="http://localhost:3000/api"
  // Mock: VITE_API_BASE_URL="http://localhost:3000"
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

API.interceptors.request.use((config) => {
  // Enviar Authorization siempre que haya token (mock: id_usuario, real: token)
  const token = window.sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ========== AUTH ========== */
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const me = () => API.get("/auth/me");
export const logout = () => API.post("/auth/logout");

/* ========== USUARIOS (id_usuario) ========== */
export const getUser = (id_usuario) => API.get(`/usuarios/${id_usuario}`);
export const updateUser = (id_usuario, d) =>
  API.put(`/usuarios/${id_usuario}`, d);
export const deleteUser = (id_usuario) => API.delete(`/usuarios/${id_usuario}`);

/* ========== PRODUCTOS (id_producto) ========== */
export const getProducts = (params) => API.get("/productos", { params });
export const getProduct = (id_producto) => API.get(`/productos/${id_producto}`);
export const createProduct = (data) => API.post("/admin/productos", data);
export const updateProduct = (id_producto, data) =>
  API.put(`/admin/productos/${id_producto}`, data);
export const deleteProduct = (id_producto) =>
  API.delete(`/admin/productos/${id_producto}`);
export const setProductoDestacado = (id_producto, destacado) =>
  API.put(`/admin/productos/${id_producto}/destacado`, { destacado });

/* ========== CARRITOS (id_carrito / id_detalle) ========== */
// export const crearCarrito  = (data = {}) => API.post("/carritos", data); // SOLO PARA TEST
export const getMiCarrito = async () => {
  // Si NO estás apuntando a "/api", asumimos modo MOCK (json-server)
  if (!import.meta.env.VITE_API_BASE_URL?.includes("/api")) {
    // MOCK: busca por id_usuario y crea si no existe
    const user = JSON.parse(sessionStorage.getItem("loggedUser") || "{}");
    const id_usuario = user.id_usuario || user.id;
    if (!id_usuario) throw new Error("No hay usuario logueado");

    const { data } = await API.get("/carritos", { params: { id_usuario } });
    if (Array.isArray(data) && data.length > 0) {
      return { data: data[0] };
    }
    const nuevo = await API.post("/carritos", {
      id_usuario,
      estado: "activo",
      fecha_creacion: new Date().toISOString(), // solo mock
    });
    return { data: nuevo.data };
  }
  // BACKEND REAL: usa /carritos/me (el backend debe resolver el usuario por token)
  return API.get("/carritos/me");
};

export const updateCarrito = (id_carrito, data) =>
  API.put(`/carritos/${id_carrito}`, data);
export const borrarCarrito = (id_carrito) =>
  API.delete(`/carritos/${id_carrito}`);

export const agregarItemCarrito = (id_carrito, data) =>
  API.post(`/carritos/${id_carrito}/items`, data);
export const updateItemCarrito = (id_carrito, id_detalle, data) =>
  API.put(`/carritos/${id_carrito}/items/${id_detalle}`, data);
export const borrarItemCarrito = (id_carrito, id_detalle) =>
  API.delete(`/carritos/${id_carrito}/items/${id_detalle}`);

/* ========== PEDIDOS (id_pedido) ========== */
export const crearPedido = (data) => API.post("/pedidos", data);
export const obtenerPedido = (id_pedido) => API.get(`/pedidos/${id_pedido}`);

// Detalle de pedido (ajuste: usar /pedidos_detalle)
export const pedidoDetalle = (id_pedido) =>
  API.get(`/pedidos_detalle`, { params: { id_pedido } });

export const adminUpdatePedido = (id_pedido, data) =>
  API.put(`/admin/pedidos/${id_pedido}`, data);

/* ========== RESEÑAS / LIKES ========== */
export const getResena = (id_producto, params) =>
  API.get(`/productos/${id_producto}/resenas`, { params });
export const postResena = (id_producto, data) =>
  API.post(`/productos/${id_producto}/resenas`, data);

export const addLike = (id_producto) => API.post("/favoritos", { id_producto });

// Ajuste: usar params para el expand
export const getLikes = () =>
  API.get("/favoritos", { params: { _expand: "producto" } });

export const deleteLike = (id_like) => API.delete(`/favoritos/${id_like}`);
export const getLikesCount = (id_producto) =>
  API.get(`/productos/${id_producto}/likes`);

export default API;
