import { useEffect, useState } from "react";
import {
  obtenerPedido,
  pedidoDetalle,
  getProduct,
} from "../../api/proPulseApi";
import { useParams } from "react-router-dom";

export default function Pedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState({}); // { [id_producto]: producto }

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // 1) Cabecera del pedido
        const { data } = await obtenerPedido(id);
        if (cancel) return;
        setPedido(data);

        // 2) Intentar obtener items de distintas formas
        let its = [];
        if (Array.isArray(data?.items) && data.items.length) {
          its = data.items;
        } else if (Array.isArray(data?.detalles) && data.detalles.length) {
          its = data.detalles;
        } else {
          // 3) Mock/json-server: pedir detalles aparte
          const r = await pedidoDetalle(id).catch(() => ({ data: [] }));
          its = Array.isArray(r?.data) ? r.data : [];
        }
        if (cancel) return;
        setItems(its);

        // 4) Resolver productos faltantes (si no vienen embebidos)
        const ids = Array.from(
          new Set(
            its
              .map(
                (it) => it?.id_producto ?? it?.producto?.id_producto ?? it?.id
              )
              .filter((v) => v !== undefined && v !== null)
          )
        );
        const faltan = ids.filter((pid) => !productos[pid]);
        if (faltan.length) {
          const res = await Promise.allSettled(
            faltan.map((pid) => getProduct(pid))
          );
          if (cancel) return;
          const map = {};
          res.forEach((r) => {
            if (
              r.status === "fulfilled" &&
              r.value?.data?.id_producto != null
            ) {
              const p = r.value.data;
              map[p.id_producto] = p;
            }
          });
          if (Object.keys(map).length) {
            setProductos((prev) => ({ ...prev, ...map }));
          }
        }
      } catch (e) {
        console.error("Error cargando pedido:", e);
        setPedido({ id, estado: "desconocido", total: 0 });
        setItems([]);
        setProductos({});
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (!pedido) return <p>Cargando pedido...</p>;

  const fmtCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  return (
    <div>
      <h2>Pedido #{pedido.id_pedido ?? pedido.id}</h2>
      <p>Estado: {pedido.estado}</p>
      <p>Total: {fmtCLP.format(pedido.total ?? 0)}</p>

      <h3 className="mt-4 mb-2 font-semibold">Detalle</h3>
      {items.length === 0 ? (
        <p>No hay ítems en este pedido.</p>
      ) : (
        <ul>
          {items.map((it, idx) => {
            const pid = it.id_producto ?? it.producto?.id_producto ?? it.id;
            const p = it.producto ?? productos[pid] ?? {};
            const titulo = p.titulo ?? it.titulo ?? `Producto #${pid}`;
            const img = p.imagen_url ?? it.imagen_url;

            return (
              <li key={idx} className="mb-2 border-b pb-2">
                <div className="flex items-center gap-2">
                  {img && <img src={img} alt={titulo} style={{ width: 40 }} />}
                  <div>
                    <div className="font-bold">{titulo}</div>
                    <div>Cantidad: {it.cantidad}</div>
                    <div>
                      Precio unitario: {fmtCLP.format(it.precio_unitario ?? 0)}
                    </div>
                    <div>
                      Subtotal:{" "}
                      {fmtCLP.format(
                        (it.cantidad || 1) * (it.precio_unitario || 0)
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
