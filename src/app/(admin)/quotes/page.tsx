"use client"

import { useState, useEffect, useCallback, Suspense } from "react";
import { Plus, Calculator, Send, FileText, Settings2, Box, Zap, Clock, DollarSign, Upload, Link as LinkIcon, Image as ImageIcon, Check, CheckCircle2, Trash2, History, Inbox, CalendarClock, FilePlus, X, MessageCircle, Heart, ArrowRight, RotateCcw, AlertTriangle, Sparkles, BellRing, ChevronDown, ChevronUp, User, LayoutGrid, List, Phone, Droplets, Monitor, Search, MoreHorizontal, ExternalLink, Globe, Info, Target, TrendingUp, ShieldCheck } from "lucide-react";
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

  const [customerName, setCustomerName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [chargedPrice, setChargedPrice] = useState<string>("");
  const [markupPercent, setMarkupPercent] = useState("150");

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  
  // Parâmetros de Custo (Poderiam vir de Config)
  const [printerWatts, setPrinterWatts] = useState("300");
  const [kwhCost, setKwhCost] = useState("1.32");
  const [depreciationHour, setDepreciationHour] = useState("0.50");

  const [metrics, setMetrics] = useState({ materialCost: 0, powerCost: 0, depreciationCost: 0, totalCost: 0 });

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
      if (Array.isArray(requestsList)) setRequests(requestsList);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    let matCost = 0;
    const mat = materials.find(m => m.id === selectedMaterialId);
    if (mat && parseFloat(weightGrams) > 0) {
      const costPerGram = mat.costPerUnit > 10 ? mat.costPerUnit / 1000 : mat.costPerUnit;
      matCost = costPerGram * parseFloat(weightGrams);
    }
    
    const totalMinutes = (parseFloat(printHours) || 0) * 60 + (parseFloat(printMinutes) || 0);
    const totalHours = totalMinutes / 60;
    
    const powerCost = (parseFloat(printerWatts) / 1000) * totalHours * parseFloat(kwhCost);
    const depreciationCost = totalHours * parseFloat(depreciationHour);
    
    const baseCost = matCost + powerCost + depreciationCost;
    setMetrics({ materialCost: matCost, powerCost, depreciationCost, totalCost: baseCost });
  }, [materials, selectedMaterialId, weightGrams, printHours, printMinutes, printerWatts, kwhCost, depreciationHour]);

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
    if (metrics.totalCost > 0 && (!chargedPrice || chargedPrice === "0.00" || chargedPrice === "")) {
       const initialPrice = metrics.totalCost * (1 + (parseFloat(markupPercent) / 100));
       setChargedPrice(initialPrice.toFixed(2));
    }
  }, [metrics.totalCost, markupPercent]);

  const handleUseRequest = (req: QuoteRequest) => {
    setCustomerName(req.clientName); setProjectName(req.projectName);
    setNotes(`Descrição: ${req.description}\nFinalidade: ${req.purpose || 'Industrial'}`);
    setIsAddingMode(true);
  };

  const handleApproveToProduction = async () => {
    if (!customerName || !projectName) return alert("Dados insuficientes.");
    try {
      const res = await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerContact: "", type: 'CUSTOM', status: 'PENDING',
          totalAmount: parseFloat(chargedPrice),
          notes: `${projectName}\n\n${notes}`,
          weightGrams: parseFloat(weightGrams),
          materialId: selectedMaterialId,
          items: [] 
        })
      });
      if (res.ok) { alert("Pedido enviado para a produção!"); setIsAddingMode(false); }
    } catch (e) { console.error(e); }
  };

  const generateWhatsAppQuote = () => {
    if (!customerName || !projectName) return alert("Dados insuficientes.");
    const finalValue = parseFloat(chargedPrice) || 0;
    let text = `*Orçamento SAMMY 3D* 🚀\n\nOlá *${customerName}*! Ficou pronto o orçamento para o projeto *${projectName}*.\n\n✅ *Valor Total:* R$ ${finalValue.toFixed(2)}\n⚙️ *Material:* ${materials.find(m => m.id === selectedMaterialId)?.name || 'Premium'}\n⏳ *Tempo Estimado:* ${printHours}h ${printMinutes}m\n\nPodemos iniciar a produção?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredRequests = requests.filter(r => r.status === inboxTab);

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
               <Calculator className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">Centro de Precificação</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gere orçamentos precisos baseados em custos reais</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            {!isAddingMode ? (
              <div className="flex bg-[#14161b] border border-white/5 rounded-xl p-1 shadow-inner">
                 <button onClick={() => setInboxTab('PENDING')} className={cn("px-6 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest", inboxTab === 'PENDING' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-500 hover:text-white")}>Solicitações</button>
                 <button onClick={() => setInboxTab('RESPONDED')} className={cn("px-6 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest", inboxTab === 'RESPONDED' ? "bg-cyan-500 text-black shadow-lg" : "text-slate-500 hover:text-white")}>Atendidos</button>
              </div>
            ) : null}
            <button 
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={cn(
                "h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg",
                isAddingMode ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : "bg-cyan-500 text-black border-cyan-400 hover:bg-cyan-400"
              )}
            >
              {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isAddingMode ? "Cancelar" : "Novo Orçamento"}
            </button>
         </div>
      </div>

      {!isAddingMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
           {filteredRequests.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-[#1a1d24] rounded-3xl border border-white/5 border-dashed">
                <Inbox className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Nenhuma solicitação pendente</p>
              </div>
           ) : filteredRequests.map(req => (
              <div key={req.id} onClick={() => handleUseRequest(req)} className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all group cursor-pointer relative overflow-hidden">
                 <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#14161b] border border-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-inner">
                       <FileText className="h-5 w-5" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors uppercase leading-tight">{req.projectName}</h4>
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{req.clientName}</span>
                    </div>
                 </div>
                 <p className="text-xs text-slate-400 line-clamp-2 mb-8 font-medium leading-relaxed">{req.description}</p>
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                       <CalendarClock className="h-3 w-3" />
                       <span className="text-[10px] font-bold font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                 </div>
              </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in slide-in-from-bottom-6 duration-700">
           
           {/* FORMULÁRIO */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Settings2 className="w-32 h-32 text-white" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
                          <User className="h-3 w-3 text-cyan-500" /> Identificação do Cliente
                       </label>
                       <input type="text" placeholder="Nome ou Empresa..." className="w-full bg-[#14161b] border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all placeholder:text-slate-700" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
                          <Target className="h-3 w-3 text-cyan-500" /> Nome do Projeto
                       </label>
                       <input type="text" placeholder="Ex: Action Figure V3..." className="w-full bg-[#14161b] border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all placeholder:text-slate-700" value={projectName} onChange={e=>setProjectName(e.target.value)} />
                    </div>
                 </div>

                 <div className="bg-[#14161b] rounded-[2rem] p-10 border border-white/5 space-y-10 shadow-inner">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                          <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Parâmetros Técnicos</span>
                       </div>
                       <Sparkles className="h-4 w-4 text-cyan-500/40" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block pl-1">Filamento Utilizado</label>
                          <div className="relative">
                             <select className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl px-6 py-5 text-xs font-black text-white appearance-none cursor-pointer outline-none focus:border-cyan-500 transition-all" value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)}>
                                <option value="">ESCOLHER MATERIAL</option>
                                {materials.map(m => <option key={m.id} value={m.id} className="bg-[#14161b]">{m.name.toUpperCase()} ({m.color})</option>)}
                             </select>
                             <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block pl-1">Massa da Peça (g)</label>
                          <div className="relative group">
                             <input type="number" className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl px-6 py-5 text-2xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all group-hover:border-white/20" value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                             <Box className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block pl-1">Tempo Impressão</label>
                          <div className="flex gap-3">
                             <div className="relative flex-1">
                                <input type="number" placeholder="H" className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl py-5 text-2xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all" value={printHours} onChange={e=>setPrintHours(e.target.value)} />
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-600">HORAS</span>
                             </div>
                             <div className="relative flex-1">
                                <input type="number" placeholder="M" className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl py-5 text-2xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500 transition-all" value={printMinutes} onChange={e=>setPrintMinutes(e.target.value)} />
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-600">MINS</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-10 space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Observações do Pedido</label>
                    <textarea placeholder="Detalhes técnicos, cor específica, urgência..." className="w-full bg-[#14161b] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold text-white min-h-[120px] outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700 resize-none" value={notes} onChange={e=>setNotes(e.target.value)} />
                 </div>
              </div>
           </div>

           {/* SIDEBAR FINANCEIRA */}
           <div className="lg:col-span-4 space-y-6 sticky top-24">
              
              {/* DETALHAMENTO DE CUSTOS */}
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-10 relative overflow-hidden">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Estrutura de Custos</h5>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center group">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block group-hover:text-slate-400 transition-colors">Matéria-Prima</span>
                          <span className="text-[10px] text-slate-600 font-bold block italic">Filamento Bruto</span>
                       </div>
                       <span className="font-mono text-white text-lg font-black">R$ {metrics.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block group-hover:text-slate-400 transition-colors">Energia Elétrica</span>
                          <span className="text-[10px] text-slate-600 font-bold block italic">{printerWatts}W @ R${kwhCost}</span>
                       </div>
                       <span className="font-mono text-white text-lg font-black">R$ {metrics.powerCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block group-hover:text-slate-400 transition-colors">Depreciação Máquina</span>
                          <span className="text-[10px] text-slate-600 font-bold block italic">Manutenção e Wear</span>
                       </div>
                       <span className="font-mono text-white text-lg font-black">R$ {metrics.depreciationCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center bg-cyan-500/5 -mx-10 px-10 py-4">
                       <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Custo Total Fabricação</span>
                       <span className="font-mono text-cyan-400 text-xl font-black">R$ {metrics.totalCost.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="bg-[#14161b] p-8 rounded-[1.5rem] border border-white/5 text-center shadow-inner relative group">
                    <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.02] transition-colors rounded-[1.5rem]"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Markup (Lucro %)</p>
                    <div className="flex items-center justify-center gap-4">
                       <input type="number" className="bg-transparent text-5xl font-black text-white outline-none text-center tracking-tighter w-full" value={markupPercent} onChange={e=>handleMarkupChange(e.target.value)} />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-white/10 text-right space-y-2">
                    <div className="flex items-center justify-end gap-2 text-emerald-400 mb-2">
                       <ShieldCheck className="h-3 w-3" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Valor de Venda Sugerido</span>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                       <span className="text-3xl font-black text-white opacity-20">R$</span>
                       <input type="number" step="0.01" className="w-full max-w-[220px] bg-transparent text-right text-7xl font-black text-emerald-400 tracking-tighter outline-none focus:text-emerald-300 transition-colors drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]" value={chargedPrice} onChange={e=>handlePriceChange(e.target.value)} />
                    </div>
                 </div>

                 <div className="space-y-4 pt-10">
                    <button onClick={generateWhatsAppQuote} className="w-full bg-emerald-500 text-black h-16 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/10 group">
                       <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" /> Enviar WhatsApp
                    </button>
                    
                    <button onClick={handleApproveToProduction} className="w-full bg-cyan-500 text-black h-20 rounded-[1.2rem] text-[13px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-cyan-500/20 group">
                       <CheckCircle2 className="h-6 w-6 group-hover:rotate-12 transition-transform" /> Iniciar Produção
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent animate-spin rounded-full"></div></div>}>
      <QuotesContent />
    </Suspense>
  );
}
