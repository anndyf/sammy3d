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
      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(matData)) setMaterials(matData);
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
    <div className="animate-fade-in space-y-10 pb-40">
      
      {/* MAGLO HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="maglo-title-container mb-0">
           <span className="maglo-subtitle">Saúde Financeira & Fluxo de Caixa</span>
           <h1 className="maglo-title">Gestão Financeira</h1>
        </div>
        
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingTransaction(null);
            if (isAdding) setFormData({ type: "INCOME", category: "", amount: "", description: "", productId: "", materialId: "", addStockAmount: "", customerName: "" });
          }}
          className="h-12 px-8 bg-black text-white text-[10px] font-medium uppercase tracking-[0.2em] rounded-full shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          {isAdding ? "Cancelar Operação" : "Novo Movimento"}
        </button>
      </header>

      {/* METRIC CAPSULES (MAGLO-STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="maglo-card p-8 group border-b-4 border-b-emerald-400">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">Receitas Totais</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-light text-emerald-500 mb-1">R$</span>
               <h3 className="text-4xl font-light text-slate-800 tracking-tighter truncate">{summary.totalIncome.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-emerald-500 font-medium uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">
               <TrendingUp className="w-3 h-3" /> Saldo Positivo
            </div>
         </div>

         <div className="maglo-card p-8 group border-b-4 border-b-orange-400">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">Despesas Totais</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-light text-orange-400 mb-1">R$</span>
               <h3 className="text-4xl font-light text-slate-800 tracking-tighter truncate">{summary.totalExpense.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-orange-400 font-medium uppercase tracking-widest bg-orange-50 w-fit px-3 py-1 rounded-full">
               <TrendingDown className="w-3 h-3" /> Saídas de Caixa
            </div>
         </div>

         <div className="maglo-card p-8 group border-b-4 border-b-black">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">Saldo Disponível</p>
            <div className="flex items-end gap-2">
               <span className="text-xl font-light text-slate-400 mb-1">R$</span>
               <h3 className="text-4xl font-light text-slate-800 tracking-tighter truncate">{summary.balance.toFixed(2)}</h3>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[9px] text-slate-400 font-medium uppercase tracking-widest bg-slate-50 w-fit px-3 py-1 rounded-full">
               <Wallet className="w-3 h-3" /> Livro Caixa Atual
            </div>
         </div>
      </div>

      {isAdding && (
         <section className="maglo-card p-10 animate-in slide-in-from-top-4 duration-500 space-y-10">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">
                  {editingTransaction ? 'Auditando Registro' : 'Registro de Transação'}
               </h4>
               <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
                  <button onClick={()=>setFormData({...formData, type:'INCOME'})} className={cn("px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all", formData.type==='INCOME' ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400")}>ENTRADA</button>
                  <button onClick={()=>setFormData({...formData, type:'EXPENSE'})} className={cn("px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all", formData.type==='EXPENSE' ? "bg-white text-orange-500 shadow-sm" : "text-slate-400")}>SAÍDA</button>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-3">
                  <label className="text-[9px] font-medium text-slate-400 ml-1 uppercase">Categoria</label>
                  <select className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] outline-none text-sm" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                     <option value="">Selecionar...</option>
                     {categories.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] font-medium text-slate-400 ml-1 uppercase">Nome do Cliente (Opcional)</label>
                  <input type="text" placeholder="Ex: Maria Souza" className="w-full px-8 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none text-sm" value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} />
               </div>
               <div className="space-y-3 lg:col-span-1">
                  <label className="text-[9px] font-medium text-slate-400 ml-1 uppercase">Descrição Interna</label>
                  <input type="text" placeholder="Notas sobre o movimento" className="w-full px-8 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none text-sm" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] font-medium text-slate-400 ml-1 uppercase">Valor (R$)</label>
                  <input type="number" step="0.01" className="w-full px-8 py-4 bg-white border-2 border-slate-100 rounded-[24px] outline-none text-xl font-light tracking-tighter focus:border-black transition-all" value={formData.amount} onChange={e=>setFormData({...formData, amount:e.target.value})} />
               </div>
               <div className="lg:col-span-4 pt-4 flex gap-4">
                  <button type="submit" className="h-16 px-12 bg-black text-white rounded-full text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:scale-95">
                     {editingTransaction ? 'Atualizar Auditoria' : 'Efetivar no Fluxo de Caixa'}
                  </button>
                  {editingTransaction && (
                     <button type="button" onClick={()=>{setIsAdding(false); setEditingTransaction(null);}} className="h-16 px-10 bg-slate-50 text-slate-400 rounded-full text-[11px] font-medium uppercase tracking-[0.3em] hover:bg-slate-100 transition-all">Descartar Edição</button>
                  )}
               </div>
            </form>
         </section>
      )}

      {/* TRANSACTION TABLE: MAGLO STYLE */}
      <div className="maglo-card p-0 overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h5 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Extrato Auditado</h5>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input type="text" placeholder="Filtrar..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-xs outline-none focus:border-slate-300" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="py-5 px-8 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em]">Data</th>
                     <th className="py-5 px-8 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em]">Natureza</th>
                     <th className="py-5 px-8 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em]">Histórico</th>
                     <th className="py-5 px-8 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] text-right">Valor Auditado</th>
                     <th className="py-5 px-8 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] text-center w-32">Ações</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-200 uppercase text-[9px] tracking-widest">Sincronizando Banco...</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} className="group hover:bg-slate-50/30 transition-colors">
                       <td className="py-6 px-8 flex flex-col">
                          <span className="text-[11px] font-mono text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[9px] font-mono text-slate-300">{new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</span>
                       </td>
                       <td className="py-6 px-8">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight",
                            t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"
                          )}>
                             {t.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                       </td>
                       <td className="py-6 px-8">
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-700 tracking-tight">
                                {t.description?.split('[')[0]?.split(':')[1]?.trim() || t.description?.split('[')[0]?.trim() || "Movimentação Comercial"}
                             </span>
                             <span className="text-[10px] text-slate-400 font-light italic">
                                {t.description?.includes('Liquidação') ? 'Venda realizada com sucesso' : (t.description?.includes('Compra') ? 'Aquisição de suprimentos' : 'Registro de caixa')}
                             </span>
                          </div>
                       </td>
                       <td className={cn("py-6 px-8 text-right font-light text-lg tracking-tighter", t.type === 'INCOME' ? "text-emerald-500" : "text-orange-400")}>
                          {t.type === 'INCOME' ? "+" : "-"} R$ {t.amount.toFixed(2)}
                       </td>
                       <td className="py-6 px-8">
                          <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                             <button 
                               onClick={() => handleEdit(t)}
                               className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-black hover:text-white transition-all"
                             >
                                <Plus className="w-3.5 h-3.5 rotate-45" /> {/* Use + rotated for edit if it looks tech, or use Lucide Edit */}
                             </button>
                             <button 
                               onClick={() => handleDelete(t.id)}
                               className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                             >
                                <X className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
