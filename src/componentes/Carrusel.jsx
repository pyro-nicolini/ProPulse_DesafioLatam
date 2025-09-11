import { Link } from "react-router-dom";

export default function Carrusel({ items = [], title, routeBase, col = 3 }) {
  return (
    <div className="glass p-1 fade-up w-full">
      <h1 className="mb-6">{title}</h1>
      <div className={`grid grid-cols-${col} gap-3`}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{ backgroundImage: `url(${item.imagen_url})` }}
            className="card-bg-img parallax"
          >
            <Link to={`${routeBase}/${item.id_producto ?? item.id}`}>
              <h3>{item.titulo}</h3>
              <div className="container z-10 flex-col justify-end">
                <p>Estas son las " img4 " mantienen relación cuadrada con CONTAIN</p>
                <div className="flex gap-1">
                  <button className="btn btn-primary">Click Me</button>
                  <button className="btn btn-secondary">Click Me</button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
