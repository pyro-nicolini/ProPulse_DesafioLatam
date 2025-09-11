// src/vistas/publico/Login.jsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { doLogin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await doLogin(form);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2.message || "Error al iniciar sesión");
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "2rem auto" }}>
      <h1>Ingresar</h1>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Demo: <b>maria@mail.com</b> / <b>maria@mail.com</b>
      </p>
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          required
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>Entrar</button>
      </form>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
      </p>
    </div>
  );
}
