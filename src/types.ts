export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  vehicle: "Moto" | "Auto" | "Furgoneta";
  plate: string;
  status: "active" | "resting" | "offline";
  rating: number;
}

export interface MapCoordinates {
  x: number; // percentage width of maps
  y: number; // percentage height of maps
}

export interface RouteStop {
  id: string;
  time: string;
  address: string;
  clientName: string;
  ticketId: string;
  amount: number;
  status: "delivered" | "pending" | "failed";
  notes?: string;
  coords: MapCoordinates;
}

export interface DriverTimeline {
  driverId: string;
  date: string;
  currentStopId: string;
  routePath: MapCoordinates[]; // list of path coordinate checkpoints
  stops: RouteStop[];
}

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  address: string;
  itemsCount: number;
  total: number;
  status: "pending" | "picking" | "dispatched" | "delivered" | "cancelled";
  createdAt: string;
  driverId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Frescos" | "Lácteos" | "Abarrotes" | "Bebidas" | "Congelados" | "Higiene";
  stock: number;
  minStock: number;
  price: number;
  cost: number;
}

export interface SupportTicket {
  id: string;
  orderId: string;
  clientName: string;
  clientEmail: string;
  category: "Producto Dañado" | "Faltante" | "Demora Chofer" | "Dirección Incorrecta" | "Otro";
  description: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  assignedDriverId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "shift" | "supply" | "maintenance";
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  targetName: string; // Driver name or wholesaler name
  notes?: string;
}

export interface FinancialMetric {
  month: string;
  ventas: number;
  cogs: number; // Cost of goods sold
  logistica: number; // fuel + drivers
  operaciones: number; // dark store rent + utilities
  netProfit: number;
}

// Initial Mock Datasets
export const initialDrivers: Driver[] = [
  { id: "drv_1", name: "Carlos Ruiz", avatar: "👨‍✈️", phone: "+504 9452-0192", vehicle: "Moto", plate: "M-A928", status: "active", rating: 4.8 },
  { id: "drv_2", name: "Sofía Medina", avatar: "👩‍✈️", phone: "+504 9821-0210", vehicle: "Auto", plate: "H-B392", status: "active", rating: 4.9 },
  { id: "drv_3", name: "Juan Pérez", avatar: "👨‍💻", phone: "+504 8877-0344", vehicle: "Furgoneta", plate: "P-C104", status: "resting", rating: 4.6 },
  { id: "drv_4", name: "Elena Gómez", avatar: "👩‍💼", phone: "+504 3311-0450", vehicle: "Moto", plate: "M-A421", status: "offline", rating: 4.7 },
];

export const initialTimelines: DriverTimeline[] = [
  {
    driverId: "drv_1",
    date: "2026-07-12",
    currentStopId: "stop_1_2",
    routePath: [
      { x: 50, y: 50 }, // Dark store central (Barrio Guamilito)
      { x: 30, y: 40 }, // Stop 1 (Barrio Guamilito)
      { x: 20, y: 65 }, // Stop 2 (Colonia Trejo)
      { x: 45, y: 75 }, // Stop 3 (Colonia Jardines del Valle)
      { x: 75, y: 40 }, // Stop 4 (La Lima)
      { x: 50, y: 50 }, // Return
    ],
    stops: [
      { id: "stop_1_1", time: "08:15 AM", address: "Barrio Guamilito, 4 Calle NO, San Pedro Sula", clientName: "Mario Castellanos", ticketId: "PED-8291", amount: 1450, status: "delivered", notes: "Entregado en mano. Todo excelente.", coords: { x: 30, y: 40 } },
      { id: "stop_1_2", time: "09:05 AM", address: "Colonia Trejo, 22 Avenida SO, San Pedro Sula", clientName: "Lucía Zelaya", ticketId: "PED-8295", amount: 820, status: "delivered", notes: "La seguridad residencial recibió el pedido.", coords: { x: 20, y: 65 } },
      { id: "stop_1_3", time: "10:10 AM", address: "Colonia Jardines del Valle, San Pedro Sula", clientName: "Gustavo Banegas", ticketId: "PED-8302", amount: 1250, status: "pending", notes: "Bloque G, Casa 15. Tocar timbre.", coords: { x: 45, y: 75 } },
      { id: "stop_1_4", time: "11:20 AM", address: "La Lima, Cortés (Sector Centro)", clientName: "Martina Valle", ticketId: "PED-8311", amount: 680, status: "pending", notes: "Llamar al llegar frente al parque central.", coords: { x: 75, y: 40 } },
    ]
  },
  {
    driverId: "drv_2",
    date: "2026-07-12",
    currentStopId: "stop_2_1",
    routePath: [
      { x: 50, y: 50 }, // Dark store central
      { x: 70, y: 70 }, // Stop 1 (Barrio Los Andes)
      { x: 85, y: 55 }, // Stop 2 (Choloma)
      { x: 60, y: 25 }, // Stop 3 (Villanueva)
    ],
    stops: [
      { id: "stop_2_1", time: "08:45 AM", address: "Barrio Los Andes, 12 Avenida, San Pedro Sula", clientName: "Federico Flores", ticketId: "PED-8293", amount: 2450, status: "delivered", notes: "Pedido Premium. Cuidado con el cartón de huevos.", coords: { x: 70, y: 70 } },
      { id: "stop_2_2", time: "09:40 AM", address: "Choloma, Cortés (Barrio El Centro)", clientName: "Paula Bonilla", ticketId: "PED-8301", amount: 1100, status: "delivered", notes: "Cliente reportó demora de 5 min por tráfico en Bulevar del Norte.", coords: { x: 85, y: 55 } },
      { id: "stop_2_3", time: "10:35 AM", address: "Villanueva, Cortés (Colonia Las Cascadas)", clientName: "Andrés Lanza", ticketId: "PED-8308", amount: 1950, status: "pending", notes: "Entrega programada por la mañana.", coords: { x: 60, y: 25 } },
    ]
  },
  {
    driverId: "drv_3",
    date: "2026-07-12",
    currentStopId: "stop_3_1",
    routePath: [
      { x: 50, y: 50 },
      { x: 35, y: 75 },
      { x: 15, y: 45 },
    ],
    stops: [
      { id: "stop_3_1", time: "12:00 PM", address: "El Progreso, Yoro (Colonia Bendeck)", clientName: "Esdras Mejía", ticketId: "PED-8320", amount: 1550, status: "pending", notes: "Dejar en la caseta de vigilancia.", coords: { x: 35, y: 75 } },
      { id: "stop_3_2", time: "12:45 PM", address: "Cofradía, Cortés (Barrio El Centro)", clientName: "Clara Díaz", ticketId: "PED-8325", amount: 920, status: "pending", notes: "Entregar directamente en portón verde.", coords: { x: 15, y: 45 } },
    ]
  }
];

export const initialOrders: Order[] = [
  { id: "PED-8315", clientName: "Manuel Tejada", clientEmail: "mtejada@example.com", address: "Colonia Altamira, San Pedro Sula", itemsCount: 14, total: 1350, status: "picking", createdAt: "2026-07-12T10:15:00Z" },
  { id: "PED-8314", clientName: "Gabriela Solís", clientEmail: "gaby.s@example.com", address: "Barrio Rio de Piedras, San Pedro Sula", itemsCount: 6, total: 820, status: "pending", createdAt: "2026-07-12T10:05:00Z" },
  { id: "PED-8311", clientName: "Martina Valle", clientEmail: "martina.valle@example.com", address: "La Lima, Cortés (Sector Centro)", itemsCount: 5, total: 680, status: "dispatched", createdAt: "2026-07-12T09:45:00Z", driverId: "drv_1" },
  { id: "PED-8308", clientName: "Andrés Lanza", clientEmail: "andres_l@example.com", address: "Villanueva, Cortés (Colonia Las Cascadas)", itemsCount: 19, total: 1950, status: "dispatched", createdAt: "2026-07-12T09:12:00Z", driverId: "drv_2" },
  { id: "PED-8302", clientName: "Gustavo Banegas", clientEmail: "gustavob@example.com", address: "Colonia Jardines del Valle, San Pedro Sula", itemsCount: 11, total: 1250, status: "dispatched", createdAt: "2026-07-12T08:50:00Z", driverId: "drv_1" },
  { id: "PED-8295", clientName: "Lucía Zelaya", clientEmail: "luciaz@example.com", address: "Colonia Trejo, 22 Avenida SO, San Pedro Sula", itemsCount: 8, total: 820, status: "delivered", createdAt: "2026-07-12T08:05:00Z", driverId: "drv_1" },
  { id: "PED-8293", clientName: "Federico Flores", clientEmail: "fede.flores@example.com", address: "Barrio Los Andes, 12 Avenida, San Pedro Sula", itemsCount: 22, total: 2450, status: "delivered", createdAt: "2026-07-12T07:45:00Z", driverId: "drv_2" },
  { id: "PED-8291", clientName: "Mario Castellanos", clientEmail: "mcastellanos@example.com", address: "Barrio Guamilito, 4 Calle NO, San Pedro Sula", itemsCount: 15, total: 1450, status: "delivered", createdAt: "2026-07-12T07:30:00Z", driverId: "drv_1" },
];

export const initialInventory: InventoryItem[] = [
  { id: "INV-001", name: "Tomate Redondo de Constanza (1kg)", category: "Frescos", stock: 120, minStock: 50, price: 45, cost: 20 },
  { id: "INV-002", name: "Leche Entera Sula (1L)", category: "Lácteos", stock: 240, minStock: 80, price: 34, cost: 24 },
  { id: "INV-003", name: "Pechuga de Pollo Fresca Rey (1kg)", category: "Frescos", stock: 15, minStock: 30, price: 110, cost: 75 }, // LOW STOCK
  { id: "INV-004", name: "Fideos Tallarines Roma (500g)", category: "Abarrotes", stock: 450, minStock: 100, price: 22, cost: 14 },
  { id: "INV-005", name: "Cerveza SalvaVida Nacional (12 oz)", category: "Bebidas", stock: 320, minStock: 60, price: 38, cost: 25 },
  { id: "INV-006", name: "Yogur Yes de Fresa (190g)", category: "Lácteos", stock: 8, minStock: 25, price: 18, cost: 11 }, // LOW STOCK
  { id: "INV-007", name: "Hamburguesas de Res El Progreso (4u)", category: "Congelados", stock: 95, minStock: 30, price: 85, cost: 55 },
  { id: "INV-008", name: "Shampoo Head & Shoulders Sula (400ml)", category: "Higiene", stock: 48, minStock: 15, price: 145, cost: 98 },
  { id: "INV-009", name: "Coca Cola Sabor Original (1.5L)", category: "Bebidas", stock: 500, minStock: 120, price: 48, cost: 32 },
  { id: "INV-010", name: "Aguacate Hass de Ocotepeque (unidad)", category: "Frescos", stock: 5, minStock: 20, price: 30, cost: 16 }, // LOW STOCK
];

export const initialTickets: SupportTicket[] = [
  { id: "TCK-491", orderId: "PED-8295", clientName: "Lucía Zelaya", clientEmail: "luciaz@example.com", category: "Producto Dañado", description: "El yogur Yes de fresa llegó roto y manchó los fideos de la bolsa. Deseo reembolso.", status: "open", createdAt: "2026-07-12T09:15:00Z", assignedDriverId: "drv_1" },
  { id: "TCK-490", orderId: "PED-8291", clientName: "Mario Castellanos", clientEmail: "mcastellanos@example.com", category: "Faltante", description: "Faltó el paquete de galletas Diana que fue cobrado en el total.", status: "in_progress", createdAt: "2026-07-12T08:30:00Z", assignedDriverId: "drv_1" },
  { id: "TCK-489", orderId: "PED-8293", clientName: "Federico Flores", clientEmail: "fede.flores@example.com", category: "Demora Chofer", description: "El repartidor tardó más de 40 minutos en llegar a Barrio Los Andes, reportó demoras por tráfico denso en el Bulevar del Norte.", status: "resolved", createdAt: "2026-07-12T08:10:00Z", assignedDriverId: "drv_2" },
];

export const initialEvents: CalendarEvent[] = [
  { id: "EVT-1", title: "Turno de Reparto AM", type: "shift", date: "2026-07-12", startTime: "08:00", endTime: "14:00", targetName: "Carlos Ruiz", notes: "Ruta Bulevar del Sur & Centro" },
  { id: "EVT-2", title: "Turno de Reparto AM", type: "shift", date: "2026-07-12", startTime: "08:30", endTime: "14:30", targetName: "Sofía Medina", notes: "Ruta Bulevar del Norte & Jardines" },
  { id: "EVT-3", title: "Abastecimiento Mayorista", type: "supply", date: "2026-07-12", startTime: "07:00", endTime: "08:30", targetName: "Distribuidora DIAPA", notes: "Llegada de abarrotes secos, jugos de naranja Sula y productos de limpieza." },
  { id: "EVT-4", title: "Mantenimiento Furgoneta", type: "maintenance", date: "2026-07-13", startTime: "14:00", endTime: "17:00", targetName: "Juan Pérez", notes: "Cambio de aceite y alineación en taller SPS." },
  { id: "EVT-5", title: "Turno de Reparto PM", type: "shift", date: "2026-07-12", startTime: "14:00", endTime: "20:00", targetName: "Juan Pérez", notes: "Furgoneta disponible para despachos pesados a Villanueva y Choloma." },
];

export const initialFinancialMetrics: FinancialMetric[] = [
  { month: "Ene 2026", ventas: 340000, cogs: 204000, logistica: 45000, operaciones: 35000, netProfit: 56000 },
  { month: "Feb 2026", ventas: 380000, cogs: 228000, logistica: 48000, operaciones: 35000, netProfit: 69000 },
  { month: "Mar 2026", ventas: 420000, cogs: 252000, logistica: 52000, operaciones: 35000, netProfit: 81000 },
  { month: "Abr 2026", ventas: 490000, cogs: 294000, logistica: 58000, operaciones: 38000, netProfit: 100000 },
  { month: "May 2026", ventas: 550000, cogs: 330000, logistica: 62000, operaciones: 38000, netProfit: 120000 },
  { month: "Jun 2026", ventas: 620000, cogs: 372000, logistica: 68000, operaciones: 40000, netProfit: 140000 },
  { month: "Jul 2026 (Act)", ventas: 245000, cogs: 147000, logistica: 28000, operaciones: 15000, netProfit: 55000 }, // Month in progress
];
