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
function getUser(req) {
  const db = getDB();
  const uid = getUserId(req);
  if (!uid) return null;
  return db.get("usuarios").find({ id_usuario: uid }).value() || null;
}
function requireAuth(req, res) {
  const uid = getUserId(req);
  if (!uid) {
    res.status(401).json({ error: "NO_AUTH" });
    return null;
  }
  return uid;
}
function requireAdmin(req, res) {
  const u = getUser(req);
  if (!u) {
    res.status(401).json({ error: "NO_AUTH" });
    return null;
  }
  if (u.rol !== "admin") {
    res.status(403).json({ error: "FORBIDDEN_ADMIN" });
    return null;
  }
  return u;
}
function requireOwnerCarrito(req, res, db, id_carrito, mustBeActivo = true) {
  const uid = getUserId(req);
  if (!uid) {
    res.status(401).json({ error: "NO_AUTH" });
    return null;
  }
  const car = db
    .get("carritos")
    .find({ id_carrito: Number(id_carrito) })
    .value();
  if (!car) {
    res.status(404).end();
    return null;
  }
  if (car.id_usuario !== uid) {
    res.status(403).json({ error: "FORBIDDEN" });
    return null;
  }
  if (mustBeActivo && car.estado !== "activo") {
    res.status(409).json({ error: "CARRITO_NO_ACTIVO" });
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
  if (!email || !password)
    return res.status(400).json({ error: "INVALID_PAYLOAD" });
  const exists = db.get("usuarios").find({ email }).value();
  if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });

  const id_usuario =
    (db.get("usuarios").map("id_usuario").max().value() || 0) + 1;
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
  // No devolvemos password
  const { password: _pw, ...safeUser } = user;
  return res.json({ token: String(id_usuario), user: safeUser });
});

server.post("/auth/login", (req, res) => {
  const db = getDB();
  const { email, password } = req.body || {};
  const user = db.get("usuarios").find({ email }).value();
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }
  const { password: _pw, ...safeUser } = user;
  return res.json({ token: String(user.id_usuario), user: safeUser });
});

server.get("/auth/me", (req, res) => {
  const db = getDB();
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: "NO_AUTH" });
  const user = db.get("usuarios").find({ id_usuario: uid }).value();
  if (!user) return res.status(401).json({ error: "NO_AUTH" });
  const { password: _pw, ...safeUser } = user;
  return res.json(safeUser);
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
  const { password: _pw, ...safeUser } = u;
  return res.json(safeUser);
});

server.put("/usuarios/:id_usuario", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;
  const id = Number(req.params.id_usuario);
  if (uid !== id && !requireAdmin(req, res)) return; // el dueño o admin
  const u = db.get("usuarios").find({ id_usuario: id }).value();
  if (!u) return res.status(404).end();

  const { email, rol, password, ...rest } = req.body || {};
  // Email único
  if (email && email !== u.email) {
    const dup = db.get("usuarios").find({ email }).value();
    if (dup) return res.status(409).json({ error: "EMAIL_EXISTS" });
  }
  // Sólo admin puede cambiar rol
  const updates = { ...rest };
  if (email) updates.email = email;
  if (rol) {
    const admin = getUser(req);
    if (!admin || admin.rol !== "admin")
      return res.status(403).json({ error: "FORBIDDEN_ADMIN" });
    updates.rol = rol;
  }
  // Nunca sobrescribir password por aquí en el mock
  db.get("usuarios").find({ id_usuario: id }).assign(updates).write();
  const updated = db.get("usuarios").find({ id_usuario: id }).value();
  const { password: _pw, ...safeUser } = updated;
  return res.json(safeUser);
});

server.delete("/usuarios/:id_usuario", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;
  const id = Number(req.params.id_usuario);
  db.get("usuarios").remove({ id_usuario: id }).write();
  return res.status(204).end();
});

/* =========================
   PRODUCTOS (id_producto)
   ========================= */
// GET /productos (lista): la entrega el router por defecto al final
server.get("/productos/:id_producto", (req, res) => {
  const db = getDB();
  const id = Number(req.params.id_producto);
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();
  return res.json(p);
});

server.post("/admin/productos", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const id_producto =
    (db.get("productos").map("id_producto").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const body = req.body || {};
  // Servicios: stock debe ser null
  const tipo = body.tipo || "producto";
  const stock = tipo === "servicio" ? null : Number(body.stock ?? 0);
  const row = {
    id_producto,
    titulo: body.titulo ?? "Sin título",
    descripcion: body.descripcion ?? "",
    precio: Number(body.precio ?? 0),
    stock,
    tipo,
    imagen_url: body.imagen_url ?? null,
    destacado: !!body.destacado,
    fecha_creacion: now,
  };
  db.get("productos").push(row).write();
  return res.json(row);
});

server.put("/admin/productos/:id_producto", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const id = Number(req.params.id_producto);
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();

  const body = req.body || {};
  // Si pasa a servicio, stock = null
  if (body.tipo === "servicio") body.stock = null;

  db.get("productos").find({ id_producto: id }).assign(body).write();
  return res.json(db.get("productos").find({ id_producto: id }).value());
});

server.delete("/admin/productos/:id_producto", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const id = Number(req.params.id_producto);
  db.get("productos").remove({ id_producto: id }).write();
  return res.status(204).end();
});

server.put("/admin/productos/:id_producto/destacado", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const id = Number(req.params.id_producto);
  const { destacado } = req.body || {};
  const p = db.get("productos").find({ id_producto: id }).value();
  if (!p) return res.status(404).end();
  db.get("productos")
    .find({ id_producto: id })
    .assign({ destacado: !!destacado })
    .write();
  return res.json({ ...p, destacado: !!destacado });
});

/* =========================
   CARRITOS (id_carrito)
   ========================= */
server.post("/carritos", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const existing = db
    .get("carritos")
    .find({ id_usuario: uid, estado: "activo" })
    .value();
  if (existing) return res.json(existing);

  const id_carrito =
    (db.get("carritos").map("id_carrito").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const carrito = {
    id_carrito,
    id_usuario: uid,
    estado: "activo",
    fecha_creacion: now,
  };
  db.get("carritos").push(carrito).write();
  return res.json(carrito);
});

server.get("/carritos/me", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  let carrito = db
    .get("carritos")
    .find({ id_usuario: uid, estado: "activo" })
    .value();

  // Si no existe, se crea automáticamente
  if (!carrito) {
    const id_carrito =
      (db.get("carritos").map("id_carrito").max().value() || 0) + 1;
    const now = new Date().toISOString();
    carrito = {
      id_carrito,
      id_usuario: uid,
      estado: "activo",
      fecha_creacion: now,
    };
    db.get("carritos").push(carrito).write();
  }

  const items = db
    .get("carrito_detalle")
    .filter({ id_carrito: carrito.id_carrito })
    .value()
    .map((d) => {
      const p = db
        .get("productos")
        .find({ id_producto: d.id_producto })
        .value();
      return {
        ...d,
        subtotal: d.cantidad * d.precio_unitario,
        producto: p
          ? {
              id_producto: p.id_producto,
              titulo: p.titulo,
              imagen_url: p.imagen_url,
              precio: p.precio,
              tipo: p.tipo,
              stock: p.stock,
            }
          : null,
      };
    });

  return res.json({ ...carrito, items });
});

server.put("/carritos/:id_carrito", (req, res) => {
  const db = getDB();
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(
    req,
    res,
    db,
    id_carrito,
    /*mustBeActivo*/ true
  );
  if (!car) return;

  // Evitamos que el front fuerce estado/fechas
  const { estado, fecha_creacion, id_usuario, ...safe } = req.body || {};
  db.get("carritos").find({ id_carrito }).assign(safe).write();
  return res.json(db.get("carritos").find({ id_carrito }).value());
});

server.delete("/carritos/:id_carrito", (req, res) => {
  const db = getDB();
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(
    req,
    res,
    db,
    id_carrito,
    /*mustBeActivo*/ true
  );
  if (!car) return;

  db.get("carrito_detalle").remove({ id_carrito }).write();
  db.get("carritos").remove({ id_carrito }).write();
  return res.status(204).end();
});

/* ====== Ítems de carrito (id_detalle) ====== */
server.post("/carritos/:id_carrito/items", (req, res) => {
  const db = getDB();
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito, /*activo*/ true);
  if (!car) return;

  const { id_producto, cantidad } = req.body || {};
  const prod = db
    .get("productos")
    .find({ id_producto: Number(id_producto) })
    .value();
  if (!prod) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  // Reglas de servicio
  if (prod.tipo === "servicio") {
    // Ya existe servicio igual en carrito?
    const dupSvc = db
      .get("carrito_detalle")
      .find({ id_carrito, id_producto: Number(id_producto) })
      .value();
    if (dupSvc) return res.status(409).json({ error: "SERVICIO_DUPLICADO" });
  } else {
    // Producto físico: stock
    const qty = Number(cantidad);
    if (!Number.isFinite(qty) || qty < 1)
      return res.status(400).json({ error: "CANTIDAD_INVALIDA" });
    if (prod.stock == null || prod.stock < qty) {
      return res
        .status(400)
        .json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock ?? 0 });
    }
    // Evita duplicado del mismo producto físico
    const dup = db
      .get("carrito_detalle")
      .find({ id_carrito, id_producto: Number(id_producto) })
      .value();
    if (dup) return res.status(409).json({ error: "ITEM_DUPLICADO" });
  }

  const id_detalle =
    (db.get("carrito_detalle").map("id_detalle").max().value() || 0) + 1;
  const finalCantidad = prod.tipo === "servicio" ? 1 : Number(cantidad);
  const row = {
    id_detalle,
    id_carrito,
    id_producto: Number(id_producto),
    cantidad: finalCantidad,
    precio_unitario: Number(prod.precio),
    fecha_creacion: new Date().toISOString(),
  };
  db.get("carrito_detalle").push(row).write();
  return res.json({ ...row, subtotal: row.cantidad * row.precio_unitario });
});

server.put("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = getDB();
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito, /*activo*/ true);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  const item = db
    .get("carrito_detalle")
    .find({ id_detalle, id_carrito })
    .value();
  if (!item) return res.status(404).end();

  const prod = db
    .get("productos")
    .find({ id_producto: item.id_producto })
    .value();
  const { cantidad } = req.body || {};

  if (!Number.isFinite(Number(cantidad)) || Number(cantidad) < 1) {
    return res.status(400).json({ error: "CANTIDAD_INVALIDA" });
  }

  if (prod?.tipo === "servicio") {
    // Servicio no puede ser > 1
    if (Number(cantidad) !== 1)
      return res.status(409).json({ error: "SERVICIO_SOLO_UNIDAD" });
  } else {
    // Producto físico: chequear stock
    if (prod.stock == null || prod.stock < Number(cantidad)) {
      return res
        .status(400)
        .json({ error: "STOCK_INSUFICIENTE", disponible: prod.stock ?? 0 });
    }
  }

  db.get("carrito_detalle")
    .find({ id_detalle, id_carrito })
    .assign({ cantidad: Number(cantidad) })
    .write();
  const updated = db
    .get("carrito_detalle")
    .find({ id_detalle, id_carrito })
    .value();
  return res.json({
    ...updated,
    subtotal: updated.cantidad * updated.precio_unitario,
  });
});

server.delete("/carritos/:id_carrito/items/:id_detalle", (req, res) => {
  const db = getDB();
  const id_carrito = Number(req.params.id_carrito);
  const car = requireOwnerCarrito(req, res, db, id_carrito, /*activo*/ true);
  if (!car) return;

  const id_detalle = Number(req.params.id_detalle);
  db.get("carrito_detalle").remove({ id_detalle, id_carrito }).write();
  return res.status(204).end();
});

/* =========================
   PEDIDOS
   ========================= */
server.post("/pedidos", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const { id_carrito, cupon } = req.body || {};
  const car = db
    .get("carritos")
    .find({ id_carrito: Number(id_carrito) })
    .value();
  if (!car) return res.status(404).json({ error: "CARRITO_NO_ENCONTRADO" });
  if (car.id_usuario !== uid)
    return res.status(403).json({ error: "FORBIDDEN" });
  if (car.estado !== "activo")
    return res.status(409).json({ error: "CARRITO_NO_ACTIVO" });

  // Evitar pedidos duplicados por mismo carrito
  const pedidoExistente = db
    .get("pedidos")
    .find({ id_carrito: car.id_carrito })
    .value();
  if (pedidoExistente)
    return res
      .status(409)
      .json({
        error: "PEDIDO_DUPLICADO",
        id_pedido: pedidoExistente.id_pedido,
      });

  const lines = db
    .get("carrito_detalle")
    .filter({ id_carrito: car.id_carrito })
    .value();
  if (!lines.length) return res.status(400).json({ error: "CARRITO_VACIO" });

  // Recalcular totales y validar stock en tiempo de pago + rebajar stock
  let detalle = [];
  for (const l of lines) {
    const p = db.get("productos").find({ id_producto: l.id_producto }).value();
    if (!p)
      return res
        .status(400)
        .json({ error: "PRODUCTO_INEXISTENTE", id_producto: l.id_producto });

    if (p.tipo !== "servicio") {
      if (p.stock == null || p.stock < l.cantidad) {
        return res
          .status(400)
          .json({
            error: "STOCK_INSUFICIENTE",
            id_producto: p.id_producto,
            disponible: p.stock ?? 0,
          });
      }
    }
    const precio_unitario = Number(l.precio_unitario ?? p.precio);
    const total = Number(l.cantidad) * precio_unitario;
    detalle.push({
      id_producto: p.id_producto,
      cantidad: l.cantidad,
      precio_unitario,
      total,
    });
  }

  let total = detalle.reduce((a, b) => a + b.total, 0);
  if (cupon === "FIT10") total = Math.round(total * 0.9);

  const id_pedido = (db.get("pedidos").map("id_pedido").max().value() || 0) + 1;
  const now = new Date().toISOString();

  // Rebajar stock de productos físicos
  for (const d of detalle) {
    const prod = db
      .get("productos")
      .find({ id_producto: d.id_producto })
      .value();
    if (prod?.tipo !== "servicio") {
      db.get("productos")
        .find({ id_producto: d.id_producto })
        .assign({ stock: Number(prod.stock) - Number(d.cantidad) })
        .write();
    }
  }

  // Crear pedido y detalle (vinculado al carrito)
  db.get("pedidos")
    .push({
      id_pedido,
      id_usuario: car.id_usuario,
      id_carrito: car.id_carrito,
      total,
      estado: "pagado",
      fecha_pedido: now,
    })
    .write();

  for (const d of detalle) {
    const id_pedido_detalle =
      (db.get("pedidos_detalle").map("id_pedido_detalle").max().value() || 0) +
      1;
    db.get("pedidos_detalle")
      .push({
        id_pedido_detalle,
        id_pedido,
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        fecha_creacion: now,
      })
      .write();
  }

  // Marcar carrito como pagado y sacarlo del flujo
  db.get("carritos")
    .find({ id_carrito: car.id_carrito })
    .assign({ estado: "pagado" })
    .write();

  return res.json({
    id_pedido,
    id_usuario: car.id_usuario,
    id_carrito: car.id_carrito,
    total,
    estado: "pagado",
    fecha_pedido: now,
    detalle,
  });
});

server.get("/pedidos", (req, res) => {
  const db = getDB();
  const uid = getUserId(req);
  let list = db.get("pedidos").value();
  if (uid) list = list.filter((p) => p.id_usuario === uid);
  return res.json(list);
});

server.get("/pedidos/:id_pedido", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const id = Number(req.params.id_pedido);
  const p = db.get("pedidos").find({ id_pedido: id }).value();
  if (!p) return res.status(404).end();
  if (p.id_usuario !== uid && !requireAdmin(req, res)) return; // dueño o admin

  const det = db
    .get("pedidos_detalle")
    .filter({ id_pedido: id })
    .value()
    .map((d) => ({ ...d, total: d.cantidad * d.precio_unitario }));
  return res.json({ ...p, detalle: det });
});

server.put("/admin/pedidos/:id_pedido", (req, res) => {
  const db = getDB();
  const admin = requireAdmin(req, res);
  if (!admin) return;

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
  const uid = requireAuth(req, res);
  if (!uid) return;

  const id_producto = Number(req.params.id_producto);
  const { comentario, calificacion } = req.body || {};
  const dup = db.get("resenas").find({ id_producto, id_usuario: uid }).value();
  if (dup) return res.status(409).json({ error: "YA_RESEÑADO" });
  const id_resena = (db.get("resenas").map("id_resena").max().value() || 0) + 1;
  const now = new Date().toISOString();
  const row = {
    id_resena,
    id_usuario: uid,
    id_producto,
    comentario,
    calificacion,
    fecha_creacion: now,
  };
  db.get("resenas").push(row).write();
  return res.json(row);
});

server.post("/favoritos", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const { id_producto } = req.body || {};
  const dup = db
    .get("likes")
    .find({ id_usuario: uid, id_producto: Number(id_producto) })
    .value();
  if (dup) return res.status(409).json({ error: "YA_LIKE" });
  const id_like = (db.get("likes").map("id_like").max().value() || 0) + 1;
  const row = {
    id_like,
    id_usuario: uid,
    id_producto: Number(id_producto),
    fecha_creacion: new Date().toISOString(),
  };
  db.get("likes").push(row).write();
  return res.json(row);
});

server.get("/favoritos", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const list = db
    .get("likes")
    .filter({ id_usuario: uid })
    .value()
    .map((l) => {
      const p = db
        .get("productos")
        .find({ id_producto: l.id_producto })
        .value();
      return {
        ...l,
        producto: p
          ? {
              id_producto: p.id_producto,
              titulo: p.titulo,
              precio: p.precio,
              tipo: p.tipo,
              imagen_url: p.imagen_url,
            }
          : null,
      };
    });
  return res.json(list);
});

server.delete("/favoritos/:id_like", (req, res) => {
  const db = getDB();
  const uid = requireAuth(req, res);
  if (!uid) return;

  const id_like = Number(req.params.id_like);
  const like = db.get("likes").find({ id_like }).value();
  if (!like) return res.status(204).end();
  if (like.id_usuario !== uid)
    return res.status(403).json({ error: "FORBIDDEN" });

  db.get("likes").remove({ id_like }).write();
  return res.status(204).end();
});

server.get("/productos/:id_producto/likes", (req, res) => {
  const db = getDB();
  const id_producto = Number(req.params.id_producto);
  const count = db.get("likes").filter({ id_producto }).value().length;
  return res.json({ count });
});

// Embebe los items en la respuesta de /carritos y /carritos/:id
router.render = (req, res) => {
  if (req.path.startsWith("/carritos") && res.locals.data) {
    const db = router.db; // lowdb instance
    const embedItems = (carrito) => {
      const items = db
        .get("carrito_detalle")
        .filter({ id_carrito: carrito.id_carrito })
        .value();
      // Devuelve ambos campos para máxima compatibilidad
      return { ...carrito, carrito_detalle: items, items };
    };

    if (Array.isArray(res.locals.data)) {
      res.locals.data = res.locals.data.map(embedItems);
    } else if (res.locals.data.id_carrito) {
      res.locals.data = embedItems(res.locals.data);
    }
  }
  res.jsonp(res.locals.data);
};

/* =========================
   Resto de rutas CRUD de json-server (GET /productos, etc.)
   ========================= */
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
