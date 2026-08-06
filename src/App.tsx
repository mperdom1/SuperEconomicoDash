import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Map, 
  FileSpreadsheet, 
  Calendar as CalendarIcon, 
  AlertOctagon, 
  Mail,
  Truck,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";

import { 
  initialDrivers, 
  initialTimelines, 
  initialOrders, 
  initialInventory, 
  initialTickets, 
  initialEvents, 
  initialFinancialMetrics,
  Driver,
  DriverTimeline,
  Order,
  InventoryItem,
  SupportTicket,
  CalendarEvent,
  FinancialMetric
} from "./types";

import { supabase, isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from "./lib/supabase";
import { Database, Copy, Check, Server, Eye, Settings, HelpCircle, AlertCircle, X } from "lucide-react";

import Overview from "./components/Overview";
import LogisticsMap from "./components/LogisticsMap";
import FinancialReports from "./components/FinancialReports";
import DriverCalendar from "./components/DriverCalendar";
import TicketHub from "./components/TicketHub";
import EmailConsole from "./components/EmailConsole";

export default function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Core logistical states (with default fallbacks)
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const local = localStorage.getItem("se_drivers");
    return local ? JSON.parse(local) : initialDrivers;
  });
  const [timelines, setTimelines] = useState<DriverTimeline[]>(() => {
    const local = localStorage.getItem("se_timelines");
    return local ? JSON.parse(local) : initialTimelines;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem("se_orders");
    return local ? JSON.parse(local) : initialOrders;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const local = localStorage.getItem("se_inventory");
    return local ? JSON.parse(local) : initialInventory;
  });
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const local = localStorage.getItem("se_tickets");
    return local ? JSON.parse(local) : initialTickets;
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const local = localStorage.getItem("se_events");
    return local ? JSON.parse(local) : initialEvents;
  });

  const [financials, setFinancials] = useState<FinancialMetric[]>(() => {
    const local = localStorage.getItem("se_financials");
    return local ? JSON.parse(local) : initialFinancialMetrics;
  });

  // Supabase Syncing and Modal States
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Cross-tab message dispatcher states
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem("se_drivers", JSON.stringify(drivers));
  }, [drivers]);
  useEffect(() => {
    localStorage.setItem("se_timelines", JSON.stringify(timelines));
  }, [timelines]);
  useEffect(() => {
    localStorage.setItem("se_orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("se_inventory", JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem("se_tickets", JSON.stringify(tickets));
  }, [tickets]);
  useEffect(() => {
    localStorage.setItem("se_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("se_financials", JSON.stringify(financials));
  }, [financials]);

  const fetchSupabaseData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setSupabaseLoading(true);
    setSupabaseError(null);
    let loadedCount = 0;
    try {
      // 1. Fetch Products / Inventory (Try 'productos' from Android app first, fallback to 'inventory')
      try {
        const { data: productosData, error: pErr } = await supabase.from("productos").select("*");
        if (!pErr && productosData && productosData.length > 0) {
          setInventory(productosData.map(item => ({
            id: String(item.id || item.codigo || `PROD-${Math.random()}`),
            name: String(item.nombre || item.name || item.titulo || "Producto"),
            category: (item.categoria_nombre || item.categoria || item.category || "Frescos") as any,
            stock: Number(item.stock ?? item.cantidad ?? 50),
            minStock: Number(item.min_stock ?? item.minStock ?? 10),
            price: Number(item.precio ?? item.price ?? 0),
            cost: Number(item.costo ?? item.cost ?? (Number(item.precio ?? item.price ?? 0) * 0.65)),
          })));
          loadedCount++;
        } else {
          const { data: inventoryData, error: iErr } = await supabase.from("inventory").select("*");
          if (!iErr && inventoryData && inventoryData.length > 0) {
            setInventory(inventoryData.map(item => ({
              ...item,
              price: Number(item.price),
              cost: Number(item.cost),
            })) as InventoryItem[]);
            loadedCount++;
          }
        }
      } catch (e) {
        console.warn("Supabase productos/inventory query notice:", e);
      }

      // 2. Fetch Orders / Pedidos (Try 'pedidos' from Android app first, fallback to 'orders')
      try {
        const { data: pedidosData, error: pedErr } = await supabase.from("pedidos").select("*");
        if (!pedErr && pedidosData && pedidosData.length > 0) {
          setOrders(pedidosData.map(o => ({
            id: String(o.id),
            clientName: o.cliente_nombre || o.nombre_cliente || o.perfil_id || "Cliente Supabase",
            clientEmail: o.cliente_email || o.email || "cliente@supereconomico.hn",
            address: o.direccion || o.address || "Tegucigalpa / SPS",
            itemsCount: Number(o.items_count || o.cantidad_items || 1),
            total: Number(o.total || o.monto || 0),
            status: (o.estado || o.status || "pending") as any,
            createdAt: o.created_at || o.createdAt || new Date().toISOString(),
            driverId: o.chofer_id || o.driverId || undefined
          })));
          loadedCount++;
        } else {
          const { data: ordersData, error: oErr } = await supabase.from("orders").select("*");
          if (!oErr && ordersData && ordersData.length > 0) {
            setOrders(ordersData.map(o => ({
              ...o,
              total: Number(o.total),
              createdAt: o.createdAt
            })) as Order[]);
            loadedCount++;
          }
        }
      } catch (e) {
        console.warn("Supabase pedidos/orders query notice:", e);
      }

      // 3. Fetch Profiles / Drivers (Try 'perfiles' or 'drivers')
      try {
        const { data: perfilesData, error: perfErr } = await supabase.from("perfiles").select("*");
        if (!perfErr && perfilesData && perfilesData.length > 0) {
          const mappedDrivers: Driver[] = perfilesData.map((p, idx) => ({
            id: String(p.id || `drv_${idx + 1}`),
            name: p.nombre || p.full_name || p.name || `Usuario Supabase ${idx + 1}`,
            avatar: p.rol === "chofer" ? "👨‍✈️" : "👩‍💼",
            phone: p.telefono || p.phone || "+504 9000-0000",
            vehicle: (p.vehiculo || "Moto") as any,
            plate: p.placa || `H-A${100 + idx}`,
            status: (p.estado || "active") as any,
            rating: Number(p.rating || 4.9)
          }));
          setDrivers(mappedDrivers);
          loadedCount++;
        } else {
          const { data: driversData, error: dErr } = await supabase.from("drivers").select("*");
          if (!dErr && driversData && driversData.length > 0) {
            setDrivers(driversData as Driver[]);
            loadedCount++;
          }
        }
      } catch (e) {
        console.warn("Supabase perfiles/drivers query notice:", e);
      }

      // 4. Fetch Logs / Tickets (Try 'logs_errores' or 'tickets')
      try {
        const { data: logsData, error: lErr } = await supabase.from("logs_errores").select("*");
        if (!lErr && logsData && logsData.length > 0) {
          setTickets(logsData.map((l, idx) => ({
            id: String(l.id || `LOG-${idx + 1}`),
            orderId: l.pedido_id ? String(l.pedido_id) : "PED-001",
            clientName: l.usuario || "App Móvil Error Log",
            clientEmail: "soporte@supereconomico.hn",
            category: "Otro",
            description: l.mensaje || l.error || l.detalles || "Registro de error en app móvil",
            status: l.resuelto ? "resolved" : "open",
            createdAt: l.created_at || new Date().toISOString()
          })));
          loadedCount++;
        } else {
          const { data: ticketsData, error: tErr } = await supabase.from("tickets").select("*");
          if (!tErr && ticketsData && ticketsData.length > 0) {
            setTickets(ticketsData as SupportTicket[]);
            loadedCount++;
          }
        }
      } catch (e) {
        console.warn("Supabase logs_errores/tickets query notice:", e);
      }

      // 5. Fetch Financial Metrics
      try {
        const { data: finData, error: fErr } = await supabase.from("financial_metrics").select("*");
        if (!fErr && finData && finData.length > 0) {
          setFinancials(finData.map(f => ({
            month: f.month,
            ventas: Number(f.ventas),
            cogs: Number(f.cogs),
            logistica: Number(f.logistica),
            operaciones: Number(f.operaciones),
            netProfit: Number(f.netProfit)
          })) as FinancialMetric[]);
          loadedCount++;
        }
      } catch (e) {
        console.warn("Supabase financial_metrics table query notice:", e);
      }

      // 6. Fetch Calendar Events
      try {
        const { data: eventsData, error: eErr } = await supabase.from("calendar_events").select("*");
        if (!eErr && eventsData && eventsData.length > 0) {
          setEvents(eventsData as CalendarEvent[]);
          loadedCount++;
        }
      } catch (e) {
        console.warn("Supabase calendar_events table query notice:", e);
      }

      setLastSyncTime(new Date().toLocaleTimeString() + " (Supabase CONECTADO)");
    } catch (err: any) {
      console.error("Supabase load error:", err);
      setSupabaseError(err.message || "Error al conectar con las tablas de Supabase.");
    } finally {
      setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseData();
    } else {
      setLastSyncTime(new Date().toLocaleTimeString() + " (Temporal SPS-TGU)");
    }
  }, []);

  const handleSyncData = () => {
    if (isSupabaseConfigured) {
      fetchSupabaseData();
    } else {
      setLastSyncTime(new Date().toLocaleTimeString() + " (Temporal SPS-TGU)");
    }
  };

  // State modifiers with Supabase writebacks
  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("orders").update({ status }).eq("id", orderId);
      } catch (err) {
        console.error("Supabase order update error:", err);
      }
    }

    // If transitioning to "dispatched", update related timeline stop to pending
    if (status === "dispatched") {
      setTimelines(prev => prev.map(tl => {
        const hasStop = tl.stops.some(s => s.ticketId === orderId);
        if (hasStop) {
          return {
            ...tl,
            stops: tl.stops.map(s => s.ticketId === orderId ? { ...s, status: "pending" as const } : s)
          };
        }
        return tl;
      }));
    }
    // If transitioning to "delivered", update related timeline stop to delivered
    if (status === "delivered") {
      setTimelines(prev => prev.map(tl => {
        const hasStop = tl.stops.some(s => s.ticketId === orderId);
        if (hasStop) {
          return {
            ...tl,
            stops: tl.stops.map(s => s.ticketId === orderId ? { ...s, status: "delivered" as const } : s)
          };
        }
        return tl;
      }));
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket["status"]) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("tickets").update({ status }).eq("id", ticketId);
      } catch (err) {
        console.error("Supabase ticket update error:", err);
      }
    }
  };

  const handleAddCalendarEvent = async (newEvent: Omit<CalendarEvent, "id">) => {
    const eventId = "EVT_" + Math.random().toString(36).substring(2, 9);
    const added = { id: eventId, ...newEvent };
    setEvents(prev => [...prev, added]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("calendar_events").insert([added]);
      } catch (err) {
        console.error("Supabase calendar insert error:", err);
      }
    }
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("calendar_events").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase calendar delete error:", err);
      }
    }
  };

  const handleInitiateEmailDraft = (to: string, subject: string, body: string) => {
    setEmailRecipient(to);
    setEmailSubject(subject);
    setEmailBody(body);
  };

  const handleClearEmailDraftState = () => {
    setEmailRecipient("");
    setEmailSubject("");
    setEmailBody("");
  };

  return (
    <div id="root-app-container" className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Main Navigation Header */}
      <header id="app-header" className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
            SE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">SuperEconomico</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold tracking-widest">
                Web Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Control Logístico y Despacho de Pedidos • Honduras</p>
          </div>
        </div>

        {/* Action center header */}
        <div className="flex items-center gap-3 text-xs">
          {/* Connection status button (Supabase Cloud Direct Connection) */}
          <button
            id="supabase-status-badge"
            onClick={() => setShowSupabaseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-[11px] cursor-pointer shadow-sm transition-all duration-200 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
          >
            <Database size={13} className="text-emerald-600" />
            <span>Supabase Cloud: mvrlcbcydpubhovvrmvf</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[10px]">
            <Clock size={12} className="text-slate-400" />
            <span>Sincronización:</span>
            <span className="text-emerald-600 font-bold">{lastSyncTime || "Conectando..."}</span>
          </div>

          <button 
            id="sync-data-btn"
            onClick={handleSyncData}
            disabled={supabaseLoading}
            className={`p-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer transition-all duration-200 ${supabaseLoading ? "opacity-50" : ""}`}
            title="Refrescar Sincronización Supabase"
          >
            <RefreshCw size={14} className={supabaseLoading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout with Sidebar Menu */}
      <div id="main-workspace-container" className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar - Clean modern light design */}
        <aside id="app-sidebar" className="w-full md:w-64 bg-white border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block pl-2 font-bold">Módulos Administrativos</span>
            </div>

            {/* Sidebar Buttons */}
            <nav className="space-y-1.5">
              <button
                id="tab-overview-btn"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "overview" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard size={15} className={activeTab === "overview" ? "text-emerald-600" : "text-slate-400"} />
                Resumen Ejecutivo
              </button>

              <button
                id="tab-map-btn"
                onClick={() => setActiveTab("map")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "map" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Map size={15} className={activeTab === "map" ? "text-emerald-600" : "text-slate-400"} />
                Histórico de Rutas
              </button>

              <button
                id="tab-financial-btn"
                onClick={() => setActiveTab("financial")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "financial" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet size={15} className={activeTab === "financial" ? "text-emerald-600" : "text-slate-400"} />
                Auditoría Financiera
              </button>

              <button
                id="tab-calendar-btn"
                onClick={() => setActiveTab("calendar")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "calendar" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <CalendarIcon size={15} className={activeTab === "calendar" ? "text-emerald-600" : "text-slate-400"} />
                Schedules / Calendarios
              </button>

              <button
                id="tab-tickets-btn"
                onClick={() => setActiveTab("tickets")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "tickets" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <AlertOctagon size={15} className={activeTab === "tickets" ? "text-emerald-600" : "text-slate-400"} />
                Reclamos & Soporte
              </button>

              <button
                id="tab-emails-btn"
                onClick={() => setActiveTab("emails")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg ${
                  activeTab === "emails" 
                    ? "bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-bold shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Mail size={15} className={activeTab === "emails" ? "text-emerald-600" : "text-slate-400"} />
                Enviar Correos SMTP
              </button>
            </nav>
          </div>

          {/* Sidebar Footer indicating platform capabilities */}
          <div className="hidden md:block p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 mt-6 text-[11px]">
            <span className="text-slate-800 font-bold uppercase tracking-wider font-mono block">Logística Honduras</span>
            <p className="text-slate-500 leading-relaxed">
              SuperEconomico es la plataforma líder para entregas inmediatas de supermercado en Honduras, coordinando el abastecimiento y la distribución de última milla.
            </p>
          </div>
        </aside>


        {/* Central Component View Container */}
        <main id="main-content-canvas" className="flex-1 p-6 overflow-y-auto max-w-full bg-slate-50">
          {activeTab === "overview" && (
            <Overview 
              drivers={drivers}
              orders={orders}
              inventory={inventory}
              financials={financials}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === "map" && (
            <LogisticsMap 
              drivers={drivers}
              timelines={timelines}
              onSelectDriverForEmail={handleUpdateWarningDriver}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "financial" && (
            <FinancialReports 
              financials={financials}
            />
          )}

          {activeTab === "calendar" && (
            <DriverCalendar 
              events={events}
              drivers={drivers}
              onAddEvent={handleAddCalendarEvent}
              onDeleteEvent={handleDeleteCalendarEvent}
            />
          )}

          {activeTab === "tickets" && (
            <TicketHub 
              tickets={tickets}
              drivers={drivers}
              orders={orders}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onInitiateEmailDraft={handleInitiateEmailDraft}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "emails" && (
            <EmailConsole 
              initialRecipient={emailRecipient}
              initialSubject={emailSubject}
              initialBody={emailBody}
              onClearInitialState={handleClearEmailDraftState}
            />
          )}
        </main>

      </div>

      {/* Global Footer */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
        <span>© 2026 SuperEconomico Inc. Honduras. Todos los derechos reservados.</span>
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Monitoreo y Despacho de Pedidos en Vivo (Dark Store)
        </span>
      </footer>

      {/* Supabase Connection Status and Schema Modal */}
      {showSupabaseModal && (
        <div id="supabase-modal-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="supabase-modal-container" className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Database className="text-emerald-400" size={18} />
                <h3 className="text-sm font-bold text-white">Conexión Supabase (mvrlcbcydpubhovvrmvf)</h3>
              </div>
              <button 
                id="close-supabase-modal"
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
              
              {/* Connection Status Panel */}
              <div className="p-4 rounded-xl border bg-emerald-50/80 border-emerald-200 text-emerald-900 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Conectado a Supabase Cloud</span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    CONECTADO 100%
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Esta aplicación web administrativa está conectada en tiempo real al mismo proyecto de Supabase que la aplicación móvil Android (<code className="font-mono bg-emerald-100 px-1 rounded">com.uth.supereconomico.data.remote.SupabaseConfig</code>).
                </p>
              </div>

              {/* Active Supabase Credentials Display */}
              <div className="space-y-3 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[10px] uppercase tracking-wider font-sans font-bold">
                  <span>Configuración en Ejecución</span>
                  <span className="text-emerald-400 font-bold">SupabaseConfig.java</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SUPABASE_URL:</span>
                  <span className="text-emerald-400 font-bold break-all">https://mvrlcbcydpubhovvrmvf.supabase.co</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ANON_KEY:</span>
                  <span className="text-slate-300 break-all text-[10px]">
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmxjYmN5ZHB1YmhvdnZybXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA3OTAsImV4cCI6MjA5ODMxNjc5MH0.rNQq1xOA5zGJpMiHlhsXKw5lWLg49qYUtDSC9M7Iha8
                  </span>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Server size={14} className="text-emerald-600" />
                    Registros en Supabase Cloud
                  </h4>
                  <button
                    onClick={handleSyncData}
                    disabled={supabaseLoading}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                  >
                    <RefreshCw size={12} className={supabaseLoading ? "animate-spin" : ""} />
                    Refrescar Tablas
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Choferes (drivers)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{drivers.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Pedidos (orders)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{orders.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Productos (inventory)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{inventory.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Calendario (events)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{events.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Soporte (tickets)</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{tickets.length}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Finanzas</span>
                    <span className="text-lg font-bold text-slate-800 font-mono">{financials.length}</span>
                  </div>
                </div>
              </div>

              {/* SQL Schema helper for Supabase SQL Editor */}
              <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Copy size={14} className="text-slate-600" />
                    Script SQL para Crear Tablas en Supabase
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2500);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedSql ? "¡Copiado!" : "Copiar SQL"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Si tu proyecto de Supabase en <code className="font-mono bg-slate-200 px-1 rounded">mvrlcbcydpubhovvrmvf.supabase.co</code> aún no tiene creadas las tablas (<code className="font-mono">drivers</code>, <code className="font-mono">orders</code>, <code className="font-mono">inventory</code>, <code className="font-mono">tickets</code>), puedes copiar este código SQL e pegarlo en el <strong>SQL Editor</strong> del Dashboard de Supabase.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                id="close-supabase-modal-footer"
                onClick={() => setShowSupabaseModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
              >
                Cerrar Consola
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Helper trigger warning template selection for driver route tab
  function handleUpdateWarningDriver(driverName: string) {
    handleInitiateEmailDraft(
      `${driverName.toLowerCase().replace(" ", "_")}@supereconomico.com`,
      `Aviso Logístico - ${driverName}`,
      `Hola ${driverName},\n\nQueremos advertirte que registramos retrasos inusuales en tu ruta del día de hoy desde el monitor web del Dark Store.\n\nPor favor, ten precaución en el tráfico y reporta el arribo de cada parada en tu App.`
    );
  }
}
