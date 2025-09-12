-- =========================
-- Limpieza opcional
-- =========================
DROP TABLE IF EXISTS likes       CASCADE;
DROP TABLE IF EXISTS resenas     CASCADE;
DROP TABLE IF EXISTS pedidos_detalle CASCADE;
DROP TABLE IF EXISTS pedidos     CASCADE;
DROP TABLE IF EXISTS carrito_detalle CASCADE;
DROP TABLE IF EXISTS carritos    CASCADE;
DROP TABLE IF EXISTS productos   CASCADE;
DROP TABLE IF EXISTS usuarios    CASCADE;

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE usuarios (
  id_usuario       SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  email            VARCHAR(100) NOT NULL UNIQUE,
  rol              VARCHAR(20)  NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente','admin')),
  avatar_url       TEXT,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- PRODUCTOS
-- =========================
CREATE TABLE productos (
  id_producto      SERIAL PRIMARY KEY,
  id_admin         INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      TEXT NOT NULL,
  precio           NUMERIC(12,2) NOT NULL,
  stock            INTEGER,                         -- NULL para servicios
  tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('producto','servicio')),
  imagen_url       TEXT,
  destacado        BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_stock_servicio CHECK (
    (tipo = 'servicio' AND stock IS NULL)
    OR (tipo = 'producto')
  )
);

CREATE INDEX idx_productos_tipo       ON productos(tipo);
CREATE INDEX idx_productos_destacado  ON productos(destacado);

-- =========================
-- CARRITOS
-- =========================
CREATE TABLE carritos (
  id_carrito       SERIAL PRIMARY KEY,
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  estado           VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','cerrado','abandonado','pagado')),
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carritos_usuario ON carritos(id_usuario);

-- =========================
-- CARRITO_DETALLE
-- =========================
CREATE TABLE carrito_detalle (
  id_detalle       SERIAL PRIMARY KEY,
  id_carrito       INTEGER NOT NULL REFERENCES carritos(id_carrito) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(12,2) NOT NULL,
  subtotal         NUMERIC(14,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto)
);

CREATE INDEX idx_cd_carrito  ON carrito_detalle(id_carrito);
CREATE INDEX idx_cd_producto ON carrito_detalle(id_producto);

-- =========================
-- PEDIDOS
-- =========================
CREATE TABLE pedidos (
  id_pedido        SERIAL PRIMARY KEY,
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  total            NUMERIC(14,2) NOT NULL,
  estado           VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','cancelado','enviado')),
  fecha_pedido     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario);

-- =========================
-- PEDIDOS_DETALLE
-- =========================
CREATE TABLE pedidos_detalle (
  id_pedido_detalle SERIAL PRIMARY KEY,
  id_pedido        INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(12,2) NOT NULL,
  total            NUMERIC(14,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pedido_producto UNIQUE (id_pedido, id_producto)
);

CREATE INDEX idx_pd_pedido   ON pedidos_detalle(id_pedido);
CREATE INDEX idx_pd_producto ON pedidos_detalle(id_producto);

-- =========================
-- RESEÑAS
-- =========================
CREATE TABLE resenas (
  id_resena        SERIAL PRIMARY KEY,
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  comentario       TEXT NOT NULL,
  calificacion     INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_resena_usuario_producto UNIQUE (id_usuario, id_producto)
);

CREATE INDEX idx_resenas_producto ON resenas(id_producto);

-- =========================
-- LIKES
-- =========================
CREATE TABLE likes (
  id_like          SERIAL PRIMARY KEY,
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_like_usuario_producto UNIQUE (id_usuario, id_producto)
);

CREATE INDEX idx_likes_producto ON likes(id_producto);
