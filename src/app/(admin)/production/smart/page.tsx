"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Upload, FileCode2, Clock, Box, DollarSign, Activity, AlertTriangle, CheckCircle2, ChevronRight, Wand2, Sparkles, Layers, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GCodeAnalyzerPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("avg");
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("avg");

  useEffect(() => {
    fetchMaterials();
    fetchPrinters();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      const list = data.data || data;
      if (Array.isArray(list)) setMaterials(list);
    } catch (err) {
      console.error("Erro ao carregar materiais", err);
    }
  };

  const fetchPrinters = async () => {
    try {
      const res = await fetch('/api/printers');
      const data = await res.json();
      if (Array.isArray(data)) setPrinters(data);
    } catch (err) {
      console.error("Erro ao carregar impressoras", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.gcode') || droppedFile.name.endsWith('.stl')) {
        analyzeFile(droppedFile);
      } else {
        alert("Apenas arquivos .gcode ou .stl são permitidos");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      analyzeFile(e.target.files[0]);
    }
  };

  // Re-analisar se o material ou impressora mudar
  useEffect(() => {
    if (file) {
      analyzeFile(file);
    }
  }, [selectedMaterialId, selectedPrinterId]);

  const analyzeFile = async (targetFile: File) => {
    setFile(targetFile);
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('materialId', selectedMaterialId);
      formData.append('printerId', selectedPrinterId);

      const res = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Falha na análise');
      
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao analisar o arquivo. Certifique-se que é um GCODE válido.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateQuote = () => {
    if (!results) return;
    
    // Extrai horas e minutos do formato "Xh Ym"
    const timeMatch = results.metrics.time.match(/(\d+)h\s+(\d+)m/);
    const h = timeMatch ? timeMatch[1] : "0";
    const m = timeMatch ? timeMatch[2] : "0";
    
    // Limpa o peso "128.5g" -> "128.5"
    const weight = results.metrics.weight.replace('g', '');
    
    const params = new URLSearchParams({
      fromGcode: 'true',
      projectName: file?.name || 'Projeto GCode',
      weight,
      hours: h,
      minutes: m,
      materialId: selectedMaterialId
    });

    router.push(`/quotes?${params.toString()}`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto">
      
      {/* HEADER */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-transparent rounded-xl flex relative">
                <Cpu className="h-6 w-6 text-indigo-400" />
                <Sparkles className="h-3 w-3 text-cyan-400 absolute top-2 right-2 animate-pulse" />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                 Analisador .gcode <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">REAL-TIME</span>
               </h1>
               <p className="text-xs text-slate-500 font-bold">Extração inteligente de custos e predição de falhas com IA.</p>
             </div>
          </div>

          {/* SELECTORS */}
          <div className="flex flex-wrap items-center gap-3">
             {/* PRINTER SELECTOR */}
             <div className="flex items-center gap-3 bg-[#1a1d24] border border-white/5 p-2 rounded-xl">
                <Printer className="h-4 w-4 text-cyan-400 ml-2" />
                <select 
                  value={selectedPrinterId}
                  onChange={(e) => setSelectedPrinterId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none border-none pr-8 cursor-pointer"
                >
                  <option value="avg" className="bg-[#1a1d24]">Custo Médio (Impressoras)</option>
                  {printers.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#1a1d24]">
                      {p.name} ({p.model})
                    </option>
                  ))}
                </select>
             </div>

             {/* MATERIAL SELECTOR */}
             <div className="flex items-center gap-3 bg-[#1a1d24] border border-white/5 p-2 rounded-xl">
                <Layers className="h-4 w-4 text-slate-500 ml-2" />
                <select 
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none border-none pr-8 cursor-pointer"
                >
                  <option value="avg" className="bg-[#1a1d24]">Custo Médio (Filamentos)</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#1a1d24]">
                      {m.name} ({m.color}) - R$ {m.costPerUnit.toFixed(2)}/{m.unitType}
                    </option>
                  ))}
                </select>
             </div>
          </div>
       </div>

      {!results && !isAnalyzing && (
        <div 
          className={cn(
            "mt-10 border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center transition-all duration-300",
            isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 bg-[#1a1d24] hover:border-white/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 rounded-2xl bg-[#14161b] flex items-center justify-center border border-white/5 mb-6 shadow-xl relative group">
            <Upload className="h-8 w-8 text-indigo-400 group-hover:-translate-y-1 transition-transform" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">Arraste seu GCODE ou STL</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Nossa Inteligência Artificial vai processar o código para encontrar tempos, pesos exatos, custo final e potenciais falhas de impressão antes mesmo de você ligar a máquina.
          </p>
          <label className="bg-indigo-500 hover:bg-indigo-400 text-black px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
            Selecionar Arquivo
            <input type="file" className="hidden" accept=".gcode,.stl" onChange={handleFileChange} />
          </label>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
           <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                <FileCode2 className="h-10 w-10 animate-pulse" />
              </div>
           </div>
           <h3 className="text-lg font-black text-white tracking-tight mb-2 animate-pulse">Analisando coordenadas X, Y, Z...</h3>
           <p className="text-sm text-slate-500">Calculando extrusão real e varrendo riscos estruturais.</p>
        </div>
      )}

      {results && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          <div className="flex items-center justify-between bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-[#14161b] rounded-xl border border-white/5 text-indigo-400"><FileCode2 className="h-6 w-6" /></div>
                <div>
                   <h3 className="text-sm font-bold text-white">{file?.name || 'arquivo.gcode'}</h3>
                   <p className="text-[10px] text-slate-500 font-mono">{(file?.size ? (file.size / 1024 / 1024).toFixed(2) : '0')} MB</p>
                </div>
             </div>
             <button onClick={() => setResults(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white px-4 py-2 border border-white/5 rounded-lg bg-[#14161b] transition-colors">
               Analisar Outro
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* LEFT: METRICS */}
             <div className="lg:col-span-4 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-2">Telemetria Extraída</h4>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col">
                      <Clock className="h-4 w-4 text-cyan-400 mb-4" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Tempo Est.</span>
                      <span className="text-xl font-black text-white font-mono">{results.metrics.time}</span>
                   </div>
                   <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col">
                      <Box className="h-4 w-4 text-cyan-400 mb-4" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Consumo</span>
                      <span className="text-xl font-black text-white font-mono">{results.metrics.weight}</span>
                   </div>
                   <div className="bg-[#1a1d24] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col">
                      <Activity className="h-4 w-4 text-indigo-400 mb-4" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Camadas</span>
                      <span className="text-xl font-black text-white font-mono">{results.metrics.layers}</span>
                   </div>
                   <div className="bg-[#14161b] border border-emerald-500/20 p-5 rounded-2xl shadow-lg flex flex-col relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                      <DollarSign className="h-4 w-4 text-emerald-400 mb-4 relative z-10" />
                      <span className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 relative z-10">Custo Base</span>
                      <span className="text-xl font-black text-emerald-400 font-mono relative z-10">{results.metrics.cost}</span>
                      
                      {results.metrics.breakdown && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1 relative z-10">
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-500 uppercase">Filamento:</span>
                              <span className="text-slate-300">R$ {results.metrics.breakdown.material}</span>
                           </div>
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-500 uppercase">Energia:</span>
                              <span className="text-slate-300">R$ {results.metrics.breakdown.energy}</span>
                           </div>
                           <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-500 uppercase">Máquina:</span>
                              <span className="text-slate-300">R$ {results.metrics.breakdown.depreciation}</span>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* RIGHT: RELATÓRIO */}
             <div className="lg:col-span-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-2 flex items-center gap-2">
                  <Wand2 className="h-3 w-3 text-indigo-400" /> Relatório de Inteligência
                </h4>

                <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-xl">
                   
                   <div className="flex items-center gap-6 pb-8 border-b border-white/5 mb-8">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                           <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                           <path className="text-indigo-500" strokeDasharray={`${results.ai.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                         </svg>
                         <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-black text-white">{results.ai.score}</span>
                         </div>
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-white">Score de Sucesso Alto</h2>
                         <p className="text-sm text-slate-400 mt-1">O arquivo GCODE apresenta boa estrutura, mas requer atenção em detalhes específicos para garantir 100% de qualidade.</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Avisos e Recomendações</h5>
                      <div className="space-y-3">
                         {results.ai.warnings.length > 0 ? results.ai.warnings.map((w: any, idx: number) => (
                           <div key={idx} className={cn(
                             "p-4 rounded-xl border flex gap-4 items-start",
                             w.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" : "bg-indigo-500/5 border-indigo-500/20"
                           )}>
                              {w.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" /> : <InfoIcon className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />}
                              <p className={cn("text-sm font-medium", w.type === 'warning' ? "text-amber-200" : "text-indigo-200")}>{w.msg}</p>
                           </div>
                         )) : (
                            <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 flex gap-4 items-start">
                               <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                               <p className="text-sm font-medium text-emerald-200">Nenhum risco detectado. O fatiamento parece otimizado para o material selecionado.</p>
                            </div>
                         )}
                      </div>

                      <h5 className="text-[11px] font-black text-white uppercase tracking-widest pt-4 border-t border-white/5">Aprovações Estruturais</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {results.ai.passes.map((p: string, idx: number) => (
                           <div key={idx} className="flex items-center gap-3 bg-[#14161b] border border-white/5 p-3 rounded-lg">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              <span className="text-[12px] text-slate-300 font-medium">{p}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                      <button 
                        onClick={handleGenerateQuote}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white h-14 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        Gerar Orçamento do GCODE <ChevronRight className="h-4 w-4" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
