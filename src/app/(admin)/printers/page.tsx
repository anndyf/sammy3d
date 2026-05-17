"use client"

import { Printer, PenTool, Search, Plus, Trash2, Edit3, AlertTriangle, List, X, DollarSign, Clock, CheckCircle2, Wrench } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Maintenance {
  id: string;
  printerId: string;
  description: string;
  cost: number;
  date: string;
  printer?: PrinterData;
}

interface PrinterData {
  id: string;
  name: string;
  model: string;
  type: string;
  price: number;
  lifespan: number;
  powerW: number;
  depreciation: number;
  totalHours: number;
  status: string;
  maintenances?: Maintenance[];
}

export default function PrintersPage() {
  const [activeTab, setActiveTab] = useState<'equipamentos' | 'manutencoes' | 'plano'>('equipamentos');
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modais
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintPrinterId, setMaintPrinterId] = useState<string | null>(null);

  // Forms
  const [printerForm, setPrinterForm] = useState({
    name: "",
    model: "",
    type: "FDM",
    price: 0,
    lifespan: 5000,
    powerW: 250,
    status: "OPERATIONAL"
  });

  const [maintForm, setMaintForm] = useState({
    description: "",
    cost: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resPrinters, resMaintenances] = await Promise.all([
        fetch('/api/printers'),
        fetch('/api/printers/maintenances')
      ]);

      if (resPrinters.ok) {
        const data = await resPrinters.json();
        setPrinters(data);
      }
      if (resMaintenances.ok) {
        const data = await resMaintenances.json();
        setMaintenances(data);
      }
    } catch (err) {
      console.error("Erro ao buscar impressoras:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ações de Impressora
  const handleSavePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing && selectedPrinterId ? `/api/printers/${selectedPrinterId}` : '/api/printers';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printerForm)
      });

      if (res.ok) {
        setShowPrinterModal(false);
        setPrinterForm({
          name: "",
          model: "",
          type: "FDM",
          price: 0,
          lifespan: 5000,
          powerW: 250,
          status: "OPERATIONAL"
        });
        fetchData();
      } else {
        alert("Erro ao salvar impressora.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPrinter = (printer: PrinterData) => {
    setIsEditing(true);
    setSelectedPrinterId(printer.id);
    setPrinterForm({
      name: printer.name,
      model: printer.model,
      type: printer.type,
      price: printer.price,
      lifespan: printer.lifespan,
      powerW: printer.powerW,
      status: printer.status
    });
    setShowPrinterModal(true);
  };

  const handleDeletePrinter = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta impressora permanentemente?")) return;
    try {
      const res = await fetch(`/api/printers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (printer: PrinterData) => {
    const newStatus = printer.status === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    try {
      const res = await fetch(`/api/printers/${printer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Ações de Manutenção
  const handleOpenMaintModal = (printerId: string) => {
    setMaintPrinterId(printerId);
    setMaintForm({
      description: "",
      cost: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setShowMaintModal(true);
  };

  const handleSaveMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintPrinterId) return;

    try {
      const res = await fetch('/api/printers/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerId: maintPrinterId,
          ...maintForm
        })
      });

      if (res.ok) {
        setShowMaintModal(false);
        fetchData();
      } else {
        alert("Erro ao registrar manutenção.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaint = async (id: string) => {
    if (!confirm("Deseja concluir/remover esta manutenção? A impressora voltará ao status operacional.")) return;
    try {
      const res = await fetch(`/api/printers/maintenances/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredPrinters = () => {
    return printers.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredMaintenances = () => {
    return maintenances.filter(m => 
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.printer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-8 pb-20 max-w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
               <Printer className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Gestão de Máquinas</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-glow-indigo">Controle e Custos de Equipamentos</p>
            </div>
         </div>
         
         {/* SEGMENT CONTROL */}
         <div className="flex items-center bg-[#1a1d24] border border-white/5 p-1 rounded-xl shadow-lg">
            <button 
              onClick={() => setActiveTab('equipamentos')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                activeTab === 'equipamentos' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              )}
            >
              <List className="h-4 w-4" />
              Equipamentos
            </button>
            <button 
              onClick={() => setActiveTab('manutencoes')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                activeTab === 'manutencoes' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              )}
            >
              <PenTool className="h-4 w-4" />
              Manutenções
            </button>
            <button 
              onClick={() => setActiveTab('plano')}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                activeTab === 'plano' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              )}
            >
              <Wrench className="h-4 w-4" />
              Plano Preventivo
            </button>
         </div>
      </div>

      {/* SEARCH AND NEW BUTTON */}
      <div className="flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:bg-[#1a1d24] focus:border-cyan-500 transition-all shadow-sm" 
            />
         </div>
         <button 
           onClick={() => {
             setIsEditing(false);
             setPrinterForm({
               name: "",
               model: "",
               type: "FDM",
               price: 0,
               lifespan: 5000,
               powerW: 250,
               status: "OPERATIONAL"
             });
             setShowPrinterModal(true);
           }}
           className="bg-cyan-500 text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
         >
           <Plus className="h-4 w-4" />
           Nova
         </button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Carregando...</p>
        </div>
      ) : activeTab === 'equipamentos' ? (
        /* PRINTER CARDS GRID */
        getFilteredPrinters().length === 0 ? (
          <div className="py-20 text-center bg-[#1a1d24]/50 border border-white/5 rounded-3xl opacity-40">
            <Printer className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Nenhuma impressora encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredPrinters().map(printer => (
              <div key={printer.id} className={cn(
                "bg-[#1a1d24] border rounded-2xl p-6 relative group hover:border-white/10 transition-all shadow-lg flex flex-col",
                printer.status === 'MAINTENANCE' ? 'border-amber-500/30 shadow-amber-500/5' : 'border-white/5'
              )}>
                 
                 {/* TOP STATUS GLOW / INDICATOR */}
                 <div className="absolute top-6 right-6 flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full border border-black",
                      printer.status === 'OPERATIONAL' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    )}></span>
                    <button className={cn(
                      "p-2 rounded-lg transition-colors border",
                      printer.status === 'OPERATIONAL' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>
                       <Printer className="h-4 w-4" />
                    </button>
                 </div>

                 {/* INFO */}
                 <div className="mb-6 pr-14">
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase truncate">{printer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{printer.model}</span>
                       <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-slate-400 uppercase">{printer.type}</span>
                    </div>
                 </div>

                 <div className="space-y-3.5 mb-8 flex-1">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-black text-slate-500 uppercase tracking-wider">Depreciação:</span>
                       <span className="font-bold text-white font-mono">R$ {printer.depreciation.toFixed(2)} / h</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-black text-slate-500 uppercase tracking-wider">Potência:</span>
                       <span className="font-bold text-white font-mono">{printer.powerW} W</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-black text-slate-500 uppercase tracking-wider">Total Impresso:</span>
                       <span className="font-bold text-cyan-400 font-mono">{printer.totalHours.toFixed(1)} h</span>
                    </div>
                 </div>

                 {/* BOTTOM ACTIONS */}
                 <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleOpenMaintModal(printer.id)}
                      title="Registrar Manutenção"
                      className="p-3 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 rounded-xl transition-all shadow-md"
                    >
                       <PenTool className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(printer)}
                      title={printer.status === 'OPERATIONAL' ? 'Colocar em Manutenção' : 'Tornar Operacional'}
                      className={cn(
                        "p-3 rounded-xl transition-all shadow-md border",
                        printer.status === 'MAINTENANCE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/5 border-white/5 text-slate-500 hover:text-amber-400 hover:border-amber-500/20'
                      )}
                    >
                       <AlertTriangle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPrinter(printer)}
                      className="flex-1 bg-[#14161b] border border-white/5 hover:border-white/10 hover:bg-[#1a1d24] text-slate-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                       <Edit3 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDeletePrinter(printer.id)}
                      title="Excluir Impressora"
                      className="p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl transition-all shadow-md"
                    >
                       <Trash2 className="h-4 w-4" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'manutencoes' ? (
        /* MAINTENANCES TAB LOG */
        getFilteredMaintenances().length === 0 ? (
          <div className="py-20 text-center bg-[#1a1d24]/50 border border-white/5 rounded-3xl opacity-40">
            <PenTool className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Nenhum registro de manutenção.</p>
          </div>
        ) : (
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#14161b]">
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Equipamento</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Custo</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {getFilteredMaintenances().map(maint => (
                    <tr key={maint.id} className="hover:bg-white/5 transition-all">
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white uppercase">{maint.printer?.name || 'Impressora Excluída'}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-slate-300 font-medium">
                        {maint.description}
                      </td>
                      <td className="p-5 text-sm font-bold text-emerald-400 font-mono">
                        R$ {maint.cost.toFixed(2)}
                      </td>
                      <td className="p-5 text-xs text-slate-400 font-mono">
                        {new Date(maint.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleDeleteMaint(maint.id)}
                          className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-black font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Resolvido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* PREVENTIVE MAINTENANCE PLAN TAB */
        getFilteredPrinters().length === 0 ? (
          <div className="py-20 text-center bg-[#1a1d24]/50 border border-white/5 rounded-3xl opacity-40">
            <Printer className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Nenhuma impressora ativa para monitorar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {getFilteredPrinters().map(printer => {
              const checkpoints = [
                {
                  id: "Z_AXIS",
                  title: "Limpeza & Lubrificação Z-Axis (100h)",
                  interval: 100,
                  desc: "Limpar fuso Z com álcool isopropílico, lubrificar e tensionar correias X/Y.",
                  icon: Wrench,
                },
                {
                  id: "EXTRUDER",
                  title: "Extrusora & Nivelamento (250h)",
                  interval: 250,
                  desc: "Limpar engrenagens da extrusora, nivelar mesa e checar fixação do hotend.",
                  icon: List,
                },
                {
                  id: "NOZZLE",
                  title: "Substituição de Bico (Nozzle) (500h)",
                  interval: 500,
                  desc: "Substituir bico 0.4mm de latão/aço, inspecionar tubo PTFE interno e coolers.",
                  icon: AlertTriangle,
                },
                {
                  id: "REVISION",
                  title: "Revisão Geral e Fiação (1000h)",
                  interval: 1000,
                  desc: "Lubrificar guias lineares, inspecionar fadiga dos cabos elétricos e correias.",
                  icon: Clock,
                }
              ];

              return (
                <div key={printer.id} className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-xl flex flex-col relative overflow-hidden">
                  {/* Printer Header */}
                  <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">{printer.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{printer.model} • {printer.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Uso Acumulado</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">{printer.totalHours.toFixed(1)} h</span>
                    </div>
                  </div>

                  {/* Checkpoint list */}
                  <div className="space-y-5 flex-1">
                    {checkpoints.map(cp => {
                      const currentVal = printer.totalHours % cp.interval;
                      const percent = Math.min(100, Math.round((currentVal / cp.interval) * 100));
                      
                      let statusColor = "text-emerald-400";
                      let barColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                      let statusLabel = "Funcionamento OK";

                      if (percent >= 80 && percent < 95) {
                        statusColor = "text-amber-400";
                        barColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                        statusLabel = "Atenção: Manutenção Próxima";
                      } else if (percent >= 95) {
                        statusColor = "text-red-400";
                        barColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
                        statusLabel = "Crítico: Manutenção Recomendada";
                      }

                      return (
                        <div key={cp.id} className="bg-[#14161b]/60 border border-white/5 p-5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <div className={cn(
                                "p-2.5 rounded-xl border shrink-0 mt-0.5",
                                percent >= 95 ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                percent >= 80 ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              )}>
                                <cp.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">{cp.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{cp.desc}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">Ciclo</span>
                              <span className="text-xs font-bold text-white font-mono">{Math.floor(currentVal)} / {cp.interval}h</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="w-full h-1.5 bg-[#14161b] border border-white/5 rounded-full overflow-hidden">
                              <div className={cn("h-full transition-all duration-500 rounded-full", barColor)} style={{ width: `${percent}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                              <span className={statusColor}>{statusLabel}</span>
                              <span className="text-slate-500 font-mono">{percent}%</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setMaintPrinterId(printer.id);
                                setMaintForm({
                                  description: `Manutenção Preventiva: ${cp.title}`,
                                  cost: 0,
                                  date: new Date().toISOString().split('T')[0]
                                });
                                setShowMaintModal(true);
                              }}
                              className={cn(
                                "px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                percent >= 95 ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black hover:border-transparent" :
                                percent >= 80 ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-transparent" :
                                "bg-[#14161b] border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                              )}
                            >
                              Registrar Preventiva
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODAL: NOVA / EDITAR IMPRESSORA */}
      {showPrinterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {isEditing ? "Editar Impressora" : "Nova Impressora"}
              </h2>
              <button onClick={() => setShowPrinterModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSavePrinter} className="p-6 space-y-5">
              {/* STATUS MACHINE TOGGLE */}
              <div className="bg-[#14161b] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg border",
                    printerForm.status === 'OPERATIONAL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Status da Máquina</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                      {printerForm.status === 'OPERATIONAL' ? 'Máquina Operacional' : 'Em Manutenção'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrinterForm(prev => ({ ...prev, status: prev.status === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL' }))}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300 relative border border-white/10",
                    printerForm.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-slate-700'
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow",
                    printerForm.status === 'OPERATIONAL' ? 'translate-x-6' : 'translate-x-0'
                  )}></div>
                </button>
              </div>

              {/* NOME (APELIDO) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome (Apelido)</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: H1, Ender-3, etc."
                  value={printerForm.name}
                  onChange={e => setPrinterForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold"
                />
              </div>

              {/* MODELO / TECNOLOGIA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modelo</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: H1 Combo"
                    value={printerForm.model}
                    onChange={e => setPrinterForm(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tecnologia</label>
                  <select
                    value={printerForm.type}
                    onChange={e => setPrinterForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold"
                  >
                    <option value="FDM">FDM</option>
                    <option value="SLA">SLA (Resina)</option>
                    <option value="SLS">SLS</option>
                  </select>
                </div>
              </div>

              {/* PREÇO / VIDA ÚTIL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">$</span>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={printerForm.price}
                      onChange={e => setPrinterForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-[#14161b] border border-white/5 rounded-xl pl-8 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vida Útil (h)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="number"
                      required
                      min="1"
                      value={printerForm.lifespan}
                      onChange={e => setPrinterForm(prev => ({ ...prev, lifespan: parseInt(e.target.value) || 5000 }))}
                      className="w-full bg-[#14161b] border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* CONSUMO (W) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consumo (W)</label>
                <input 
                  type="number"
                  required
                  min="0"
                  value={printerForm.powerW}
                  onChange={e => setPrinterForm(prev => ({ ...prev, powerW: parseInt(e.target.value) || 250 }))}
                  className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold font-mono"
                />
              </div>

              {/* INFO BOX */}
              <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-xl flex items-start gap-3">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider leading-relaxed">
                  Depreciação calculada automaticamente baseada no preço de compra e vida útil.
                </span>
              </div>

              {/* SUBMIT */}
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg mt-2">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MANUTENÇÃO */}
      {showMaintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Registrar Manutenção
              </h2>
              <button onClick={() => setShowMaintModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveMaint} className="p-6 space-y-5">
              {/* DESCRIÇÃO DA FALHA / MANUTENÇÃO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição da Manutenção</label>
                <textarea 
                  required
                  placeholder="Ex: Troca de bico 0.4mm, troca de correia, lubrificação do eixo Z..."
                  rows={3}
                  value={maintForm.description}
                  onChange={e => setMaintForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold resize-none"
                />
              </div>

              {/* CUSTO (R$) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custo do Conserto (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">$</span>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={maintForm.cost}
                    onChange={e => setMaintForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[#14161b] border border-white/5 rounded-xl pl-8 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold font-mono"
                  />
                </div>
              </div>

              {/* DATA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</label>
                <input 
                  type="date"
                  required
                  value={maintForm.date}
                  onChange={e => setMaintForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:border-cyan-500 transition-all font-semibold font-mono"
                />
              </div>

              {/* INFO BOX */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider leading-relaxed">
                  Ao registrar esta manutenção, a impressora mudará automaticamente para o status de "Em Manutenção".
                </span>
              </div>

              {/* SUBMIT */}
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg mt-2">
                Salvar Manutenção
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
