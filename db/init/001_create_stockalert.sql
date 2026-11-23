CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  stock_minimo INT,
  dias_preaviso INT
);

CREATE TABLE IF NOT EXISTS lotes (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  codigo_lote VARCHAR(50) NOT NULL,
  saldo INT NOT NULL CHECK (saldo >= 0),
  fecha_vencimiento DATE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos (
  id SERIAL PRIMARY KEY,
  lote_id INT NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('INGRESO', 'VENTA', 'MERMA')),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  motivo VARCHAR(150),
  usuario_rol VARCHAR(30) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario_rol VARCHAR(30) NOT NULL,
  endpoint VARCHAR(120) NOT NULL,
  metodo VARCHAR(10) NOT NULL,
  detalle TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datos semilla iniciales 
INSERT INTO productos (codigo, nombre, categoria, stock_minimo, dias_preaviso) VALUES
  ('LAC-001', 'Leche Entera 1L', 'Lacteos', 10, 7),
  ('ABA-002', 'Arroz Blanco 2kg', 'Abarrotes', 15, 15),
  ('SIN-003', 'Producto Sin Umbral', 'Varios', NULL, NULL);

INSERT INTO lotes (producto_id, codigo_lote, saldo, fecha_vencimiento) VALUES
  (1, 'LOTE-LAC-A', 6, CURRENT_DATE + INTERVAL '3 days'),
  (1, 'LOTE-LAC-B', 12, CURRENT_DATE + INTERVAL '20 days'),
  (2, 'LOTE-ABA-A', 8, CURRENT_DATE + INTERVAL '60 days'),
  (3, 'LOTE-SIN-FECHA', 5, NULL);