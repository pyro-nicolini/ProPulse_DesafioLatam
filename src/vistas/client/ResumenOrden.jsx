import { useCart } from "../../contexts/CartContext";
import { useState } from "react";

export default function ResumenOrden() {
  const { totals, checkout } = useCart();
  const [direccion, setDireccion] = useState("");
  const [metodo, setMetodo] = useState("tarjeta");

  const onConfirm = async () => {
    const pedido = await checkout({
      direccion_envio: direccion,
      metodo_pago: metodo,
    });
    // redirige a /pedido/:id o muestra toast
    console.log("Pedido creado:", pedido);
  };

  return (
    <aside className="p-4 border rounded-xl">
      <h3 className="font-semibold mb-2">Resumen</h3>
      <p>Subtotal: ${totals.subtotal}</p>
      <p>Envío: $0</p>
      <p className="font-bold">Total: ${totals.total}</p>

      <input
        className="input mt-3 w-full"
        placeholder="Dirección de envío"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
      />
      <select
        className="select mt-2 w-full"
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
      >
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>

      <button className="btn btn-primary mt-3 w-full" onClick={onConfirm}>
        Confirmar pedido
      </button>
    </aside>
  );
}
