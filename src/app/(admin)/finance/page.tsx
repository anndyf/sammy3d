"use client"

import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Search, ArrowDownCircle, ArrowUpCircle, Filter, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string; type: string; category: string; amount: number; description: string; date: string;
}

interface Product { id: string; name: string; sellingPrice: number; }
interface Material { id: string; name: string; unitType: string; }

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({ type: "INCOME", category: "", amount: "", description: "", productId: "", materialId: "", addStockAmount: "", customerName: "" });

  const fetchData = async () => {
    try {
      const [resFin, resProd, resMat] = await Promise.all([fetch('/api/finance'), fetch('/api/products'), fetch('/api/materials')]);
      const data = await resFin.json();
      if (data.transactions) setTransactions(data.transactions);
      if (data.summary) setSummary(data.summary);
      
      const prodData = await resProd.json();
      const matData = await resMat.json();
      // Suporte ao novo formato paginado { data: [], meta: {} }
      setProducts(Array.isArray(prodData) ? prodData : (prodData?.data ?? []));
      setMaterials(Array.isArray(matData) ? matData : (matData?.data ?? []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTransaction ? "PUT" : "POST";
    const url = editingTransaction ? `/api/finance/${editingTransaction.id}` : "/api/finance";

    // Se tiver nome de cliente, anexa na descrição se for manual
    const finalDescription = formData.customerName 
      ? `CLIENTE: ${formData.customerName} - ${formData.description}`
      : formData.description;

    try {
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...formData, description: finalDescription }) 
      });
      if (res.ok) { 
        setIsAdding(false); 
        setEditingTransaction(null);
        setFormData({ type: "INCOME", category: "", amount: "", description: "", productId: "", materialId: "", addStockAmount: "", customerName: "" }); 
        fetchData(); 
      }
    } catch (e) { console.error(e); }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    
    // Tentar extrair o nome do cliente se estiver no padrão "CLIENTE: X - Y"
    let cName = "";
    let cleanDesc = t.description || "";
    if (t.description?.startsWith("CLIENTE: ")) {
       const parts = t.description.split(" - ");
       cName = parts[0].replace("CLIENTE: ", "");
       cleanDesc = parts.slice(1).join(" - ");
    }

    setFormData({ 
      type: t.type, 
      category: t.category, 
      amount: t.amount.toString(), 
      description: cleanDesc, 
      productId: "", 
      materialId: "", 
      addStockAmount: "",
      customerName: cName
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmar exclusão permanente deste registro financeiro?")) return;
    try {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const categories = formData.type === "INCOME" 
    ? ["Prestações de Serviço 3D", "Peça Pronta (Venda)", "Modelagem", "Outros"]
    : ["Compra de Filamento", "Manutenção (Peças)", "Conta de Luz (Proporcional)", "Embalagens", "Fretes", "Ferramentas", "Outros"];

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40 space-y-12">
      
      {/* MAGLO HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="flex flex-col gap-1">
           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">Saúde Financeira & Fluxo de Caixa</span>
           <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Gestão Financeira</h1>
        </div>
        
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingTransaction(null);
            if (isAdding) setFormData({ type: "INCOME", category: "", amount: "", description: "", productId: "", materialId: "", addStockAmount: "", customerName: "" });
          }}
          className="h-12 px-10 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
        >
          {isAdding ? "Cancelar Operação" : "Novo Movimento +"}
        </button>
      </header>

      {/* METRIC CAPSULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl group border-l-4 border-l-emerald-500 shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ArrowUpCircle className="w-4 h-4 text-emerald-500" /> Receitas Totais</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-bold text-emerald-500 mb-1">R$</span>
               <h3 className="text-4xl font-black text-white tracking-tighter truncate">{summary.totalIncome.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full border border-emerald-500/20">
               <TrendingUp className="w-3 h-3" /> Saldo Positivo
            </div>
         </div>

         <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl group border-l-4 border-l-orange-500 shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ArrowDownCircle className="w-4 h-4 text-orange-500" /> Despesas Totais</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-bold text-orange-500 mb-1">R$</span>
               <h3 className="text-4xl font-black text-white tracking-tighter truncate">{summary.totalExpense.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-orange-500 font-black uppercase tracking-widest bg-orange-500/10 w-fit px-4 py-1.5 rounded-full border border-orange-500/20">
               <TrendingDown className="w-3 h-3" /> Saídas de Caixa
            </div>
         </div>

         <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl group border-l-4 border-l-blue-500 shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-500" /> Saldo em Carteira</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-bold text-blue-500 mb-1">R$</span>
               <h3 className="text-4xl font-black text-white tracking-tighter truncate">{summary.balance.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-blue-500 font-black uppercase tracking-widest bg-blue-500/10 w-fit px-4 py-1.5 rounded-full border border-blue-500/20">
                Operacional
            </div>
         </div>
      </div>

      {isAdding && (
         <section className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl animate-in slide-in-from-top-4 duration-500 space-y-10 shadow-2xl shadow-black/40">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">
                  {editingTransaction ? 'Auditando Registro' : 'Registro de Transação'}
               </h4>
               <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/10 shadow-inner">
                  <button onClick={()=>setFormData({...formData, type:'INCOME'})} className={cn("px-8 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase", formData.type==='INCOME' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>ENTRADA</button>
                  <button onClick={()=>setFormData({...formData, type:'EXPENSE'})} className={cn("px-8 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase", formData.type==='EXPENSE' ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>SAÍDA</button>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">Categoria</label>
                  <select className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-xl outline-none text-[13px] font-bold text-white focus:bg-white/10 focus:border-white transition-all appearance-none" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                     <option value="" className="bg-black">Selecionar...</option>
                     {categories.map(c=><option key={c} value={c} className="bg-black">{c}</option>)}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">Nome do Cliente</label>
                  <input type="text" placeholder="Ex: Maria Souza" className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-xl outline-none text-[13px] font-bold text-white focus:bg-white/10 focus:border-white transition-all placeholder:text-slate-700" value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} />
               </div>
               <div className="space-y-3 lg:col-span-1">
                  <label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">Descrição Interna</label>
                  <input type="text" placeholder="Notas sobre o movimento" className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-xl outline-none text-[13px] font-bold text-white focus:bg-white/10 focus:border-white transition-all placeholder:text-slate-700" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">Valor Auditado (R$)</label>
                  <input type="number" step="0.01" className="w-full h-14 px-6 bg-white/5 border-2 border-white/10 rounded-xl outline-none text-xl font-black text-white focus:bg-white/10 focus:border-blue-500 transition-all text-center tracking-tighter" value={formData.amount} onChange={e=>setFormData({...formData, amount:e.target.value})} />
               </div>
               <div className="lg:col-span-4 pt-4 flex flex-col md:flex-row gap-4">
                  <button type="submit" className="h-16 px-12 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 transition-all active:scale-95 shadow-2xl flex-1 md:flex-none">
                     {editingTransaction ? 'Atualizar Auditoria' : 'Efetivar no Fluxo de Caixa'}
                  </button>
                  {editingTransaction && (
                     <button type="button" onClick={()=>{setIsAdding(false); setEditingTransaction(null);}} className="h-16 px-10 bg-white/5 text-slate-500 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">Descartar Edição</button>
                  )}
               </div>
            </form>
         </section>
      )}

      {/* TRANSACTION TABLE */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              <Filter className="w-4 h-4 text-blue-500" /> Extrato Auditado
            </h5>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input type="text" placeholder="Filtrar histórico..." className="w-full md:w-72 pl-12 pr-6 py-3 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-white outline-none focus:border-white/20 transition-all" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-black/20">
                     <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Data</th>
                     <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Natureza</th>
                     <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Histórico Comercial</th>
                     <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-right">Valor Auditado</th>
                     <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-center w-32">Ações</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-32 text-center text-slate-700 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">Sincronizando Banco de Dados...</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} className="group hover:bg-white/5 transition-all">
                       <td className="py-6 px-8 flex flex-col">
                          <span className="text-[12px] font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">{new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</span>
                       </td>
                       <td className="py-6 px-8">
                          <span className={cn(
                            "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border",
                            t.type === 'INCOME' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          )}>
                             {t.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                       </td>
                       <td className="py-6 px-8">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm font-bold text-white tracking-tight group-hover:text-blue-500 transition-colors">
                                {t.description?.split('[')[0]?.split(':')[1]?.trim() || t.description?.split('[')[0]?.trim() || "Movimentação Comercial"}
                             </span>
                             <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter italic">
                                {t.description?.includes('Liquidação') ? 'Venda realizada' : (t.description?.includes('Compra') ? 'Logística/Suprimentos' : 'Operacional')}
                             </span>
                          </div>
                       </td>
                       <td className={cn("py-6 px-8 text-right font-black text-xl tracking-tighter", t.type === 'INCOME' ? "text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-orange-500 opacity-80")}>
                          {t.type === 'INCOME' ? "+" : "-"} R$ {t.amount.toFixed(2)}
                       </td>
                       <td className="py-6 px-8">
                          <div className="flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                             <button 
                               onClick={() => handleEdit(t)}
                               className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all shadow-xl"
                             >
                                <Plus className="w-4 h-4 rotate-45" /> 
                             </button>
                             <button 
                               onClick={() => handleDelete(t.id)}
                               className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl"
                             >
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {transactions.length === 0 && !loading && (
           <div className="py-24 text-center">
             <Wallet className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
             <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Nenhum movimento registrado este mês</p>
           </div>
         )}
      </div>
    </div>
  );
}
