import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProduct, crearPedido } from "../api/proPulseApi";

export default function ConfirmBar({ items, totals }) {
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState([]);
  const [acepto, setAcepto] = useState(false);
  const navigate = useNavigate();

  const revalida = async () => {
    const errs = [];
    // Revalida cada ítem contra el backend
    for (const it of items) {
      try {
        const { data: p } = await getProduct(it.id_producto);
        const esServicio = (p?.tipo ?? it.tipo) === "servicio";
        const stock = typeof p?.stock === "number" ? p.stock : Infinity;

        if (esServicio && Number(it.cantidad) !== 1) {
          errs.push({
            id: it.id_producto,
            motivo: "Los servicios solo se pueden agregar 1 vez.",
          });
        }
        if (Number.isFinite(stock) && Number(it.cantidad) > stock) {
          errs.push({
            id: it.id_producto,
            motivo: `Sin stock suficiente. Disponible: ${stock}.`,
          });
        }
      } catch {
        errs.push({
          id: it.id_producto,
          motivo: "No se pudo validar este producto.",
        });
      }
    }
    return errs;
  };

  const onConfirm = async () => {
    setLoading(true);
    setErrores([]);
    // 1) Revalidar
    const errs = await revalida();
    if (errs.length) {
      setErrores(errs);
      setLoading(false);
      return;
    }

    try {
      // 2) Crear pedido (borrador/pendiente) y avanzar
      const payload = {
        estado: "pendiente",
        total: totals?.total ?? 0,
        items: items.map((it) => ({
          id_producto: it.id_producto,
          cantidad: Number(it.cantidad) || 1,
          precio_unitario: Number(it.precio_unitario) || 0,
          tipo: it.tipo ?? null,
          titulo: it.titulo ?? null,
        })),
      };
      const { data } = await crearPedido(payload); // Debes tener este endpoint en tu proPulseApi
      const idPedido = data?.id ?? data?.id_pedido ?? "";
      navigate(idPedido ? `/checkout/${idPedido}` : "/checkout", {
        state: { pedido: data || payload },
      });
    } catch {
      setErrores([{ id: "general", motivo: "No se pudo crear el pedido." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container w-full">
      {errores.length > 0 && (
        <ul>
          {errores.map((e, idx) => (
            <li key={idx}>• {e.motivo}</li>
          ))}
        </ul>
      )}

      <div className="card w-full">
        <div>
          <p>Subtotal: {new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(totals?.subtotal || 0)}</p>
          <p>Total: {new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(totals?.total || 0)}</p>
        </div>

        <label>
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
          />
          <span> Acepto términos y condiciones</span>
        </label>

        <button onClick={onConfirm} disabled={!acepto || loading || !items.length}>
          {loading ? "Confirmando..." : "Confirmar y continuar"}
        </button>
      </div>
    </div>
  );
}
