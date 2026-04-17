"use client"

import { useState, useEffect } from "react";
import { Package, TrendingUp, Box, Wallet, Clock, Zap, Target, Activity, ExternalLink, MoreHorizontal, ChevronRight, Globe, Command, Smartphone, Bell, Monitor, Search, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMetrics {
  materialsTotal: number;
  productsTotal: number;
  totalStock: number;
  topSellingProduct: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in space-y-12 pb-40">
      
      {/* VERCEL HERO HEADER */}
      <div className="border-b border-white/5 pb-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-3xl font-black tracking-tight text-white uppercase">Painel de Operação</h1>
               <p className="text-[14px] text-slate-400">Monitorando a performance de extrusão e fluxo comercial da Sammy 3D.</p>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-[10px] tracking-[0.3em] font-mono uppercase opacity-30 italic">Lendo banco de dados industriais...</div>
      ) : (
        <div className="space-y-12">
          
          {/* VERCEL PROJECTS GRID STYLE FOR METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-44 group cursor-pointer">
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Produto Favorito</span>
                     <ExternalLink className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-[18px] font-bold text-white tracking-tight truncate leading-tight">
                     {metrics?.topSellingProduct || "Sem Registro"}
                  </h3>
               </div>
               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wide border border-emerald-500/20">
                     <TrendingUp className="h-3 w-3" /> Alta Demanda
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-800" />
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-44 group cursor-pointer">
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Estoque Pronta-Mão</span>
                     <Package className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                     {metrics?.totalStock || 0}
                  </h3>
               </div>
               <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <Globe className="h-3 w-3 animate-spin-slow" /> Unid. no Hub
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-44 group cursor-pointer">
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Design Systems</span>
                     <Target className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                     {metrics?.productsTotal || 0}
                  </h3>
               </div>
               <div className="pt-4 border-t border-white/5 w-full">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                     <div className="w-2/3 h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(0,112,243,0.5)]"></div>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-44 group cursor-pointer">
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Insumos Base</span>
                     <Zap className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                     {metrics?.materialsTotal || 0}
                  </h3>
               </div>
               <div className="pt-4 border-t border-white/5 text-[11px] font-black italic text-[#0070F3] uppercase tracking-[0.2em] group-hover:glow-blue transition-all">
                  Inventário Lab
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
