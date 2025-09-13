// server.js
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

function getDB() {
  return router.db; // lowdb
}
function getUserId(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const id = Number(token);
  return Number.isFinite(id) ? id : null;
}

function requireOwnerCarrito(req, res, db, id_carrito) {
  const uid = getUserId(req);
  if (!uid) {
    res.status(401).json({ error: "NO_AUTH" });
    return null;
  }
  const car = db.get("carritos").find({ id_carrito: Number(id_carrito) }).value();
  if (!car) {
    res.status(404).end();
    return null;
  }
  if (car.id_usuario !== uid) {
    res.status(403).json({ error: "FORBIDDEN" });
    return null;
  }
  return car;
}


/* =========================
   AUTH
   ========================= */
server.post("/auth/register", (req, res) => {
  const db = getDB();
  const { nombre, email, password = "123456" } = req.body || {};
  const exists = db.get("usuarios").find({ email }).value();
  if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });

  const id_usuario = (db.get("usuarios").map("id_usuario").max().value() || 0) + 1;
  const user = {
    id_usuario,
    nombre,
    email,
    password,
    rol: "cliente",
    avatar_url: null,
    fecha_creacion: new Date().toISOString(),
  };
  db.get("usuarios").push(user).write();
  return res.json({ token: String(id_usuario), user });
});

server.post("/auth/login", (req, res) => {
  const db = getDB();
  const { email, password } = req.body || {};
  const user = db.get("usuarios").find({ email }).value();
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }
  return res.json({ token: String(user.id_usuario), user });
});

server.get("/auth/me", (req, res) => {
  const db = getDB();
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });
  const user = db.get("usuarios").find({ id_usuario: uid }).value();
  if (!user) return res.status(401).json({ error: "NO_AUTH" });
  return res.json(user);
});

server.post("/auth/logout", (_req, res) => res.json({ message: "ok" }));

/* =========================
   USUARIOS (id_usuario)
   ========================= */
server.get("/usuarios/:id_usuario", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_usuario);
  const u = db.get("usuarios").find({ id_usuario: id }).value();
  if (!u) return res.status(404).end();
  return res.json(u);
});

server.put("/usuarios/:id_usuario", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_usuario);
  const u = db.get("usuarios").find({ id_usuario: id }).value();
  if (!u) return res.status(404).end();
  db.get("usuarios").find({ id_usuario: id }).assign(req.body || {}).write();
  return res.json(db.get("usuarios").find({ id_usuario: id }).value());
});

server.delete("/usuarios/:id_usuario", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_usuario);
  db.get("usuarios").remove({ id_usuario: id }).write();
  return res.status(204).end();
});

/* =========================
   PRODUCTOS (id_producto)
   ========================= */
server.get("/productos/:id_producto", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_producto);
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();
  return res.json(p);
});

server.post("/admin/productos", (req, res) => {
  const db = getDB();
  const id_producto = (db.get("productos").map("id_producto").max().value() || 0) + 1;
  const row = { id_producto, destacado: false, ...req.body };
  db.get("productos").push(row).write();
  return res.json(row);
});

server.put("/admin/productos/:id_producto", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_producto);
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();
  db.get("productos").find({ id_producto: id }).assign(req.body || {}).write();
  return res.json(db.get("productos").find({ id_producto: id }).value());
});

server.delete("/admin/productos/:id_producto", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_producto);
  db.get("productos").remove({ id_producto: id }).write();
  return res.status(204).end();
});

server.put("/admin/productos/:id_producto/destacado", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_producto);
  const { destacado } = req.body || {};
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();
  db.get("productos").find({ id_producto: id }).assign({ destacado: !!destacado }).write();
  return res.json({ ...p, destacado: !!destacado });
});

/* =========================
   CARRITOS (id_carrito)
   ========================= */
server.post("/carritos", (req, res) => {
  const db = router.db;
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });

  const existing = db.get("carritos").find({ id_usuario: uid, estado: "activo" }).value();
  if (existing) return res.json(existing);

  const id_carrito = (db.get("carritos").map("id_carrito").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const carrito = { id_carrito, id_usuario: uid, estado: "activo", fecha_creacion: now };
  db.get("carritos").push(carrito).write();
  return res.json(carrito);
});


server.get("/carritos/me", (req, res) => {
  const db = router.db;
  const uid = getUserId(req);
  if (!Number.isFinite(uid)) return res.status(401).json({ error: "NO_AUTH" });
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });

  let carrito = db.get("carritos").find({ id_usuario: uid, estado: "activo" }).value();

  // Si no existe, lo creamos automáticamente
  if (!carrito) {
    const id_carrito = (db.get("carritos").map("id_carrito").max().value() || 0) + 1;
    const now = new Date().toISOString();
    carrito = { id_carrito, id_usuario: uid, estado: "activo", fecha_creacion: now };
    db.get("carritos").push(carrito).write();
  }

  const items = db.get("carrito_detalle").filter({ id_carrito: carrito.id_carrito }).value()
    .map(d => {
      const p = db.get("productos").find({ id_producto: d.id_producto }).value();
      return {
        ...d,
        subtotal: d.cantidad * d.precio_unitario,
        producto: p ? { id_producto: p.id_producto, titulo: p.titulo, imagen_url: p.imagen_url, precio: p.precio, tipo: p.tipo } : null
      };
    });

  return res.json({ ...carrito, items });
});

server.put("/carritos/:id_carrito", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;
  db.get("carritos").find({ id_carrito }).assign(req.body || {}).write();
  return res.json(db.get("carritos").find({ id_carrito }).value());
});

server.delete("/carritos/:id_carrito", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;
  db.get("carrito_detalle").remove({ id_carrito }).write();
  db.get("carritos").remove({ id_carrito }).write();
  return res.status(204).end();
});


/* ====== Ítems de carrito (id_detalle) ====== */
server.post("/carritos/:id_carrito/items", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;

  const { id_producto, cantidad } = req.body || {};
  const prod = db.get("productos").find({ id_producto: Number(id_producto) }).value();
  if (!prod) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  if (prod.tipo === "producto" && prod.stock < Number(cantidad)) {
    return res.status(400).json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock });
  }
  const dup = db.get("carrito_detalle").find({ id_carrito, id_producto: Number(id_producto) }).value();
  if (dup) return res.status(409).json({ error: "ITEM_DUPLICADO" });

  const id_detalle = (db.get("carrito_detalle").map("id_detalle").max().value() || 0) + 1;
  const row = {
    id_detalle, id_carrito,
    id_producto: Number(id_producto),
    cantidad: Number(cantidad),
    precio_unitario: prod.precio,
    fecha_creacion: new Date().toISOString()
  };
  db.get("carrito_detalle").push(row).write();
  return res.json({ ...row, subtotal: row.cantidad * row.precio_unitario });
});

server.put("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  const item = db.get("carrito_detalle").find({ id_detalle, id_carrito }).value();
  if (!item) return res.status(404).end();

  const { cantidad } = req.body || {};
  const prod = db.get("productos").find({ id_producto: item.id_producto }).value();
  if (prod?.tipo === "producto" && prod.stock < Number(cantidad)) {
    return res.status(400).json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock });
  }

  db.get("carrito_detalle").find({ id_detalle, id_carrito }).assign({ cantidad: Number(cantidad) }).write();
  const updated = db.get("carrito_detalle").find({ id_detalle, id_carrito }).value();
  return res.json({ ...updated, subtotal: updated.cantidad * updated.precio_unitario });
});

server.delete("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  db.get("carrito_detalle").remove({ id_detalle, id_carrito }).write();
  return res.status(204).end();
});


server.put("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  const item = db.get("carrito_detalle").find({ id_detalle, id_carrito }).value();
  if (!item) return res.status(404).end();

  const { cantidad } = req.body || {};
  const prod = db.get("productos").find({ id_producto: item.id_producto }).value();
  if (prod?.tipo === "producto" && prod.stock < Number(cantidad)) {
    return res.status(400).json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock });
  }

  db.get("carrito_detalle").find({ id_detalle, id_carrito }).assign({ cantidad: Number(cantidad) }).write();
  const updated = db.get("carrito_detalle").find({ id_detalle, id_carrito }).value();
  return res.json({ ...updated, subtotal: updated.cantidad * updated.precio_unitario });
});

server.delete("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = router.db;
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  db.get("carrito_detalle").remove({ id_detalle, id_carrito }).write();
  return res.status(204).end();
});

/* =========================
   PEDIDOS
   ========================= */
server.post("/pedidos", (req, res) => {
  const db = router.db;
  const { id_carrito, cupon } = req.body || {};
  const car = requireOwnerCarrito(req, res, db, Number(id_carrito));
  if (!car) return;

  const lines = db.get("carrito_detalle").filter({ id_carrito: car.id_carrito }).value();
  if (!lines.length) return res.status(400).json({ error: "CARRITO_VACIO" });

  const detalle = lines.map(l => ({ id_producto: l.id_producto, cantidad: l.cantidad, precio_unitario: l.precio_unitario, total: l.cantidad * l.precio_unitario }));
  let total = detalle.reduce((a, b) => a + b.total, 0);
  if (cupon === "FIT10") total = Math.round(total * 0.9);

  const id_pedido = (db.get("pedidos").map("id_pedido").max().value() || 0) + 1;
  const now = new Date().toISOString();

  db.get("pedidos").push({ id_pedido, id_usuario: car.id_usuario, total, estado: "pagado", fecha_pedido: now }).write();
  detalle.forEach((d, i) => {
    const id_pedido_detalle = (db.get("pedidos_detalle").map("id_pedido_detalle").max().value() || 0) + 1 + i;
    db.get("pedidos_detalle").push({ id_pedido_detalle, id_pedido, id_producto: d.id_producto, cantidad: d.cantidad, precio_unitario: d.precio_unitario, fecha_creacion: now }).write();
  });

  db.get("carritos").find({ id_carrito: car.id_carrito }).assign({ estado: "pagado" }).write();

  return res.json({ id_pedido, id_usuario: car.id_usuario, total, estado: "pagado", fecha_pedido: now, detalle });
});

server.get("/pedidos", (req, res) => {
  const db = getDB();
  const uid = getUserId(req);
  let list = db.get("pedidos").value();
  if (uid) list = list.filter(p => p.id_usuario === uid);
  return res.json(list);
});

server.get("/pedidos/:id_pedido", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_pedido);
  const p = db.get("pedidos").find({ id_pedido: id }).value();
  if (!p) return res.status(404).end();
  const det = db.get("pedidos_detalle").filter({ id_pedido: id }).value()
    .map(d => ({ ...d, total: d.cantidad * d.precio_unitario }));
  return res.json({ ...p, detalle: det });
});

server.put("/admin/pedidos/:id_pedido", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_pedido);
  const ped = db.get("pedidos").find({ id_pedido: id }).value();
  if (!ped) return res.status(404).end();
  const { estado } = req.body || {};
  db.get("pedidos").find({ id_pedido: id }).assign({ estado }).write();
  return res.json(db.get("pedidos").find({ id_pedido: id }).value());
});

/* =========================
   RESEÑAS / LIKES
   ========================= */
server.get("/productos/:id_producto/resenas", (req, res) => {
  const db = getDB();
  const id_producto = Number(req.params.id_producto);
  const list = db.get("resenas").filter({ id_producto }).value();
  return res.json(list);
});

server.post("/productos/:id_producto/resenas", (req, res) => {
  const db = getDB();
  const id_producto = Number(req.params.id_producto);
  const uid = getUserId(req) ?? Number(req.body?.id_usuario);
  const { comentario, calificacion } = req.body || {};
  const dup = db.get("resenas").find({ id_producto, id_usuario: uid }).value();
  if (dup) return res.status(409).json({ error: "YA_RESEÑADO" });
  const id_resena = (db.get("resenas").map("id_resena").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const row = { id_resena, id_usuario: uid, id_producto, comentario, calificacion, fecha_creacion: now };
  db.get("resenas").push(row).write();
  return res.json(row);
});

server.post("/favoritos", (req, res) => {
  const db = getDB();
  const uid = getUserId(req) ?? Number(req.body?.id_usuario);
  const { id_producto } = req.body || {};
  const dup = db.get("likes").find({ id_usuario: uid, id_producto: Number(id_producto) }).value();
  if (dup) return res.status(409).json({ error: "YA_LIKE" });
  const id_like = (db.get("likes").map("id_like").max().value() || 0) + 1;
  const row = { id_like, id_usuario: uid, id_producto: Number(id_producto), fecha_creacion: new Date().toISOString() };
  db.get("likes").push(row).write();
  return res.json(row);
});

server.get("/favoritos", (req, res) => {
  const db = getDB();
  const uid = getUserId(req);
  const list = db.get("likes").filter(uid ? { id_usuario: uid } : {}).value()
    .map(l => {
      const p = db.get("productos").find({ id_producto: l.id_producto }).value();
      return { ...l, producto: p ? { id_producto: p.id_producto, titulo: p.titulo, precio: p.precio, tipo: p.tipo, imagen_url: p.imagen_url } : null };
    });
  return res.json(list);
});

server.delete("/favoritos/:id_like", (req, res) => {
  const db = getDB();
  const id_like = Number(req.params.id_like);
  db.get("likes").remove({ id_like }).write();
  return res.status(204).end();
});

server.get("/productos/:id_producto/likes", (req, res) => {
  const db = getDB();
  const id_producto = Number(req.params.id_producto);
  const count = db.get("likes").filter({ id_producto }).value().length;
  return res.json({ count });
});

/* =========================
   Resto de rutas CRUD de json-server (GET /productos, etc.)
   ========================= */
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
