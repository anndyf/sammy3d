"use client"

import { useState, useEffect, useCallback, Suspense } from "react";
import { Plus, Calculator, Send, FileText, Settings2, Box, Zap, Clock, DollarSign, Upload, Link as LinkIcon, Image as ImageIcon, Check, CheckCircle2, Trash2, History, Inbox, CalendarClock, FilePlus, X, MessageCircle, Heart, ArrowRight, RotateCcw, AlertTriangle, Sparkles, BellRing, ChevronDown, ChevronUp, User, LayoutGrid, List, Phone, Droplets, Monitor, Search, MoreHorizontal, ExternalLink, Globe, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Material { id: string; name: string; color?: string; costPerUnit: number; totalAmount: number; unitType: string; }
interface QuoteRequest { id: string; clientName: string; clientContact: string; projectName: string; description: string; purpose?: string; dimensions?: string; preferredColor?: string; fileUrl?: string; externalLink?: string; status: string; createdAt: string; }

function QuotesContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const fromGcode = searchParams.get('fromGcode');
    if (fromGcode) {
      setProjectName(searchParams.get('projectName') || "");
      setWeightGrams(searchParams.get('weight') || "");
      setPrintHours(searchParams.get('hours') || "");
      setPrintMinutes(searchParams.get('minutes') || "");
      setSelectedMaterialId(searchParams.get('materialId') || "");
      setIsAddingMode(true);
    }
  }, [searchParams]);

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [resMat, resReq] = await Promise.all([fetch('/api/materials'), fetch('/api/quote-requests')]);
      const matData = await resMat.json();
      const reqData = await resReq.json();
      
      const materialsList = matData.data || matData;
      const requestsList = reqData.data || reqData;

      if (Array.isArray(materialsList)) setMaterials(materialsList);
      if (Array.isArray(requestsList)) {
        const currentPending = requestsList.filter((r: any) => r.status === 'PENDING');
        const prevPending = requests.filter(r => r.status === 'PENDING');
        if (isSilent && currentPending.length > prevPending.length && prevPending.length > 0) { setNewRequestModal(currentPending[0]); }
        setRequests(requestsList);
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
      const costPerGram = mat.costPerUnit > 10 ? mat.costPerUnit / 1000 : mat.costPerUnit;
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
  }, [metrics.totalCost, markupPercent, chargedPrice]);

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

  const filteredRequests = requests.filter(r => r.status === inboxTab);

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Calculator className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Orçamentos Online</h1>
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
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
               <div className="py-24 text-center">
                 <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-30" />
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Nenhum orçamento pendente</p>
               </div>
            ) : filteredRequests.map(req => (
               <div key={req.id} className="flex items-center px-8 py-6 border border-white/5 rounded-2xl bg-[#1a1d24] hover:border-cyan-500 transition-all group gap-6 cursor-pointer" onClick={() => handleUseRequest(req)}>
                  <div className="w-12 h-12 rounded-xl bg-[#14161b] border border-white/5 text-slate-500 flex items-center justify-center text-xs font-black shadow-inner group-hover:bg-cyan-500 group-hover:text-black transition-all">
                     {req.clientName.substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[16px] font-bold text-white truncate">{req.projectName}</h4>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{req.clientName}</p>
                  </div>
                  <div className="text-right">
                     <span className="text-[11px] text-slate-500 font-mono italic">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            ))}
          </div>
        )}

        {isAddingMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-8 space-y-10">
                <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-10 space-y-10 shadow-lg">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Cliente</label>
                         <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Projeto</label>
                         <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500" value={projectName} onChange={e=>setProjectName(e.target.value)} />
                      </div>
                   </div>

                   <div className="bg-[#14161b] p-10 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-inner">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</label>
                         <select className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-6 py-4 text-sm font-black text-white outline-none focus:border-cyan-500" value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)}>
                            <option value="">Selecionar...</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Peso (g)</label>
                         <input type="number" className="w-full bg-[#1a1d24] border border-white/5 rounded-xl px-6 py-4 text-[18px] font-black text-cyan-400 text-center outline-none focus:border-cyan-500" value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo (H:M)</label>
                         <div className="flex gap-2">
                           <input type="number" placeholder="H" className="w-1/2 bg-[#1a1d24] border border-white/5 rounded-xl px-4 py-4 text-[18px] font-black text-cyan-400 text-center" value={printHours} onChange={e=>setPrintHours(e.target.value)} />
                           <input type="number" placeholder="M" className="w-1/2 bg-[#1a1d24] border border-white/5 rounded-xl px-4 py-4 text-[18px] font-black text-cyan-400 text-center" value={printMinutes} onChange={e=>setPrintMinutes(e.target.value)} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 sticky top-24 bg-[#1a1d24] border border-white/5 rounded-3xl p-10 shadow-lg space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>CUSTO FILAMENTO</span>
                      <span>R$ {metrics.materialCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-4">
                      <span>ENERGIA + MAQUINA</span>
                      <span>R$ {(metrics.powerCost + metrics.laborCost).toFixed(2)}</span>
                   </div>
                </div>

                <div className="bg-[#14161b] p-8 rounded-2xl border border-white/5 text-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Markup (%)</p>
                   <input type="number" className="w-full bg-transparent text-5xl font-black text-white text-center outline-none" value={markupPercent} onChange={e=>handleMarkupChange(e.target.value)} />
                </div>

                <div className="pt-8 border-t border-white/5 text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Preço Final:</p>
                   <div className="flex items-baseline justify-end gap-3">
                      <span className="text-2xl font-black text-white opacity-20">R$</span>
                      <input type="number" className="w-full max-w-[180px] bg-transparent text-right text-6xl font-black text-emerald-400 outline-none" value={chargedPrice} onChange={e=>handlePriceChange(e.target.value)} />
                   </div>
                </div>

                <div className="space-y-4 pt-8">
                   <button onClick={generateWhatsAppQuote} className="w-full bg-emerald-500 text-black h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-4">
                      <MessageCircle className="h-5 w-5" /> Enviar WhatsApp
                   </button>
                   <button onClick={handleApproveToProduction} className="w-full bg-cyan-500 text-black h-16 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 shadow-lg">
                      <CheckCircle2 className="h-5 w-5" /> Iniciar Produção
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <QuotesContent />
    </Suspense>
  );
}
