import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";
import AddToCartButton from "../../componentes/AddToCartButton";

export default function Producto() {
  const { id } = useParams(); // /productos/:id
  const [producto, setProducto] = useState(null);

  const [error, setError] = useState(null);
  useFadeUp();
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const { data } = await getProduct(id);
        if (!data || Object.keys(data).length === 0) {
          setError("Producto no encontrado");
          setProducto(null);
        } else {
          setProducto(data);
        }
      } catch (err) {
        setError("Error al cargar producto");
        setProducto(null);
        console.error("Error al cargar producto:", err);
      }
    })();
  }, [id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!producto) return <div>Cargando...</div>;

  return (
    <div className="container flex-col items-center justify-center">
    <div className="card fade-up visible">
      <h3>{producto?.titulo}</h3>
      <img
        className="img2 w-full"
        src={producto?.imagen_url}
        alt={producto?.titulo}
      />
      <p>{producto?.descripcion}</p>
      <div className="flex gap-1">
        <AddToCartButton producto={producto} />
        <button className="btn btn-secondary">Click Me</button>
      </div>
    </div>
        </div>
  );
}
