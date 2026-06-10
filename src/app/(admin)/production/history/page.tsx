"use client"

import { History, Search, Filter, Calendar as CalendarIcon, Download, CheckCircle2, XCircle, AlertTriangle, Box, Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductionHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const historyData = [
    { id: "ORD-0001", date: "2024-05-12", client: "João S.", product: "Suporte VESA", material: "PETG Preto", machine: "Bambu Lab P1S", duration: "2h 30m", weight: "120g", status: "SUCCESS" },
    { id: "ORD-0002", date: "2024-05-12", client: "Tech Solutions", product: "Engrenagem 40D", material: "ABS Branco", machine: "Creality K1", duration: "4h 15m", weight: "85g", status: "SUCCESS" },
    { id: "ORD-0003", date: "2024-05-11", client: "Maria A.", product: "Case Raspberry", material: "PLA Cinza", machine: "HI COMBO", duration: "1h 10m", weight: "45g", status: "FAILED", failReason: "Descolamento da mesa" },
    { id: "ORD-0004", date: "2024-05-10", client: "Pedro C.", product: "Miniatura RPG", material: "Resina Standard", machine: "Elegoo Saturn 3", duration: "3h 45m", weight: "22g", status: "SUCCESS" },
    { id: "ORD-0005", date: "2024-05-10", client: "Ana B.", product: "Vaso Decorativo", material: "PLA Silk Ouro", machine: "Bambu Lab P1S", duration: "8h 20m", weight: "350g", status: "WARNING", failReason: "Pequena falha na camada superior (Aceito)" }
  ];

  const totalProduced = historyData.filter(d => d.status === 'SUCCESS' || d.status === 'WARNING').reduce((acc, curr) => acc + parseInt(curr.weight), 0);
  const successRate = (historyData.filter(d => d.status === 'SUCCESS').length / historyData.length) * 100;

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <History className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Histórico de Produção</h1>
         </div>
         <button className="bg-gray-50 border border-gray-200 text-gray-500 px-6 py-2.5 h-11 rounded-lg text-sm font-bold hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 shadow-sm">
           <Download className="h-4 w-4" /> Exportar CSV
         </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Box className="h-4 w-4 text-blue-600" /> Material Processado</span>
            <div className="flex items-baseline gap-2 mt-2">
               <p className="text-3xl font-black text-white font-mono">{(totalProduced / 1000).toFixed(2)}</p>
               <span className="text-sm font-bold text-gray-600 uppercase">kg</span>
            </div>
         </div>
         <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Target className="h-4 w-4 text-emerald-400" /> Taxa de Sucesso</span>
            <div className="flex items-baseline gap-2 mt-2">
               <p className="text-3xl font-black text-white font-mono">{successRate.toFixed(1)}</p>
               <span className="text-sm font-bold text-gray-600 uppercase">%</span>
            </div>
         </div>
         <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Falhas Registradas</span>
            <p className="text-3xl font-black text-white font-mono mt-2">{historyData.filter(d => d.status === 'FAILED').length}</p>
         </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
            <input 
              type="text" 
              placeholder="Buscar histórico (OS, Produto, Cliente)..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none hover:border-gray-200 focus:bg-gray-50 focus:border-blue-600 transition-all shadow-sm" 
              value={searchTerm} 
              onChange={e=>setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-48">
               <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
               <select className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-600 transition-all cursor-pointer appearance-none">
                  <option value="30">Últimos 30 Dias</option>
                  <option value="7">Últimos 7 Dias</option>
                  <option value="all">Todo o Período</option>
               </select>
            </div>
            <button className="p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg hover:text-white transition-colors shrink-0">
               <Filter className="h-5 w-5" />
            </button>
         </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">DATA / OS</div>
            <div className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">CLIENTE / PROJETO</div>
            <div className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">MÁQUINA / MATERIAL</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">TEMPO / PESO</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">RESULTADO</div>
         </div>

         {/* Table Body */}
         <div className="divide-y divide-white/5">
            {historyData.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors group">
                 {/* DATE & ID */}
                 <div className="col-span-2 flex flex-col">
                    <span className="text-sm font-bold text-white">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                    <span className="text-[10px] font-mono text-gray-600">{item.id}</span>
                 </div>

                 {/* CLIENT & PROJECT */}
                 <div className="col-span-3 flex flex-col min-w-0 pr-4">
                    <span className="text-sm font-bold text-white truncate">{item.product}</span>
                    <span className="text-[11px] text-gray-500 uppercase tracking-widest truncate">{item.client}</span>
                 </div>

                 {/* MACHINE & MATERIAL */}
                 <div className="col-span-3 flex flex-col pr-4">
                    <span className="text-xs font-bold text-blue-600 truncate">{item.machine}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Box className="h-3 w-3 text-gray-600" />
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{item.material}</span>
                    </div>
                 </div>

                 {/* TIME & WEIGHT */}
                 <div className="col-span-2 flex flex-col items-center">
                    <span className="text-sm font-mono font-bold text-white">{item.duration}</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.weight}</span>
                 </div>

                 {/* STATUS */}
                 <div className="col-span-2 flex flex-col items-end justify-center">
                    {item.status === 'SUCCESS' && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Sucesso</span>
                       </div>
                    )}
                    {item.status === 'WARNING' && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Ressalva</span>
                       </div>
                    )}
                    {item.status === 'FAILED' && (
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Falha</span>
                       </div>
                    )}
                    
                    {(item.status === 'FAILED' || item.status === 'WARNING') && item.failReason && (
                       <span className="text-[9px] text-gray-600 text-right mt-1.5 leading-tight line-clamp-2 max-w-full" title={item.failReason}>
                          {item.failReason}
                       </span>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
