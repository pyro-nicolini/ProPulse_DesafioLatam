import { useEffect, useState } from "react";
import { getProducts } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";
import Carrusel from "../../componentes/Carrusel";
import Destacados from "../../componentes/Destacados";

export default function GaleriaServicios() {
  const [servicios, setServicios] = useState([]);
  useFadeUp();

  useEffect(() => {
    (async () => {
      const { data } = await getProducts();
      setServicios(data.filter((p) => p.tipo === "servicio"));
    })();
  }, []);

  const desordenarArray = (array) =>
    [...array].sort(() => Math.random() - 0.5);

  const serviciosBarajados = desordenarArray(servicios).slice(0, 6);
  return (
    <>
    <div className="w-full container-1200 min-h-screen">
      <Carrusel items={serviciosBarajados} title="Galería de Servicios" routeBase="/servicios" col={3}/>
      <Destacados title="Servicios Destacados" col={3} routeBase="/servicios" cant={3} tipoProducto="servicio"/>
    </div>
    </>
  );
}
