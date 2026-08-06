import React, { useState } from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Clock, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle,
  Truck,
  RotateCcw
} from "lucide-react";
import { Driver, Order, InventoryItem, FinancialMetric } from "../types";

interface OverviewProps {
  drivers: Driver[];
  orders: Order[];
  inventory: InventoryItem[];
  financials: FinancialMetric[];
  onNavigateToTab: (tab: string) => void;
  onUpdateOrderStatus: (id: string, status: Order["status"]) => void;
}

export default function Overview({
  drivers,
  orders,
  inventory,
  financials,
  onNavigateToTab,
  onUpdateOrderStatus,
}: OverviewProps) {
  const [activeMetric, setActiveMetric] = useState<"ventas" | "netProfit" | "logistica">("ventas");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // KPIs
  const totalRevenue = financials.reduce((acc, curr) => acc + curr.ventas, 0);
  const activeDriversCount = drivers.filter(d => d.status === "active").length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "picking" || o.status === "dispatched");
  const completedOrdersCount = orders.filter(o => o.status === "delivered").length;
  const lowStockItems = inventory.filter(i => i.stock <= i.minStock);

  // Categories for inventory donut
  const categoryData = inventory.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.stock;
    return acc;
  }, {} as Record<string, number>);

  const totalStockItems = Object.values(categoryData).reduce((a, b) => a + b, 0);

  const colorsByCategory: Record<string, string> = {
    Frescos: "#10B981", // Emerald
    Lácteos: "#3B82F6", // Blue
    Abarrotes: "#F59E0B", // Amber
    Bebidas: "#8B5CF6", // Purple
    Congelados: "#06B6D4", // Cyan
    Higiene: "#EC4899", // Pink
  };

  // Helper formatting currency (Honduras Lempiras)
  const formatLps = (val: number) => {
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", maximumFractionDigits: 0 }).format(val);
  };

  // Sales Trend SVG calculations with left padding for Y-Axis scale labels
  const maxVal = Math.max(...financials.map(f => f[activeMetric])) || 600000;
  // Let's round up maxVal to a clean multiple of 100,000 for neat grid scale divisions
  const roundedMaxVal = Math.ceil(maxVal / 100000) * 100000;

  const chartHeight = 200;
  const chartWidth = 560;
  const pLeft = 70; // Generous padding on left for currency tags
  const pRight = 20;
  const pTop = 20;
  const pBottom = 30;

  const points = financials.map((f, i) => {
    const x = pLeft + (i / (financials.length - 1)) * (chartWidth - pLeft - pRight);
    const y = chartHeight - pBottom - (f[activeMetric] / roundedMaxVal) * (chartHeight - pTop - pBottom);
    return { x, y, label: f.month, value: f[activeMetric] };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Filled area path
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - pBottom} L ${points[0].x} ${chartHeight - pBottom} Z` 
    : "";

  return (
    <div id="overview-tab" className="space-y-6">
      {/* Top Banner - Clean, modern retail identity gradient */}
      <div id="overview-banner" className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 border border-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">Consola de Despacho • Activa</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">SuperEconomico Consola de Distribución Logística</h2>
          <p className="text-emerald-100/90 text-xs max-w-xl leading-relaxed">
            Consola administrativa centralizada para control de pedidos y despacho de entregas. Coordina la flota de repartidores en Honduras y supervisa el inventario de productos en tiempo real.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
          <button 
            id="nav-map-btn"
            onClick={() => onNavigateToTab("map")}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg transition-all duration-150 shadow-sm text-xs cursor-pointer"
          >
            <Truck size={14} />
            Mapa en Vivo
          </button>
          <button 
            id="nav-tickets-btn"
            onClick={() => onNavigateToTab("tickets")}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-lg border border-slate-700 transition-all duration-150 text-xs cursor-pointer"
          >
            Atención Reclamos
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="kpis-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Ingresos */}
        <div id="kpi-revenue" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-semibold">Facturación Acumulada</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{formatLps(totalRevenue)}</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
              <ArrowUpRight size={14} />
              <span>+18.4% este mes</span>
            </div>
          </div>
        </div>

        {/* KPI: Pedidos */}
        <div id="kpi-orders" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-semibold">Pedidos Registrados</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{orders.length}</h3>
            <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold font-mono">
              <span>{pendingOrders.length} en curso</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{completedOrdersCount} listos</span>
            </div>
          </div>
        </div>

        {/* KPI: Repartidores */}
        <div id="kpi-drivers" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-semibold">Flota Repartidores</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{drivers.length}</h3>
            <div className="flex items-center gap-1.5 text-purple-700 text-[11px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1" />
              <span>{activeDriversCount} activos hoy</span>
            </div>
          </div>
        </div>

        {/* KPI: Alertas Inventario */}
        <div id="kpi-inventory" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-xs font-semibold">SKUs bajo Stock Crítico</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{lowStockItems.length}</h3>
            <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-bold">
              <span>{inventory.length} total de artículos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Interactive Graphics */}
      <div id="charts-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales trend chart - Custom interactive SVG */}
        <div id="chart-sales-trend" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Análisis de Desempeño Financiero</h3>
              <p className="text-slate-500 text-xs font-medium">Visualización de flujos y márgenes operativos</p>
            </div>
            {/* Metric switcher buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button 
                id="btn-metric-sales"
                onClick={() => { setActiveMetric("ventas"); setHoveredPoint(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${activeMetric === "ventas" ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                Ventas
              </button>
              <button 
                id="btn-metric-profit"
                onClick={() => { setActiveMetric("netProfit"); setHoveredPoint(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${activeMetric === "netProfit" ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                Márgenes
              </button>
              <button 
                id="btn-metric-logistics"
                onClick={() => { setActiveMetric("logistica"); setHoveredPoint(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${activeMetric === "logistica" ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                Logística
              </button>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
              {/* Grids and Axes with scale labels in HNL */}
              {(() => {
                const yTicks = [0, 0.25, 0.5, 0.75, 1];
                return yTicks.map((t, idx) => {
                  const y = chartHeight - pBottom - t * (chartHeight - pTop - pBottom);
                  const val = roundedMaxVal * t;
                  return (
                    <g key={`ytick-${idx}`} className="opacity-90">
                      {/* Horizontal Gridline */}
                      <line 
                        x1={pLeft} 
                        y1={y} 
                        x2={chartWidth - pRight} 
                        y2={y} 
                        stroke="#f1f5f9" 
                        strokeWidth={1} 
                        strokeDasharray={val === 0 ? "" : "3 3"} 
                      />
                      {/* Scale Label */}
                      <text 
                        x={pLeft - 10} 
                        y={y + 3} 
                        textAnchor="end" 
                        className="font-mono text-[9px] fill-slate-400 font-bold"
                      >
                        {formatLps(val)}
                      </text>
                    </g>
                  );
                });
              })()}

              {/* Vertical grids corresponding to months */}
              {points.map((p, i) => (
                <line key={`vgrid-${i}`} x1={p.x} y1={pTop} x2={p.x} y2={chartHeight - pBottom} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
              ))}

              {/* Hover guide line */}
              {hoveredPoint !== null && (
                <line 
                  x1={points[hoveredPoint].x} 
                  y1={pTop} 
                  x2={points[hoveredPoint].x} 
                  y2={chartHeight - pBottom} 
                  stroke={activeMetric === "ventas" ? "#10B981" : activeMetric === "netProfit" ? "#3B82F6" : "#8B5CF6"} 
                  strokeWidth={1} 
                  strokeDasharray="3 3" 
                  className="pointer-events-none"
                />
              )}

              {/* Shaded area under the curve */}
              <path 
                d={areaD} 
                fill={activeMetric === "ventas" ? "url(#emerald-gradient)" : activeMetric === "netProfit" ? "url(#blue-gradient)" : "url(#purple-gradient)"} 
                opacity="0.12"
              />

              {/* Main curve line */}
              <path 
                d={pathD} 
                fill="none" 
                stroke={activeMetric === "ventas" ? "#10B981" : activeMetric === "netProfit" ? "#3B82F6" : "#8B5CF6"} 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Interactive nodes */}
              {points.map((p, i) => (
                <g key={`point-${i}`} className="cursor-pointer">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredPoint === i ? 6 : 4} 
                    fill={activeMetric === "ventas" ? "#10B981" : activeMetric === "netProfit" ? "#3B82F6" : "#8B5CF6"} 
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* Gradients definitions */}
              <defs>
                <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Custom Tooltip overlay */}
            {hoveredPoint !== null && (
              <div 
                className="absolute bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-[11px] space-y-0.5 pointer-events-none shadow-md text-white z-10"
                style={{
                  left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / chartHeight) * 100 - 15}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-bold">{points[hoveredPoint].label}</div>
                <div className="text-slate-300">
                  {activeMetric === "ventas" ? "Facturación" : activeMetric === "netProfit" ? "Margen Neto" : "Gasto Logístico"}:{" "}
                  <span className="text-emerald-400 font-mono font-bold">{formatLps(points[hoveredPoint].value)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Month labels footer */}
          <div className="flex justify-between mt-2 pl-[70px] pr-[20px] text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            {financials.map((f, i) => (
              <span key={`lbl-${i}`}>{f.month.split(" ")[0]}</span>
            ))}
          </div>
        </div>

        {/* Stock distribution - Custom interactive Donut */}
        <div id="chart-inventory" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stock por Categorías</h3>
            <p className="text-slate-500 text-xs">Distribución física de SKUs en bodega</p>
          </div>

          <div className="relative flex items-center justify-center my-4 h-40">
            {/* SVG Donut */}
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
              {(() => {
                let accumulatedPercent = 0;
                return Object.entries(categoryData).map(([cat, val], i) => {
                  const percent = val / totalStockItems;
                  const strokeDasharray = `${percent * 251.2} 251.2`;
                  const strokeDashoffset = -accumulatedPercent * 251.2;
                  accumulatedPercent += percent;

                  const color = colorsByCategory[cat] || "#FFFFFF";
                  const isHovered = hoveredSlice === cat;

                  return (
                    <circle
                      key={`slice-${cat}`}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isHovered ? "11" : "8"}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(cat)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <Package className="text-slate-400 mb-0.5" size={16} />
              <span className="text-lg font-bold font-mono text-slate-800">
                {hoveredSlice ? categoryData[hoveredSlice] : totalStockItems}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {hoveredSlice ? hoveredSlice : "Unidades"}
              </span>
            </div>
          </div>

          {/* Categoríes list legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(categoryData).map(([cat, val]) => (
              <div 
                key={`legend-${cat}`}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${hoveredSlice === cat ? "bg-slate-50" : ""}`}
                onMouseEnter={() => setHoveredSlice(cat)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colorsByCategory[cat] }} />
                <span className="text-slate-700 truncate font-medium">{cat}</span>
                <span className="text-slate-400 font-mono ml-auto">
                  {Math.round((val / totalStockItems) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alerts & recent dispatch items */}
      <div id="operations-lists" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Order dispatch tracking */}
        <div id="live-dispatch-tracking" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Despachos en Curso (App)</h3>
              <p className="text-slate-500 text-xs">Monitoreo de preparación de canasta de compras</p>
            </div>
            <button 
              id="view-orders-btn"
              onClick={() => onNavigateToTab("map")}
              className="text-emerald-600 text-xs hover:underline flex items-center gap-1 font-semibold"
            >
              Ver mapa completo
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => {
              const driver = drivers.find(d => d.id === order.driverId);
              return (
                <div 
                  key={order.id} 
                  id={`order-row-${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/60 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {order.status === "pending" && (
                        <span className="flex h-3 w-3 rounded-full bg-yellow-500 animate-pulse" title="Pendiente de picking" />
                      )}
                      {order.status === "picking" && (
                        <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse" title="En preparación" />
                      )}
                      {order.status === "dispatched" && (
                        <span className="flex h-3 w-3 rounded-full bg-purple-500 animate-pulse" title="En camino" />
                      )}
                      {order.status === "delivered" && (
                        <CheckCircle size={16} className="text-emerald-600" title="Entregado" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-800 text-sm">{order.id}</span>
                        <span className="text-xs text-slate-500">({order.itemsCount} productos)</span>
                      </div>
                      <p className="text-slate-600 text-xs truncate max-w-xs mt-0.5">{order.clientName} • {order.address}</p>
                    </div>
                  </div>

                  {/* Flow control action / status indicator */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Driver details if dispatched */}
                    {driver && (
                      <div className="text-right text-xs shrink-0 mr-1">
                        <span className="text-slate-400 block font-medium">Logística</span>
                        <span className="text-slate-700 font-semibold">{driver.avatar} {driver.name}</span>
                      </div>
                    )}

                    {/* App state changer */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg">
                      {order.status === "pending" && (
                        <button
                          id={`btn-pick-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "picking")}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Iniciar Picking
                        </button>
                      )}
                      {order.status === "picking" && (
                        <button
                          id={`btn-dispatch-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "dispatched")}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[10px] px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Despachar
                        </button>
                      )}
                      {order.status === "dispatched" && (
                        <button
                          id={`btn-deliver-${order.id}`}
                          onClick={() => onUpdateOrderStatus(order.id, "delivered")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Entregar
                        </button>
                      )}
                      {order.status === "delivered" && (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 text-[10px] font-semibold px-2 py-1.5 rounded">
                          Entregado
                        </span>
                      )}
                    </div>

                    <div className="text-right font-mono text-sm font-bold text-slate-800 shrink-0">
                      {formatLps(order.total)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Inventory Warning */}
        <div id="stock-alerts" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alertas de Reposición</h3>
              <p className="text-slate-500 text-xs">Mermas o quiebre de stock inminente</p>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-bold font-mono">
              {lowStockItems.length} SKUs
            </span>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <CheckCircle size={28} className="mx-auto text-emerald-500" />
                <p className="text-xs">Todo el inventario sobre el stock crítico.</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/60 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 block">{item.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>Ref: {item.id}</span>
                      <span>•</span>
                      <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-600 block">
                      {item.stock} / {item.minStock} unids
                    </span>
                    <span className="text-[10px] text-slate-400 block">Mínimo requerido</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {lowStockItems.length > 0 && (
            <button 
              id="reorder-all-btn"
              onClick={() => onNavigateToTab("calendar")}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Programar Abastecimiento PM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
