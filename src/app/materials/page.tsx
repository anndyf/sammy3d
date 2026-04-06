"use client"

import { Plus, Layers, Search, MoreVertical, Droplets, Ruler } from "lucide-react";
import { formatCurrency, formatUnit } from "@/lib/utils";

const materialsMock = [
  { id: "1", name: "PLA Branco Creality", type: "FILAMENT", remaining: 120, total: 1000, color: "#FFFFFF", cost: 120.00 },
  { id: "2", name: "PLA Silk Gold", type: "FILAMENT", remaining: 850, total: 1000, color: "#D4AF37", cost: 160.00 },
  { id: "3", name: "Resina Clear Anycubic", type: "RESIN", remaining: 400, total: 500, color: "rgba(255,255,255,0.2)", cost: 220.00 },
];

export default function MaterialsPage() {
  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-outfit text-white tracking-tight">
            Insumos & <span className="text-purple-400">Materiais</span>
          </h1>
          <p className="text-slate-400 font-light mt-1">Gerencie seu estoque de filamentos, resinas e acessórios.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" />
          Novo Material
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center glass-card p-2 border-white/5 max-w-md">
        <div className="pl-3 text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar material..." 
          className="bg-transparent border-none focus:ring-0 text-sm text-white w-full placeholder:text-slate-600 p-2"
        />
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materialsMock.map((material) => {
          const percentage = (material.remaining / material.total) * 100;
          const isLow = percentage < 20;

          return (
            <div key={material.id} className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: material.color + "20" }}
                  >
                    {material.type === "RESIN" ? <Droplets className="h-5 w-5 text-blue-400" /> : <Layers className="h-5 w-5 text-purple-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{material.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{material.type === "RESIN" ? "Resina" : "Filamento"}</p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Restante</p>
                    <p className="text-xl font-bold font-outfit text-white">
                      {material.remaining} <span className="text-sm font-normal text-slate-500">/{material.total}g</span>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Custo Un.</p>
                    <p className="text-sm font-bold text-slate-200">{formatCurrency(material.cost)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-0.5">
                    <span className={isLow ? "text-amber-500" : "text-slate-500"}>
                      {isLow ? "Estoque Crítico" : "Nível"}
                    </span>
                    <span className="text-slate-400">{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ${isLow ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-purple-500 shadowed-purple"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hover highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          );
        })}
        
        {/* Empty State / Quick Add Card */}
        <button className="glass-card p-6 border-dashed border-white/10 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-purple-400 group">
          <div className="h-12 w-12 rounded-full border border-dashed border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest px-0.5">Adicionar Novo</span>
        </button>
      </div>
    </div>
  );
}
