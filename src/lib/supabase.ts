import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://mvrlcbcydpubhovvrmvf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmxjYmN5ZHB1YmhvdnZybXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA3OTAsImV4cCI6MjA5ODMxNjc5MH0.rNQq1xOA5zGJpMiHlhsXKw5lWLg49qYUtDSC9M7Iha8";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Gracefully export the client if configured, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema script to create the required tables in Supabase.
 * Users can copy this from our connection setup panel in the UI!
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. Habilitar la extensión uuid-ossp si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Choferes / Repartidores
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  plate TEXT NOT NULL,
  status TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Pedidos / Órdenes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  clientEmail TEXT NOT NULL,
  address TEXT NOT NULL,
  itemsCount INTEGER NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  driverId TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla de Inventario / Stock
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL,
  minStock INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla de Tickets de Soporte
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  orderId TEXT REFERENCES orders(id) ON DELETE SET NULL,
  clientName TEXT NOT NULL,
  clientEmail TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  assignedDriverId TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla de Eventos del Calendario
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  targetName TEXT NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Tabla de Métricas Financieras (Histórico)
CREATE TABLE IF NOT EXISTS financial_metrics (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  ventas NUMERIC NOT NULL,
  cogs NUMERIC NOT NULL,
  logistica NUMERIC NOT NULL,
  operaciones NUMERIC NOT NULL,
  netProfit NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insertar datos iniciales si las tablas están vacías (Semilla Honduras)
INSERT INTO drivers (id, name, avatar, phone, vehicle, plate, status, rating) VALUES
('drv_1', 'Carlos Ruiz', '👨‍✈️', '+504 9452-0192', 'Moto', 'M-A928', 'active', 4.8),
('drv_2', 'Sofía Medina', '👩‍✈️', '+504 9821-0210', 'Auto', 'H-B392', 'active', 4.9),
('drv_3', 'Juan Pérez', '👨‍💻', '+504 8877-0344', 'Furgoneta', 'P-C104', 'resting', 4.6),
('drv_4', 'Elena Gómez', '👩‍💼', '+504 3311-0450', 'Moto', 'M-A421', 'offline', 4.7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (id, name, category, stock, minStock, price, cost) VALUES
('INV-001', 'Tomate Redondo de Constanza (1kg)', 'Frescos', 120, 50, 45, 20),
('INV-002', 'Leche Entera Sula (1L)', 'Lácteos', 240, 80, 34, 24),
('INV-003', 'Pechuga de Pollo Fresca Rey (1kg)', 'Frescos', 15, 30, 110, 75),
('INV-004', 'Fideos Tallarines Roma (500g)', 'Abarrotes', 450, 100, 22, 14),
('INV-005', 'Cerveza SalvaVida Nacional (12 oz)', 'Bebidas', 320, 60, 38, 25),
('INV-006', 'Yogur Yes de Fresa (190g)', 'Lácteos', 8, 25, 18, 11),
('INV-007', 'Hamburguesas de Res El Progreso (4u)', 'Congelados', 95, 30, 85, 55),
('INV-008', 'Shampoo Head & Shoulders Sula (400ml)', 'Higiene', 48, 15, 145, 98),
('INV-009', 'Coca Cola Sabor Original (1.5L)', 'Bebidas', 500, 120, 48, 32),
('INV-010', 'Aguacate Hass de Ocotepeque (unidad)', 'Frescos', 5, 20, 30, 16)
ON CONFLICT (id) DO NOTHING;

INSERT INTO financial_metrics (month, ventas, cogs, logistica, operaciones, netProfit) VALUES
('Ene 2026', 340000, 204000, 45000, 35000, 56000),
('Feb 2026', 380000, 228000, 48000, 35000, 69000),
('Mar 2026', 420000, 252000, 52000, 35000, 81000),
('Abr 2026', 490000, 294000, 58000, 38000, 100000),
('May 2026', 550000, 330000, 62000, 38000, 120000),
('Jun 2026', 620000, 372000, 68000, 40000, 140000),
('Jul 2026 (Act)', 245000, 147000, 28000, 15000, 55000)
ON CONFLICT (month) DO NOTHING;
`;
