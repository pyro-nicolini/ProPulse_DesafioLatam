// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Al montar: carga el último logeado si quieres (opcional)
  useEffect(() => {
    const stored = sessionStorage.getItem("loggedUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // LOGIN usando la API
  const doLogin = async ({ email, password }) => {
    const { data } = await API.get("/usuarios", {
      params: { email, password },
    });
    if (data && data.length > 0) {
      setUser(data[0]);
      sessionStorage.setItem("loggedUser", JSON.stringify(data[0]));
      return { ok: true };
    }
    throw new Error("Credenciales inválidas");
  };

  // REGISTER usando la API
  const doRegister = async ({ nombre, email, password }) => {
    const newUser = {
      nombre,
      email,
      password,
      rol: "cliente",
      fecha_creacion: new Date().toISOString(),
    };
    const { data } = await API.post("/usuarios", newUser);
    setUser(data);
    sessionStorage.setItem("loggedUser", JSON.stringify(data));
    return { ok: true };
  };

  // LOGOUT
  const doLogout = async () => {
    setUser(null);
    sessionStorage.removeItem("loggedUser"); // 👈 sólo borro la sesión, NO el registrado
  };

  return (
    <AuthContext.Provider value={{ user, doLogin, doRegister, doLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
