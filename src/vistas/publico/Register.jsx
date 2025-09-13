import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFadeUp } from "../../hooks/useFadeUp";
import { useAuth } from "../../contexts/AuthContext";

import logoColor3 from "../../assets/img/logos/logo_propulse_white.png";
import foto4 from "../../assets/img/ejemplos/run.jpeg";

const fmtErr = (e) => (e?.response?.data?.error || "Error al registrarse");

export default function Register() {
  useFadeUp();
  const nav = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(form);
      nav("/"); // a donde prefieras
    } catch (e) {
      setErr(fmtErr(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container glass p-2 fade-up">
      <div className="container-cards grid grid-cols-2 gap-2">
        {/* Columna izquierda: imagen/branding */}
        <div
          className="card card-bg-img fade-up text-shadow relative overflow-hidden"
          style={{ backgroundImage: `url(${foto4})` }}
        >
          <div className="relative z-20 flex-col justify-end h-full">
            <img src={logoColor3} alt="ProPulse" className="png3 w-24 h-24 bg-gradient-primary mb-2" />
            <h3 className="m-0">Crea tu cuenta</h3>
            <p className="m-0">Únete y comienza a impulsar tu entrenamiento.</p>
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <div className="card fade-up">
          <h1 className="text-gradient m-0">Registro</h1>
          <p className="subtitle m-0">Completa tus datos</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-2 mt-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                className="input border p-2"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input border p-2"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password">Contraseña</label>
              <div className="flex gap-1">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="input border p-2 flex-1"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {err && <p className="text-red-600 text-sm">{String(err)}</p>}

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p className="text-sm mt-1">
              ¿Ya tienes cuenta?&nbsp;
              <Link to="/login" className="underline">
                Ingresar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
