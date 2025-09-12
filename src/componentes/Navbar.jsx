import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/img/logos/logo_color_w.png";
import CartWidget from "../componentes/CartWidget";

import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, doLogout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar container">
        <Link className="nav-link" to="/profile-user">
          <img className="navbar-brand" src={logo} alt="ProPulse" />
        </Link>

        <button
          aria-label="Abrir menú"
          onClick={() => setOpen((prev) => !prev)}
          className="nav-toggle"
        >
          &#9776;
        </button>
          <Link className="nav-link" to="/cart">
            <CartWidget />
          </Link>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-link">Hola, {user.nombre}</span>
              {console.log(user)}
              <button
                onClick={doLogout}
                className="nav-link btn-logout"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </>
          )}
          <Link className="nav-link" to="/">
            Home
          </Link>
          <Link className="nav-link plantilla" to="/plantilla">
            Plantilla
          </Link>
          <Link className="nav-link" to="/productos">
            Productos
          </Link>
          <Link className="nav-link" to="/servicios">
            Servicios
          </Link>
          <Link className="nav-link" to="/contacto">
            Contacto
          </Link>

        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          {user ? (
            <>

              <button
                onClick={() => {
                  doLogout();
                  setOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          )}
          <Link to="/productos" onClick={() => setOpen(false)}>
            Productos
          </Link>
          <Link to="/servicios" onClick={() => setOpen(false)}>
            Servicios
          </Link>
          <Link to="/contacto" onClick={() => setOpen(false)}>
            Contacto
          </Link>
          <button
            onClick={doLogout}
            className="nav-link btn-logout"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Salir
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
