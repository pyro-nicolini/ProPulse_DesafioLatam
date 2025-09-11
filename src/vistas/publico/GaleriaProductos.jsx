import { useEffect, useState } from "react";
import { getProducts } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";
import Carrusel from "../../componentes/Carrusel";

export default function GaleriaProductos() {
  const [productos, setProductos] = useState([]);
  useFadeUp();

  useEffect(() => {
    (async () => {
      const { data } = await getProducts();
      setProductos(data.filter((p) => p.tipo === "producto"));
    })();
  }, []);

    const desordenarArray = (array) =>
    [...array].sort(() => Math.random() - 0.5);

  const productosBarajados = desordenarArray(productos).slice(0, 6);
  return <Carrusel items={productosBarajados} title="Galería de Productos" routeBase="/productos" col={3}/>;
}
