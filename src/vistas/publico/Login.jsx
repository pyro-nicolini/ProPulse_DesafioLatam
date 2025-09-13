import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFadeUp } from "../../hooks/useFadeUp";
import { useAuth } from "../../contexts/AuthContext";

import logoColor1 from "../../assets/img/logos/logo_propulse.svg";
import foto2 from "../../assets/img/ejemplos/nike-running.webp";

const fmtErr = (e) => (e?.response?.data?.error || "Credenciales inválidas");

export default function Login() {
  useFadeUp();
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(form);
      nav("/"); // redirige donde quieras
    } catch (e) {
      setErr(fmtErr(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container glass p-2 fade-up">
      <div className="container-cards grid grid-cols-2 gap-2">
        {/* Columna izquierda: formulario */}
        <div className="card fade-up">
          <div className="flex items-center gap-1 mb-2">
            <img src={logoColor1} alt="ProPulse" className="png w-16 h-16" />
            <div>
              <h1 className="text-gradient m-0">Ingresar</h1>
              <p className="subtitle m-0">Bienvenido de vuelta</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-2">
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
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {err && <p className="text-red-600 text-sm">{String(err)}</p>}

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <p className="text-sm mt-1">
              ¿No tienes cuenta?&nbsp;
              <Link to="/register" className="underline">
                Crear una cuenta
              </Link>
            </p>
          </form>
        </div>

        {/* Columna derecha: imagen/branding */}
        <div className="card card-bg-img fade-up text-shadow relative overflow-hidden"
             style={{ backgroundImage: `url(${foto2})` }}>
          <div className="relative z-20 flex-col justify-end h-full">
            <h3 className="m-0">Tu progreso, en movimiento</h3>
            <p className="m-0">Compra productos y servicios deportivos al instante.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
