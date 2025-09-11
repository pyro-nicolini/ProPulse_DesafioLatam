import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";

export default function Servicio() {
  const { id } = useParams(); // /servicios/:id
  const [servicio, setServicio] = useState(null);

  const [error, setError] = useState(null);
  useFadeUp();
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const { data } = await getProduct(id);
        if (!data || Object.keys(data).length === 0) {
          setError("servicio no encontrado");
          setServicio(null);
        } else {
          setServicio(data);
        }
      } catch (err) {
        setError("Error al cargar servicio");
        setServicio(null);
        console.error("Error al cargar servicio:", err);
      }
    })();
  }, [id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!servicio) return <div>Cargando...</div>;

  return (
    <div className="container flex-col items-center justify-center">
    <div className="card fade-up visible">
      <h3>{servicio?.titulo}</h3>
      <img
        className="img2 w-full"
        src={servicio?.imagen_url}
        alt={servicio?.titulo}
      />
      <p>{servicio?.descripcion}</p>
      <div className="flex gap-1">
        <button className="btn btn-primary">Click Me</button>
        <button className="btn btn-secondary">Click Me</button>
      </div>
    </div>
        </div>
  );
}
