"use client"

import { useState, useEffect, useCallback } from "react";
import { KanbanSquare, Plus, MoreHorizontal, Clock, Box, Play, CheckCircle2, Search, Filter, Trash2, ArrowRight, Calendar, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customerName: string;
  notes: string;
  status: string;
  weightGrams?: number;
  deadline?: string;
  createdAt: string;
  type: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  textColor: string;
}

const PRODUCTION_COLUMNS: KanbanColumn[] = [
  { id: "PENDING", title: "Fila de Impressão", color: "border-slate-500", textColor: "text-slate-400" },
  { id: "PRINTING", title: "Imprimindo", color: "border-cyan-500", textColor: "text-cyan-400" },
  { id: "POST_PROCESSING", title: "Pós-Produção", color: "border-amber-500", textColor: "text-amber-500" }
];

const FINISHED_COLUMN: KanbanColumn = { id: "FINISHED", title: "Concluído", color: "border-emerald-500", textColor: "text-emerald-500" };

export default function ProductionKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?limit=100');
      const json = await res.json();
      const list = json.data?.data || json.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const updateDeadline = async (id: string, days: number, createdAt: string) => {
    try {
      const createdDate = new Date(createdAt);
      const deadlineDate = new Date(createdDate);
      deadlineDate.setDate(deadlineDate.getDate() + days);

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: deadlineDate.toISOString() })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Excluir esta ordem permanentemente?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredOrders = (status: string) => {
    return orders.filter(o => 
      o.status === status && 
      (o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       o.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getNextStatus = (current: string) => {
    if (current === "FINISHED") return null;
    const idx = PRODUCTION_COLUMNS.findIndex(c => c.id === current);
    if (idx < PRODUCTION_COLUMNS.length - 1) return PRODUCTION_COLUMNS[idx + 1].id;
    return FINISHED_COLUMN.id;
  };

  return (
    <div className="flex flex-col space-y-8 animate-fade-in pb-20 max-w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 pt-2 pr-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
               <KanbanSquare className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Fluxo de Produção</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-glow-indigo">Painel de Controle Operacional</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Buscar peça..." 
                 className="w-48 lg:w-64 bg-[#1a1d24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all shadow-sm" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)} 
               />
            </div>
            <button onClick={fetchOrders} className="p-3 bg-[#1a1d24] border border-white/5 text-slate-400 rounded-xl hover:text-white transition-all shadow-lg">
               <RotateCcw className="h-4 w-4" />
            </button>
         </div>
      </div>

      {/* KANBAN BOARD - PRODUCTION (3 COLUMNS) */}
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
           {PRODUCTION_COLUMNS.map(col => {
             const items = getFilteredOrders(col.id);
             return (
              <div key={col.id} className="bg-[#1a1d24]/50 border border-white/5 rounded-[2.5rem] flex-1 w-full min-w-[300px] flex flex-col shadow-2xl relative">
                 
                 <div className={cn("p-6 border-b-2 flex items-center justify-between shrink-0", col.color)}>
                    <div className="flex items-center gap-3">
                       <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", col.textColor)}>{col.title}</h3>
                       <span className="bg-[#14161b] px-2 py-0.5 rounded-md text-[9px] font-black text-slate-500 border border-white/5">{items.length}</span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                 </div>

                 <div className="p-6 space-y-5 overflow-y-auto max-h-[600px] custom-scrollbar">
                    {items.length === 0 ? (
                      <div className="py-20 text-center opacity-10">
                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Vazio</p>
                      </div>
                    ) : items.map(item => (
                      <div key={item.id} className="bg-[#14161b] border border-white/5 p-6 rounded-[1.8rem] shadow-xl hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteOrder(item.id)} className="p-2 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-xl transition-all">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                         
                         <div className="flex items-center gap-2 mb-4">
                            <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/5 px-2 py-1 rounded-lg border border-cyan-400/10 uppercase tracking-widest">#{item.id.substring(0,6)}</span>
                         </div>
                         
                         <h4 className="text-sm font-black text-white mb-3 leading-tight uppercase group-hover:text-cyan-400 transition-colors">
                            {item.notes?.split('\n').find(l => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || 'Projeto Customizado'}
                         </h4>
                       
                         <div className="space-y-2 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
                            {item.notes?.split('\n').filter(l => l.includes('⚙️') || l.includes('⚖️') || l.includes('⏳')).map((line, idx) => (
                              <div key={idx} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                 {line}
                              </div>
                            ))}
                         </div>

                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px] border border-indigo-500/20">{item.customerName.substring(0,2).toUpperCase()}</div>
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{item.customerName}</span>
                         </div>

                         <div className="pt-6 border-t border-white/5 space-y-4">
                            {/* DEADLINE SELECTOR */}
                            <div className="flex flex-wrap gap-2">
                               {[2, 3, 5, 7].map(days => (
                                 <button 
                                   key={days}
                                   onClick={() => updateDeadline(item.id, days, item.createdAt)}
                                   className="text-[9px] font-black px-2 py-1.5 rounded-lg bg-white/5 text-slate-500 border border-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 transition-all"
                                 >
                                   +{days} DIAS
                                 </button>
                               ))}
                            </div>

                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase">
                                     {item.deadline ? new Date(item.deadline).toLocaleDateString('pt-BR') : 'Definir Prazo'}
                                  </span>
                               </div>
                               
                               <button 
                                 onClick={() => updateStatus(item.id, getNextStatus(col.id)!)}
                                 className="h-10 px-4 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                               >
                                  Próximo <ArrowRight className="h-3.5 w-3.5" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
             );
           })}
        </div>
      </div>

      {/* KANBAN BOARD - FINISHED (FULL WIDTH BELOW) */}
      <div className="w-full pt-10">
         <div className="bg-[#1a1d24]/50 border border-white/5 rounded-[2.5rem] w-full flex flex-col shadow-2xl relative">
            <div className={cn("p-6 border-b-2 flex items-center justify-between shrink-0", FINISHED_COLUMN.color)}>
               <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h3 className={cn("text-[12px] font-black uppercase tracking-[0.2em]", FINISHED_COLUMN.textColor)}>{FINISHED_COLUMN.title}</h3>
                  <span className="bg-[#14161b] px-2 py-0.5 rounded-md text-[10px] font-black text-slate-500 border border-white/5">{getFilteredOrders(FINISHED_COLUMN.id).length}</span>
               </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 custom-scrollbar">
               {getFilteredOrders(FINISHED_COLUMN.id).length === 0 ? (
                 <div className="col-span-full py-16 text-center opacity-10">
                   <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Nenhuma peça concluída ainda</p>
                 </div>
               ) : getFilteredOrders(FINISHED_COLUMN.id).map(item => (
                 <div key={item.id} className="bg-[#14161b] border border-white/5 p-6 rounded-[2rem] shadow-lg opacity-60 hover:opacity-100 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 uppercase tracking-widest">#{item.id.substring(0,6)}</span>
                       <button onClick={() => deleteOrder(item.id)} className="p-2 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                       </button>
                    </div>
                    <h4 className="text-xs font-black text-white mb-2 leading-tight uppercase truncate">{item.notes?.split('\n').find(l => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || 'Projeto'}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{item.customerName}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
