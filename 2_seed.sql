
BEGIN;

-- USUARIOS
INSERT INTO usuarios (id_usuario, nombre, email, rol, avatar_url, fecha_creacion) VALUES
(1, 'admin@admin', 'admin@admin', 'admin',   'https://i.pravatar.cc/150?img=1', '2024-10-01T10:00:00Z'),
(2, 'cliente@cliente', 'cliente@cliente', 'cliente', 'https://i.pravatar.cc/150?img=2', '2024-10-01T10:00:00Z');

-- PRODUCTOS
INSERT INTO productos (id_producto, id_admin, titulo, descripcion, precio, stock, tipo, imagen_url, destacado, fecha_creacion) VALUES
(1, 1, 'Mancuernas Ajustables 40kg', 'Par de mancuernas ajustables ideales para entrenamientos de fuerza.', 120000, 15, 'producto', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', true,  '2024-10-01T10:00:00Z'),
(2, 1, 'Barra Olímpica 20kg',        'Barra olímpica profesional de 20kg para levantamiento pesado.',       95000,  10, 'producto', 'https://images.unsplash.com/photo-1583454110551-21e94e56f7a3', false, '2024-10-01T10:00:00Z'),
(3, 1, 'Discos Olímpicos 150kg Set', 'Juego completo de discos olímpicos recubiertos en goma.',             280000, 8,  'producto', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', true,  '2024-10-01T10:00:00Z'),
(4, 1, 'Rack de Potencia',           'Rack multipower ideal para squats, bench y entrenamiento funcional.', 450000, 5,  'producto', 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77', true,  '2024-10-01T10:00:00Z'),
(5, 1, 'Banco Plano Ajustable',      'Banco regulable para press, curl y trabajo de core.',                 75000,  12, 'producto', 'https://images.unsplash.com/photo-1629382364875-4f5bbdd7c3c0', false, '2024-10-01T10:00:00Z'),
(6, 1, 'Máquina de Poleas',          'Máquina de poleas dual con múltiples ejercicios posibles.',           520000, 3,  'producto', 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1', true,  '2024-10-01T10:00:00Z'),
(7, 1, 'Cinturón de Levantamiento',  'Cinturón de cuero reforzado para levantar pesado con seguridad.',     35000,  25, 'producto', 'https://images.unsplash.com/photo-1605296867304-ebe9e2d3b03b', false, '2024-10-01T10:00:00Z'),
(8, 1, 'Cuerda de Batalla',          'Cuerda gruesa de 15m para entrenamiento de potencia y resistencia.',  48000,  20, 'producto', 'https://images.unsplash.com/photo-1614313529709-8b9a84c59070', false, '2024-10-01T10:00:00Z'),
(9, 1, 'Kettlebells Set 4-32kg',     'Set completo de kettlebells para entrenamiento funcional.',           180000, 7,  'producto', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', true,  '2024-10-01T10:00:00Z'),
(10,1, 'Máquina de Remo Indoor',     'Rower profesional para cardio de alto rendimiento.',                  390000, 6,  'producto', 'https://images.unsplash.com/photo-1583454110551-21e94e56f7a3', false, '2024-10-01T10:00:00Z'),

-- SERVICIOS 
(11,1, 'Plan Personalizado 3 Meses',  'Programa de entrenamiento de musculación ajustado a tus objetivos.', 120000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', true,  '2024-10-01T10:00:00Z'),
(12,1, 'Clases de Powerlifting',      'Sesiones grupales con entrenador experto en levantamientos olímpicos.', 45000, NULL, 'servicio', 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba', false, '2024-10-01T10:00:00Z'),
(13,1, 'Asesoría Nutricional Deportiva','Plan de alimentación para maximizar fuerza y masa muscular.',       60000, NULL, 'servicio', 'https://images.unsplash.com/photo-1579966735421-4f71c1a9a3e6', true,  '2024-10-01T10:00:00Z'),
(14,1, 'Clases de Cross Training',    'Entrenamientos intensos combinando fuerza y cardio.',                 35000, NULL, 'servicio', 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77', false, '2024-10-01T10:00:00Z'),
(15,1, 'Entrenamiento Funcional Avanzado','Sesiones personalizadas para atletas de alto rendimiento.',       80000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-ebe9e2d3b03b', false, '2024-10-01T10:00:00Z'),
(16,1, 'Plan Online de Fuerza',       'Entrenamiento remoto con seguimiento semanal.',                       50000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', false, '2024-10-01T10:00:00Z'),
(17,1, 'Coaching de Competencia',     'Preparación personalizada para torneos.',                            200000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', true,  '2024-10-01T10:00:00Z'),
(18,1, 'Sesión de Fisioterapia Deportiva','Recuperación muscular y prevención de lesiones.',                  40000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', false, '2024-10-01T10:00:00Z'),
(19,1, 'Clases de Técnica de Levantamiento','Aprende técnica correcta en squats, bench y deadlift.',           30000, NULL, 'servicio', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', false, '2024-10-01T10:00:00Z'),
(20,1, 'Plan Elite de 6 Meses',       'Programa premium con entrenador y nutricionista asignado.',           350000, NULL, 'servicio', 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77', true,  '2024-10-01T10:00:00Z');

-- CARRITOS
INSERT INTO carritos (id_carrito, id_usuario, estado, fecha_creacion) VALUES
(1, 2, 'activo', '2024-10-01T10:00:00Z');

-- CARRITO_DETALLE
INSERT INTO carrito_detalle (id_detalle, id_carrito, id_producto, cantidad, precio_unitario, fecha_creacion) VALUES
(1, 1, 1, 2, 120000, '2024-10-01T10:05:00Z'),
(2, 1, 2, 1,  95000, '2024-10-01T10:05:00Z'),
(3, 1, 3, 1, 280000, '2024-10-01T10:05:00Z');

-- PEDIDOS
INSERT INTO pedidos (id_pedido, id_usuario, total, estado, fecha_pedido) VALUES
(1, 2, 615000, 'pagado', '2024-10-01T10:06:00Z');

-- PEDIDOS_DETALLE
INSERT INTO pedidos_detalle (id_pedido_detalle, id_pedido, id_producto, cantidad, precio_unitario, fecha_creacion) VALUES
(1, 1, 1, 2, 120000, '2024-10-01T10:06:10Z'),
(2, 1, 2, 1,  95000, '2024-10-01T10:06:10Z'),
(3, 1, 3, 1, 280000, '2024-10-01T10:06:10Z');

-- RESEÑAS
INSERT INTO resenas (id_resena, id_usuario, id_producto, comentario, calificacion, fecha_creacion) VALUES
(1, 2, 1, 'Excelente calidad y ajuste rápido.', 5, '2024-10-05T10:15:00Z'),
(2, 2, 2, 'Muy buena barra, sólida y estable.', 4, '2024-10-05T10:20:00Z'),
(3, 2, 3, 'Set completo, ideal para progresar.', 5, '2024-10-05T10:25:00Z');

-- LIKES
INSERT INTO likes (id_like, id_usuario, id_producto, fecha_creacion) VALUES
(1, 2, 1, '2024-10-02T09:00:00Z'),
(2, 2, 3, '2024-10-02T09:01:00Z'),
(3, 1, 2, '2024-10-02T09:02:00Z'),
(4, 1, 3, '2024-10-02T09:03:00Z');

COMMIT;