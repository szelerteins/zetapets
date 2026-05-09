-- ============================================================
-- seed.sql — Datos iniciales del catálogo de ZetaPets
-- NO inserta usuarios en auth.users directamente.
-- Ejecutar DESPUÉS de las migraciones.
-- ============================================================

INSERT INTO public.products
  (name, description, price, stock, image_url, emoji, category, badge, is_active)
VALUES
  -- HIGIENE
  ('Limpiador de Pelo',
   'Elimina el pelo de tu mascota de alfombras, ropa y muebles con facilidad. Recargable y reutilizable.',
   14990, 50, NULL, '🧴', 'Higiene', NULL, TRUE),

  ('Shampoo Hipoalergénico para Perros',
   'Fórmula suave para pieles sensibles. Sin parabenos ni sulfatos. 500 ml.',
   8990, 80, NULL, '🛁', 'Higiene', NULL, TRUE),

  ('Cortaúñas Profesional',
   'Cortaúñas de acero inoxidable con guarda de seguridad. Para perros y gatos de todos los tamaños.',
   6990, 100, NULL, '✂️', 'Higiene', NULL, TRUE),

  -- JUGUETES
  ('Lanzapelotas Automático',
   'Lanzador automático de pelotas para mantener a tu perro activo. 3 distancias ajustables.',
   38990, 30, NULL, '🎾', 'Juguetes', 'Popular', TRUE),

  ('Rascador para Gatos Multinivel',
   'Torre rascadora con 4 plataformas, cueva y juguetes colgantes. Sisal natural. 120 cm de alto.',
   29990, 20, NULL, '🐾', 'Juguetes', NULL, TRUE),

  ('Juguete Interactivo Anti-aburrimiento',
   'Dispensador de premios con 5 niveles de dificultad. Estimula la mente de tu mascota.',
   12990, 60, NULL, '🧩', 'Juguetes', NULL, TRUE),

  -- ALIMENTACIÓN
  ('Dispenser de Comida Inteligente',
   'Dispensador con temporizador. Programá hasta 4 comidas diarias desde la app.',
   52990, 25, '/productos/dispenser-comida.jpg', '🥣', 'Alimentación', 'Nuevo', TRUE),

  ('Bebedero con Filtro de Carbón',
   'Fuente de agua con filtro multicapa. 2 litros. Silencioso y fácil de limpiar.',
   24990, 40, '/productos/bebedero.jpg', '💧', 'Alimentación', NULL, TRUE),

  ('Comedero Automático V2',
   'Comedero automático con cámara y micrófono. Controlá las comidas desde tu celular.',
   79990, 15, '/productos/comedero-v2.jpg', '📱', 'Alimentación', 'Premium', TRUE),

  -- PASEO
  ('Botella Portátil Comida y Agua',
   'Todo en uno para salidas largas: compartimento para agua y snacks. Libre de BPA.',
   19990, 70, NULL, '🧴', 'Paseo', NULL, TRUE),

  ('Arnés Regulable Anti-tirones',
   'Arnés ergonómico con reflectivos. 4 puntos de ajuste. Tallas XS a XL.',
   17990, 90, NULL, '🦮', 'Paseo', NULL, TRUE),

  -- TECNOLOGÍA
  ('Collar con AirTag',
   'Collar de cuero vegano con funda integrada para AirTag. Localización en tiempo real.',
   12990, 45, '/productos/collar-airtag.jpg', '📍', 'Tecnología', NULL, TRUE),

  ('Cámara Pet Monitor WiFi',
   'Cámara 1080p con visión nocturna, audio bidireccional y dispenser de snacks remoto.',
   89990, 10, NULL, '📷', 'Tecnología', 'Nuevo', TRUE),

  -- ACCESORIOS
  ('Cama Ortopédica Memory Foam',
   'Cama con espuma viscoelástica que alivia articulaciones. Funda lavable. 70x50 cm.',
   34990, 35, NULL, '🛏️', 'Accesorios', NULL, TRUE),

  ('Mochila Transportadora Aérea',
   'Aprobada por aerolíneas. Ventilación lateral, base rígida y cierre de seguridad.',
   44990, 18, NULL, '🎒', 'Accesorios', NULL, TRUE),

  -- REPUESTOS
  ('Filtro de Carbón para Bebedero (x3)',
   'Pack de 3 filtros de repuesto compatibles con el Bebedero con Filtro de Carbón.',
   5990, 150, NULL, '🔄', 'Repuestos', NULL, TRUE),

  ('Pelota de Repuesto Lanzapelotas (x6)',
   'Pack de 6 pelotas compatibles con el Lanzapelotas Automático. Goma natural.',
   3990, 200, NULL, '⚽', 'Repuestos', NULL, TRUE),

  -- GATOS
  ('Arena Sanitaria Aglomerante 10kg',
   'Arena de alta absorción y control de olores. Sin polvo. Forma grumos sólidos.',
   11990, 60, NULL, '🏖️', 'Gatos', NULL, TRUE),

  ('Rascador de Pared',
   'Rascador de sisal montado en pared. Ahorra espacio y protege los muebles.',
   9990, 40, NULL, '🐱', 'Gatos', NULL, TRUE)

ON CONFLICT DO NOTHING;
