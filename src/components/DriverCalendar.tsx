import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Truck, 
  User, 
  Wrench, 
  Trash2, 
  Info,
  CalendarCheck
} from "lucide-react";
import { CalendarEvent, Driver } from "../types";

interface DriverCalendarProps {
  events: CalendarEvent[];
  drivers: Driver[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onDeleteEvent: (id: string) => void;
}

export default function DriverCalendar({
  events,
  drivers,
  onAddEvent,
  onDeleteEvent,
}: DriverCalendarProps) {
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<CalendarEvent["type"]>("shift");
  const [newEventDate, setNewEventDate] = useState("2026-07-12");
  const [newEventStart, setNewEventStart] = useState("08:00");
  const [newEventEnd, setNewEventEnd] = useState("14:00");
  const [newEventTarget, setNewEventTarget] = useState(drivers[0]?.name || "Carlos Ruiz");
  const [newEventNotes, setNewEventNotes] = useState("");

  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    onAddEvent({
      title: newEventTitle,
      type: newEventType,
      date: newEventDate,
      startTime: newEventStart,
      endTime: newEventEnd,
      targetName: newEventTarget,
      notes: newEventNotes,
    });

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);

    // Reset inputs
    setNewEventTitle("");
    setNewEventNotes("");
  };

  // Group events by date for list
  const sortedEvents = [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div id="driver-calendar-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Event creation form */}
      <div id="event-scheduler-panel" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 lg:col-span-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Programar Operación</h3>
          <p className="text-slate-500 text-xs">Establecer turnos, arribos mayoristas o mantenimiento de flota</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">Título de la Operación</label>
            <input
              id="event-title-input"
              type="text"
              required
              placeholder="Ej. Turno Reparto Carlos Ruiz PM"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-400"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">Tipo de Operación</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="type-shift-btn"
                type="button"
                onClick={() => setNewEventType("shift")}
                className={`py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  newEventType === "shift" 
                    ? "bg-blue-50 border-blue-200 text-blue-700" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                Turno Chofer
              </button>
              <button
                id="type-supply-btn"
                type="button"
                onClick={() => {
                  setNewEventType("supply");
                  setNewEventTarget("Distribuidora Arcor");
                }}
                className={`py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  newEventType === "supply" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                Abastecimiento
              </button>
              <button
                id="type-maintenance-btn"
                type="button"
                onClick={() => setNewEventType("maintenance")}
                className={`py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  newEventType === "maintenance" 
                    ? "bg-amber-50 border-amber-200 text-amber-700" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                Mantenimiento
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">Fecha</label>
            <input
              id="event-date-input"
              type="date"
              required
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Start and End hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Hora Inicio</label>
              <input
                id="event-start-input"
                type="time"
                required
                value={newEventStart}
                onChange={(e) => setNewEventStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Hora Fin</label>
              <input
                id="event-end-input"
                type="time"
                required
                value={newEventEnd}
                onChange={(e) => setNewEventEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Target Entity Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">
              {newEventType === "supply" ? "Proveedor / Distribuidora" : "Responsable / Chofer"}
            </label>
            {newEventType === "supply" ? (
              <input
                id="event-vendor-input"
                type="text"
                value={newEventTarget}
                onChange={(e) => setNewEventTarget(e.target.value)}
                placeholder="Ej. Distribuidora Arcor"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <select
                id="event-driver-select"
                value={newEventTarget}
                onChange={(e) => setNewEventTarget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.name}>{d.avatar} {d.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">Notas de Operación</label>
            <textarea
              id="event-notes-textarea"
              rows={2}
              value={newEventNotes}
              onChange={(e) => setNewEventNotes(e.target.value)}
              placeholder="Ej. Cargar tanque antes de partir. Priorizar zona Norte."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-400 resize-none"
            />
          </div>

          <button
            id="event-schedule-submit-btn"
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            Programar Evento
          </button>

          {/* Success indicators */}
          {formSuccess && (
            <div id="event-success-alert" className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] text-center font-bold font-mono animate-fade-in">
              ✓ Operación registrada con éxito en el calendario logístico.
            </div>
          )}

        </form>
      </div>

      {/* Main Panel: Calendar Agenda Log List */}
      <div id="calendar-list-panel" className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[620px] overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cronograma de Operaciones</h3>
            <p className="text-slate-500 text-xs">Próximos turnos y misiones del Dark Store</p>
          </div>
          <CalendarCheck className="text-slate-400 animate-pulse" size={20} />
        </div>

        {/* Scrollable event lists */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-2">
              <Info size={28} className="mx-auto text-slate-300 animate-bounce" />
              <p className="text-xs">No hay eventos ni turnos programados en el calendario.</p>
            </div>
          ) : (
            sortedEvents.map((evt) => (
              <div 
                key={evt.id} 
                id={`calendar-event-row-${evt.id}`}
                className="flex items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon type indicator */}
                  <div className={`p-2 rounded-lg shrink-0 ${
                    evt.type === "shift" 
                      ? "bg-blue-50 text-blue-600 border border-blue-100" 
                      : evt.type === "supply" 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    {evt.type === "shift" && <User size={16} />}
                    {evt.type === "supply" && <Truck size={16} />}
                    {evt.type === "maintenance" && <Wrench size={16} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-800 font-bold">{evt.title}</span>
                      <span className="text-[9px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 capitalize">
                        {evt.type === "shift" ? "Turno" : evt.type === "supply" ? "Arribo" : "Mantenimiento"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={12} className="text-slate-400" />
                        {evt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {evt.startTime} - {evt.endTime}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {evt.type === "supply" ? `Proveedor: ${evt.targetName}` : `Chofer: ${evt.targetName}`}
                      </span>
                    </div>

                    {evt.notes && (
                      <p className="text-[11px] text-slate-500 leading-normal italic bg-white p-2 border border-slate-200/60 rounded-lg max-w-md">
                        "{evt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  id={`delete-event-btn-${evt.id}`}
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0 self-start"
                  title="Eliminar evento"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
