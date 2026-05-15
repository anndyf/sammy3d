"use client"

import { useState, useEffect, useCallback } from "react";
import { KanbanSquare, Plus, MoreHorizontal, Clock, Box, Play, CheckCircle2, Search, Filter, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customerName: string;
  notes: string;
  status: string;
  weightGrams?: number;
  deadline?: string;
  type: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  textColor: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "PENDING", title: "Fila de Impressão", color: "border-slate-500", textColor: "text-slate-400" },
  { id: "PRINTING", title: "Imprimindo", color: "border-cyan-500", textColor: "text-cyan-400" },
  { id: "POST_PROCESSING", title: "Pós-Produção", color: "border-amber-500", textColor: "text-amber-500" },
  { id: "FINISHED", title: "Concluído", color: "border-emerald-500", textColor: "text-emerald-500" }
];

export default function ProductionKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?limit=100');
      const json = await res.json();
      if (json.data?.data) {
        setOrders(json.data.data);
      }
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
    const idx = COLUMNS.findIndex(c => c.id === current);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-6 animate-fade-in overflow-hidden max-w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 pt-2 pr-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
               <KanbanSquare className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Produção (Kanban)</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Controle de fluxo operacional</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Buscar peça ou cliente..." 
                 className="w-48 lg:w-64 bg-[#1a1d24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all shadow-sm" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)} 
               />
            </div>
            <button onClick={fetchOrders} className="p-3 bg-[#1a1d24] border border-white/5 text-slate-400 rounded-xl hover:text-white transition-all">
               <RotateCcwIcon className="h-4 w-4" />
            </button>
         </div>
      </div>

      {/* KANBAN BOARD WRAPPER */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start custom-scrollbar snap-x">
           {COLUMNS.map(col => {
             const items = getFilteredOrders(col.id);
             return (
              <div key={col.id} className="bg-[#1a1d24]/50 border border-white/5 rounded-[2rem] w-[280px] lg:w-[320px] shrink-0 flex flex-col h-full shadow-2xl relative snap-start">
                 
                 <div className={cn("p-6 border-b-2 flex items-center justify-between shrink-0", col.color)}>
                    <div className="flex items-center gap-3">
                       <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", col.textColor)}>{col.title}</h3>
                       <span className="bg-[#14161b] px-2 py-0.5 rounded-md text-[9px] font-black text-slate-500 border border-white/5">{items.length}</span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                 </div>

                 <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    {loading && items.length === 0 ? (
                      <div className="py-10 text-center animate-pulse">
                        <div className="w-8 h-8 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2"></div>
                      </div>
                    ) : items.length === 0 ? (
                      <div className="py-20 text-center opacity-20">
                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Vazio</p>
                      </div>
                    ) : items.map(item => (
                      <div key={item.id} className="bg-[#14161b] border border-white/5 p-5 rounded-2xl shadow-lg hover:border-cyan-500/30 transition-all group relative">
                         <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">#{item.id.substring(0,6)}</span>
                            <button onClick={() => deleteOrder(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-lg transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                         </div>
                         
                         <h4 className="text-sm font-bold text-white mb-2 leading-tight uppercase group-hover:text-cyan-400 transition-colors truncate">{item.notes?.split('\n')[0] || 'Projeto Customizado'}</h4>
                         
                         <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2">
                               <UserIcon className="h-3 w-3 text-slate-500" />
                               <span className="text-[10px] font-bold text-slate-400 truncate">{item.customerName}</span>
                            </div>
                            {item.weightGrams && (
                              <div className="flex items-center gap-2">
                                 <Box className="h-3 w-3 text-slate-500" />
                                 <span className="text-[10px] font-bold text-slate-400">{item.weightGrams}g</span>
                              </div>
                            )}
                         </div>

                         <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                               <Clock className="h-3 w-3 text-slate-600" />
                               <span className="text-[9px] font-black text-slate-600 uppercase">{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Sem prazo'}</span>
                            </div>
                            
                            {getNextStatus(col.id) && (
                              <button 
                                onClick={() => updateStatus(item.id, getNextStatus(col.id)!)}
                                className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-all"
                              >
                                 <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}

function RotateCcwIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
