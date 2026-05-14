"use client"

import { useState, useEffect, useCallback } from "react";
import { Plus, Calculator, Send, FileText, Settings2, Box, Zap, Clock, DollarSign, Upload, Link as LinkIcon, Image as ImageIcon, Check, CheckCircle2, Trash2, History, Inbox, CalendarClock, FilePlus, X, MessageCircle, Heart, ArrowRight, RotateCcw, AlertTriangle, Sparkles, BellRing, ChevronDown, ChevronUp, User, LayoutGrid, List, Phone, Droplets, Monitor, Search, MoreHorizontal, ExternalLink, Globe, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material { id: string; name: string; color?: string; costPerUnit: number; totalAmount: number; unitType: string; }
interface QuoteRequest { id: string; clientName: string; clientContact: string; projectName: string; description: string; purpose?: string; dimensions?: string; preferredColor?: string; fileUrl?: string; externalLink?: string; status: string; createdAt: string; }

export default function QuotesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [inboxTab, setInboxTab] = useState<'PENDING' | 'RESPONDED'>('PENDING');
  const [newRequestModal, setNewRequestModal] = useState<QuoteRequest | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [chargedPrice, setChargedPrice] = useState<string>("");
  const [markupPercent, setMarkupPercent] = useState("150");

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  const [printerWatts, setPrinterWatts] = useState("120");
  const [kwhCost, setKwhCost] = useState("0.90");
  const [setupTimeMins, setSetupTimeMins] = useState("15");
  const [laborHourCost, setLaborHourCost] = useState("20.00");

  const [metrics, setMetrics] = useState({ materialCost: 0, powerCost: 0, laborCost: 0, totalCost: 0 });

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [resMat, resReq] = await Promise.all([fetch('/api/materials'), fetch('/api/quote-requests')]);
      const matData = await resMat.json();
      const reqData = await resReq.json();
      if (Array.isArray(matData)) setMaterials(matData);
      if (Array.isArray(reqData)) {
        const currentPending = reqData.filter((r: any) => r.status === 'PENDING');
        const prevPending = requests.filter(r => r.status === 'PENDING');
        if (isSilent && currentPending.length > prevPending.length && prevPending.length > 0) { setNewRequestModal(currentPending[0]); }
        setRequests(reqData);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [requests]);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    let matCost = 0;
    const mat = materials.find(m => m.id === selectedMaterialId);
    if (mat && parseFloat(weightGrams) > 0) {
      const costPerGram = mat.unitType.toLowerCase() === 'kg' ? mat.costPerUnit / (mat.totalAmount * 1000) : mat.costPerUnit / mat.totalAmount;
      matCost = costPerGram * parseFloat(weightGrams);
    }
    const timeMins = (parseFloat(printHours) || 0) * 60 + (parseFloat(printMinutes) || 0);
    const power = ((parseFloat(printerWatts) || 0) / 1000) * (parseFloat(kwhCost) || 0);
    const powCost = (timeMins / 60) * power;
    const labCost = ((parseFloat(setupTimeMins) || 0) / 60) * (parseFloat(laborHourCost) || 0);
    const baseCost = matCost + powCost + labCost;
    setMetrics({ materialCost: matCost, powerCost: powCost, laborCost: labCost, totalCost: baseCost });
  }, [materials, selectedMaterialId, weightGrams, printHours, printMinutes, printerWatts, kwhCost, setupTimeMins, laborHourCost]);

  const handlePriceChange = (value: string) => {
    setChargedPrice(value);
    const newPrice = parseFloat(value) || 0;
    if (metrics.totalCost > 0) {
      const newMarkup = ((newPrice / metrics.totalCost) - 1) * 100;
      setMarkupPercent(newMarkup.toFixed(0));
    }
  };

  const handleMarkupChange = (value: string) => {
    setMarkupPercent(value);
    const newMarkup = parseFloat(value) || 0;
    const newPrice = metrics.totalCost * (1 + (newMarkup / 100));
    setChargedPrice(newPrice.toFixed(2));
  };

  useEffect(() => {
    if (metrics.totalCost > 0 && (!chargedPrice || chargedPrice === "0.00")) {
       const initialPrice = metrics.totalCost * (1 + (parseFloat(markupPercent) / 100));
       setChargedPrice(initialPrice.toFixed(2));
    }
  }, [metrics.totalCost, markupPercent]);

  const handleUseRequest = (req: QuoteRequest) => {
    setCustomerName(req.clientName); setProjectName(req.projectName);
    setNotes(`Descrição: ${req.description}\nFinalidade: ${req.purpose || 'Industrial'}`);
    setIsAddingMode(true); setNewRequestModal(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const archiveRequest = async (id: string) => {
    try {
      await fetch(`/api/quote-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RESPONDED' }) });
      fetchData(true);
    } catch (e) { console.error(e); }
  };

  const handleApproveToProduction = async () => {
    if (!customerName || !projectName) return alert("Dados insuficientes.");
    
    try {
      const res = await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerContact: "", 
          type: 'CUSTOM',
          status: 'PENDING',
          totalAmount: parseFloat(chargedPrice),
          notes: `${projectName}\n\n${notes}`,
          weightGrams: parseFloat(weightGrams),
          materialId: selectedMaterialId,
          items: [] 
        })
      });
      
      if (res.ok) {
        alert("Pedido gerado com sucesso! Redirecionando...");
        const original = requests.find(r => r.projectName === projectName && r.status === 'PENDING');
        if (original) await archiveRequest(original.id);
        setIsAddingMode(false);
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const generateWhatsAppQuote = () => {
    if (!customerName || !projectName) return alert("Dados insuficientes.");
    const finalValue = parseFloat(chargedPrice) || 0;
    let text = `*Orçamento SAMMY 3D* 🚀\n\n*${customerName}*, seu projeto *${projectName}* está em *R$ ${finalValue.toFixed(2)}*.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    const original = requests.find(r => r.projectName === projectName && r.status === 'PENDING');
    if (original) archiveRequest(original.id);
  };

  const [viewingRequest, setViewingRequest] = useState<QuoteRequest | null>(null);

  const filteredRequests = requests.filter(r => r.status === inboxTab);

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Calculator className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Orçamentos Online (PRO)</h1>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="flex bg-[#14161b] border border-white/5 rounded-xl p-1 shadow-inner">
               <button onClick={() => setInboxTab('PENDING')} className={cn("px-6 py-2 text-[11px] font-black uppercase rounded-lg transition-all tracking-widest", inboxTab === 'PENDING' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-500 hover:text-white")}>Pendentes</button>
               <button onClick={() => setInboxTab('RESPONDED')} className={cn("px-6 py-2 text-[11px] font-black uppercase rounded-lg transition-all tracking-widest", inboxTab === 'RESPONDED' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-500 hover:text-white")}>Atendidos</button>
            </div>
            <button 
              onClick={() => setIsAddingMode(!isAddingMode)}
              className="bg-[#14161b] text-slate-400 h-11 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border border-white/5"
            >
              {isAddingMode ? <X className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
              {isAddingMode ? "Cancelar" : "Cálculo Manual"}
            </button>
         </div>
      </div>

      <div className="space-y-12">
        
        {!isAddingMode && (
          <div className="space-y-1">
             <div className="flex items-center pb-8 border-b border-white/5 mb-6 gap-6">
                <div className="flex flex-1 items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-16">
                   <div className="flex-1">Projeto / Solicitante</div>
                   <div className="w-[120px] text-center">Status</div>
                   <div className="w-[120px] text-center">Data</div>
                   <div className="w-[80px] text-right">Ficha</div>
                </div>
             </div>

             <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                   <div className="py-24 text-center">
                     <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-30" />
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Nenhum orçamento pendente</p>
                   </div>
                ) : filteredRequests.map(req => (
                   <div 
                     key={req.id} 
                     className="flex items-center px-8 py-6 border border-white/5 rounded-2xl bg-[#1a1d24] hover:border-cyan-500 hover:shadow-lg transition-all group gap-6 cursor-pointer"
                     onClick={() => setViewingRequest(req)}
                   >
                      <div className="w-12 h-12 rounded-xl bg-[#14161b] border border-white/5 text-slate-500 flex items-center justify-center text-xs font-black shadow-inner group-hover:bg-cyan-500 group-hover:text-black transition-all">
                         {req.clientName.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-[16px] font-bold text-white truncate leading-tight flex items-center gap-3">
                            {req.projectName}
                            <Info className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500" />
                         </h4>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Solicitante: {req.clientName}</p>
                      </div>

                      <div className="w-[120px] flex justify-center">
                         <div className={cn(
                            "px-3 py-1 rounded-md text-[9px] font-black border uppercase tracking-widest",
                            req.status === 'PENDING' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse" : "bg-[#14161b] text-slate-500 border-white/5"
                         )}>
                             {req.status === 'PENDING' ? 'Triagem' : 'Atendido'}
                          </div>
                      </div>

                      <div className="w-[120px] text-center">
                         <span className="text-[11px] text-slate-500 font-mono italic group-hover:text-slate-400 transition-colors">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="w-[80px] flex justify-end">
                         <div className="p-3 border border-white/5 rounded-xl bg-[#14161b] group-hover:border-cyan-500 transition-all shadow-sm">
                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {viewingRequest && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setViewingRequest(null)} />
             <div className="relative w-full max-w-xl bg-[#12151c] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/5">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-black flex items-center justify-center text-md font-black shadow-lg">
                        {viewingRequest.clientName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tight text-white uppercase">{viewingRequest.projectName}</h3>
                         <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em]">{viewingRequest.clientName}</p>
                      </div>
                   </div>
                   <button onClick={() => setViewingRequest(null)} className="p-3 bg-[#14161b] border border-white/5 hover:border-white/20 rounded-xl transition-all text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-[#1a1d24] p-5 rounded-2xl border border-white/5 space-y-1 shadow-sm">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">WhatsApp de Contato</span>
                         <p className="text-sm font-mono font-bold text-white flex items-center gap-3 mt-1">
                           <Phone className="h-4 w-4 text-emerald-400" />
                           {viewingRequest.clientContact}
                         </p>
                      </div>
                      <div className="bg-[#1a1d24] p-5 rounded-2xl border border-white/5 space-y-1 shadow-sm">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Cor de Preferência</span>
                         <p className="text-sm font-bold text-white flex items-center gap-3 mt-1">
                           <Droplets className="h-4 w-4 text-cyan-400" />
                           {viewingRequest.preferredColor || 'Padrão SAMMY'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]"><FileText className="h-4 w-4 text-cyan-400" /> Especificações</div>
                      <div className="bg-[#1a1d24] p-8 rounded-2xl border border-white/5 space-y-8 shadow-sm">
                         <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Descrição Detalhada</span>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{viewingRequest.description}</p>
                         </div>
                         {viewingRequest.purpose && (
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Finalidade de Uso</span>
                               <p className="text-sm text-slate-300 leading-relaxed font-medium">{viewingRequest.purpose}</p>
                            </div>
                         )}
                         {viewingRequest.dimensions && (
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Dimensões Estimadas</span>
                               <p className="text-sm font-mono text-cyan-400 font-black tracking-tight">{viewingRequest.dimensions}</p>
                            </div>
                         )}
                      </div>
                   </div>

                   {(viewingRequest.externalLink || viewingRequest.fileUrl) && (
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]"><LinkIcon className="h-4 w-4 text-cyan-400" /> Referências & STL</div>
                         <div className="flex flex-col gap-4">
                            {viewingRequest.externalLink && (
                               <a href={viewingRequest.externalLink} target="_blank" className="flex items-center justify-between p-5 bg-[#1a1d24] border border-white/5 rounded-2xl hover:border-white/10 transition-all group shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shadow-inner"><Globe className="h-5 w-5" /></div>
                                     <span className="text-sm font-bold text-white">Link do Projeto / STL</span>
                                  </div>
                                  <ExternalLink className="h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                               </a>
                            )}
                            {viewingRequest.fileUrl && (
                               <a href={viewingRequest.fileUrl} target="_blank" className="flex items-center justify-between p-5 bg-[#1a1d24] border border-white/5 rounded-2xl hover:border-white/10 transition-all group shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner"><Upload className="h-5 w-5" /></div>
                                     <span className="text-sm font-bold text-white">Anexo de Referência</span>
                                  </div>
                                  <ExternalLink className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                               </a>
                            )}
                         </div>
                      </div>
                   )}
                </div>

                <div className="p-10 border-t border-white/5 bg-[#14161b] flex gap-4">
                   <button 
                     onClick={() => { handleUseRequest(viewingRequest); setViewingRequest(null); }}
                     className="flex-1 bg-cyan-500 text-black h-16 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center gap-4"
                   >
                     <Calculator className="h-5 w-5" /> Iniciar Precificação
                   </button>
                   <button 
                     onClick={() => archiveRequest(viewingRequest.id)}
                     className="px-8 h-16 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:border-white/20 transition-all bg-[#1a1d24]"
                   >
                     <History className="h-6 w-6" />
                   </button>
                </div>
             </div>
          </div>
        )}

        {isAddingMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="lg:col-span-8 flex flex-col gap-10">
                <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-10 space-y-10 shadow-lg">
                   <div className="flex items-center gap-4 pb-8 border-b border-white/5">
                      <div className="p-3 bg-cyan-500 text-black rounded-xl shadow-lg"><FilePlus className="h-5 w-5" /></div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Detalhes do Projeto</h4>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Domínio do Cliente</label>
                         <input type="text" placeholder="Ex: Acme Corp" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Nome do Projeto</label>
                         <input type="text" placeholder="Ex: Engrenagem Drone V2" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600" value={projectName} onChange={e=>setProjectName(e.target.value)} />
                      </div>
                   </div>

                   <div className="bg-[#14161b] p-10 rounded-2xl border border-white/5 space-y-10 shadow-inner">
                      <div className="flex items-center gap-4">
                         <Zap className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                         <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em] italic">Parâmetros de Fabricação</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 pl-1 uppercase tracking-widest">Material Base</label>
                            <select className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-6 py-4 text-sm font-black text-white appearance-none cursor-pointer outline-none focus:border-cyan-500 transition-all" value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)}>
                               <option value="" className="bg-[#14161b]">Selecionar...</option>
                               {materials.map(m => <option key={m.id} value={m.id} className="bg-[#14161b]">{m.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 pl-1 uppercase tracking-widest">Massa (Gramas)</label>
                            <input type="number" className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-6 py-4 text-[18px] font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all" value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 pl-1 uppercase tracking-widest">Tempo Est. (H:M)</label>
                            <div className="flex gap-3">
                               <input type="number" placeholder="H" className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-2 py-4 text-[18px] font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all" value={printHours} onChange={e=>setPrintHours(e.target.value)} />
                               <input type="number" placeholder="M" className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-2 py-4 text-[18px] font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all" value={printMinutes} onChange={e=>setPrintMinutes(e.target.value)} />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Memorial Técnico / Observações</label>
                      <textarea placeholder="Ex: Infill 40%, PETG alta temperatura..." className="w-full bg-[#14161b] border border-white/5 rounded-2xl px-6 py-6 text-sm font-bold text-white min-h-[140px] outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600" value={notes} onChange={e=>setNotes(e.target.value)} />
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
                <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-10 shadow-lg space-y-10">
                   <div className="flex items-center gap-4">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Auditoria Financeira</h5>
                   </div>

                   <div className="space-y-5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                         <span className="uppercase tracking-widest">Matéria-Prima</span>
                         <span className="font-mono text-white text-sm">R$ {metrics.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                         <span className="uppercase tracking-widest">Energia Inb.</span>
                         <span className="font-mono text-white text-sm">R$ {metrics.powerCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-white/5 pb-6">
                         <span className="uppercase tracking-widest">Unidades Trabalho</span>
                         <span className="font-mono text-white text-sm">R$ {metrics.laborCost.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="bg-[#14161b] p-8 rounded-2xl border border-white/5 text-center shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Margem do Projeto (%)</p>
                      <input type="number" className="w-full bg-transparent text-5xl font-black text-white outline-none text-center tracking-tighter" value={markupPercent} onChange={e=>handleMarkupChange(e.target.value)} />
                   </div>

                   <div className="pt-8 border-t border-white/5 text-right space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Liquidação Proposta:</p>
                      <div className="flex items-baseline justify-end gap-3">
                         <span className="text-2xl font-black text-white opacity-20">R$</span>
                         <input type="number" step="0.01" className="w-full max-w-[180px] bg-transparent text-right text-6xl font-black text-emerald-400 tracking-tighter outline-none focus:text-emerald-300 transition-colors drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]" value={chargedPrice} onChange={e=>handlePriceChange(e.target.value)} />
                      </div>
                   </div>

                   <div className="space-y-4 pt-8">
                      <button onClick={generateWhatsAppQuote} className="w-full bg-emerald-500 text-black h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 shadow-lg">
                         <MessageCircle className="h-5 w-5" /> Enviar WhatsApp
                      </button>
                      
                      <button onClick={handleApproveToProduction} className="w-full bg-cyan-500 text-black h-16 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 shadow-lg">
                         <CheckCircle2 className="h-5 w-5" /> Iniciar Produção
                      </button>

                      <button 
                        onClick={async () => {
                          const original = requests.find(r => r.projectName === projectName && r.status === 'PENDING');
                          if (original) await archiveRequest(original.id);
                          setIsAddingMode(false);
                        }}
                        className="w-full bg-[#14161b] border border-white/5 text-slate-500 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-400 hover:border-red-500/20 transition-all"
                      >
                         Arquivar Projeto
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
