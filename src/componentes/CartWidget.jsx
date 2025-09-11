import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function CartWidget() {
  const { count } = useCart();
  return (
    <Link className="nav-link" to="/cart">
      🛒 Carrito {count > 0 ? `(${count})` : ""}
    </Link>
  );
}