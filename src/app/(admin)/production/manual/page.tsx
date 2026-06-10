"use client"

import { useState, useEffect, useCallback } from "react";
import { KanbanSquare, Plus, MoreHorizontal, Clock, Box, Play, CheckCircle2, Search, Filter, Trash2, ArrowRight, Calendar, RotateCcw, AlertCircle, BellRing, Printer } from "lucide-react";
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
  printerId?: string;
  startDate?: string;
  productionDays?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  textColor: string;
}

const PRODUCTION_COLUMNS: KanbanColumn[] = [
  { id: "PENDING", title: "Fila de Impressão", color: "border-slate-500", textColor: "text-gray-500" },
  { id: "PRINTING", title: "Imprimindo", color: "border-blue-600", textColor: "text-blue-600" },
  { id: "POST_PROCESSING", title: "Pós-Produção", color: "border-amber-500", textColor: "text-amber-500" }
];

const FINISHED_COLUMN: KanbanColumn = { id: "FINISHED", title: "Concluído", color: "border-emerald-500", textColor: "text-emerald-500" };

export default function ProductionKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPrinters = useCallback(async () => {
    try {
      const res = await fetch('/api/printers');
      const data = await res.json();
      if (Array.isArray(data)) setPrinters(data);
    } catch (err) {
      console.error("Erro ao carregar impressoras", err);
    }
  }, []);

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
    fetchPrinters();
  }, [fetchOrders, fetchPrinters]);

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

  const assignPrinter = async (id: string, printerId: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId: printerId || null })
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
        body: JSON.stringify({ 
          productionDays: days,
          deadline: deadlineDate.toISOString() 
        })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePlanning = async (id: string, fields: { startDate?: string | null, productionDays?: number | null, deadline?: string | null }) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Erro ao planejar:", err);
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

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const dDate = new Date(deadline);
    now.setHours(0, 0, 0, 0);
    dDate.setHours(0, 0, 0, 0);

    const diffTime = dDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `ATRASADO ${Math.abs(diffDays)}D`, type: 'danger' };
    if (diffDays === 0) return { label: 'VENCE HOJE', type: 'warning' };
    if (diffDays === 1) return { label: 'VENCE AMANHÃ', type: 'info' };
    return { label: `${diffDays} DIAS RESTANTES`, type: 'safe' };
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
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-600/20 shadow-lg shadow-blue-600/5">
               <KanbanSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Fluxo de Produção</h1>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-glow-indigo">Monitoramento em Tempo Real</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-blue-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Buscar peça..." 
                 className="w-48 lg:w-64 bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none hover:border-gray-200 focus:border-blue-600 transition-all shadow-sm" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)} 
               />
            </div>
            <button onClick={fetchOrders} className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-white transition-all shadow-lg">
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
              <div key={col.id} className="bg-white/50 border border-gray-200 rounded-[2.5rem] flex-1 w-full min-w-[300px] flex flex-col shadow-2xl relative">
                 
                 <div className={cn("p-6 border-b-2 flex items-center justify-between shrink-0", col.color)}>
                    <div className="flex items-center gap-3">
                       <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", col.textColor)}>{col.title}</h3>
                       <span className="bg-gray-50 px-2 py-0.5 rounded-md text-[9px] font-black text-gray-600 border border-gray-200">{items.length}</span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                 </div>

                 <div className="p-6 space-y-5 overflow-y-auto max-h-[700px] custom-scrollbar">
                    {items.length === 0 ? (
                      <div className="py-20 text-center opacity-10">
                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Vazio</p>
                      </div>
                    ) : items.map(item => {
                      const dlStatus = getDeadlineStatus(item.deadline);
                      return (
                        <div key={item.id} className={cn(
                          "bg-gray-50 border p-6 rounded-[1.8rem] shadow-xl transition-all group relative overflow-hidden",
                          dlStatus?.type === 'danger' ? "border-red-500/50 animate-pulse-subtle shadow-red-500/5" : 
                          dlStatus?.type === 'warning' ? "border-amber-500/50 shadow-amber-500/5" :
                          "border-gray-200 hover:border-blue-600/30"
                        )}>
                           <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button onClick={() => deleteOrder(item.id)} className="p-2 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-xl transition-all">
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                           
                           <div className="flex items-center justify-between gap-2 mb-4">
                              <span className="text-[9px] font-black text-blue-600 bg-blue-600/5 px-2 py-1 rounded-lg border border-blue-600/10 uppercase tracking-widest">#{item.id.substring(0,6)}</span>
                              
                              {dlStatus && (
                                <div className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                  dlStatus.type === 'danger' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                  dlStatus.type === 'warning' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}>
                                  {dlStatus.type === 'danger' ? <AlertCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                                  {dlStatus.label}
                                </div>
                              )}
                           </div>

                           <h4 className="text-sm font-black text-white mb-2 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                               {item.notes?.split('\n').find(l => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || 'Projeto Customizado'}
                            </h4>

                            {item.startDate && (
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-wider bg-blue-600/5 border border-blue-600/10 px-2.5 py-1 rounded-xl mb-3 w-fit">
                                 <Calendar className="h-3 w-3 shrink-0" />
                                 Agendado: {new Date(item.startDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            )}
                          
                            <div className="space-y-2 mb-4 bg-black/20 p-4 rounded-2xl border border-gray-200">
                               {item.notes?.split('\n').filter(l => l.includes('⚙️') || l.includes('⚖️') || l.includes('⏳')).map((line, idx) => (
                                 <div key={idx} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    {line}
                                 </div>
                               ))}
                               
                               {/* SELETOR DE IMPRESSORA NO CARD */}
                               <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                                  <Printer className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                  <select
                                    value={item.printerId || ""}
                                    onChange={(e) => assignPrinter(item.id, e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase text-slate-300 outline-none border-none cursor-pointer w-full"
                                  >
                                    <option value="" className="bg-gray-50 text-gray-600">Sem Impressora</option>
                                    {printers.map(p => (
                                      <option key={p.id} value={p.id} className="bg-gray-50 text-white">
                                        {p.name} ({p.model})
                                      </option>
                                    ))}
                                  </select>
                               </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                               <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px] border border-indigo-500/20">{item.customerName.substring(0,2).toUpperCase()}</div>
                               <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{item.customerName}</span>
                            </div>

                            {/* PLANILHA DE AGENDAMENTO E PRODUÇÃO */}
                            <div className="pt-4 border-t border-gray-200 space-y-3">
                               <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                 Planejamento e Agenda
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                  {/* Programar Início (startDate) */}
                                  <div className="space-y-1">
                                     <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Agendar Início</label>
                                     <input 
                                       type="datetime-local" 
                                       value={item.startDate ? new Date(new Date(item.startDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ""}
                                       onChange={(e) => {
                                         const val = e.target.value;
                                         if (!val) {
                                           updatePlanning(item.id, { startDate: null });
                                         } else {
                                           const selectedDate = new Date(val);
                                           const days = item.productionDays || 0;
                                           const newDeadline = new Date(selectedDate);
                                           newDeadline.setDate(newDeadline.getDate() + days);
                                           updatePlanning(item.id, { 
                                             startDate: selectedDate.toISOString(),
                                             ...(days > 0 && { deadline: newDeadline.toISOString() })
                                           });
                                         }
                                       }}
                                       className="w-full bg-black/40 border border-gray-200 rounded-xl px-2 py-1.5 text-[9px] font-bold text-blue-600 outline-none focus:border-blue-600 cursor-pointer"
                                     />
                                  </div>

                                  {/* Dias de Produção */}
                                  <div className="space-y-1">
                                     <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Dias Produção</label>
                                     <div className="flex items-center gap-1">
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            const currentDays = item.productionDays || 0;
                                            if (currentDays > 1) {
                                              const newDays = currentDays - 1;
                                              const baseDate = item.startDate ? new Date(item.startDate) : new Date(item.createdAt);
                                              const newDeadline = new Date(baseDate);
                                              newDeadline.setDate(newDeadline.getDate() + newDays);
                                              updatePlanning(item.id, { 
                                                productionDays: newDays,
                                                deadline: newDeadline.toISOString()
                                              });
                                            }
                                          }}
                                          className="w-6 h-6 rounded-lg bg-white/5 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 text-xs font-black transition-all"
                                        >
                                          -
                                        </button>
                                        <input 
                                          type="number" 
                                          min="1"
                                          value={item.productionDays || ""}
                                          placeholder="Dias"
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val >= 1) {
                                              const baseDate = item.startDate ? new Date(item.startDate) : new Date(item.createdAt);
                                              const newDeadline = new Date(baseDate);
                                              newDeadline.setDate(newDeadline.getDate() + val);
                                              updatePlanning(item.id, { 
                                                productionDays: val,
                                                deadline: newDeadline.toISOString()
                                              });
                                            } else if (e.target.value === "") {
                                              updatePlanning(item.id, { productionDays: null });
                                            }
                                          }}
                                          className="w-10 bg-black/40 border border-gray-200 rounded-lg py-1 text-center font-mono text-[9px] text-white outline-none focus:border-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            const currentDays = item.productionDays || 0;
                                            const newDays = currentDays + 1;
                                            const baseDate = item.startDate ? new Date(item.startDate) : new Date(item.createdAt);
                                            const newDeadline = new Date(baseDate);
                                            newDeadline.setDate(newDeadline.getDate() + newDays);
                                            updatePlanning(item.id, { 
                                              productionDays: newDays,
                                              deadline: newDeadline.toISOString()
                                            });
                                          }}
                                          className="w-6 h-6 rounded-lg bg-white/5 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 text-xs font-black transition-all"
                                        >
                                          +
                                        </button>
                                     </div>
                                  </div>
                               </div>

                               {/* Prazo Final (Deadline) */}
                               <div className="space-y-1">
                                  <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block">Prazo Final</label>
                                  <input 
                                    type="date"
                                    value={item.deadline ? item.deadline.substring(0, 10) : ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (!val) {
                                        updatePlanning(item.id, { deadline: null });
                                      } else {
                                        const newDeadline = new Date(val + "T12:00:00");
                                        let daysField = {};
                                        if (item.startDate) {
                                          const diffTime = newDeadline.getTime() - new Date(item.startDate).getTime();
                                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                          if (diffDays > 0) {
                                            daysField = { productionDays: diffDays };
                                          }
                                        }
                                        updatePlanning(item.id, { 
                                          deadline: newDeadline.toISOString(),
                                          ...daysField
                                        });
                                      }
                                    }}
                                    className="w-full bg-black/40 border border-gray-200 rounded-xl px-2 py-1.5 text-[9px] font-bold text-slate-300 outline-none focus:border-blue-600 cursor-pointer"
                                  />
                               </div>

                               <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center gap-1 text-[8px] font-black text-gray-600 uppercase">
                                     <Clock className="h-3 w-3 text-slate-600" />
                                     <span>Criado: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  
                                  <button 
                                    onClick={() => updateStatus(item.id, getNextStatus(col.id)!)}
                                    className="h-9 px-3 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                                  >
                                     Próximo <ArrowRight className="h-3 w-3" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      );
                    })}
                 </div>
              </div>
             );
           })}
        </div>
      </div>

      {/* KANBAN BOARD - FINISHED (FULL WIDTH BELOW) */}
      <div className="w-full pt-10">
         <div className="bg-white/50 border border-gray-200 rounded-[2.5rem] w-full flex flex-col shadow-2xl relative">
            <div className={cn("p-6 border-b-2 flex items-center justify-between shrink-0", FINISHED_COLUMN.color)}>
               <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h3 className={cn("text-[12px] font-black uppercase tracking-[0.2em]", FINISHED_COLUMN.textColor)}>{FINISHED_COLUMN.title}</h3>
                  <span className="bg-gray-50 px-2 py-0.5 rounded-md text-[10px] font-black text-gray-600 border border-gray-200">{getFilteredOrders(FINISHED_COLUMN.id).length}</span>
               </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 custom-scrollbar">
               {getFilteredOrders(FINISHED_COLUMN.id).length === 0 ? (
                 <div className="col-span-full py-16 text-center opacity-10">
                   <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Nenhuma peça concluída ainda</p>
                 </div>
               ) : getFilteredOrders(FINISHED_COLUMN.id).map(item => (
                 <div key={item.id} className="bg-gray-50 border border-gray-200 p-6 rounded-[2rem] shadow-lg opacity-60 hover:opacity-100 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 uppercase tracking-widest">#{item.id.substring(0,6)}</span>
                       <button onClick={() => deleteOrder(item.id)} className="p-2 hover:bg-red-500/10 text-slate-700 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                       </button>
                    </div>
                    <h4 className="text-xs font-black text-white mb-2 leading-tight uppercase truncate">{item.notes?.split('\n').find(l => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || 'Projeto'}</h4>
                    <p className="text-[10px] text-gray-600 uppercase font-black">{item.customerName}</p>
                    {item.printerId && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-wider">
                        <Printer className="h-3 w-3" />
                        {printers.find(p => p.id === item.printerId)?.name || 'Impressora'}
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
