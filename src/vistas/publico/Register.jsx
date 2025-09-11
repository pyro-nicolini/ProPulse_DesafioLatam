// src/vistas/publico/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const { doRegister } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRegister(form);
    nav("/", { replace: true });
  };

  return (
    <div style={{ maxWidth: 380, margin: "2rem auto" }}>
      <h1>Crear cuenta (demo)</h1>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        En esta demo, siempre quedas como <b>Maria Lopez</b>.
      </p>
      <form onSubmit={onSubmit}>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={onChange}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          required
        />
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
        <button type="submit" style={{ width: "100%", padding: 10 }}>Crear cuenta</button>
      </form>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
      </p>
    </div>
  );
}
