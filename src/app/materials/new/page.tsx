"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Droplets, Info, ChevronLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewMaterialPage() {
  const router = useRouter();
  const [type, setType] = useState<"FILAMENT" | "RESIN">("FILAMENT");

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-10 py-6">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="text-slate-400 hover:text-white flex items-center gap-2 group text-sm font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para os Materiais
      </button>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-outfit text-white tracking-tight">
          Cadastrar <span className="text-purple-400">Novo Insumo</span>
        </h1>
        <p className="text-slate-400 font-light mt-1">Registre a compra de um novo rolo de filamento ou frasco de resina.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3 glass-card p-8 border border-white/5 space-y-8">
          {/* Type Selector */}
          <div className="space-y-4">
             <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo do Material</label>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setType("FILAMENT")}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3",
                    type === "FILAMENT" 
                      ? "bg-purple-600/10 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                  )}
                >
                  <Layers className="h-8 w-8" />
                  <span className="text-sm font-bold">Filamento (g)</span>
                </button>
                <button 
                  onClick={() => setType("RESIN")}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3",
                    type === "RESIN" 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                  )}
                >
                  <Droplets className="h-8 w-8" />
                  <span className="text-sm font-bold">Resina (ml)</span>
                </button>
             </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome / Marca</label>
                <input 
                  type="text" 
                  placeholder="Ex: PLA Plus Rock White - Creality" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Custo Total (R$)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Peso Total ({type === "FILAMENT" ? "g" : "ml"})</label>
                <input 
                  type="number" 
                  placeholder="1000" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                />
             </div>

             <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cor Predominante (Hex)</label>
                <div className="flex gap-4">
                  <input 
                    type="color" 
                    className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    placeholder="#FFFFFF" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                  />
                </div>
             </div>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] mt-4 group">
            <Save className="h-5 w-5 group-hover:animate-pulse" />
            Salvar Material no Estoque
          </button>
        </div>

        {/* Sidebar Help / Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-white/5 bg-purple-500/5">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Por que isso é importante?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O custo unitário por grama será calculado automaticamente. 
                  Isso permite que o sistema projete o custo exato de cada peça impressa com base no fatiamento.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-emerald-500/10 bg-emerald-500/5">
             <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">Dica de Gestão</h4>
                <p className="text-xs text-emerald-100/60 leading-relaxed font-light italic">
                  "Sempre adicione o peso bruto da embalagem ou carretel se pretender pesar o restante manualmente no futuro para controle de saldo exacto."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
