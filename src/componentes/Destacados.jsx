import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/proPulseApi";

const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export default function Destacados({
  title = "Destacados",
  col = 3,
  routeBase = "/producto",
  cant = 6,
  tipoProducto = "producto",
}) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const colsClass = useMemo(() => colsMap[col] || colsMap[3], [col]);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const { data } = await getProducts();
        const destacados = (data ?? []).filter(
          (p) => p?.tipo === tipoProducto && p?.destacado === true
        );
        setItems(destacados.slice(0, cant));
      } catch (e) {
        console.error(e);
        setErr("No se pudieron cargar los destacados");
      }
    })();
  }, [tipoProducto, cant]);

  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!items.length) return <div>No hay destacados para mostrar.</div>;

  return (
    <div className="p-1 container-1200">
      <h1 className="mb-6">{title}</h1>

      <div className={`grid ${colsClass} gap-3`}>
        {items.map((item) => {
          const id = item.id_producto ?? item.id;
          return (
            <div
              key={id}
              style={{ backgroundImage: `url(${item.imagen_url || "/placeholder.png"})` }}
              className="card-bg-img parallax"
            >
              <Link to={`${routeBase}/${id}`}>
                <h3>{item.titulo}</h3>
                <div className="container z-10 flex-col justify-end">
                  <p>Item destacado</p>
                  <div className="flex gap-1">
                    <button className="btn btn-primary">Ver más</button>
                    <button className="btn btn-secondary">Agregar</button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
