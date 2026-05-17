"use client"

import { useState, useEffect, useCallback } from "react";
import { Wallet, Calendar, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Filter, Printer, Search, Plus, Trash2, MoreVertical, X, AlertCircle, Sparkles } from "lucide-react";
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

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance');
      const json = await res.json();
      const financeData = json.data || json;
      if (financeData && Array.isArray(financeData.transactions)) {
        setData(financeData);
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

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* STATUS NOTIFICATION BAR */}
      {status.message && (
        <div 
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border backdrop-blur-md",
            status.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : 
            status.type === 'error' ? "bg-red-500/90 text-white border-red-400" : 
            "bg-blue-500/90 text-white border-blue-400"
          )}
        >
           {status.type === 'loading' ? <Sparkles className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
           <span className="text-[13px] font-bold tracking-tight">{status.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Fluxo de Caixa</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gestão financeira em tempo real</p>
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">SALDO REALIZADO</h3>
               <p className={cn("text-4xl font-black font-mono tracking-tighter", data.summary.balance >= 0 ? "text-white" : "text-red-400")}>
                  R$ {data.summary.balance.toFixed(2)}
               </p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-6 flex items-center gap-2 uppercase">
               <TrendingLine className={cn("h-4 w-4", data.summary.balance >= 0 ? "text-emerald-400" : "text-red-400")} />
               {data.summary.balance >= 0 ? "Saldo Positivo" : "Prejuízo no período"}
            </p>
         </div>

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
         </div>

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
         </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      <div className="bg-[#1a1d24] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
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
            ) : data.transactions.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xs text-slate-600 font-black uppercase tracking-widest">Nenhum lançamento encontrado</p>
              </div>
            ) : data.transactions.map(t => (
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
