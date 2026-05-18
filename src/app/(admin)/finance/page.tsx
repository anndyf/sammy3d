"use client"

import { useState, useEffect, useCallback } from "react";
import { 
  Wallet, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Printer, 
  Search, 
  Plus, 
  Trash2, 
  MoreVertical, 
  X, 
  AlertCircle, 
  Sparkles,
  Lock,
  Unlock,
  Loader2,
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  status?: string;
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [activeChannelTab, setActiveChannelTab] = useState<'geral' | 'shopee' | 'ml' | 'direta' | 'liberar'>('geral');
  const [orders, setOrders] = useState<any[]>([]);
  const [data, setData] = useState<{ transactions: Transaction[], summary: any }>({
    transactions: [],
    summary: { totalIncome: 0, totalExpense: 0, balance: 0 }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'loading' | '', message: string}>({type: '', message: ''});
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as 'INCOME' | 'EXPENSE',
    category: "Outros"
  });

  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const [resF, resO] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/orders?limit=1000')
      ]);
      const jsonF = await resF.json();
      const jsonO = await resO.json();
      
      const financeData = jsonF.data || jsonF;
      if (financeData && Array.isArray(financeData.transactions)) {
        setData(financeData);
      }
      
      const ordersData = jsonO.data || jsonO;
      if (ordersData && Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else if (ordersData && Array.isArray(ordersData.data)) {
        setOrders(ordersData.data);
      }
    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const showStatus = (type: 'success' | 'error', message: string) => {
      setStatus({ type, message });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    try {
      setStatus({ type: 'loading', message: '📡 Transmitindo dados para o banco...' });
      
      const rawAmount = String(newTransaction.amount).trim().replace(',', '.');
      const parsedAmount = parseFloat(rawAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showStatus('error', '❌ Insira um valor numérico válido maior que zero.');
        return;
      }

      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          amount: parsedAmount
        })
      });

      const result = await res.json();

      if (res.ok) {
        showStatus('success', '✅ Lançamento registrado com sucesso!');
        setIsModalOpen(false);
        setNewTransaction({ description: "", amount: "", type: "EXPENSE", category: "Outros" });
        fetchFinance();
      } else {
        showStatus('error', `❌ Erro: ${result.error || 'Falha no servidor'}`);
      }
    } catch (err: any) {
      console.error("POST Transaction Error:", err);
      showStatus('error', `❌ Falha na conexão: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir lançamento permanentemente?")) return;
    const showStatus = (type: 'success' | 'error', message: string) => {
      setStatus({ type, message });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    try {
      setStatus({ type: 'loading', message: '📡 Excluindo lançamento...' });
      const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        showStatus('success', '✅ Lançamento excluído com sucesso!');
        fetchFinance();
      } else {
        const result = await res.json();
        showStatus('error', `❌ Erro: ${result.error || 'Falha ao excluir'}`);
      }
    } catch (err: any) {
      console.error("DELETE Transaction Error:", err);
      showStatus('error', `❌ Falha na conexão: ${err.message}`);
    }
  };

  // Liberação manual e imediata de saldos pendentes diretamente na tela financeira
  const handleReleaseOrder = async (orderId: string) => {
    const showStatus = (type: 'success' | 'error', message: string) => {
      setStatus({ type, message });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    try {
      setReleasingOrderId(orderId);
      setStatus({ type: 'loading', message: '📡 Atualizando pedido e liberando caixa...' });
      
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FINISHED' })
      });

      if (res.ok) {
        showStatus('success', '✅ Receita do pedido liberada no caixa com sucesso!');
        fetchFinance();
      } else {
        const result = await res.json();
        showStatus('error', `❌ Erro ao liberar: ${result.error || 'Falha ao atualizar'}`);
      }
    } catch (err: any) {
      console.error("Release Order Error:", err);
      showStatus('error', `❌ Falha na conexão: ${err.message}`);
    } finally {
      setReleasingOrderId(null);
    }
  };

  // Filtrar pedidos pagos ou concluidos para a parte do caixa
  const paidOrders = orders.filter(o => 
    o.paymentStatus === 'PAID' || 
    o.status === 'FINISHED' || 
    o.status === 'READY' || 
    o.status === 'SHIPPED'
  );

  // Filtrar pedidos em andamento da Shopee/Mercado Livre (Valores a Liberar)
  const pendingReleaseOrders = orders.filter(o => 
    (o.channel === 'Shoppe' || o.channel === 'Mercado Livre') && 
    o.status !== 'FINISHED' && 
    o.status !== 'CANCELED'
  );

  // Calcula a receita líquida acumulada dos pedidos pendentes a liberar
  const totalPendingRelease = pendingReleaseOrders.reduce((acc, o) => {
    if (o.netRevenue !== null && o.netRevenue !== undefined && o.netRevenue > 0) {
      return acc + o.netRevenue;
    } else {
      // Fallback de cálculo estimado caso não exista netRevenue gravado
      const isShopee = o.channel === 'Shoppe';
      if (isShopee) {
        return acc + (o.totalAmount * 0.73); // 27% taxas padrão estimadas
      } else {
        return acc + (o.totalAmount * 0.88); // 12% taxas padrão ML
      }
    }
  }, 0);

  const getChannelStats = (filteredOrders: any[], channelType: 'shopee' | 'ml' | 'direta') => {
    let grossRevenue = 0;
    let marketplaceFees = 0;
    let productionCost = 0;

    filteredOrders.forEach(o => {
      grossRevenue += o.totalAmount;
      
      // Calcular taxa do marketplace
      if (channelType === 'shopee') {
        if (o.netRevenue !== null && o.netRevenue !== undefined) {
          marketplaceFees += (o.totalAmount - o.netRevenue);
        } else {
          marketplaceFees += (o.totalAmount * 0.27);
        }
      } else if (channelType === 'ml') {
        if (o.netRevenue !== null && o.netRevenue !== undefined) {
          marketplaceFees += (o.totalAmount - o.netRevenue);
        } else {
          let mlTax = 0;
          if (o.items && Array.isArray(o.items)) {
            o.items.forEach((item: any) => {
              const fixedFee = item.price < 79 ? 6.00 * item.quantity : 0;
              mlTax += (item.price * item.quantity) * 0.12 + fixedFee;
            });
          }
          marketplaceFees += mlTax;
        }
      } else {
        marketplaceFees += 0;
      }

      // Calcular custo de produção com base em peças
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          productionCost += (item.quantity * (item.product?.calculatedCost || 0));
        });
      }
    });

    const netProfit = grossRevenue - marketplaceFees - productionCost;

    return {
      grossRevenue,
      marketplaceFees,
      productionCost,
      netProfit
    };
  };

  const shopeeOrders = paidOrders.filter(o => o.channel === 'Shoppe');
  const mlOrders = paidOrders.filter(o => o.channel === 'Mercado Livre');
  const directaOrders = paidOrders.filter(o => o.channel === 'Venda Direta' || !o.channel);

  const shopeeStats = getChannelStats(shopeeOrders, 'shopee');
  const mlStats = getChannelStats(mlOrders, 'ml');
  const directaStats = getChannelStats(directaOrders, 'direta');

  const filteredTransactions = data.transactions.filter(t => {
    if (activeChannelTab === 'geral') return true;
    if (activeChannelTab === 'shopee') return t.description.toLowerCase().includes('shoppe') || t.description.toLowerCase().includes('shopee');
    if (activeChannelTab === 'ml') return t.description.toLowerCase().includes('mercado livre') || t.description.toLowerCase().includes('ml');
    if (activeChannelTab === 'direta') return t.description.toLowerCase().includes('direta');
    return true;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-white">
      
      {/* STATUS NOTIFICATION BAR */}
      {status.message && (
        <div 
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border backdrop-blur-md",
            status.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : 
            status.type === 'error' ? "bg-red-500/90 text-white border-red-400" : 
            "bg-blue-500/95 text-white border-blue-400"
          )}
        >
           {status.type === 'loading' ? <Loader2 className="h-4.5 w-4.5 animate-spin text-white" /> : <AlertCircle className="h-4.5 w-4.5" />}
           <span className="text-[12px] font-black uppercase tracking-wider">{status.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Fluxo de Caixa</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gestão financeira e controle de repasses em tempo real</p>
            </div>
         </div>
         
         <div className="flex items-center bg-[#1a1d24] border border-white/5 rounded-xl shadow-lg overflow-hidden p-1">
            <button className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex items-center gap-2 px-4 py-1">
               <Calendar className="h-4 w-4 text-cyan-400" />
               <span className="text-xs font-black text-white uppercase tracking-widest">MAIO 2026</span>
            </div>
            <button className="p-2 hover:bg-white/5 text-slate-400 rounded-lg transition-colors"><ChevronRight className="h-5 w-5" /></button>
         </div>
      </div>

      {/* TABS DE FLUXO E CANAIS */}
      <div className="flex flex-wrap items-center gap-2 bg-[#1a1d24]/50 p-2 rounded-2xl w-fit border border-white/5 mb-4">
         <button 
           onClick={() => setActiveChannelTab('geral')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeChannelTab === 'geral' ? "bg-[#1e293b] text-cyan-400 border border-cyan-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            Fluxo Geral
         </button>
         <button 
           onClick={() => setActiveChannelTab('shopee')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeChannelTab === 'shopee' ? "bg-[#1e293b] text-amber-500 border border-amber-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            Vendas Shopee
         </button>
         <button 
           onClick={() => setActiveChannelTab('ml')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeChannelTab === 'ml' ? "bg-[#1e293b] text-yellow-400 border border-yellow-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            Mercado Livre
         </button>
         <button 
           onClick={() => setActiveChannelTab('direta')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeChannelTab === 'direta' ? "bg-[#1e293b] text-emerald-400 border border-emerald-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            Venda Direta
         </button>
         
         {/* TAB DE VALORES A LIBERAR SOLICITADA PELO USUÁRIO */}
         <button 
           onClick={() => setActiveChannelTab('liberar')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative overflow-hidden",
             activeChannelTab === 'liberar' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg font-black" : "text-slate-500 hover:text-white"
           )}
         >
            <Lock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            A Liberar
            {pendingReleaseOrders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[8px] font-black bg-amber-500 text-black rounded-full animate-bounce">
                 {pendingReleaseOrders.length}
              </span>
            )}
         </button>
      </div>

      {/* SUMMARY CARDS INCLUINDO CARD DE VALORES A LIBERAR */}
      {activeChannelTab === 'geral' && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         
         {/* CARD 1: SALDO DISPONÍVEL */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">SALDO REALIZADO (CAIXA)</h3>
               <p className={cn("text-3xl font-black font-mono tracking-tighter", data.summary.balance >= 0 ? "text-white" : "text-red-400")}>
                  R$ {data.summary.balance.toFixed(2)}
               </p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-6 flex items-center gap-2 uppercase">
               <TrendingLine className={cn("h-4 w-4", data.summary.balance >= 0 ? "text-emerald-400" : "text-red-400")} />
               {data.summary.balance >= 0 ? "Saldo Positivo" : "Prejuízo no período"}
            </p>
         </div>

         {/* CARD 2: RECEITAS REALIZADAS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-8 top-8 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 group-hover:rotate-12 transition-all">
               <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">RECEITAS ACUMULADAS</h3>
               <p className="text-3xl font-black text-cyan-400 font-mono tracking-tighter">
                  R$ {data.summary.totalIncome.toFixed(2)}
               </p>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-6 uppercase">Total efetivamente recebido</p>
         </div>

         {/* CARD 3: DESPESAS ACUMULADAS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-8 top-8 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 group-hover:rotate-12 transition-all">
               <ArrowDownRight className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">DESPESAS ACUMULADAS</h3>
               <p className="text-3xl font-black text-red-400 font-mono tracking-tighter">
                  R$ {data.summary.totalExpense.toFixed(2)}
               </p>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-6 uppercase">Total gasto no período</p>
         </div>

         {/* CARD 4: VALORES A LIBERAR (ESTOQUE EM TRÂNSITO) */}
         <div 
           onClick={() => setActiveChannelTab('liberar')}
           className="bg-[#1a1d24] border border-amber-500/10 rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all"
         >
            <div className="absolute right-8 top-8 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 group-hover:scale-105 transition-all">
               <Lock className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
            <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  VALORES A LIBERAR (EM TRÂNSITO)
               </h3>
               <p className="text-3xl font-black text-amber-500 font-mono tracking-tighter">
                  R$ {totalPendingRelease.toFixed(2)}
               </p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-6 flex items-center gap-2 uppercase">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
               {pendingReleaseOrders.length} pedidos pendentes no marketplace
            </p>
         </div>

      </div>
      )}

      {/* CHANNEL BREAKDOWN CARDS */}
      {activeChannelTab !== 'geral' && activeChannelTab !== 'liberar' && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
            
            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
               <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">RECEITA BRUTA</h3>
                  <p className="text-2xl font-black text-white font-mono tracking-tighter">
                     R$ {activeChannelTab === 'shopee' ? shopeeStats.grossRevenue.toFixed(2) : 
                         activeChannelTab === 'ml' ? mlStats.grossRevenue.toFixed(2) : 
                         directaStats.grossRevenue.toFixed(2)}
                  </p>
               </div>
               <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase">Faturamento total do canal</p>
            </div>

            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
               <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">TAXAS DO MARKETPLACE</h3>
                  <p className="text-2xl font-black text-red-400 font-mono tracking-tighter">
                     R$ {activeChannelTab === 'shopee' ? shopeeStats.marketplaceFees.toFixed(2) : 
                         activeChannelTab === 'ml' ? mlStats.marketplaceFees.toFixed(2) : 
                         directaStats.marketplaceFees.toFixed(2)}
                  </p>
               </div>
               <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase">Comissões e taxas fixas retidas</p>
            </div>

            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
               <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">CUSTO DE PRODUÇÃO</h3>
                  <p className="text-2xl font-black text-orange-400/80 font-mono tracking-tighter">
                     R$ {activeChannelTab === 'shopee' ? shopeeStats.productionCost.toFixed(2) : 
                         activeChannelTab === 'ml' ? mlStats.productionCost.toFixed(2) : 
                         directaStats.productionCost.toFixed(2)}
                  </p>
               </div>
               <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase">Custo de material + adicionais</p>
            </div>

            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
               <div className={cn(
                 "absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl transition-colors",
                 activeChannelTab === 'shopee' ? "bg-amber-500/10 group-hover:bg-amber-500/20" :
                 activeChannelTab === 'ml' ? "bg-yellow-500/10 group-hover:bg-yellow-500/20" :
                 "bg-emerald-500/10 group-hover:bg-emerald-500/20"
               )}></div>
               <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">LUCRO LÍQUIDO REAL</h3>
                  <p className={cn(
                    "text-2xl font-black font-mono tracking-tighter",
                    (activeChannelTab === 'shopee' ? shopeeStats.netProfit : 
                     activeChannelTab === 'ml' ? mlStats.netProfit : 
                     directaStats.netProfit) >= 0 ? "text-cyan-400" : "text-red-400"
                  )}>
                     R$ {activeChannelTab === 'shopee' ? shopeeStats.netProfit.toFixed(2) : 
                         activeChannelTab === 'ml' ? mlStats.netProfit.toFixed(2) : 
                         directaStats.netProfit.toFixed(2)}
                  </p>
               </div>
               <p className="text-[9px] font-bold text-slate-500 mt-4 uppercase flex items-center gap-1.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    (activeChannelTab === 'shopee' ? shopeeStats.netProfit : 
                     activeChannelTab === 'ml' ? mlStats.netProfit : 
                     directaStats.netProfit) >= 0 ? "bg-cyan-400" : "bg-red-400"
                  )}></span>
                  Resultado líquido final
               </p>
            </div>
            
         </div>
      )}

      {/* RENDER VIEW DA TAB "A LIBERAR" (PEDIDOS EM TRÂNSITO SOLICITADOS) */}
      {activeChannelTab === 'liberar' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
           
           <div className="bg-[#1a1d24] border border-amber-500/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 blur-[60px] pointer-events-none" />
              <div className="space-y-1 relative z-10">
                 <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-500" /> Repasses de Marketplace a Liberar
                 </h2>
                 <p className="text-xs text-slate-500 font-bold">
                    Estes pedidos foram importados da planilha mas estão em andamento. Eles **não** constam no seu caixa até que você os finalize.
                 </p>
              </div>

              <div className="text-left md:text-right relative z-10">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Saldo Bloqueado Total</span>
                 <span className="text-3xl font-black text-amber-500 font-mono">R$ {totalPendingRelease.toFixed(2)}</span>
              </div>
           </div>

           <div className="bg-[#1a1d24] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-[#14161b]/30 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                 <div className="col-span-2">DATA DE IMPORTAÇÃO</div>
                 <div className="col-span-4">COMPRADOR / CANAL / PEDIDO</div>
                 <div className="col-span-2 text-center">STATUS DE PRODUÇÃO</div>
                 <div className="col-span-2 text-right">VALOR LÍQUIDO</div>
                 <div className="col-span-2 text-center">AÇÃO</div>
              </div>

              <div className="divide-y divide-white/5">
                 {pendingReleaseOrders.length === 0 ? (
                   <div className="py-20 text-center space-y-2">
                      <Unlock className="h-8 w-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Nenhum repasse pendente a liberar!</p>
                      <p className="text-[10px] text-slate-600 font-bold">Todas as vendas importadas já foram faturadas e integradas ao caixa.</p>
                   </div>
                 ) : (
                   pendingReleaseOrders.map((order) => {
                      const isReleasing = releasingOrderId === order.id;
                      const isShopee = order.channel === 'Shoppe';
                      const netVal = order.netRevenue !== null && order.netRevenue !== undefined && order.netRevenue > 0
                        ? order.netRevenue
                        : isShopee ? (order.totalAmount * 0.73) : (order.totalAmount * 0.88);

                      return (
                        <div key={order.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/5 transition-all group">
                           {/* DATA */}
                           <div className="col-span-2">
                              <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                                 {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                           </div>

                           {/* CLIENTE E CANAL */}
                           <div className="col-span-4 flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors uppercase">
                                 {order.customerName}
                              </span>
                              <div className="flex items-center gap-2 mt-1.5">
                                 <span className={cn(
                                   "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                   isShopee ? "bg-[#FF4500]/10 text-[#FF4500]" : "bg-yellow-400/10 text-yellow-400"
                                 )}>
                                    {order.channel}
                                 </span>
                                 <span className="text-[9px] font-mono text-slate-600 font-bold">#{order.id}</span>
                              </div>
                           </div>

                           {/* STATUS DA PRODUÇÃO */}
                           <div className="col-span-2 text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                order.status === 'READY' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                order.status === 'PICKING' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              )}>
                                 <Clock className="h-3 w-3" /> {order.status}
                              </span>
                           </div>

                           {/* VALOR LÍQUIDO REAL / EST. */}
                           <div className="col-span-2 text-right">
                              <p className="text-sm font-black font-mono text-emerald-400">R$ {netVal.toFixed(2)}</p>
                              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                 {order.netRevenue !== null && order.netRevenue !== undefined ? 'Valor real' : 'Valor est.'}
                              </p>
                           </div>

                           {/* AÇÃO DE LIBERAÇÃO NO CAIXA */}
                           <div className="col-span-2 text-center">
                              <button 
                                onClick={() => handleReleaseOrder(order.id)}
                                disabled={isReleasing}
                                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 mx-auto shadow-md"
                              >
                                 {isReleasing ? (
                                   <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                 ) : (
                                   <>
                                     <Unlock className="h-3 w-3 text-black" /> Liberar
                                   </>
                                 )}
                              </button>
                           </div>
                        </div>
                      );
                   })
                 )}
              </div>
           </div>
        </div>
      ) : (
        /* CAIXA DE TRANSAÇÕES GERAL OU DE CANAL */
        <>
          {/* ACTIONS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar lançamentos..." 
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all shadow-sm" 
                />
             </div>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-cyan-500 text-black px-8 h-14 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-3 shadow-xl shadow-cyan-500/10"
             >
               <Plus className="h-4 w-4" /> Novo Lançamento
             </button>
          </div>

          {/* TABLE */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
             <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-[#14161b]/30">
                <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DATA</div>
                <div className="col-span-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DESCRIÇÃO / CATEGORIA</div>
                <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">STATUS</div>
                <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">VALOR</div>
             </div>

             <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="py-20 text-center animate-pulse">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Sincronizando com o banco de dados...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Nenhum lançamento encontrado</p>
                  </div>
                ) : filteredTransactions.map(t => (
                  <div key={t.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/5 transition-all group">
                     <div className="col-span-2">
                        <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                          {new Date(t.date).toLocaleDateString()}
                        </span>
                     </div>
                     
                     <div className="col-span-5 flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase truncate">
                          {t.description || 'Lançamento Manual'}
                        </span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                          {t.category}
                        </span>
                     </div>

                     <div className="col-span-3 text-center">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                          t.type === 'INCOME' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                           {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                     </div>

                     <div className="col-span-2 text-right flex items-center justify-end gap-4">
                        <span className={cn("text-md font-black font-mono", t.type === 'INCOME' ? "text-cyan-400" : "text-red-400")}>
                           {t.type === 'INCOME' ? "+ " : "- "}R$ {Math.abs(t.amount).toFixed(2)}
                        </span>
                        <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </>
      )}

      {/* MODAL NOVO LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#1a1d24] border border-white/10 rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Novo Lançamento</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Descrição</label>
                    <input required type="text" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500" value={newTransaction.description} onChange={e=>setNewTransaction({...newTransaction, description: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Valor (R$)</label>
                       <input required type="number" step="0.01" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-xl font-black text-white outline-none focus:border-cyan-500" value={newTransaction.amount} onChange={e=>setNewTransaction({...newTransaction, amount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tipo</label>
                       <select className="w-full h-[60px] bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-xs font-black text-white outline-none focus:border-cyan-500 appearance-none" value={newTransaction.type} onChange={e=>setNewTransaction({...newTransaction, type: e.target.value as any})}>
                          <option value="EXPENSE">DESPESA (-)</option>
                          <option value="INCOME">RECEITA (+)</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Categoria</label>
                    <select className="w-full bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-xs font-black text-white outline-none focus:border-cyan-500 appearance-none" value={newTransaction.category} onChange={e=>setNewTransaction({...newTransaction, category: e.target.value})}>
                       <option value="Outros">Outros</option>
                       <option value="Material">Material</option>
                       <option value="Venda">Venda</option>
                       <option value="Infraestrutura">Infraestrutura</option>
                    </select>
                 </div>

                 <button type="submit" className="w-full bg-cyan-500 text-black h-16 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/10 mt-4">
                    Confirmar Lançamento
                  </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function TrendingLine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
