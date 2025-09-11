import { useEffect, useState } from "react";
import { getProducts } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";
import Carrusel from "../../componentes/Carrusel";

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
  return <Carrusel items={serviciosBarajados} title="Galería de Servicios" routeBase="/servicios" col={4}/>;
}
