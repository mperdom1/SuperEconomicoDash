import React, { useState } from "react";
import { 
  Download, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  FileSpreadsheet,
  Cpu,
  Loader
} from "lucide-react";
import { FinancialMetric } from "../types";

interface FinancialReportsProps {
  financials: FinancialMetric[];
}

export default function FinancialReports({ financials }: FinancialReportsProps) {
  const [geminiReport, setGeminiReport] = useState<string>("");
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isPrintView, setIsPrintView] = useState<boolean>(false);

  // Totals calculations
  const totalSales = financials.reduce((acc, curr) => acc + curr.ventas, 0);
  const totalCogs = financials.reduce((acc, curr) => acc + curr.cogs, 0);
  const totalLogistics = financials.reduce((acc, curr) => acc + curr.logistica, 0);
  const totalOperaciones = financials.reduce((acc, curr) => acc + curr.operaciones, 0);
  const totalProfit = financials.reduce((acc, curr) => acc + curr.netProfit, 0);
  const overallMargin = (totalProfit / totalSales) * 100;

  const formatLps = (val: number) => {
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", maximumFractionDigits: 0 }).format(val);
  };

  // CSV Exporter (A real functional CSV builder)
  const handleExportCSV = () => {
    const headers = ["Mes/Periodo", "Ventas Totales (HNL)", "Costo de Ventas COGS (HNL)", "Gasto Logistica (HNL)", "Gasto Operaciones Dark Store (HNL)", "Margen Neto (HNL)", "Rentabilidad (%)"];
    
    const rows = financials.map(f => [
      f.month,
      f.ventas,
      f.cogs,
      f.logistica,
      f.operaciones,
      f.netProfit,
      Math.round((f.netProfit / f.ventas) * 100)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_financiero_supereconomico_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger server-side Gemini analysis
  const handleGenerateAIReport = async () => {
    setIsLoadingReport(true);
    setGeminiReport("");
    try {
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "financial",
          data: financials
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult Gemini assistant.");
      }

      const data = await response.json();
      setGeminiReport(data.summary || "No analysis could be gathered.");
    } catch (err: any) {
      console.error(err);
      setGeminiReport(`Error al invocar la inteligencia artificial: ${err.message || "Servicio no disponible temporalmente."}`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="financial-reports-tab" className="space-y-6">
      
      {/* Finance Stats and Metrics Selector */}
      {!isPrintView && (
        <div id="finance-widgets-panel" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-mono uppercase">Ventas Históricas</span>
              <h4 className="text-xl font-bold text-slate-900 font-mono">{formatLps(totalSales)}</h4>
              <p className="text-[10px] text-slate-400">Últimos 7 meses de facturación app</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-mono uppercase">Costos Operativos</span>
              <h4 className="text-xl font-bold text-slate-900 font-mono">{formatLps(totalCogs + totalLogistics + totalOperaciones)}</h4>
              <p className="text-[10px] text-slate-400">Logística de reparto + merma + arriendo</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-mono uppercase">Rentabilidad Promedio</span>
              <h4 className="text-xl font-bold text-slate-900 font-mono">{overallMargin.toFixed(1)}%</h4>
              <p className="text-[10px] text-emerald-600 font-semibold">Tasa saludable de Dark Store</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Main Financial Spreadsheet and print trigger buttons */}
      <div id="financial-ledger-panel" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Libro Contable de Supermercado Digital</h3>
            <p className="text-slate-500 text-xs">Ingresos netos deducidos de logística de última milla y arriendos</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="print-view-toggle"
              onClick={() => setIsPrintView(!isPrintView)}
              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
            >
              <Printer size={13} />
              {isPrintView ? "Vista Normal" : "Modo Impresión"}
            </button>
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all shadow-sm"
            >
              <Download size={13} />
              Extraer Reporte (CSV)
            </button>
          </div>
        </div>

        {/* Ledger Table Spreadsheet */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold text-slate-500">Periodo / Mes</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Ventas App</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Costo Ventas (COGS)</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Logística (Choferes)</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Dark Store (Fijo)</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-900">Margen Neto</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500">Rentabilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {financials.map((f, i) => {
                const marginPercent = (f.netProfit / f.ventas) * 100;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{f.month}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">{formatLps(f.ventas)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{formatLps(f.cogs)}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">{formatLps(f.logistica)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">{formatLps(f.operaciones)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{formatLps(f.netProfit)}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                        {marginPercent.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Aggregated Totals Row */}
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                <td className="py-4 px-4 text-slate-900 font-bold">TOTAL HISTÓRICO</td>
                <td className="py-4 px-4 text-right font-mono text-emerald-700">{formatLps(totalSales)}</td>
                <td className="py-4 px-4 text-right font-mono text-slate-600">{formatLps(totalCogs)}</td>
                <td className="py-4 px-4 text-right font-mono text-amber-700">{formatLps(totalLogistics)}</td>
                <td className="py-4 px-4 text-right font-mono text-slate-600">{formatLps(totalOperaciones)}</td>
                <td className="py-4 px-4 text-right font-mono text-emerald-700">{formatLps(totalProfit)}</td>
                <td className="py-4 px-4 text-right font-mono">
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    {overallMargin.toFixed(0)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Print Ledger trigger if inside Print Mode */}
        {isPrintView && (
          <div className="flex justify-end pt-4">
            <button
              id="trigger-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-sm cursor-pointer transition-colors"
            >
              <Printer size={14} />
              Confirmar e Imprimir Ledger
            </button>
          </div>
        )}

      </div>

      {/* Gemini Financial AI Analyst */}
      {!isPrintView && (
        <div id="finance-ai-copilot" className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5 border border-emerald-100">
                <Cpu size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Asesor de Negocio Inteligente (Gemini AI)
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold">Server Side</span>
                </h3>
                <p className="text-slate-500 text-xs">Análisis automatizado del modelo dark store y eficiencia logística</p>
              </div>
            </div>

            <button
              id="ai-generate-report-btn"
              disabled={isLoadingReport}
              onClick={handleGenerateAIReport}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {isLoadingReport ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isLoadingReport ? "Generando Análisis..." : "Generar Auditoría Financiera"}
            </button>
          </div>

          {/* AI Response Display Block */}
          {isLoadingReport && (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
              <Loader size={28} className="mx-auto text-emerald-600 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">Compilando datos mensuales de ventas y logística...</p>
                <p className="text-[10px] text-slate-400">Gemini 3.5 Flash está auditando costos fijos y mermas de almacén.</p>
              </div>
            </div>
          )}

          {geminiReport && !isLoadingReport && (
            <div id="ai-report-output" className="p-5 bg-white border border-emerald-100 rounded-lg space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-emerald-700 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  💡 REPORTE ESTRATÉGICO GENERADO
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Modelo: gemini-3.5-flash</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-sans whitespace-pre-line prose max-w-none">
                {geminiReport}
              </div>
              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 flex justify-between">
                <span>SuperEconomico Executive Intelligence Suite</span>
                <span>Análisis válido para periodos 2026</span>
              </div>
            </div>
          )}

          {!geminiReport && !isLoadingReport && (
            <div className="p-6 text-center border border-dashed border-slate-200 bg-white rounded-lg text-slate-400 text-xs">
              Presione "Generar Auditoría Financiera" para consultar a la inteligencia artificial de Gemini sobre sugerencias de optimización para este Dark Store.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
