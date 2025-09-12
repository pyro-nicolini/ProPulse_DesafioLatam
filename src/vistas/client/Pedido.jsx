import { useEffect, useState } from "react";
import { obtenerPedido } from "../../api/proPulseApi";
import { useParams } from "react-router-dom";

export default function Pedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    obtenerPedido(id).then(({ data }) => setPedido(data));
  }, [id]);

  if (!pedido) return <p>Cargando pedido...</p>;

  return (
    <div>
      <h2>Pedido #{pedido.id_pedido}</h2>
      <p>Estado: {pedido.estado}</p>
      <p>Total: ${pedido.total}</p>
      {/* Puedes mapear los detalles aquí */}
    </div>
  );
}
