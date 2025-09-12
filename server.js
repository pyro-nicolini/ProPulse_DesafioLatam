import jsonServer from "json-server";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// --- Mock auth muy simple (token = userId) ---
server.post("/auth/login", (req, res) => {
  const { email } = req.body || {};
  const db = router.db;
  const user = db.get("usuarios").find({ email }).value();
  if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  return res.json({ token: String(user.id_usuario), user });
});

server.post("/auth/register", (req, res) => {
  const { nombre, email } = req.body || {};
  const db = router.db;
  const exists = db.get("usuarios").find({ email }).value();
  if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });
  const id = (db.get("usuarios").map("id_usuario").max().value() || 0) + 1;
  const user = {
    id_usuario: id,
    nombre,
    email,
    rol: "cliente",
    avatar_url: null,
    fecha_creacion: new Date().toISOString()
  };
  db.get("usuarios").push(user).write();
  return res.json({ token: String(id), user });
});

server.post("/auth/logout", (_req, res) => res.json({ message: "ok" }));

server.get("/auth/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const db = router.db;
  const user = db.get("usuarios").find({ id_usuario: Number(token) }).value();
  if (!user) return res.status(401).json({ error: "NO_AUTH" });
  return res.json(user);
});

// --- Helper: obtener usuario desde token ---
function getUserId(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const id = Number(token);
  return Number.isFinite(id) ? id : null;
}

// --- Productos admin destacado ---
server.put("/admin/productos/:id/destacado", (req, res) => {
  const id = Number(req.params.id);
  const { destacado } = req.body || {};
  const db = router.db;
  const prod = db.get("productos").find({ id_producto: id }).value();
  if (!prod) return res.status(404).end();
  db.get("productos").find({ id_producto: id }).assign({ destacado: !!destacado }).write();
  return res.json({ ...prod, destacado: !!destacado });
});

// --- Carritos ---
server.post("/carritos", (req, res) => {
  const db = router.db;
  const uid = getUserId(req) ?? req.body?.id_usuario;
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });

  const id = (db.get("carritos").map("id_carrito").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const carrito = { id_carrito: id, id_usuario: Number(uid), estado: "activo", fecha_creacion: now };
  db.get("carritos").push(carrito).write();
  return res.json(carrito);
});

server.get("/carritos/me", (req, res) => {
  const db = router.db;
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });

  const carrito = db.get("carritos").find({ id_usuario: uid, estado: "activo" }).value();
  if (!carrito) return res.json(null);

  const items = db.get("carrito_detalle").filter({ id_carrito: carrito.id_carrito }).value()
    .map(d => {
      const p = db.get("productos").find({ id_producto: d.id_producto }).value();
      const subtotal = d.cantidad * d.precio_unitario; // simula columna generada
      return {
        ...d,
        subtotal,
        producto: p ? { id_producto: p.id_producto, titulo: p.titulo, imagen_url: p.imagen_url, precio: p.precio, tipo: p.tipo } : null
      };
    });

  return res.json({ ...carrito, items });
});

// agregar item
server.post("/carritos/:id/items", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id);
  const { id_producto, cantidad } = req.body || {};
  const prod = db.get("productos").find({ id_producto: Number(id_producto) }).value();
  if (!prod) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  // stock para 'producto'
  if (prod.tipo === "producto" && prod.stock < cantidad) {
    return res.status(400).json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock });
  }

  const exists = db.get("carrito_detalle").find({ id_carrito, id_producto: Number(id_producto) }).value();
  if (exists) return res.status(409).json({ error: "ITEM_DUPLICADO" });

  const id_detalle = (db.get("carrito_detalle").map("id_detalle").max().value() || 0) + 1;
  const precio_unitario = prod.precio; // congela precio
  const now = new Date().toISOString();
  const row = { id_detalle, id_carrito, id_producto: Number(id_producto), cantidad: Number(cantidad), precio_unitario, fecha_creacion: now };
  db.get("carrito_detalle").push(row).write();

  const subtotal = row.cantidad * row.precio_unitario;
  return res.json({ ...row, subtotal });
});

// update item
server.put("/carritos/:id/items/:id_item", (req, res) => {
  const db = router.db;
  const id_item = Number(req.params.id_item);
  const { cantidad } = req.body || {};
  const item = db.get("carrito_detalle").find({ id_detalle: id_item }).value();
  if (!item) return res.status(404).end();

  const prod = db.get("productos").find({ id_producto: item.id_producto }).value();
  if (prod?.tipo === "producto" && prod.stock < Number(cantidad)) {
    return res.status(400).json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock });
  }

  db.get("carrito_detalle").find({ id_detalle: id_item }).assign({ cantidad: Number(cantidad) }).write();
  const updated = db.get("carrito_detalle").find({ id_detalle: id_item }).value();
  const subtotal = updated.cantidad * updated.precio_unitario;
  return res.json({ ...updated, subtotal });
});

// delete item
server.delete("/carritos/:id/items/:id_item", (req, res) => {
  const db = router.db;
  db.get("carrito_detalle").remove({ id_detalle: Number(req.params.id_item) }).write();
  return res.status(204).end();
});

// actualizar carrito (estado)
server.put("/carritos/:id", (req, res) => {
  const db = router.db;
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  const car = db.get("carritos").find({ id_carrito: id }).value();
  if (!car) return res.status(404).end();
  db.get("carritos").find({ id_carrito: id }).assign({ estado }).write();
  return res.json({ ...car, estado });
});

// --- Pedidos ---
server.post("/pedidos", (req, res) => {
  const db = router.db;
  const { id_carrito, cupon } = req.body || {};
  const carrito = db.get("carritos").find({ id_carrito: Number(id_carrito) }).value();
  if (!carrito) return res.status(404).json({ error: "CARRITO_NO_ENCONTRADO" });

  const lines = db.get("carrito_detalle").filter({ id_carrito: carrito.id_carrito }).value();
  if (!lines.length) return res.status(400).json({ error: "CARRITO_VACIO" });

  const detalles = lines.map(l => ({ id_producto: l.id_producto, cantidad: l.cantidad, precio_unitario: l.precio_unitario, total: l.cantidad * l.precio_unitario }));
  let total = detalles.reduce((a, b) => a + b.total, 0);

  // mock cupon 10%
  if (cupon === "FIT10") total = Math.round(total * 0.9);

  const id_pedido = (db.get("pedidos").map("id_pedido").max().value() || 0) + 1;
  const now = new Date().toISOString();
  db.get("pedidos").push({ id_pedido, id_usuario: carrito.id_usuario, total, estado: "pagado", fecha_pedido: now }).write();

  detalles.forEach((d, i) => {
    const id_pd = (db.get("pedidos_detalle").map("id_pedido_detalle").max().value() || 0) + 1 + i;
    db.get("pedidos_detalle").push({
      id_pedido_detalle: id_pd,
      id_pedido,
      id_producto: d.id_producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      fecha_creacion: now
    }).write();
  });

  // opcional: cerrar carrito
  db.get("carritos").find({ id_carrito: carrito.id_carrito }).assign({ estado: "pagado" }).write();

  return res.json({
    id_pedido,
    id_usuario: carrito.id_usuario,
    total,
    estado: "pagado",
    fecha_pedido: now,
    detalle: detalles
  });
});

server.get("/pedidos/:id", (req, res) => {
  const db = router.db;
  const id = Number(req.params.id);
  const pedido = db.get("pedidos").find({ id_pedido: id }).value();
  if (!pedido) return res.status(404).end();
  const det = db.get("pedidos_detalle").filter({ id_pedido: id }).value()
    .map(d => ({ id_pedido_detalle: d.id_pedido_detalle, id_producto: d.id_producto, cantidad: d.cantidad, precio_unitario: d.precio_unitario, total: d.cantidad * d.precio_unitario }));
  return res.json({ ...pedido, detalle: det });
});

// --- Reseñas ---
server.get("/productos/:id/resenas", (req, res) => {
  const db = router.db;
  const id_producto = Number(req.params.id);
  const list = db.get("resenas").filter({ id_producto }).value();
  return res.json(list);
});

server.post("/productos/:id/resenas", (req, res) => {
  const db = router.db;
  const id_producto = Number(req.params.id);
  const uid = getUserId(req) ?? req.body?.id_usuario;
  const { comentario, calificacion } = req.body || {};
  const dup = db.get("resenas").find({ id_producto, id_usuario: Number(uid) }).value();
  if (dup) return res.status(409).json({ error: "YA_RESEÑADO" });
  const id = (db.get("resenas").map("id_resena").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const row = { id_resena: id, id_usuario: Number(uid), id_producto, comentario, calificacion, fecha_creacion: now };
  db.get("resenas").push(row).write();
  return res.json(row);
});

// --- Likes (favoritos) ---
server.post("/favoritos", (req, res) => {
  const db = router.db;
  const uid = getUserId(req) ?? req.body?.id_usuario;
  const { id_producto } = req.body || {};
  const dup = db.get("likes").find({ id_usuario: Number(uid), id_producto: Number(id_producto) }).value();
  if (dup) return res.status(409).json({ error: "YA_LIKE" });
  const id_like = (db.get("likes").map("id_like").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const row = { id_like, id_usuario: Number(uid), id_producto: Number(id_producto), fecha_creacion: now };
  db.get("likes").push(row).write();
  return res.json(row);
});

server.get("/favoritos", (req, res) => {
  const db = router.db;
  const uid = getUserId(req);
  const list = db.get("likes").filter(uid ? { id_usuario: uid } : {}).value()
    .map(l => {
      const p = db.get("productos").find({ id_producto: l.id_producto }).value();
      return { ...l, producto: p ? { id_producto: p.id_producto, titulo: p.titulo, precio: p.precio, tipo: p.tipo, imagen_url: p.imagen_url } : null };
    });
  return res.json(list);
});

server.get("/productos/:id/likes", (req, res) => {
  const db = router.db;
  const id_producto = Number(req.params.id);
  const count = db.get("likes").filter({ id_producto }).value().length;
  return res.json({ count });
});

// --- Usa router por defecto para lo demás (CRUD básico) ---
server.use(jsonServer.rewriter(JSON.parse(
  await import("fs").then(m => m.readFileSync(path.join(__dirname, "routes.json"), "utf-8"))
)));
server.use(router);

// --- Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
