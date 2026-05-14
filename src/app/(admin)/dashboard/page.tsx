"use client"

import { useState, useEffect } from "react";
import { LayoutDashboard, Filter, Calendar, AlertTriangle, Info, DollarSign, TrendingUp, Activity, Package, FileText, Clock, Truck, Ship, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetch to match the empty state in the image
    setTimeout(() => {
      setData({
        faturamentoTotal: 0,
        lucroLiquido: 0,
        custoProducao: 0,
        lotesProduzidos: 0,
        orcamentosPendentes: [],
        naFila: [],
        aEnviar: [],
        emTransito: []
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="py-32 text-center text-slate-500 font-mono uppercase text-xs animate-pulse">Carregando painel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a1d24] p-5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400">Visão geral do seu negócio.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#14161b] border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-medium text-slate-300">
            <Filter className="h-4 w-4 text-cyan-400" />
            maio de 2026
            <Calendar className="h-4 w-4 ml-2 text-slate-500" />
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-sm font-bold text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Registrar Falha
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">VENCE EM 6 DIAS</span>
              <span className="text-[12px] font-bold text-amber-400 leading-none mt-1">21/05/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FATURAMENTO TOTAL */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">FATURAMENTO TOTAL</h3>
            <div className="p-2 bg-[#14161b] rounded-lg border border-white/5 group-hover:border-emerald-500/30 transition-colors">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
            R$ {(data?.faturamentoTotal || 0).toFixed(2)}
          </p>
        </div>

        {/* LUCRO LÍQUIDO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">LUCRO LÍQUIDO</h3>
            <div className="p-2 bg-[#14161b] rounded-lg border border-white/5 group-hover:border-emerald-500/30 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
            R$ {(data?.lucroLiquido || 0).toFixed(2)}
          </p>
        </div>

        {/* CUSTO PRODUÇÃO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">CUSTO PRODUÇÃO</h3>
            <div className="p-2 bg-[#14161b] rounded-lg border border-white/5 group-hover:border-red-500/30 transition-colors">
              <Activity className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-400 font-mono tracking-tighter">
            R$ {(data?.custoProducao || 0).toFixed(2)}
          </p>
        </div>

        {/* LOTES PRODUZIDOS */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">LOTES PRODUZIDOS</h3>
            <div className="p-2 bg-[#14161b] rounded-lg border border-white/5 group-hover:border-purple-500/30 transition-colors">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">
            {data?.lotesProduzidos || 0}
          </p>
        </div>
      </div>

      {/* QUEUES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ORÇAMENTOS PENDENTES */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="font-bold text-white">Orçamentos<br/>Pendentes</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#14161b] rounded-md text-[11px] font-bold text-slate-400">{data?.orcamentosPendentes?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-slate-500">Nenhum orçamento<br/>pendente.</p>
          </div>
        </div>

        {/* NA FILA PRODUÇÃO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-white">Na Fila (Produção)</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#14161b] rounded-md text-[11px] font-bold text-slate-400">{data?.naFila?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-slate-500">Fila de produção vazia.</p>
          </div>
        </div>

        {/* A ENVIAR */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-orange-400" />
              <h3 className="font-bold text-white">A Enviar</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#14161b] rounded-md text-[11px] font-bold text-slate-400">{data?.aEnviar?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-slate-500">Tudo enviado! 🎉</p>
          </div>
        </div>

        {/* EM TRÂNSITO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold text-white">Em Trânsito</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#14161b] rounded-md text-[11px] font-bold text-slate-400">{data?.emTransito?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-slate-500">Nenhum pedido em rota.</p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* EVOLUÇÃO DO LUCRO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-4">Evolução do Lucro</h3>
          <div className="flex-1 flex items-center justify-center">
             {/* Chart Placeholder */}
             <div className="w-full h-full border-b border-l border-white/10 relative"></div>
          </div>
        </div>

        {/* CUSTOS DE PRODUÇÃO */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-4">Custos de Produção</h3>
          <div className="flex-1 flex items-center justify-center">
             {/* Chart Placeholder */}
             <div className="w-full h-full border-b border-l border-white/10 relative"></div>
          </div>
        </div>

        {/* TOP PRODUTOS */}
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-4">Top Produtos (R$)</h3>
          <div className="flex-1 flex items-center justify-center">
             {/* List Placeholder */}
             <p className="text-sm text-slate-500 italic">Sem dados suficientes</p>
          </div>
        </div>
      </div>

    </div>
  );
}
