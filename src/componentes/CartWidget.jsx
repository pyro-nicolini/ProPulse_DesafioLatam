import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function CartWidget() {
  const { items, totals } = useCart();
  const count = items.reduce((a, i) => a + (i.cantidad || 0), 0);
  return (
    <>
    <Link to="/carrito">
    <button className="btn btn-secondary p-1">
      🛒 {count} — ${totals.total}
    </button>
    </Link>
    </>
  );
}
