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
  const [saveToCatalog, setSaveToCatalog] = useState(false);

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [printHours, setPrintHours] = useState("");
  const [printMinutes, setPrintMinutes] = useState("");
  
  const [printerWatts, setPrinterWatts] = useState("300");
  const [kwhCost, setKwhCost] = useState("1.32");
  const [depreciationHour, setDepreciationHour] = useState("0.50");
  const [packagingCost, setPackagingCost] = useState("1.50");

  const [metrics, setMetrics] = useState({ materialCost: 0, powerCost: 0, depreciationCost: 0, packagingCost: 0, totalCost: 0 });

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

  useEffect(() => { fetchData(); }, [fetchData]);

  // CÁLCULO DE MÉTRICAS (BASE DE TUDO)
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
    const packCost = parseFloat(packagingCost) || 0;

    const baseCost = matCost + powerCost + depreciationCost + packCost;
    
    setMetrics({ materialCost: matCost, powerCost, depreciationCost, packagingCost: packCost, totalCost: baseCost });
  }, [materials, selectedMaterialId, weightGrams, printHours, printMinutes, printerWatts, kwhCost, depreciationHour, packagingCost]);

  // SINCRONIZAR PREÇO COM MARKUP (QUANDO O CUSTO OU MARKUP MUDA)
  useEffect(() => {
    if (metrics.totalCost > 0) {
       const newPrice = metrics.totalCost * (1 + (parseFloat(markupPercent) / 100));
       setChargedPrice(newPrice.toFixed(2));
    }
  }, [metrics.totalCost, markupPercent]);

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
  };

  const handleUseRequest = (req: QuoteRequest) => {
    setCustomerName(req.clientName); setProjectName(req.projectName);
    setNotes(`Descrição: ${req.description}\nFinalidade: ${req.purpose || 'Industrial'}`);
    setIsAddingMode(true);
  };

  const handleApproveToProduction = async () => {
    if (!customerName || !projectName) return alert("Dados insuficientes.");
    try {
      const matName = materials.find(m => m.id === selectedMaterialId)?.name || 'Premium';
      const formattedNotes = `PROJETO: ${projectName}\n` +
                             `⚙️ MATERIAL: ${matName}\n` +
                             `⚖️ PESO: ${weightGrams}g\n` +
                             `⏳ TEMPO: ${printHours}h ${printMinutes}m\n\n` +
                             `📝 OBSERVAÇÕES:\n${notes}`;

      let productId = null;

      if (saveToCatalog) {
        const prodRes = await fetch('/api/products', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectName,
            description: formattedNotes,
            productionTime: (parseInt(printHours) || 0) * 60 + (parseInt(printMinutes) || 0),
            weightGrams: parseFloat(weightGrams) || 0,
            materialId: selectedMaterialId,
            category: 'Personalizado',
            calculatedCost: metrics.totalCost,
            sellingPrice: parseFloat(chargedPrice),
            stockQuantity: 0
          })
        });

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          productId = prodData.id || prodData.data?.id;
        } else {
          const err = await prodRes.json();
          alert(`Erro ao salvar no catálogo: ${err.error || 'Desconhecido'}`);
          return;
        }
      }

      const res = await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, type: 'CUSTOM', status: 'PENDING',
          totalAmount: parseFloat(chargedPrice),
          notes: formattedNotes,
          weightGrams: parseFloat(weightGrams),
          materialId: selectedMaterialId,
          items: productId ? [{
            productId: productId,
            quantity: 1,
            price: parseFloat(chargedPrice),
            customName: projectName
          }] : [] 
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
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Centro de Precificação</h1>
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
            <button onClick={() => setIsAddingMode(!isAddingMode)} className={cn("h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-lg", isAddingMode ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-cyan-500 text-black border-cyan-400")}>
              {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isAddingMode ? "Cancelar" : "Novo Orçamento"}
            </button>
         </div>
      </div>

      {isAddingMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-6 duration-700">
           
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-10 shadow-2xl space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Cliente</label>
                       <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Projeto</label>
                       <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all" value={projectName} onChange={e=>setProjectName(e.target.value)} />
                    </div>
                 </div>

                 <div className="bg-[#14161b] rounded-3xl p-8 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block pl-1">Filamento</label>
                       <select className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl px-5 py-4 text-xs font-black text-white outline-none focus:border-cyan-500 appearance-none" value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)}>
                          <option value="">SELECIONAR...</option>
                          {materials.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()} ({m.color})</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block pl-1">Massa (g)</label>
                       <input type="number" className="w-full bg-[#1a1d24] border border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500" value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block pl-1">Tempo (H:M)</label>
                       <div className="flex gap-2">
                          <input type="number" placeholder="H" className="w-1/2 bg-[#1a1d24] border border-white/10 rounded-2xl py-4 text-xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500" value={printHours} onChange={e=>setPrintHours(e.target.value)} />
                          <input type="number" placeholder="M" className="w-1/2 bg-[#1a1d24] border border-white/10 rounded-2xl py-4 text-xl font-black text-cyan-400 text-center outline-none focus:border-cyan-500" value={printMinutes} onChange={e=>setPrintMinutes(e.target.value)} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Observações do Pedido</label>
                    <textarea className="w-full bg-[#14161b] border border-white/5 rounded-3xl px-6 py-5 text-sm font-bold text-white min-h-[100px] outline-none focus:border-cyan-500 transition-all resize-none" value={notes} onChange={e=>setNotes(e.target.value)} />
                 </div>

                 {/* DETALHAMENTO HORIZONTAL (PEDIDO PELO USUÁRIO) */}
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6 border-t border-white/5">
                    <div className="bg-[#14161b]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Filamento</span>
                       <span className="text-sm font-black text-white">R$ {metrics.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#14161b]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Energia</span>
                       <span className="text-sm font-black text-white">R$ {metrics.powerCost.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#14161b]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Máquina</span>
                       <span className="text-sm font-black text-white">R$ {metrics.depreciationCost.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#14161b]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Embalagem</span>
                       <span className="text-sm font-black text-white">R$ {metrics.packagingCost.toFixed(2)}</span>
                    </div>
                    <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-1">Custo Total</span>
                       <span className="text-sm font-black text-cyan-400 font-mono">R$ {metrics.totalCost.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* SIDEBAR DE VENDA */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-10 shadow-2xl space-y-10">
                 <div className="bg-[#14161b] p-8 rounded-[1.5rem] border border-white/5 text-center shadow-inner relative group">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Markup (Lucro %)</p>
                    <input type="number" className="bg-transparent text-6xl font-black text-white outline-none text-center tracking-tighter w-full" value={markupPercent} onChange={e=>handleMarkupChange(e.target.value)} />
                    <Sparkles className="absolute top-4 right-4 h-3 w-3 text-cyan-500/30" />
                 </div>

                 <div className="text-right space-y-2">
                    <div className="flex items-center justify-end gap-2 text-emerald-400 mb-2">
                       <ShieldCheck className="h-3 w-3" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Valor de Venda Final</span>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                       <span className="text-3xl font-black text-white opacity-20 italic">R$</span>
                       <input type="number" step="0.01" className="w-full max-w-[200px] bg-transparent text-right text-7xl font-black text-emerald-400 tracking-tighter outline-none focus:text-emerald-300 transition-colors" value={chargedPrice} onChange={e=>handlePriceChange(e.target.value)} />
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <label className="flex items-center justify-between bg-[#14161b] p-4 rounded-xl border border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          <Box className="h-4 w-4 text-cyan-400" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Salvar no Catálogo</span>
                       </div>
                       <div className={cn("w-10 h-6 rounded-full p-1 transition-all", saveToCatalog ? "bg-cyan-500" : "bg-white/10")}>
                          <div className={cn("w-4 h-4 bg-white rounded-full transition-all shadow-sm", saveToCatalog ? "translate-x-4" : "translate-x-0")} />
                       </div>
                       <input type="checkbox" className="hidden" checked={saveToCatalog} onChange={e => setSaveToCatalog(e.target.checked)} />
                    </label>

                    <button onClick={generateWhatsAppQuote} className="w-full bg-emerald-500 text-black h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-4">
                       <MessageCircle className="h-5 w-5" /> WhatsApp
                    </button>
                    <button onClick={handleApproveToProduction} className="w-full bg-cyan-500 text-black h-20 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-cyan-500/20">
                       <CheckCircle2 className="h-6 w-6" /> Produzir Peça
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
           {filteredRequests.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-[#1a1d24] rounded-3xl border border-white/5 border-dashed">
                <Inbox className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">Nenhuma solicitação</p>
              </div>
           ) : filteredRequests.map(req => (
              <div key={req.id} onClick={() => handleUseRequest(req)} className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 hover:border-cyan-500 transition-all group cursor-pointer relative">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-black">{req.clientName.substring(0,2).toUpperCase()}</div>
                    <h4 className="text-md font-black text-white uppercase">{req.projectName}</h4>
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-2 mb-6">{req.description}</p>
                 <ArrowRight className="h-4 w-4 text-slate-700 absolute bottom-8 right-8 group-hover:text-cyan-400" />
              </div>
           ))}
        </div>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <QuotesContent />
    </Suspense>
  );
}
