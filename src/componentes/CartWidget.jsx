import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export default function CartWidget() {
  const { items, totals } = useCart();
  const { user } = useAuth();
  // Suma total de cantidades de todos los items
  const count = items.reduce((a, i) => a + (Number(i.cantidad) || 0), 0);
  // Formato CLP
  const fmtCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  // Solo mostrar si hay usuario
  if (!user) return null;

  return (
    <Link to="/carrito">
      <button className="btn btn-secondary p-1">
        🛒 {count} — {fmtCLP.format(totals.subtotal || 0)}
      </button>
    </Link>
  );
}
