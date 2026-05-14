"use client"

import { Wallet, Calendar, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Filter, Printer, Search, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FinancePage() {
  const transactions = [
    {
      id: 1,
      date: "14/05/2026",
      description: "Compra de Filamento: VOOLT PRETO PETG (4 un)",
      subDescription: "Outros",
      category: "Material",
      status: "Pago",
      value: -384.00
    }
  ];

  const totalIncome = 0.00;
  const totalExpense = 384.00;
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Fluxo de Caixa</h1>
         </div>
         
         {/* MONTH NAVIGATOR */}
         <div className="flex items-center bg-[#1a1d24] border border-white/5 rounded-xl shadow-lg overflow-hidden p-1">
            <button className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors">
               <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 px-4 py-1">
               <Calendar className="h-4 w-4 text-cyan-400" />
               <span className="text-sm font-bold text-white uppercase tracking-widest">MAIO 2026</span>
            </div>
            <button className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors">
               <ChevronRight className="h-5 w-5" />
            </button>
         </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* SALDO */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">SALDO REALIZADO</h3>
               <p className={cn("text-4xl font-black font-mono tracking-tighter", balance >= 0 ? "text-white" : "text-red-400")}>
                  R$ {balance.toFixed(2)}
               </p>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-4 flex items-center gap-1.5">
               <TrendingLine className="h-4 w-4" />
               {balance >= 0 ? "Lucro no período" : "Prejuízo no período"}
            </p>
         </div>

         {/* RECEITAS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-6 top-6 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
               <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">RECEITAS (PAGAS)</h3>
               <p className="text-3xl font-black text-cyan-400 font-mono tracking-tighter">
                  R$ {totalIncome.toFixed(2)}
               </p>
            </div>
         </div>

         {/* DESPESAS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-6 top-6 p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
               <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">DESPESAS (PAGAS)</h3>
               <p className="text-3xl font-black text-red-400 font-mono tracking-tighter">
                  R$ {totalExpense.toFixed(2)}
               </p>
            </div>
         </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a1d24] border border-white/5 rounded-2xl p-4 shadow-lg">
         <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500 ml-2" />
            <span className="text-sm font-bold text-slate-400">Filtros:</span>
            <select className="bg-[#14161b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
               <option>Todos os Tipos</option>
            </select>
            <select className="bg-[#14161b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
               <option>Todos os Status</option>
            </select>
            <select className="bg-[#14161b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
               <option>Todas as Categorias</option>
            </select>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-[#14161b] border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
            <Printer className="h-4 w-4" />
            Imprimir Relatório
         </button>
      </div>

      {/* LIST SECTION */}
      <div>
         <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Buscar lançamento..." 
                 className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:bg-[#1a1d24] focus:border-cyan-500 transition-all shadow-sm" 
               />
            </div>
            <button className="bg-cyan-500 text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </button>
         </div>

         {/* TABLE */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5">
               <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">DATA</div>
               <div className="col-span-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">DESCRIÇÃO</div>
               <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">CATEGORIA</div>
               <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">STATUS</div>
               <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">VALOR</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-white/5">
               {transactions.map(t => (
                 <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group">
                    <div className="col-span-2">
                       <span className="text-sm font-bold text-slate-300">{t.date}</span>
                    </div>
                    
                    <div className="col-span-5 flex flex-col">
                       <span className="text-sm font-bold text-white">{t.description}</span>
                       <span className="text-xs text-slate-500">{t.subDescription}</span>
                    </div>

                    <div className="col-span-2 text-center">
                       <span className="inline-block px-3 py-1 bg-[#14161b] border border-white/5 rounded-lg text-[10px] font-bold text-slate-300">
                          {t.category}
                       </span>
                    </div>

                    <div className="col-span-1 text-center">
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          {t.status}
                       </span>
                    </div>

                    <div className="col-span-2 text-right">
                       <span className={cn("text-sm font-black font-mono", t.value >= 0 ? "text-cyan-400" : "text-red-400")}>
                          {t.value >= 0 ? "+ " : "- "}R$ {Math.abs(t.value).toFixed(2)}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// Simple sparkline-like icon for the balance card
function TrendingLine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
