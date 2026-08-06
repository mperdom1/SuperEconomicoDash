import React, { useState, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  UserCheck, 
  Trash2, 
  Loader, 
  Mail, 
  Info,
  CheckCircle2,
  ListRestart
} from "lucide-react";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "sent" | "failed";
}

interface EmailConsoleProps {
  initialRecipient: string;
  initialSubject: string;
  initialBody: string;
  onClearInitialState: () => void;
}

export default function EmailConsole({
  initialRecipient,
  initialSubject,
  initialBody,
  onClearInitialState,
}: EmailConsoleProps) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // SMTP Simulation logs
  const [terminalLog, setTerminalLog] = useState<string>("");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Watch for initial states passed down from map warnings or ticket helpers
  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
    if (initialSubject) {
      setSubject(initialSubject);
    }
    if (initialBody) {
      setBody(initialBody);
    }
  }, [initialRecipient, initialSubject, initialBody]);

  // Load sent emails history on mount
  const fetchSentLogs = async () => {
    try {
      const response = await fetch("/api/emails/logs");
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load sent logs:", err);
    }
  };

  useEffect(() => {
    fetchSentLogs();
  }, []);

  // Built-in operational templates
  const applyTemplate = (type: "refund" | "warning" | "supplier") => {
    onClearInitialState();
    if (type === "refund") {
      setRecipient("cliente_afectado@example.com");
      setSubject("Reembolso Aprobado - SuperEconomico Pedido #");
      setBody(`Estimado/a cliente,

Queremos informarle que hemos auditado el incidente reportado en su canasta de compras. En SuperEconomico nos tomamos muy en serio la calidad de los productos y la logística de entrega.

Hemos aprobado un reembolso completo de su dinero a su método de pago original. Se verá reflejado en las próximas 24-48 horas hábiles. 

Le pedimos sinceras disculpas por las molestias ocasionadas y le obsequiamos un cupón de envío gratis para su próximo pedido: REEMBOLSOSUPER2026.

Atentamente,
Departamento de Atención al Cliente
SuperEconomico`);
    } else if (type === "warning") {
      setRecipient("repartidor_ruta@supereconomico.com");
      setSubject("ADVERTENCIA LOGÍSTICA: Retrasos excesivos o mal manejo");
      setBody(`Estimado Colaborador,

A través del monitor de control web del Dark Store, hemos identificado demoras inusuales en su ruta de entrega asignada del día de hoy, o se ha registrado una queja formal del cliente sobre el estado de la entrega.

Le recordamos que, al ser un supermercado digital sin sucursal física, la última milla es el pilar de nuestra reputación. Por favor, asegúrese de:
1. Respetar la cadena de frío de los congelados y frescos.
2. Tratar las bolsas de abarrotes con cuidado.
3. Comunicarse con el Dark Store central si hay congestión de tráfico.

Quedamos a la espera de su descargo a través de la App de Choferes.

Atentamente,
Gerencia de Operaciones Logísticas
SuperEconomico`);
    } else if (type === "supplier") {
      setRecipient("mayorista_distribucion@arcor.com");
      setSubject("Solicitud de Abastecimiento de Stock Crítico - Dark Store");
      setBody(`Estimados,

Basado en las alertas automatizadas de nuestro panel administrativo de inventario, solicitamos la entrega urgente de reposición para el próximo bloque de abastecimiento.

Artículos solicitados:
- Palta Hass Selección: 100 unidades.
- Hamburguesas Swift de Carne: 150 paquetes.
- Pechuga de Pollo Fresca: 80 kg.

Favor de confirmar disponibilidad y horarios de arribo de camiones según la agenda establecida del Dark Store.

Atentamente,
Control de Almacén y Stock
SuperEconomico`);
    }
  };

  // Gemini AI Draft creator
  const handleGenerateAIDraft = async () => {
    if (!recipient) {
      alert("Por favor ingrese primero el correo del destinatario.");
      return;
    }
    
    setIsDrafting(true);
    try {
      const response = await fetch("/api/gemini/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: recipient.includes("supereconomico") ? "driver" : "customer",
          purpose: subject || "Comunicado Operativo",
          extraDetails: body || "Notas breves de que deseamos disculparnos o advertir"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get draft from server-side Gemini AI");
      }

      const data = await response.json();
      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);
    } catch (err: any) {
      console.error(err);
      alert(`No se pudo generar el borrador con IA: ${err.message || "Servicio no disponible"}`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Send Simulated SMTP email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) return;

    setIsSending(true);
    setTerminalLog("[SMTP Client] Iniciando conexión...");

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject,
          body
        })
      });

      if (!response.ok) {
        throw new Error("Failed to dispatch simulated email");
      }

      const data = await response.json();
      
      // Print SMTP handshake simulation log slowly
      setTerminalLog(data.smtpLog || "[SMTP Client] Conexión establecida.");
      
      // Reload sent logs
      fetchSentLogs();

      // Clear fields on success
      setRecipient("");
      setSubject("");
      setBody("");
      onClearInitialState();
    } catch (err: any) {
      console.error(err);
      setTerminalLog(`[SMTP Client ERROR] Falló la entrega: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="email-console-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Templates Sidebar */}
      <div id="templates-bar-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1 max-h-[720px] overflow-y-auto">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Plantillas Logísticas</h3>
          <p className="text-slate-500 text-xs">Modelos preestablecidos para despachos y control de choferes</p>
        </div>

        <div className="space-y-3">
          <button
            id="template-refund-btn"
            onClick={() => applyTemplate("refund")}
            className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-xl space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              <Mail size={12} />
              Reembolso Cliente
            </div>
            <span className="text-xs text-slate-800 block group-hover:text-emerald-700 font-semibold transition-colors">Disculpa por producto dañado</span>
            <p className="text-[10px] text-slate-400 leading-relaxed truncate">"Hemos aprobado un reembolso completo de su dinero..."</p>
          </button>

          <button
            id="template-warning-btn"
            onClick={() => applyTemplate("warning")}
            className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-xl space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold uppercase tracking-wider">
              <UserCheck size={12} />
              Advertir Chofer
            </div>
            <span className="text-xs text-slate-800 block group-hover:text-amber-700 font-semibold transition-colors">Demoras excesivas en ruta</span>
            <p className="text-[10px] text-slate-400 leading-relaxed truncate">"Hemos identificado demoras inusuales en su ruta asignada..."</p>
          </button>

          <button
            id="template-supplier-btn"
            onClick={() => applyTemplate("supplier")}
            className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-xl space-y-1 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold uppercase tracking-wider">
              <BookOpen size={12} />
              Stock Crítico
            </div>
            <span className="text-xs text-slate-800 block group-hover:text-blue-700 font-semibold transition-colors">Abastecimiento Mayorista</span>
            <p className="text-[10px] text-slate-400 leading-relaxed truncate">"Solicitamos la entrega urgente de reposición para el próximo..."</p>
          </button>
        </div>

        {/* History / Audit Log list of recently sent emails */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Bitácora de Envíos</h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {emailLogs.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No se han realizado envíos SMTP en esta sesión.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 font-semibold truncate max-w-[120px]">{log.to}</span>
                    <span className="text-slate-400 text-[8px]">{new Date(log.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-slate-800 font-medium block truncate">{log.subject}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Composition console with Gemini Assistance & SMTP Terminal */}
      <div id="composition-and-smtp-panel" className="lg:col-span-2 space-y-6">
        
        {/* Email composer form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Consola de Envío Directo</h3>
              <p className="text-slate-500 text-xs">Comuníquese directamente mediante un servidor SMTP simulado</p>
            </div>
            <button
              id="ai-draft-email-btn"
              type="button"
              disabled={isDrafting}
              onClick={handleGenerateAIDraft}
              className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:border-slate-300 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
            >
              {isDrafting ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isDrafting ? "Escribiendo..." : "Borrador con Gemini AI"}
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4">
            {/* Destinatario */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Destinatario (Email)</label>
              <input
                id="email-to-input"
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 font-mono placeholder-slate-400"
              />
            </div>

            {/* Asunto */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Asunto</label>
              <input
                id="email-subject-input"
                type="text"
                required
                placeholder="Asunto del correo"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 font-sans placeholder-slate-400"
              />
            </div>

            {/* Mensaje */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Mensaje / Cuerpo del Correo</label>
              <textarea
                id="email-body-textarea"
                required
                rows={8}
                placeholder="Escriba su mensaje aquí..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 font-sans placeholder-slate-400 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                id="clear-email-fields-btn"
                type="button"
                onClick={() => {
                  setRecipient("");
                  setSubject("");
                  setBody("");
                  onClearInitialState();
                }}
                className="px-4 py-2 border border-slate-200 bg-slate-55 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Limpiar
              </button>
              <button
                id="send-email-submit-btn"
                type="submit"
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                {isSending ? "Entregando..." : "Despachar Correo (Simulado)"}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time SMTP Terminal Simulator */}
        {terminalLog && (
          <div id="smtp-terminal-log" className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 text-slate-500 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal size={14} className="text-emerald-500 animate-pulse" />
                SMTP CONSOLE TERMINAL
              </span>
              <button 
                id="clear-smtp-log-btn"
                onClick={() => setTerminalLog("")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Ocultar
              </button>
            </div>

            <pre className="font-mono text-[10px] text-emerald-400 bg-black/40 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-900 shadow-inner max-h-[160px]">
              {terminalLog}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
