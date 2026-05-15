"use client"

import { BarChart3, TrendingUp, TrendingDown, Target, Zap, Download, Printer, Box, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvancedReportsPage() {
  // Dados MOCK para demonstração dos gráficos
  const weeklyProduction = [
    { day: "Seg", success: 80, fail: 20, label: "24h" },
    { day: "Ter", success: 95, fail: 5, label: "26h" },
    { day: "Qua", success: 60, fail: 40, label: "18h" },
    { day: "Qui", success: 100, fail: 0, label: "30h" },
    { day: "Sex", success: 85, fail: 15, label: "22h" },
    { day: "Sáb", success: 90, fail: 10, label: "25h" },
    { day: "Dom", success: 40, fail: 10, label: "8h" },
  ];

  const materialUsage = [
    { name: "PLA Preto", used: 8.5, max: 10, color: "bg-cyan-500" },
    { name: "PETG Cinza", used: 4.2, max: 10, color: "bg-indigo-500" },
    { name: "ABS Branco", used: 2.1, max: 10, color: "bg-emerald-500" },
    { name: "Resina Standard", used: 1.5, max: 10, color: "bg-amber-500" },
  ];

  const printers = [
    { name: "Bambu Lab P1S", status: "online", efficiency: 98, hours: 340 },
    { name: "Creality K1", status: "online", efficiency: 85, hours: 210 },
    { name: "Elegoo Saturn 3", status: "maintenance", efficiency: 60, hours: 45 },
    { name: "Ender 3 V2", status: "offline", efficiency: 40, hours: 1200 },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-[1200px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl flex relative">
               <BarChart3 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Relatórios Avançados
              </h1>
              <p className="text-xs text-slate-500 font-bold">BI, Inteligência e Análise profunda da sua fazenda de impressão.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <select className="w-48 bg-[#14161b] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-[11px] font-bold text-white outline-none focus:border-emerald-500 transition-all cursor-pointer appearance-none uppercase tracking-widest">
                  <option value="30">Últimos 30 Dias</option>
                  <option value="7">Últimos 7 Dias</option>
                  <option value="year">Este Ano</option>
               </select>
            </div>
            <button className="bg-[#14161b] border border-white/5 text-slate-400 px-4 py-2 h-9 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-all flex items-center gap-2 shadow-sm">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
         </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita Gerada</span>
               <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3" /> +14.5%
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">R$ 12.450</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">R$ 1.800 de lucro operacional</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OEE (Eficiência)</span>
               <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  <Target className="h-3 w-3" /> Ótimo
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">84.2%</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Overall Equipment Effectiveness</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horas Impressas</span>
               <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  <Zap className="h-3 w-3" /> Recorde
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">153h</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">+22h em relação ao mês passado</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxa de Desperdício</span>
               <div className="flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                  <TrendingDown className="h-3 w-3" /> Piora
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">4.8%</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Foco em reduzir erros de primeira camada</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* CHART 1: PRODUCAO DIARIA */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Volume de Impressão</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-8">Relação entre Sucessos e Falhas ao longo da semana.</p>
            
            <div className="flex items-end justify-between gap-2 h-48 mt-10">
               {weeklyProduction.map((data, idx) => (
                 <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-3 group relative cursor-pointer">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#14161b] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-white whitespace-nowrap shadow-xl z-20">
                      {data.label} prod.
                    </div>
                    
                    <div className="w-full max-w-[40px] flex flex-col-reverse justify-start relative">
                       {/* Success Bar */}
                       <div 
                         className="w-full bg-cyan-500 rounded-b-md rounded-t-sm transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                         style={{ height: `${data.success}%` }}
                       ></div>
                       {/* Fail Bar (stacked on top conceptually by flexing reverse, but we'll stack them visually if we just let them sit) */}
                       {data.fail > 0 && (
                          <div 
                            className="w-full bg-red-500 rounded-t-md opacity-80 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                            style={{ height: `${data.fail}%`, marginBottom: '2px' }}
                          ></div>
                       )}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.day}</span>
                 </div>
               ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sucesso</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Falha</span>
               </div>
            </div>
         </div>

         {/* CHART 2: CONSUMO DE MATERIAIS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Consumo de Insumos</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-8">Os materiais que mais estão rodando nas suas máquinas.</p>

            <div className="space-y-6">
               {materialUsage.map((mat, idx) => {
                 const percent = (mat.used / mat.max) * 100;
                 return (
                   <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[12px] font-bold text-white flex items-center gap-2">
                            <Box className="h-3.5 w-3.5 text-slate-500" /> {mat.name}
                         </span>
                         <span className="text-[11px] font-mono text-slate-400">{mat.used} kg</span>
                      </div>
                      <div className="w-full h-3 bg-[#14161b] rounded-full overflow-hidden border border-white/5">
                         <div 
                           className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]", mat.color)} 
                           style={{ width: `${percent}%` }}
                         ></div>
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
               <button className="w-full py-3 bg-[#14161b] border border-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                  Ver Relatório Completo de Estoque
               </button>
            </div>
         </div>
      </div>

      {/* MAQUINAS LIST */}
      <div className="bg-[#1a1d24] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
         <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#14161b]">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Status das Impressoras</h3>
               <p className="text-[11px] text-slate-500 font-bold">Saúde e eficiência de cada equipamento do seu parque.</p>
            </div>
            <Printer className="h-6 w-6 text-slate-600" />
         </div>

         <div className="divide-y divide-white/5">
            {printers.map((printer, idx) => (
               <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-xl flex items-center justify-center border",
                       printer.status === 'online' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                       printer.status === 'maintenance' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                       "bg-red-500/10 border-red-500/20 text-red-400"
                     )}>
                        {printer.status === 'online' ? <CheckCircle2 className="h-5 w-5" /> :
                         printer.status === 'maintenance' ? <AlertTriangle className="h-5 w-5" /> :
                         <AlertTriangle className="h-5 w-5" />}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">{printer.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                           {printer.status === 'online' ? 'Produzindo' : printer.status === 'maintenance' ? 'Manutenção' : 'Parada'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Horas Totais</p>
                        <p className="text-lg font-black text-white font-mono">{printer.hours}h</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Eficiência (OEE)</p>
                        <p className={cn(
                          "text-lg font-black font-mono",
                          printer.efficiency > 80 ? "text-emerald-400" : printer.efficiency > 50 ? "text-amber-500" : "text-red-400"
                        )}>{printer.efficiency}%</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}
