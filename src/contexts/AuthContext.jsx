// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Usuario fallback (si no hay ninguno registrado)
const HARDCODED_USER = {
  id: 3,
  nombre: "Maria Lopez",
  email: "maria@mail.com",
  password: "maria@mail.com",
  rol: "cliente",
  fecha_creacion: "2025-09-10T00:00:00Z",
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Al montar: carga el último logeado si quieres (opcional)
  useEffect(() => {
    const stored = sessionStorage.getItem("loggedUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // LOGIN
  const doLogin = async ({ email, password }) => {
    // buscamos primero en localStorage
    const stored = localStorage.getItem("registeredUser");
    const registered = stored ? JSON.parse(stored) : null;

    if (
      registered &&
      registered.email === email &&
      registered.password === password
    ) {
      setUser(registered);
      sessionStorage.setItem("loggedUser", JSON.stringify(registered));
      return { ok: true };
    }

    // fallback hardcodeado
    if (email === HARDCODED_USER.email && password === HARDCODED_USER.password) {
      setUser(HARDCODED_USER);
      sessionStorage.setItem("loggedUser", JSON.stringify(HARDCODED_USER));
      return { ok: true };
    }

    throw new Error("Credenciales inválidas");
  };

  // REGISTER
  const doRegister = async ({ nombre, email, password }) => {
    const newUser = {
      id: Date.now(),
      nombre,
      email,
      password,
      rol: "cliente",
      fecha_creacion: new Date().toISOString(),
    };

    // guardamos al usuario registrado en localStorage (permanece aunque cierres sesión)
    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    // además lo seteamos como logeado ahora mismo
    setUser(newUser);
    sessionStorage.setItem("loggedUser", JSON.stringify(newUser));

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
