"use client"

import { Tag, Plus, Edit3, PenTool, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CostsPage() {
  const [costs, setCosts] = useState([
    {
      id: 1,
      name: "Caixas",
      type: "INSUMO / ESTOQUE",
      unitCost: 1.30,
      unitLabel: "unidade",
      currentStock: 50,
      minStock: 5
    }
  ]);

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Custos Extras & Insumos</h1>
         </div>
         <button className="bg-blue-600 text-black px-6 py-2.5 h-11 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg">
           <Plus className="h-4 w-4" />
           Novo Custo
         </button>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {costs.map(cost => (
           <div key={cost.id} className="bg-[#1a1d24] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
              
              {/* TOP BADGE */}
              <div className="absolute top-0 right-0 bg-purple-500/20 px-3 py-1.5 rounded-bl-xl border-b border-l border-purple-500/30">
                 <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{cost.type}</span>
              </div>

              <div className="p-6">
                 <h3 className="text-lg font-bold text-white mb-1">{cost.name}</h3>
                 <p className="text-xs font-medium text-gray-500 mb-4">Custo Unitário Médio</p>
                 
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-xs font-bold text-gray-600">R$</span>
                    <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">{cost.unitCost.toFixed(2)}</span>
                    <span className="text-xs font-medium text-gray-600 ml-1">/ {cost.unitLabel}</span>
                 </div>

                 {/* STOCK BOX */}
                 <div className="bg-[#14161b] border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Estoque Atual</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white">{cost.currentStock}</span>
                          <span className="text-xs text-gray-600 font-medium">un</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Min: {cost.minStock}</span>
                 </div>

                 {/* ACTIONS */}
                 <div className="flex items-center gap-2">
                    <button className="flex-1 bg-[#14161b] border border-white/5 hover:border-white/10 text-slate-300 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                       <Edit3 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button className="p-2.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors">
                       <PenTool className="h-4 w-4" />
                    </button>
                    <button className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                       <ShoppingCart className="h-3.5 w-3.5" /> Comprar
                    </button>
                    <button className="p-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                       <Trash2 className="h-4 w-4" />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
