"use client"

import { Printer, PenTool, Search, Plus, ListFilter, Trash2, Edit3, AlertTriangle, List } from "lucide-react";
import { useState } from "react";

export default function PrintersPage() {
  const [activeTab, setActiveTab] = useState<'equipamentos' | 'manutencoes'>('equipamentos');
  
  const printers = [
    {
      id: 1,
      name: "HI",
      model: "HI COMBO",
      type: "FDM",
      depreciation: 0.76,
      powerW: 300,
      totalHours: 0.0
    },
    {
      id: 2,
      name: "K1C",
      model: "K1C",
      type: "FDM",
      depreciation: 0.18,
      powerW: 350,
      totalHours: 0.0
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Printer className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Gestão de Máquinas</h1>
         </div>
         
         {/* SEGMENT CONTROL */}
         <div className="flex items-center bg-[#1a1d24] border border-white/5 p-1 rounded-xl shadow-lg">
            <button 
              onClick={() => setActiveTab('equipamentos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'equipamentos' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="h-4 w-4" />
              Equipamentos
            </button>
            <button 
              onClick={() => setActiveTab('manutencoes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'manutencoes' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <PenTool className="h-4 w-4" />
              Manutenções
            </button>
         </div>
      </div>

      {/* SEARCH AND NEW BUTTON */}
      <div className="flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar impressora..." 
              className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:bg-[#1a1d24] focus:border-cyan-500 transition-all shadow-sm" 
            />
         </div>
         <button className="bg-cyan-500 text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
           <Plus className="h-4 w-4" />
           Nova
         </button>
      </div>

      {/* PRINTER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {printers.map(printer => (
           <div key={printer.id} className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 relative group hover:border-white/10 transition-colors shadow-lg flex flex-col">
              
              {/* TOP ACTIONS */}
              <div className="absolute top-6 right-6">
                 <button className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors">
                    <Printer className="h-4 w-4" />
                 </button>
              </div>

              {/* INFO */}
              <div className="mb-6 pr-12">
                 <h3 className="text-xl font-bold text-white tracking-tight">{printer.name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{printer.model}</span>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase">{printer.type}</span>
                 </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Depreciação:</span>
                    <span className="font-bold text-white font-mono">R$ {printer.depreciation.toFixed(2)} / h</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Potência:</span>
                    <span className="font-bold text-white font-mono">{printer.powerW} W</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Total Impresso:</span>
                    <span className="font-bold text-cyan-400 font-mono">{printer.totalHours.toFixed(1)} h</span>
                 </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="flex items-center gap-2 mt-auto">
                 <button className="p-2.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors">
                    <PenTool className="h-4 w-4" />
                 </button>
                 <button className="p-2.5 bg-[#14161b] border border-white/5 hover:border-white/10 text-slate-400 rounded-lg transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                 </button>
                 <button className="flex-1 bg-[#14161b] border border-white/5 hover:border-white/10 text-slate-300 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                 </button>
                 <button className="p-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
