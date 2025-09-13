import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function CartWidget() {
  const { items, totals } = useCart();
  // Suma total de cantidades de todos los items
  const count = items.reduce((a, i) => a + (Number(i.cantidad) || 0), 0);
  // Formato CLP
  const fmtCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
  return (
    <Link to="/carrito">
      <button className="btn btn-secondary p-1">
        🛒 {count} — {fmtCLP.format(totals.subtotal || 0)}
      </button>
    </Link>
  );
}
