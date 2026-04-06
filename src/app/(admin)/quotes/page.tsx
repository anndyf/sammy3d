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
  }, []);

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
  }, [metrics.totalCost]);

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
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40 relative">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black">Orçamentos Online</h1>
              <p className="text-[14px] text-slate-500">Gerencie solicitações industriais e precificações em tempo real.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-[#FAFAFA] border border-slate-100 rounded-lg p-0.5">
                 <button onClick={() => setInboxTab('PENDING')} className={cn("px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all", inboxTab === 'PENDING' ? "bg-white text-black shadow-sm ring-1 ring-slate-100" : "text-slate-500 hover:text-black")}>Pendentes</button>
                 <button onClick={() => setInboxTab('RESPONDED')} className={cn("px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all", inboxTab === 'RESPONDED' ? "bg-white text-black shadow-sm ring-1 ring-slate-100" : "text-slate-500 hover:text-black")}>Atendidos</button>
              </div>
              <button 
                onClick={() => setIsAddingMode(!isAddingMode)}
                className="bg-black text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isAddingMode ? "Cancelar" : "Cálculo Manual"}
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-12">
        
        {!isAddingMode && (
          <div className="space-y-1">
             {/* HEADER */}
             <div className="flex items-center pb-8 border-b border-slate-100 mb-6 gap-6">
                {/* TABLE HEADER STYLE */}
                <div className="flex flex-1 items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-16">
                   <div className="flex-1">Projeto / Solicitante</div>
                   <div className="w-[120px] text-center">Status</div>
                   <div className="w-[120px] text-center">Data</div>
                   <div className="w-[80px] text-right">Ação</div>
                </div>
             </div>

             <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                   <div className="py-20 text-center text-slate-200 uppercase text-[10px] tracking-widest font-mono italic">Caixa de entrada vazia...</div>
                ) : filteredRequests.map(req => (
                   <div 
                     key={req.id} 
                     className="flex items-center px-6 py-5 border border-slate-100 rounded-xl bg-white hover:border-black transition-all group gap-6 cursor-pointer"
                     onClick={() => setViewingRequest(req)}
                   >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                         {req.clientName.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-[15px] font-bold text-black truncate leading-tight flex items-center gap-2">
                            {req.projectName}
                            <Info className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                         </h4>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Solicitante: {req.clientName}</p>
                      </div>

                      <div className="w-[120px] flex justify-center">
                         <div className={cn(
                           "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                           req.status === 'PENDING' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                            {req.status === 'PENDING' ? 'Triagem' : 'Atendido'}
                         </div>
                      </div>

                      <div className="w-[120px] text-center">
                         <span className="text-[11px] text-slate-300 font-mono italic">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="w-[80px] flex justify-end">
                         <div className="p-2 border border-slate-100 rounded-md group-hover:border-black transition-all">
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-black" />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* VIEWING DRAWER */}
        {viewingRequest && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setViewingRequest(null)} />
             <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-sm font-black shadow-lg">
                        {viewingRequest.clientName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="text-xl font-bold tracking-tight text-black">{viewingRequest.projectName}</h3>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">{viewingRequest.clientName}</p>
                      </div>
                   </div>
                   <button onClick={() => setViewingRequest(null)} className="p-2 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-[#FAFAFA] p-4 rounded-xl border border-slate-100 space-y-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">WhatsApp</span>
                         <p className="text-[14px] font-mono font-bold text-black flex items-center gap-2">
                           <Phone className="h-3.5 w-3.5 text-emerald-500" />
                           {viewingRequest.clientContact}
                         </p>
                      </div>
                      <div className="bg-[#FAFAFA] p-4 rounded-xl border border-slate-100 space-y-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Cor de Preferência</span>
                         <p className="text-[14px] font-bold text-black flex items-center gap-2">
                           <Droplets className="h-3.5 w-3.5 text-blue-500" />
                           {viewingRequest.preferredColor || 'Padrão SAMMY'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest"><FileText className="h-4 w-4" /> Especificações</div>
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                         <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Descrição do Projeto</span>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{viewingRequest.description}</p>
                         </div>
                         {viewingRequest.purpose && (
                            <div>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Finalidade</span>
                               <p className="text-sm text-slate-700 leading-relaxed font-medium">{viewingRequest.purpose}</p>
                            </div>
                         )}
                         {viewingRequest.dimensions && (
                            <div>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Dimensões Estimadas</span>
                               <p className="text-sm font-mono text-slate-700 font-bold">{viewingRequest.dimensions}</p>
                            </div>
                         )}
                      </div>
                   </div>

                   {(viewingRequest.externalLink || viewingRequest.fileUrl) && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest"><LinkIcon className="h-4 w-4" /> Referências & STL</div>
                         <div className="flex flex-col gap-3">
                            {viewingRequest.externalLink && (
                               <a href={viewingRequest.externalLink} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-black transition-all group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                                     <span className="text-sm font-bold text-black">Link do Projeto / STL</span>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-black" />
                               </a>
                            )}
                            {viewingRequest.fileUrl && (
                               <a href={viewingRequest.fileUrl} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-black transition-all group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Upload className="h-4 w-4" /></div>
                                     <span className="text-sm font-bold text-black">Anexo de Referência</span>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-black" />
                               </a>
                            )}
                         </div>
                      </div>
                   )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-[#FAFAFA] flex gap-4">
                   <button 
                     onClick={() => { handleUseRequest(viewingRequest); setViewingRequest(null); }}
                     className="flex-1 bg-black text-white h-14 rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
                   >
                     <Calculator className="h-4 w-4" /> Iniciar Precificação
                   </button>
                   <button 
                     onClick={() => archiveRequest(viewingRequest.id)}
                     className="px-6 h-14 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all bg-white"
                   >
                     <History className="h-5 w-5" />
                   </button>
                </div>
             </div>
          </div>
        )}

        {isAddingMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in slide-in-from-bottom-4 duration-500">
             
             {/* LEFT FORM */}
             <div className="lg:col-span-8 flex flex-col gap-10">
                <div className="bg-white border border-slate-100 rounded-xl p-8 space-y-10 shadow-sm">
                   <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                      <div className="p-2.5 bg-black text-white rounded-lg shadow-sm"><FilePlus className="h-4 w-4" /></div>
                      <h4 className="text-lg font-bold text-black">Detalhes do Projeto</h4>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Domínio do Cliente</label>
                         <input type="text" placeholder="Ex: Acme Corp" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nome do Projeto</label>
                         <input type="text" placeholder="Ex: Engrenagem Drone V2" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" value={projectName} onChange={e=>setProjectName(e.target.value)} />
                      </div>
                   </div>

                   <div className="bg-[#FAFAFA] p-8 rounded-xl border border-slate-100 space-y-8">
                      <div className="flex items-center gap-3">
                         <Zap className="h-4 w-4 text-blue-500" />
                         <span className="text-[12px] font-bold text-blue-500 uppercase tracking-widest italic">Parâmetros de Fabricação</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 pl-1 uppercase">Material Base</label>
                            <select className="w-full bg-white border border-slate-100 rounded-lg px-4 py-3 text-[13px] font-semibold appearance-none cursor-pointer" value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)}>
                               <option value="">Selecionar Material...</option>
                               {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 pl-1 uppercase">Massa (Gramas)</label>
                            <input type="number" className="w-full bg-white border border-slate-100 rounded-lg px-4 py-3 text-[14px] font-bold text-center" value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 pl-1 uppercase">Tempo Est. (H:M)</label>
                            <div className="flex gap-2">
                               <input type="number" placeholder="H" className="w-full bg-white border border-slate-100 rounded-lg px-2 py-3 text-[14px] font-bold text-center" value={printHours} onChange={e=>setPrintHours(e.target.value)} />
                               <input type="number" placeholder="M" className="w-full bg-white border border-slate-100 rounded-lg px-2 py-3 text-[14px] font-bold text-center" value={printMinutes} onChange={e=>setPrintMinutes(e.target.value)} />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1">Memorial Técnico / Observações</label>
                      <textarea placeholder="Ex: Infill 40%, PETG alta temperatura..." className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] min-h-[120px] outline-none focus:bg-white focus:border-black transition-all" value={notes} onChange={e=>setNotes(e.target.value)} />
                   </div>
                </div>
             </div>

             {/* RIGHT SIDEBAR (CUSTO) */}
             <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm space-y-8">
                   <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-black" />
                      <h5 className="text-[13px] font-bold text-black uppercase tracking-widest">Auditoria Financeira</h5>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[13px] text-slate-500">
                         <span>Matéria-Prima</span>
                         <span className="font-mono text-black font-semibold">R$ {metrics.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] text-slate-500">
                         <span>Energia Inb.</span>
                         <span className="font-mono text-black font-semibold">R$ {metrics.powerCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] text-slate-500 border-b border-slate-50 pb-4">
                         <span>Unidades de Trabalho</span>
                         <span className="font-mono text-black font-semibold">R$ {metrics.laborCost.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="bg-[#FAFAFA] p-6 rounded-xl border border-slate-100 text-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Margem do Projeto (%)</p>
                      <input type="number" className="w-full bg-transparent text-4xl font-bold text-black outline-none text-center" value={markupPercent} onChange={e=>handleMarkupChange(e.target.value)} />
                   </div>

                   <div className="pt-6 border-t border-slate-50 text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-4">Liquidação Proposta:</p>
                      <div className="flex items-baseline justify-end gap-2">
                         <span className="text-xl font-bold text-black opacity-30">R$</span>
                         <input type="number" step="0.01" className="w-full max-w-[160px] bg-transparent text-right text-5xl font-bold text-black tracking-tighter outline-none focus:text-blue-600 transition-colors" value={chargedPrice} onChange={e=>handlePriceChange(e.target.value)} />
                      </div>
                   </div>

                   <div className="space-y-3 pt-6">
                      <button onClick={generateWhatsAppQuote} className="w-full bg-[#FAFAFA] border border-slate-200 text-black h-12 rounded-lg text-[13px] font-bold hover:border-black transition-all flex items-center justify-center gap-3">
                         <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
                      </button>
                      
                      <button onClick={handleApproveToProduction} className="w-full bg-black text-white h-14 rounded-xl text-[14px] font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg">
                         <CheckCircle2 className="h-4 w-4" /> Aprovar e Gerar Pedido
                      </button>

                      <button 
                        onClick={async () => {
                          const original = requests.find(r => r.projectName === projectName && r.status === 'PENDING');
                          if (original) await archiveRequest(original.id);
                          setIsAddingMode(false);
                        }}
                        className="w-full bg-white border border-slate-100 text-slate-300 h-10 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:text-red-500 hover:border-red-100 transition-all"
                      >
                         Arquivar (Não Realizado)
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
