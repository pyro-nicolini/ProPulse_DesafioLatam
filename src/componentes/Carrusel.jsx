import { Link } from "react-router-dom";

export default function Carrusel({ items = [], title, routeBase, col = 3 }) {
  return (
    <div className="glass p-1 fade-up w-full">
      <h1 className="mb-6">{title}</h1>
      <div className={`grid ${col === 1 ? 'grid-cols-1' : col === 2 ? 'grid-cols-2' : col === 3 ? 'grid-cols-3' : col === 4 ? 'grid-cols-4' : ''} gap-3`}>
        {items.map((item) => (
          <div
            key={item.id_producto ?? item.id}
            style={{ backgroundImage: `url(${item.imagen_url})` }}
            className="card-bg-img parallax"
          >
            <Link to={`${routeBase}/${item.id_producto ?? item.id}`}>
              <h3>{item.titulo}</h3>
              <h2>{item.precio}</h2>
              <span className="flex text-center">{item.descripcion}</span>
              <div className="container z-10 flex-col justify-end">
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
