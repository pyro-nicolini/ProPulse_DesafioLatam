import { useEffect, useState } from "react";
import { getProducts } from "../../api/proPulseApi";
import { useFadeUp } from "../../hooks/useFadeUp";
import Carrusel from "../../componentes/Carrusel";
import Destacados from "../../componentes/Destacados";

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
  return (
    <>
    <div className="w-full container-1200 min-h-screen">
      <Carrusel items={productosBarajados} title="Galería de Productos" routeBase="/productos" col={3}/>
      <Destacados title="Productos Destacados" col={3} routeBase="/productos" cant={3} tipoProducto="producto"/>
    </div>
    </>
  )
}
