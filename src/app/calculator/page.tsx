"use client"

import { useState, useMemo } from "react";
import { Calculator, Zap, Clock, Package, TrendingUp, DollarSign, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CostCalculator() {
  const [weight, setWeight] = useState(0);
  const [time, setTime] = useState(0); // em minutos
  const [materialCost, setMaterialCost] = useState(120); // por kg
  const [profitMargin, setProfitMargin] = useState(100); // 100%
  const [energyCost, setEnergyCost] = useState(0.85); // R$ / kWh
  const [printerWattage, setPrinterWattage] = useState(150); // Média de watts da impressora

  const calculations = useMemo(() => {
    const costPerGram = materialCost / 1000;
    const itemMaterialCost = weight * costPerGram;
    const energyConsumption = (printerWattage * (time / 60)) / 1000; // em kWh
    const energyPrice = energyConsumption * energyCost;
    
    const baseCost = itemMaterialCost + energyPrice;
    const profitAmount = baseCost * (profitMargin / 100);
    const totalPrice = baseCost + profitAmount;

    return {
      material: itemMaterialCost,
      energy: energyPrice,
      totalCost: baseCost,
      profit: profitAmount,
      finalPrice: totalPrice
    };
  }, [weight, time, materialCost, profitMargin, energyCost, printerWattage]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-outfit text-white tracking-tight">
          Simulador de <span className="text-purple-400">Custos</span>
        </h1>
        <p className="text-slate-400 font-light mt-1">Calcule o orçamento ideal com base no material, tempo e lucro desejado.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls */}
        <div className="lg:col-span-7 glass-card p-8 border border-white/5 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Peso Estimado (g)</label>
                   <span className="text-purple-400 text-xs font-medium">{weight}g</span>
                </div>
                <div className="flex gap-4">
                   <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-purple-400" />
                   </div>
                   <input 
                     type="range" 
                     min="1" max="2000" step="1" 
                     value={weight}
                     onChange={(e) => setWeight(Number(e.target.value))}
                     className="flex-1 accent-purple-500"
                   />
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tempo de Impressão (min)</label>
                   <span className="text-blue-400 text-xs font-medium">{Math.floor(time/60)}h {time % 60}m</span>
                </div>
                <div className="flex gap-4">
                   <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-blue-400" />
                   </div>
                   <input 
                     type="range" 
                     min="1" max="1440" step="15" 
                     value={time}
                     onChange={(e) => setTime(Number(e.target.value))}
                     className="flex-1 accent-blue-500"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Custo do Filamento (R$/kg)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                  <input 
                    type="number" 
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Margem de Lucro (%)</label>
                <div className="relative group">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                  <input 
                    type="number" 
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 transition-all outline-none"
                  />
                </div>
             </div>
           </div>

           <div className="pt-6 border-t border-white/5">
             <div className="flex items-center gap-2 mb-4 text-slate-400">
               <Zap className="h-4 w-4" />
               <h3 className="text-xs font-bold uppercase tracking-widest">Configuração de Energia</h3>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Consumo Impressora (Watts)</p>
                  <input 
                    type="number" 
                    value={printerWattage}
                    onChange={(e) => setPrinterWattage(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Valor do kWh (R$)</p>
                  <input 
                    type="number" 
                    value={energyCost}
                    onChange={(e) => setEnergyCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none"
                  />
                </div>
             </div>
           </div>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-5 space-y-6">
           <div className="glass-card p-8 border-2 border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-blue-600/10 shadow-2xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                 <DollarSign className="h-6 w-6 text-purple-400" />
                 <h2 className="text-xl font-bold font-outfit text-white">Preço Recomendado</h2>
              </div>
              
              <div className="text-center py-6 mb-8 border-b border-white/10">
                 <p className="text-5xl font-black font-outfit text-white tracking-tight">
                    {formatCurrency(calculations.finalPrice)}
                 </p>
                 <p className="text-sm text-purple-400/70 mt-2 font-medium">Sugestão com {profitMargin}% de Lucro</p>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Custo Material (Filamento)</span>
                    <span className="text-white font-medium">{formatCurrency(calculations.material)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Energia Elétrica</span>
                    <span className="text-white font-medium">{formatCurrency(calculations.energy)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                    <span className="text-slate-200 font-bold uppercase text-xs tracking-widest">Custo Real Total</span>
                    <span className="text-white font-black">{formatCurrency(calculations.totalCost)}</span>
                 </div>
              </div>

              <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white rounded-xl py-4 font-bold text-sm transition-all border border-white/5 flex items-center justify-center gap-2">
                 Gerar Orçamento PDF
                 <HelpCircle className="h-4 w-4 text-slate-500" />
              </button>
           </div>

           <div className="glass-card p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
                <h4 className="font-bold text-sm">Análise de ROI</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                 Ao vender este item pelo preço recomendado, você terá um retorno de <span className="text-emerald-400 font-bold">{formatCurrency(calculations.profit)}</span> livre sobre os custos de produção.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
