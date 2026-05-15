"use client"

import { KanbanSquare, Plus, MoreHorizontal, Clock, Box, Play, CheckCircle2, Search, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface KanbanItem {
  id: string;
  product: string;
  material: string;
  time: string;
  client: string;
  machine?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  textColor: string;
  count: number;
  items: KanbanItem[];
}

export default function ProductionKanbanPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const columns: KanbanColumn[] = [
    {
      id: "fila",
      title: "Fila de Impressão",
      color: "border-slate-500",
      textColor: "text-slate-400",
      count: 2,
      items: [
        { id: "ORD-001", product: "Suporte VESA 100mm", material: "PETG Preto", time: "2h 30m", client: "João S." },
        { id: "ORD-002", product: "Engrenagem Helicoidal", material: "ABS Branco", time: "4h 15m", client: "Tech Solutions" }
      ]
    },
    {
      id: "imprimindo",
      title: "Imprimindo",
      color: "border-cyan-500",
      textColor: "text-cyan-400",
      count: 1,
      items: [
        { id: "ORD-003", product: "Case Raspberry Pi 4", material: "PLA Cinza", time: "1h 10m restante", client: "Maria A.", machine: "HI COMBO" }
      ]
    },
    {
      id: "pos_producao",
      title: "Pós-Produção",
      color: "border-amber-500",
      textColor: "text-amber-500",
      count: 1,
      items: [
        { id: "ORD-004", product: "Miniatura RPG", material: "Resina Standard", time: "Aguardando cura", client: "Pedro C." }
      ]
    },
    {
      id: "concluido",
      title: "Concluído",
      color: "border-emerald-500",
      textColor: "text-emerald-500",
      count: 3,
      items: [
        { id: "ORD-005", product: "Vaso Decorativo", material: "PLA Silk Ouro", time: "Finalizado", client: "Ana B." }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20 min-h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 mt-2 shrink-0">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <KanbanSquare className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Produção & Status (Kamban)</h1>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Buscar peça..." 
                 className="w-64 bg-[#1a1d24] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none hover:border-white/10 focus:bg-[#1a1d24] focus:border-cyan-500 transition-all shadow-sm" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)} 
               />
            </div>
            <button className="p-2.5 bg-[#1a1d24] border border-white/5 text-slate-400 rounded-lg hover:text-white transition-colors">
               <Filter className="h-4 w-4" />
            </button>
            <button className="bg-cyan-500 text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Nova Ordem
            </button>
         </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
         {columns.map(col => (
           <div key={col.id} className="bg-[#1a1d24] border border-white/5 rounded-2xl w-80 shrink-0 flex flex-col max-h-full snap-start shadow-xl">
              
              {/* COLUMN HEADER */}
              <div className={cn("p-4 border-b-2 border-white/5 flex items-center justify-between", col.color)}>
                 <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-bold uppercase tracking-widest", col.textColor)}>{col.title}</h3>
                    <span className="bg-[#14161b] px-2 py-0.5 rounded text-[10px] font-bold text-slate-400">{col.count}</span>
                 </div>
                 <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                 </button>
              </div>

              {/* COLUMN CONTENT (CARDS) */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                 {col.items.map(item => (
                   <div key={item.id} className="bg-[#14161b] border border-white/5 p-4 rounded-xl shadow-sm hover:border-white/10 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{item.id}</span>
                         <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{item.client}</span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white mb-2 leading-tight">{item.product}</h4>
                      
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-1.5">
                            <Box className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[11px] font-medium text-slate-400">{item.material}</span>
                         </div>
                         
                         {item.machine && (
                           <div className="flex items-center gap-1.5">
                              <Play className="h-3.5 w-3.5 text-cyan-400" />
                              <span className="text-[11px] font-bold text-cyan-400">{item.machine}</span>
                           </div>
                         )}

                         <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2">
                            {col.id === "concluido" ? (
                               <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                               <Clock className="h-3.5 w-3.5 text-slate-500" />
                            )}
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              col.id === "imprimindo" ? "text-cyan-400" :
                              col.id === "concluido" ? "text-emerald-500" : "text-slate-500"
                            )}>{item.time}</span>
                         </div>
                      </div>
                   </div>
                 ))}
                 
                 {/* EMPTY STATE OR ADD BUTTON */}
                 <button className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:border-white/20 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
