import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/userContext";


import { PrivateRoute } from "./routes/PrivateRoute";
import Navbar from "./componentes/Navbar";

// Public routes
import Home from "./vistas/publico/Home";
import Login from "./vistas/publico/Login";
import Register from "./vistas/publico/Register";
import Galeria from "./vistas/publico/Galeria";
import Producto from "./vistas/publico/Producto";
import Planes from "./vistas/publico/Planes";
import Servicios from "./vistas/publico/Servicios";

// Client private routes
import ResumenOrden from "./vistas/client/ResumenOrden";
import ResenaForm from "./vistas/client/ResenaForm";
import ProfileUser from "./vistas/client/ProfileUser";
import Pedido from "./vistas/client/Pedido";
import Favorite from "./vistas/client/Favorite";
import CarritoPreOrden from "./vistas/client/CarritoPreOrden";

// Admin private routes
import AdminShop from "./vistas/admin/AdminShop";
import AdminVentas from "./vistas/admin/AdminVentas";
import AdminProductosForm from "./vistas/admin/AdminProductosForm";
import AdminProductos from "./vistas/admin/AdminProductos";
import Contacto from "./vistas/publico/Contacto";


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/producto" element={<Producto />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* Client private routes */}
          <Route
            path="/resumen-orden"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <ResumenOrden />
              </PrivateRoute>
            }
          />
          <Route
            path="/resena-form"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <ResenaForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile-user"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <ProfileUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/pedido"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <Pedido />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorite"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <Favorite />
              </PrivateRoute>
            }
          />
          <Route
            path="/carrito-preorden"
            element={
              <PrivateRoute roles={["admin", "client"]}>
                <CarritoPreOrden />
              </PrivateRoute>
            }
          />

          {/* Admin private routes */}
          <Route
            path="/admin-shop"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminShop />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-ventas"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminVentas />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-productos-form"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminProductosForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-productos"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminProductos />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
