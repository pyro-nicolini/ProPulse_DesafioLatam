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

    // 2) Navegar a resumen de orden, pasando items y totales
    navigate("/checkout/resumen", {
      state: { items, totals },
    });
    setLoading(false);
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
          <p>
            Subtotal:{" "}
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
              maximumFractionDigits: 0,
            }).format(totals?.subtotal || 0)}
          </p>
          <p>
            Impuesto 19%:{" "}
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
              maximumFractionDigits: 0,
            }).format(totals?.subtotal * 0.19 || 0)}
          </p>
          <p>
            Total:{" "}
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
              maximumFractionDigits: 0,
            }).format(totals?.subtotal * 1.19 || 0)}
          </p>
        </div>

        <label>
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
          />
          <span> Acepto términos y condiciones</span>
        </label>

        <button
          onClick={onConfirm}
          disabled={!acepto || loading || !items.length}
        >
          {loading ? "Confirmando..." : "Confirmar y continuar"}
        </button>
      </div>
    </div>
  );
}
