"use client"

import { useState, useEffect } from "react";
import { Package, TrendingUp, Box, Wallet, Clock, Zap, Target, Activity, ExternalLink, MoreHorizontal, ChevronRight, Globe, Command, Smartphone, Bell, Monitor, Search, Plus, Filter, ShoppingCart } from "lucide-react";
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const metrics = data?.metrics;

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in space-y-12 pb-40">
      
      {/* VERCEL HERO HEADER */}
      <div className="border-b border-white/5 pb-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/20">
                     <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Central de Produção</h1>
               </div>
               <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.2em]">Monitoramento tático de extrusão e fluxos comerciais ativos.</p>
            </div>
            
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">Sistema Online</span>
               </div>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-[10px] tracking-[0.3em] font-mono uppercase opacity-30 italic">Sincronizando Nodes Industriais...</div>
      ) : (
        <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-1000">
          
          {/* TOP METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-40 group">
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Receita Mensal</span>
                     <Wallet className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter font-mono">
                     R$ {metrics?.monthlyIncome?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
               </div>
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Fluxo Bruto de CAIXA
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-40 group">
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Total em Pedidos</span>
                     <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter font-mono">
                     {metrics?.ordersTotal || 0}
                  </h3>
               </div>
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Ordens de Serviço Totais
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-40 group">
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Hub de Estoque</span>
                     <Box className="h-4 w-4 text-orange-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter font-mono">
                     {metrics?.totalStock || 0}
                  </h3>
               </div>
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Unidades Prontas-Mão
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(0,112,243,0.1)] transition-all flex flex-col justify-between h-40 group">
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Saldo Operacional</span>
                     <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter font-mono">
                     R$ {metrics?.balance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
               </div>
               <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  Líquido Global
               </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* RECENT ORDERS LIST */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                     <Clock className="h-4 w-4 text-blue-500" /> Fila de Produção Recente
                  </h4>
                  <button className="text-[10px] font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">Ver Todos <ChevronRight className="h-3 w-3" /></button>
               </div>
               
               <div className="space-y-4">
                  {data?.recentOrders?.map((order: any) => (
                    <div key={order.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.07] transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border",
                            order.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            order.status === 'PRINTING' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          )}>
                             {order.status[0]}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors">{order.customerName}</span>
                             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                                {order.items?.length || 0} Itens • R$ {order.totalAmount.toFixed(2)}
                             </span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-mono text-slate-600 uppercase mb-1">Status</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            order.status === 'PENDING' ? "text-amber-500" :
                            order.status === 'PRINTING' ? "text-blue-500" :
                            "text-emerald-500"
                          )}>
                             {order.status}
                          </span>
                       </div>
                    </div>
                  ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl text-[10px] text-slate-700 uppercase tracking-widest font-black italic">Sem Ordens Recentes</div>
                  )}
               </div>
            </div>

            {/* TOP PRODUCTS LIST */}
            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                     <Target className="h-4 w-4 text-orange-500" /> TOP Vendidos
                  </h4>
               </div>
               
               <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  {data?.topProducts?.map((item: any, i: number) => (
                    <div key={i} className="px-6 py-5 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-700 w-4 font-mono">0{i+1}</span>
                          <span className="text-[13px] font-bold text-slate-200 truncate max-w-[120px]">{item.name}</span>
                       </div>
                       <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/10">
                          <span className="text-[10px] font-black text-white font-mono">{item.qty} un</span>
                       </div>
                    </div>
                  ))}
                  {(!data.topProducts || data.topProducts.length === 0) && (
                    <div className="p-10 text-center text-[10px] text-slate-700 uppercase font-black italic">Aguardando Vendas</div>
                  )}
               </div>

               <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                     <Zap className="h-4 w-4 text-blue-500" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Growth Analytics</span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed italic">Sua peça mais rentável é o <span className="text-white font-bold">{metrics?.topSellingProduct}</span>. Considere otimizar o tempo de extrusão para este modelo.</p>
               </div>
            </div>

          </div>

          {/* FINANCIAL RECENT ACTIVITY */}
          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                   <Monitor className="h-4 w-4 text-emerald-500" /> Atividade Financeira
                </h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {data?.recentActivity?.map((activity: any) => (
                  <div key={activity.id} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 group hover:border-emerald-500/30 transition-all">
                     <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-slate-600 uppercase">{new Date(activity.date).toLocaleDateString('pt-BR')}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", activity.type === 'INCOME' ? "bg-emerald-500" : "bg-red-500")} />
                     </div>
                     <p className="text-[12px] font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{activity.description || 'Transação Industrial'}</p>
                     <p className={cn("text-[14px] font-black font-mono", activity.type === 'INCOME' ? "text-emerald-500" : "text-red-500")}>
                        {activity.type === 'INCOME' ? '+' : '-'} R$ {activity.amount.toFixed(2)}
                     </p>
                  </div>
                ))}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
