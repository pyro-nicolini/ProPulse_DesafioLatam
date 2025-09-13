import { useCart } from "../../contexts/CartContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResumenOrden() {
  const { totals, checkout } = useCart();
  const [direccion, setDireccion] = useState("");
  const [metodo, setMetodo] = useState("tarjeta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fmt = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

  const {
    subtotal: ctxSubtotal = 0,
    envio: ctxEnvio = 0,
    total: ctxTotal,
  } = totals || {};

  // Ciudades y precios de envío
  const ciudades = [
    { nombre: "Santiago", precio: 3000 },
    { nombre: "Valparaíso", precio: 4000 },
    { nombre: "Concepción", precio: 5000 },
    { nombre: "La Serena", precio: 4500 },
    { nombre: "Antofagasta", precio: 6000 },
    { nombre: "Puerto Montt", precio: 7000 },
    { nombre: "Arica", precio: 7000 },
    { nombre: "Iquique", precio: 6500 },
    { nombre: "Alto Hospicio", precio: 6500 },
    { nombre: "Pozo Almonte", precio: 6500 },
    { nombre: "Calama", precio: 6000 },
    { nombre: "Tocopilla", precio: 6000 },
    { nombre: "Copiapó", precio: 5000 },
    { nombre: "Vallenar", precio: 5000 },
    { nombre: "Ovalle", precio: 4500 },
    { nombre: "Quillota", precio: 4000 },
    { nombre: "San Antonio", precio: 4000 },
    { nombre: "Rancagua", precio: 3500 },
    { nombre: "San Fernando", precio: 3500 },
    { nombre: "Talca", precio: 4000 },
    { nombre: "Curicó", precio: 4000 },
    { nombre: "Linares", precio: 4500 },
    { nombre: "Chillán", precio: 5000 },
    { nombre: "Los Ángeles", precio: 5500 },
    { nombre: "Temuco", precio: 6000 },
    { nombre: "Villarrica", precio: 6500 },
    { nombre: "Valdivia", precio: 6500 },
    { nombre: "Osorno", precio: 7000 },
    { nombre: "Castro", precio: 8000 },
    { nombre: "Coyhaique", precio: 9000 },
    { nombre: "Punta Arenas", precio: 10000 },
    { nombre: "Puerto Natales", precio: 11000 },
    { nombre: "Aysén", precio: 9500 },
    { nombre: "Quellón", precio: 8500 },
    { nombre: "Angol", precio: 6000 },
    { nombre: "San Felipe", precio: 4000 },
    { nombre: "Melipilla", precio: 3500 },
    { nombre: "Colina", precio: 3500 },
    { nombre: "Peñaflor", precio: 3500 },
    { nombre: "Padre Hurtado", precio: 3500 },
    { nombre: "Machalí", precio: 3500 },
    { nombre: "Pucón", precio: 7000 },
    { nombre: "Lebu", precio: 7000 },
    { nombre: "Curanilahue", precio: 7000 },
    { nombre: "San Pedro de la Paz", precio: 5000 },
    { nombre: "Coronel", precio: 5000 },
    { nombre: "Talcahuano", precio: 5000 },
    { nombre: "Hualpén", precio: 5000 },
    { nombre: "Chiguayante", precio: 5000 },
    { nombre: "Otra ciudad", precio: 12000 }
  ];

  // Estado para ciudad y envío local (controla el "envio" que se usa en totales)
  const [ciudad, setCiudad] = useState(ciudades[0].nombre);
  const [envioLocal, setEnvioLocal] = useState(ciudades[0].precio);

  // Si viene un envío desde el contexto (p.ej. backend), úsalo como valor inicial
  useEffect(() => {
    if (Number(ctxEnvio) > 0) {
      setEnvioLocal(Number(ctxEnvio));
      // opcional: también podrías alinear "ciudad" buscando la que coincida por precio
      const match = ciudades.find((c) => c.precio === Number(ctxEnvio));
      if (match) setCiudad(match.nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxEnvio]);

  const { subtotal, iva, envio, total } = useMemo(() => {
    const s = Number(ctxSubtotal) || 0;
    const ivaCalc = Math.round(s * 0.19);
    const e = Number(envioLocal) || 0;         // 👈 usar el envío local
    const t = Number.isFinite(ctxTotal) ? Number(ctxTotal) : s + ivaCalc + e;
    return { subtotal: s, iva: ivaCalc, envio: e, total: t };
  }, [ctxSubtotal, ctxTotal, envioLocal]);

  const carritoVacio = subtotal <= 0;

  const handleCiudadChange = (e) => {
    const seleccionada = ciudades.find((c) => c.nombre === e.target.value);
    setCiudad(seleccionada.nombre);
    setEnvioLocal(seleccionada.precio);       // 👈 actualiza envío al cambiar ciudad
  };

  const onConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      if (!direccion.trim()) {
        setError("Debes ingresar una dirección de envío.");
        setLoading(false);
        return;
      }
      if (carritoVacio) {
        setError("Tu carrito está vacío.");
        setLoading(false);
        return;
      }

      const pedido = await checkout({
        direccion_envio: direccion.trim(),
        metodo_pago: metodo,
        montos: { subtotal, iva, envio, total }, // 👈 envío actualizado
        ciudad_envio: ciudad,                    // opcional: persistir ciudad elegida
      });

      const id = pedido?.id_pedido ?? pedido?.id;
      if (id) navigate(`/pedidos/${id}`);
      else setError("No se pudo crear el pedido.");
    } catch {
      setError("Error al crear el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="p-4 border rounded-xl">
      <h3 className="font-semibold mb-3">Resumen</h3>

      <div className="space-y-1 text-sm">
        <p>Subtotal: {fmt(subtotal)}</p>
        <p>Impuesto 19%: {fmt(iva)}</p>

        <div>
          <span>Ciudad: </span>
          <select
            className="select inline w-auto"
            value={ciudad}
            onChange={handleCiudadChange}
          >
            {ciudades.map((c) => (
              <option key={c.nombre} value={c.nombre}>
                {c.nombre} (+{fmt(c.precio)})
              </option>
            ))}
          </select>
        </div>

        <p>Envío: {fmt(envio)}</p>

        <p className="font-bold text-base pt-1 border-t mt-2">
          Total: {fmt(total + envio)}
        </p>
      </div>

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

      {error && <div className="text-red-600 mt-2">{error}</div>}

      <button
        className="btn btn-primary mt-3 w-full"
        onClick={onConfirm}
        disabled={loading || carritoVacio}
      >
        {loading ? "Confirmando..." : "Confirmar pedido"}
      </button>
    </aside>
  );
}
