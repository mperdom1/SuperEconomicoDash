import React, { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Compass, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp, 
  Layers, 
  Phone, 
  Navigation,
  Info,
  Radio,
  Wifi,
  Battery,
  Map as MapIcon,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  Server,
  FileSpreadsheet,
  Database
} from "lucide-react";
import { Driver, DriverTimeline, RouteStop, MapCoordinates } from "../types";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY !== "";


interface LogisticsMapProps {
  drivers: Driver[];
  timelines: DriverTimeline[];
  onSelectDriverForEmail: (driverName: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function LogisticsMap({
  drivers,
  timelines,
  onSelectDriverForEmail,
  onNavigateToTab
}: LogisticsMapProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || "");
  const [selectedTimeline, setSelectedTimeline] = useState<DriverTimeline | null>(null);
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);

  // Real Geolocation Tracking
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-fetch real geolocation
  useEffect(() => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolocation failed, defaulting to Tegucigalpa:", error);
          // Default Tegucigalpa coordinate fallback
          setUserCoords({ lat: 14.0818, lng: -87.2068 });
          setLocationError("Permiso de ubicación denegado. Mostrando Tegucigalpa por defecto.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserCoords({ lat: 14.0818, lng: -87.2068 });
      setLocationError("Tu navegador no soporta geolocalización.");
      setIsLocating(false);
    }
  }, []);

  // Helper to dynamically translate relative percentage-based coords to real-world coordinates around your live position
  const getStopRealCoords = (stop: RouteStop, center: {lat: number, lng: number}) => {
    // scale coords relative to center 50,50
    const latOffset = (stop.coords.y - 50) * 0.00035;
    const lngOffset = (stop.coords.x - 50) * 0.00035;
    return {
      lat: center.lat - latOffset,
      lng: center.lng + lngOffset
    };
  };

  // Fetch timeline corresponding to driver
  useEffect(() => {
    const tl = timelines.find(t => t.driverId === selectedDriverId);
    if (tl) {
      setSelectedTimeline(tl);
      // Set first pending stop or default first stop
      const pending = tl.stops.find(s => s.status === "pending");
      setActiveStop(pending || tl.stops[0] || null);
    } else {
      setSelectedTimeline(null);
      setActiveStop(null);
    }
  }, [selectedDriverId, timelines]);

  const driverDetails = drivers.find(d => d.id === selectedDriverId);

  const formatLps = (val: number) => {
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", maximumFractionDigits: 0 }).format(val);
  };

  // Static list of stylized landmarks/neighborhoods of Tegucigalpa for the vector map representation
  const hnLandmarks = [
    { name: "Colonia Palmira", x: 25, y: 35, type: "residential" },
    { name: "Mall Multiplaza", x: 72, y: 65, type: "commercial" },
    { name: "Bulevar Morazán", x: 40, y: 25, type: "boulevard" },
    { name: "Plaza Miraflores", x: 60, y: 48, type: "commercial" },
    { name: "Bulevar Suyapa", x: 55, y: 58, type: "boulevard" },
    { name: "Anillo Periférico", x: 82, y: 22, type: "boulevard" },
  ];

  // Helper to calculate total stats of the current active route
  const getRouteStats = () => {
    if (!selectedTimeline) return { total: 0, delivered: 0, pending: 0, amount: 0 };
    const total = selectedTimeline.stops.length;
    const delivered = selectedTimeline.stops.filter(s => s.status === "delivered").length;
    const pending = total - delivered;
    const amount = selectedTimeline.stops.reduce((sum, s) => sum + s.amount, 0);
    return { total, delivered, pending, amount };
  };

  const routeStats = getRouteStats();

  return (
    <div id="logistics-map-tab" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar: Drivers list & Daily Timeline Milestones */}
      <div id="timeline-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 lg:col-span-1 flex flex-col max-h-[850px] overflow-y-auto">
        
        {/* Driver Selector Header */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Seleccionar Transportista
          </label>
          <div className="relative">
            <select
              id="driver-select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-semibold transition-all"
            >
              {drivers.map(drv => (
                <option key={drv.id} value={drv.id}>
                  {drv.avatar} {drv.name} ({drv.vehicle})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <Compass size={14} className="animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Selected Driver Brief Details with real-time GPS indicators */}
        {driverDetails && (
          <div id="driver-card-mini" className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="text-2xl bg-white h-11 w-11 flex items-center justify-center rounded-lg border border-slate-200 shrink-0 shadow-sm">
                {driverDetails.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{driverDetails.name}</h4>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0 ml-1" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className={`font-mono px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    driverDetails.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-700"
                  }`}>
                    {driverDetails.status === "active" ? "En Ruta" : "Pausa"}
                  </span>
                  <span>•</span>
                  <span className="text-[11px] font-medium text-slate-600">⭐ {driverDetails.rating}</span>
                </div>
              </div>
            </div>

            {/* Vehicle specifics */}
            <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-200/70 pt-3 text-slate-500">
              <div>
                <span className="block text-slate-400 uppercase tracking-wider font-mono text-[8px] font-bold">Unidad</span>
                <span className="font-bold text-slate-700">{driverDetails.vehicle}</span>
              </div>
              <div>
                <span className="block text-slate-400 uppercase tracking-wider font-mono text-[8px] font-bold">Placa HN</span>
                <span className="font-bold text-slate-700 font-mono">{driverDetails.plate}</span>
              </div>
            </div>

            {/* Simulated Live GPS Metadata (Instead of a mock movement simulation) */}
            <div className="bg-white border border-slate-100 rounded-lg p-2.5 text-[10px] space-y-1.5 text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <Radio size={11} className="text-emerald-500 animate-pulse" />
                  Señal GPS:
                </span>
                <span className="font-mono font-bold text-emerald-600">Excelente (3m)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <Wifi size={11} className="text-emerald-500" />
                  Red Móvil:
                </span>
                <span className="font-mono text-slate-700 font-bold">Tigo 4G LTE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <Battery size={11} className="text-amber-500" />
                  Batería Celular:
                </span>
                <span className="font-mono text-slate-700 font-bold">89% (Cargando)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <a 
                href={`tel:${driverDetails.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Phone size={12} className="text-slate-400" />
                Llamar
              </a>
              <button 
                id="contact-driver-email-btn"
                onClick={() => {
                  onSelectDriverForEmail(driverDetails.name);
                  onNavigateToTab("emails");
                }}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-xs font-bold cursor-pointer border border-emerald-100 transition-all"
              >
                Advertir
              </button>
            </div>
          </div>
        )}

        {/* Real-Time Route milestones and stop sequencing */}
        <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Secuencia de Entregas</h4>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">HOY EN RUTA</span>
          </div>

          <div className="relative border-l-2 border-slate-100 ml-2.5 pl-4 space-y-3.5 overflow-y-auto flex-1 pr-1">
            {/* Start Node Depot */}
            <div className="relative">
              <span className="absolute -left-[22px] top-1 flex h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-slate-400 font-bold">08:00 AM</span>
                <span className="text-xs font-bold text-slate-800">Centro de Distribución Central (Prado)</span>
                <p className="text-[10px] text-slate-500">Carga de canastas y verificación de frío completa.</p>
              </div>
            </div>

            {/* Stop Nodes */}
            {selectedTimeline?.stops.map((stop, idx) => {
              const isSelected = activeStop?.id === stop.id;
              return (
                <div 
                  key={stop.id} 
                  id={`timeline-stop-${stop.id}`}
                  className="relative cursor-pointer group"
                  onClick={() => setActiveStop(stop)}
                >
                  <span className={`absolute -left-[22px] top-1.5 flex h-3 w-3 rounded-full border-2 border-white transition-all shadow-sm ${
                    stop.status === "delivered" 
                      ? "bg-emerald-500 group-hover:bg-emerald-400" 
                      : "bg-amber-500 group-hover:bg-amber-400"
                  } ${isSelected ? "ring-2 ring-emerald-500/30" : ""}`} />
                  
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    isSelected 
                      ? "bg-emerald-50/50 border-emerald-200 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-slate-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 font-bold">Entrega #{idx + 1} • {stop.time}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase font-mono tracking-wider ${
                        stop.status === "delivered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {stop.status === "delivered" ? "Listo" : "En Camino"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700 transition-colors mt-0.5">
                      {stop.clientName}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{stop.address}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-slate-100">
                      <span className="text-[9px] font-mono text-slate-400">Ref: {stop.ticketId}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-700">{formatLps(stop.amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Panel: High-Fidelity Styled Honduras Route Map & Inspector */}
      <div id="map-and-details-panel" className="lg:col-span-3 flex flex-col gap-6">
        
        {/* Styled Route Map Vector Canvas */}
        <div id="interactive-map-container" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[560px] relative overflow-hidden">
          
          {/* Map Controls Header overlay */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-slate-100 absolute top-4 left-4 right-4 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <MapIcon size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Monitoreo de Última Milla - SuperEconomico
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Ruta actual y estado de tráfico en Tegucigalpa para <span className="text-emerald-700 font-bold">{driverDetails?.name || "repartidores"}</span>
                </p>
              </div>
            </div>

            {/* Interactive Filters (Map toggles) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  showTraffic 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {showTraffic ? "✓ Tráfico en Vivo" : "Ver Tráfico"}
              </button>
              <button
                onClick={() => setShowLandmarks(!showLandmarks)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  showLandmarks 
                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {showLandmarks ? "✓ Puntos de Interés" : "Ver Puntos"}
              </button>
            </div>
          </div>

          {/* Map Grid / Vector Representation (Adapts to Google Maps or Fallback Live Geolocation) */}
          {hasValidKey ? (
            <div id="vector-map-canvas" className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden mt-16 border border-slate-200/80">
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={userCoords || { lat: 14.0818, lng: -87.2068 }}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* User Current Live position marker */}
                  {userCoords && (
                    <AdvancedMarker position={userCoords} title="Tu ubicación real">
                      <Pin background="#3b82f6" glyphColor="#fff" />
                    </AdvancedMarker>
                  )}

                  {/* Central depot */}
                  {userCoords && (
                    <AdvancedMarker position={getStopRealCoords({ coords: { x: 50, y: 50 } } as any, userCoords)} title="Depósito Central SuperEconomico">
                      <Pin background="#10b981" glyphColor="#fff" scale={1.1} />
                    </AdvancedMarker>
                  )}

                  {/* Active route stops translated to userCoords neighborhood */}
                  {selectedTimeline?.stops.map((stop, idx) => {
                    const isActive = activeStop?.id === stop.id;
                    const stopCoords = userCoords ? getStopRealCoords(stop, userCoords) : null;
                    if (!stopCoords) return null;
                    return (
                      <AdvancedMarker
                        key={stop.id}
                        position={stopCoords}
                        onClick={() => setActiveStop(stop)}
                      >
                        <Pin
                          background={stop.status === "delivered" ? "#10b981" : "#f59e0b"}
                          glyphColor="#fff"
                          scale={isActive ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    );
                  })}
                </Map>
              </APIProvider>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-xl border border-slate-200 text-[10px] space-y-1.5 text-slate-600 z-10 pointer-events-none shadow-md">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Leyenda de Distribución</span>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white inline-block shadow-sm" />
                  <span className="font-medium font-semibold text-slate-700">Entregado con éxito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500 border border-white inline-block shadow-sm" />
                  <span className="font-medium font-semibold text-slate-700">Pendiente de entrega</span>
                </div>
              </div>

              {/* Static Telemetry Watermark */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 text-white/90 p-2.5 rounded-lg text-[9px] font-mono space-y-0.5 pointer-events-none shadow-sm z-10 border border-slate-800">
                <div>SISTEMA LOGÍSTICO HN v1.4</div>
                <div className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GOOGLE MAPS ACTIVO OK
                </div>
              </div>
            </div>
          ) : (
            <div id="vector-map-canvas" className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden mt-16 border border-slate-200/80">
              {/* OpenStreetMap dynamic interactive iframe focused on user's real location */}
              <iframe
                title="Live Dynamic Map"
                width="100%"
                height="100%"
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300"
                src={userCoords 
                  ? `https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.005}%2C${userCoords.lat - 0.004}%2C${userCoords.lng + 0.005}%2C${userCoords.lat + 0.004}&layer=mapnik&marker=${userCoords.lat}%2C${userCoords.lng}`
                  : `https://www.openstreetmap.org/export/embed.html?bbox=-87.225%2C14.065%2C-87.185%2C14.095&layer=mapnik&marker=14.0818%2C-87.2068`
                }
              />

              {/* Float overlay informing user of live location integration */}
              <div className="absolute top-4 left-4 right-4 bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-[11px] leading-relaxed backdrop-blur-sm z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>📍 ¡Ubicación Satelital Activa!</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-normal font-medium">
                    {isLocating 
                      ? "Buscando coordenadas satelitales de tu dispositivo..."
                      : `Conectado al GPS. Ubicación: ${locationError ? "San Pedro Sula / Tegucigalpa" : "Detectada en Tiempo Real"}. Puedes arrastrar y hacer zoom para explorar tu zona.`}
                  </p>
                  {userCoords && (
                    <div className="font-mono text-[9px] text-emerald-300/95 font-bold bg-slate-950/40 px-2 py-0.5 rounded inline-block">
                      Lat: {userCoords.lat.toFixed(5)} • Lng: {userCoords.lng.toFixed(5)}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    alert("Para habilitar la visualización avanzada de Google Maps en 3D, ingresa la variable GOOGLE_MAPS_PLATFORM_KEY en la configuración de Secretos (⚙️) de AI Studio.");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-[10px] whitespace-nowrap self-start sm:self-center shrink-0 transition-colors cursor-pointer shadow-sm"
                >
                  Desbloquear Google Maps 3D
                </button>
              </div>

              {/* Custom Overlay Pins mapping deliveries on top of the map wrapper if they approved location */}
              {userCoords && selectedTimeline?.stops.map((stop, idx) => {
                const isActive = activeStop?.id === stop.id;
                // Map percentage coords to visual overlay points on the map wrapper
                return (
                  <div 
                    key={`overlay-${stop.id}`}
                    onClick={() => setActiveStop(stop)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
                    style={{ left: `${stop.coords.x}%`, top: `${stop.coords.y}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`px-1.5 py-0.5 rounded bg-slate-900 text-white border text-[8px] font-bold whitespace-nowrap mb-1 shadow-md transition-all ${
                        isActive ? "border-emerald-400 scale-105 font-bold" : "border-slate-800 scale-95 opacity-70"
                      }`}>
                        {stop.clientName.split(" ")[0]}
                      </div>
                      <div className={`h-4.5 w-4.5 rounded-full border border-white shadow flex items-center justify-center transition-all ${
                        stop.status === "delivered" ? "bg-emerald-500" : "bg-amber-500"
                      } ${isActive ? "scale-125 ring-2 ring-emerald-400" : "scale-100"}`}>
                        <span className="text-[8px] text-white font-bold font-mono">{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Central Depot overlay */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: "50%", top: "50%" }}
              >
                <div className="bg-emerald-600 text-white h-7 w-7 rounded-full flex items-center justify-center border border-white shadow-md text-xs font-bold" title="Depósito de Distribución">
                  🏪
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-xl border border-slate-200 text-[10px] space-y-1.5 text-slate-600 z-10 pointer-events-none shadow-md">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Leyenda de Distribución</span>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white inline-block shadow-sm" />
                  <span className="font-semibold text-slate-700">Entregado con éxito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500 border border-white inline-block shadow-sm" />
                  <span className="font-semibold text-slate-700">Pendiente de entrega</span>
                </div>
              </div>

              {/* Static Telemetry Watermark */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 text-white/90 p-2.5 rounded-lg text-[9px] font-mono space-y-0.5 pointer-events-none shadow-sm z-10 border border-slate-800">
                <div>SISTEMA LOGÍSTICO HN v1.4</div>
                <div className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MAPA DE TU UBICACIÓN OK
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected stop/delivery inspector details */}
        <div id="stop-details-inspector" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {activeStop ? (
            <div id={`inspector-card-${activeStop.id}`} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold">
                      PUNTO DE ENTREGA
                    </span>
                    <span className="text-slate-300 font-mono text-xs">•</span>
                    <span className="text-slate-500 text-xs font-mono font-bold flex items-center gap-1">
                      <Clock size={12} />
                      Entrega programada: {activeStop.time}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{activeStop.clientName}</h4>
                  <p className="text-slate-600 text-xs flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    {activeStop.address}
                  </p>
                </div>

                <div className="text-right space-y-0.5 shrink-0 self-start sm:self-center">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block font-bold">Monto del Recibo</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">{formatLps(activeStop.amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Order specifics */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2.5">
                  <span className="text-slate-400 text-[9px] font-mono uppercase block font-bold">Información de Facturación</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Orden de Compra:</span>
                      <span className="text-slate-800 font-mono font-bold">{activeStop.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Canasta:</span>
                      <span className="text-slate-700 font-semibold">Víveres del Supermercado</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Método Pago:</span>
                      <span className="text-emerald-700 font-bold font-mono">Pago en App</span>
                    </div>
                  </div>
                </div>

                {/* Driver delivery notes */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2.5">
                  <span className="text-slate-400 text-[9px] font-mono uppercase block font-bold">Indicaciones de Despacho</span>
                  <p className="text-slate-600 text-xs leading-relaxed italic">
                    "{activeStop.notes || "Entregar en portería o portón principal si el cliente no responde de inmediato."}"
                  </p>
                </div>

                {/* Client digital signature proof */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-400 text-[9px] font-mono uppercase font-bold">Firma Digital de Recibido</span>
                    {activeStop.status === "delivered" ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle size={10} /> Verificada
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                        Pendiente
                      </span>
                    )}
                  </div>
                  {activeStop.status === "delivered" ? (
                    <div className="border border-slate-200 rounded-lg bg-white p-2 flex items-center justify-center h-14 shadow-inner">
                      <span className="font-serif italic text-emerald-700/80 text-sm tracking-wider">
                        {activeStop.clientName.split(" ")[0]}... ✓
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-[10px] text-slate-400 py-3.5 border border-dashed border-slate-200 bg-white rounded-lg font-medium">
                      Confirmar al entregar el pedido
                    </div>
                  )}
                  <span className="text-[8px] text-slate-400 text-right block mt-1 font-mono">SPS-TGU Log Gateway</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Info size={28} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Selecciona un punto de entrega o parada en el historial de rutas para inspeccionar detalles.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
