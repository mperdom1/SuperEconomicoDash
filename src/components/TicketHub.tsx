import React, { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  Mail, 
  DollarSign, 
  Sparkles,
  Loader,
  ChevronRight,
  Info
} from "lucide-react";
import { SupportTicket, Driver, Order } from "../types";

interface TicketHubProps {
  tickets: SupportTicket[];
  drivers: Driver[];
  orders: Order[];
  onUpdateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  onInitiateEmailDraft: (recipient: string, purpose: string, details: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function TicketHub({
  tickets,
  drivers,
  orders,
  onUpdateTicketStatus,
  onInitiateEmailDraft,
  onNavigateToTab,
}: TicketHubProps) {
  const [activeTicketId, setActiveTicketId] = useState<string>(tickets[0]?.id || "");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [isConsultingAi, setIsConsultingAi] = useState<boolean>(false);

  const selectedTicket = tickets.find(t => t.id === activeTicketId);
  const selectedOrder = selectedTicket ? orders.find(o => o.id === selectedTicket.orderId) : null;
  const assignedDriver = selectedTicket ? drivers.find(d => d.id === selectedTicket.assignedDriverId) : null;

  // Filtered tickets list
  const filteredTickets = tickets.filter(t => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  const handleConsultAIResolution = async () => {
    if (!selectedTicket) return;
    setIsConsultingAi(true);
    setAiSuggestions("");

    try {
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tickets",
          data: {
            ticket: selectedTicket,
            order: selectedOrder,
            driver: assignedDriver
          }
        })
      });

      if (!response.ok) {
        throw new Error("Gemini API request failed");
      }

      const data = await response.json();
      setAiSuggestions(data.summary || "No advice provided.");
    } catch (err: any) {
      console.error(err);
      setAiSuggestions(`Error del servidor AI: ${err.message || "No se pudo obtener el veredicto en este momento."}`);
    } finally {
      setIsConsultingAi(false);
    }
  };

  const handleComposeEmailToClient = () => {
    if (!selectedTicket) return;
    onInitiateEmailDraft(
      selectedTicket.clientEmail,
      `Resolución de Reclamo ${selectedTicket.id} - SuperEconomico`,
      `Hola ${selectedTicket.clientName},\n\nCon respecto a su reporte sobre el pedido ${selectedTicket.orderId} (${selectedTicket.category}):\n\n[ESCRIBA DETALLES DEL REEMBOLSO O SOLUCIÓN AQUÍ]\n\nPedimos disculpas por el inconveniente.`
    );
    onNavigateToTab("emails");
  };

  return (
    <div id="ticket-hub-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sidebar: Tickets Feed list */}
      <div id="tickets-feed-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1 max-h-[720px] overflow-y-auto">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Reclamos y Tickets (Chofer App)</h3>
          <p className="text-slate-500 text-xs">Alertas de entregas reportadas por el cliente o repartidor</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {(["all", "open", "in_progress", "resolved"] as const).map((status) => (
            <button
              key={status}
              id={`filter-tck-${status}-btn`}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                filterStatus === status 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              {status === "all" ? "Todos" : status === "open" ? "Abiertos" : status === "in_progress" ? "Proceso" : "Listos"}
            </button>
          ))}
        </div>

        {/* Tickets Scroll list */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No hay reclamos registrados con este filtro.
            </div>
          ) : (
            filteredTickets.map((tck) => (
              <div
                key={tck.id}
                id={`ticket-feed-card-${tck.id}`}
                onClick={() => {
                  setActiveTicketId(tck.id);
                  setAiSuggestions(""); // reset AI help
                }}
                className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                  activeTicketId === tck.id 
                    ? "bg-blue-50/40 border-blue-400" 
                    : "bg-white border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{tck.id}</span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                    tck.status === "open" 
                      ? "bg-rose-50 text-rose-700" 
                      : tck.status === "in_progress" 
                      ? "bg-blue-50 text-blue-700" 
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {tck.status === "open" ? "Abierto" : tck.status === "in_progress" ? "En Proceso" : "Resuelto"}
                  </span>
                </div>
                
                <span className="text-xs font-bold text-slate-800 block truncate">{tck.clientName}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{tck.category} • Pedido {tck.orderId}</span>
                <p className="text-[10px] text-slate-400 truncate mt-2 leading-relaxed italic">"{tck.description}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Selected Ticket Inspector and Gemini Copilot */}
      <div id="ticket-detail-panel" className="lg:col-span-2 space-y-6">
        {selectedTicket ? (
          <div id={`ticket-inspector-${selectedTicket.id}`} className="space-y-6">
            
            {/* Incident Header Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <span>ID: {selectedTicket.id}</span>
                    <span>•</span>
                    <span>Pedido: {selectedTicket.orderId}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedTicket.category}</h3>
                  <p className="text-slate-500 text-xs">Reportado por: <span className="text-slate-800 font-semibold">{selectedTicket.clientName}</span> ({selectedTicket.clientEmail})</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start">
                  <button
                    id="btn-tck-open"
                    onClick={() => onUpdateTicketStatus(selectedTicket.id, "open")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                      selectedTicket.status === "open" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Abierto
                  </button>
                  <button
                    id="btn-tck-process"
                    onClick={() => onUpdateTicketStatus(selectedTicket.id, "in_progress")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                      selectedTicket.status === "in_progress" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Proceso
                  </button>
                  <button
                    id="btn-tck-resolve"
                    onClick={() => onUpdateTicketStatus(selectedTicket.id, "resolved")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${
                      selectedTicket.status === "resolved" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Resuelto
                  </button>
                </div>
              </div>

              {/* Description message box */}
              <div className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Mensaje de reclamo enviado en App</span>
                <p className="text-slate-700 text-xs italic leading-relaxed">
                  "{selectedTicket.description}"
                </p>
              </div>

              {/* Order & Driver Reference summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Associated order */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                  <span className="text-slate-500 text-[10px] font-mono uppercase">Pedido Relacionado</span>
                  {selectedOrder ? (
                    <div>
                      <div className="font-semibold text-slate-800">{selectedOrder.id}</div>
                      <p className="text-[10px] text-slate-400">Total cobrado: <span className="text-emerald-700 font-semibold font-mono">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(selectedOrder.total)}</span></p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No se encontraron detalles del pedido.</p>
                  )}
                </div>

                {/* Assigned Logistics Courier */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                  <span className="text-slate-500 text-[10px] font-mono uppercase">Repartidor en Ruta</span>
                  {assignedDriver ? (
                    <div>
                      <div className="font-semibold text-slate-800">{assignedDriver.avatar} {assignedDriver.name}</div>
                      <p className="text-[10px] text-slate-400">Misión de reparto asignada</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No hay repartidor asignado a este reclamo.</p>
                  )}
                </div>
              </div>

              {/* Fast Operational Action buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  id="action-email-composed-btn"
                  onClick={handleComposeEmailToClient}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-250 text-slate-800 font-semibold py-2 rounded-lg text-xs cursor-pointer border border-slate-200 transition-colors"
                >
                  <Mail size={13} className="text-slate-500" />
                  Escribir al Cliente
                </button>
                <button
                  id="action-refund-instant-btn"
                  onClick={() => {
                    alert(`Simulación de reembolso procesada para el pedido ${selectedTicket.orderId}. El cliente recibirá una notificación en la app.`);
                    onUpdateTicketStatus(selectedTicket.id, "resolved");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  <DollarSign size={13} />
                  Reembolsar Dinero
                </button>
              </div>

            </div>

            {/* AI Diagnosis and Action Recommendation */}
            <div id="incident-ai-resolution" className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Asistente AI de Resolución de Conflictos</h3>
                    <p className="text-[10px] text-slate-500">Genera estrategias, mitigaciones y cartas de disculpa con Gemini</p>
                  </div>
                </div>

                <button
                  id="ai-ticket-solution-btn"
                  disabled={isConsultingAi}
                  onClick={handleConsultAIResolution}
                  className="flex items-center gap-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isConsultingAi ? <Loader size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  {isConsultingAi ? "Evaluando..." : "Diagnosticar con Gemini"}
                </button>
              </div>

              {isConsultingAi && (
                <div className="p-6 text-center bg-white border border-slate-100 rounded-lg space-y-2">
                  <Loader className="animate-spin text-emerald-600 mx-auto" size={20} />
                  <p className="text-xs text-slate-500">Gemini está analizando el impacto operacional del incidente...</p>
                </div>
              )}

              {aiSuggestions && !isConsultingAi && (
                <div id="ai-suggestion-box" className="p-4 bg-white border border-emerald-100 rounded-lg space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-mono text-slate-400">
                    <span>Recomendación del Mediador AI</span>
                    <span>gemini-3.5-flash</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                    {aiSuggestions}
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      id="use-ai-draft-email-btn"
                      onClick={() => {
                        onInitiateEmailDraft(
                          selectedTicket.clientEmail,
                          `Disculpa por inconveniente - SuperEconomico Reclamo ${selectedTicket.id}`,
                          `Estimado/a ${selectedTicket.clientName},\n\nCon respecto a su reporte sobre el pedido ${selectedTicket.orderId} en el cual menciona: "${selectedTicket.description}".\n\nHe evaluado su caso personalmente y deseo comentarle que hemos procesado una resolución.\n\n[ESCRIBA SU RECONCILIACIÓN AQUÍ, ej. Le devolvemos el saldo de su cuenta]\n\nAgradecemos su feedback para seguir mejorando nuestro supermercado digital.\n\nAtentamente,\nOperaciones SuperEconomico`
                        );
                        onNavigateToTab("emails");
                      }}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors shadow-sm"
                    >
                      Copiar Plantilla y Redactar Correo
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              {!aiSuggestions && !isConsultingAi && (
                <div className="text-center text-[10px] text-slate-400 py-3 border border-dashed border-slate-200 bg-white rounded-lg">
                  Haga clic en "Diagnosticar con Gemini" para obtener un borrador contable de disculpa y un plan de mitigación para el chofer.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl p-6 text-slate-400 space-y-2">
            <Info size={28} className="mx-auto text-slate-300" />
            <p className="text-xs">Selecciona un ticket de soporte de la lista lateral para auditar el problema de entrega.</p>
          </div>
        )}
      </div>

    </div>
  );
}
