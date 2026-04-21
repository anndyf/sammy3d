"use client"

import { useState, useEffect } from "react";
import { Send, Upload, FileText, User, Phone, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PublicQuoteRequestPage() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    projectName: "",
    description: "",
    purpose: "",
    length: "",
    width: "",
    height: "",
    preferredColor: "",
    externalLink: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch('/api/materials');
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data)) setMaterials(data);
      } catch (e) {
        console.error("Failed to load materials", e);
      }
    };
    fetchMaterials();
  }, []);

  const formatPhone = (v: string) => {
    v = v.replace(/\D/g, ""); 
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, clientContact: formatPhone(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let uploadedFileUrl = "";

    try {
      // 1. Upload do Arquivo se existir
      if (file) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        if (upRes.ok) {
          const upJson = await upRes.json();
          uploadedFileUrl = upJson.url;
        }
      }

      // 2. Envio do formulário
      const dimensions = `${formData.length} x ${formData.width} x ${formData.height} cm/mm`;
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dimensions, fileUrl: uploadedFileUrl })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Erro ao enviar solicitação.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-[#00D1FF] selection:text-black">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300 shadow-[0_0_50px_rgba(0,209,255,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Transmissão Concluída</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Seu memorial técnico foi recebido. Nossa engenharia avaliará as camadas do projeto e retornará a telemetria via WhatsApp em breve.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ clientName: "", clientContact: "", projectName: "", description: "", purpose: "", length: "", width: "", height: "", preferredColor: "", externalLink: "" });
              setFile(null);
            }} 
            className="inline-block w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-widest text-[12px]"
          >
            Lançar Novo Projeto
          </button>
          <Link href="/store" className="inline-block w-full py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-[#00D1FF] transition-all">
            Voltar ao Acervo Principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 selection:bg-[#00D1FF] selection:text-black">
      
      {/* HEADER NAV */}
      <div className="h-24 px-6 md:px-10 flex items-center justify-between max-w-[1200px] mx-auto border-b border-white/5">
         <Link href="/store" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:bg-[#00D1FF] transition-all overflow-hidden p-1.5">
               <img src="/logo.png" className="w-full h-full object-contain invert group-hover:invert-0 transition-all" alt="Sammy" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">sammy<span className="text-[#00D1FF]">3d</span></span>
         </Link>
         <Link href="/store" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all">
            Voltar
         </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pt-16">
        <div className="mb-12 text-left flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-full shadow-[0_0_15px_rgba(0,209,255,0.1)]">
             <Package className="w-3.5 h-3.5 text-[#00D1FF]" />
             <span className="text-[9px] font-black text-[#00D1FF] uppercase tracking-[0.2em] pt-0.5">Customizado</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">Engenharia de <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#00D1FF]/50 italic">Orçamento</span></h1>
          <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-lg">Transmita os parâmetros físicos do seu projeto para análise tática e precificação em tempo real.</p>
        </div>

        <div className="bg-[#111111] rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00D1FF]/5 blur-[100px] mix-blend-screen pointer-events-none" />
          
          <div className="bg-white/5 px-8 py-5 border-b border-white/10 flex items-center justify-between relative z-10">
             <span className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.3em]">Protocolo de Especificação</span>
             <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
             </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 relative z-10">
            {/* DADOS DO CLIENTE */}
            <div className="space-y-6">
               <h4 className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] pb-3 border-b border-white/5">
                  <User className="w-4 h-4 text-slate-500" /> 1. Identificação
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome Completo</label>
                   <input required type="text" placeholder="Ex: John Doe" className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-[14px] text-white font-medium placeholder:text-slate-700" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">WhatsApp de Contato</label>
                   <input required type="text" placeholder="(00) 90000-0000" maxLength={15} className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-[14px] text-white font-medium placeholder:text-slate-700" value={formData.clientContact} onChange={handlePhoneChange} />
                 </div>
               </div>
            </div>

            {/* DADOS DO PROJETO */}
            <div className="space-y-6">
               <h4 className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] pb-3 border-b border-white/5 pt-4">
                  <Package className="w-4 h-4 text-slate-500" /> 2. Parâmetros do Projeto
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome da Peça</label>
                   <input required type="text" placeholder="Ex: Suporte para Headset" className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-[14px] text-white font-medium placeholder:text-slate-700" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Finalidade Industrial</label>
                   <select required className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-[13px] text-white font-bold cursor-pointer appearance-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}>
                     <option value="" className="bg-black text-slate-500">Selecionar classificação...</option>
                     <option value="Decorativa (Action Figure, Vaso, etc)" className="bg-black">✨ Decorativa (Estética)</option>
                     <option value="Protótipo Funcional (Teste de encaixe)" className="bg-black">⚙️ Protótipo Mecânico</option>
                     <option value="Peça de Reposição (Uso mecânico)" className="bg-black">🔧 Peça de Reposição</option>
                     <option value="Outros" className="bg-black">📦 Outro Segmento</option>
                   </select>
                 </div>
               </div>

               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Bounding Box (Dimensões Máximas cm/mm)</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5 flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-500 pl-1">Z (Alt.)</span>
                          <input type="text" placeholder="Ex: 10" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-center focus:bg-black focus:border-[#00D1FF] outline-none transition-all font-mono text-white" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
                      </div>
                      <div className="space-y-1.5 flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-500 pl-1">X (Larg.)</span>
                          <input type="text" placeholder="Ex: 5" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-center focus:bg-black focus:border-[#00D1FF] outline-none transition-all font-mono text-white" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                      </div>
                      <div className="space-y-1.5 flex flex-col">
                          <span className="text-[9px] font-black uppercase text-slate-500 pl-1">Y (Prof.)</span>
                          <input type="text" placeholder="Ex: 5" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-center focus:bg-black focus:border-[#00D1FF] outline-none transition-all font-mono text-white" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] pl-1">Polímero Base / Acabamento</label>
                    <select required className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-sm cursor-pointer text-white font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:12px]" value={formData.preferredColor} onChange={e => setFormData({...formData, preferredColor: e.target.value})}>
                      <option value="" className="bg-black text-slate-500">Consultar estoque...</option>
                      {materials.map(m => (
                        <option key={m.id} value={`${m.name} (${m.color || 'Industrial'})`} className="bg-black">
                          {m.type === 'FILAMENT' ? '🧵' : m.type === 'RESIN' ? '🧪' : '📦'} {m.name} - {m.color || 'Bruto'}
                        </option>
                      ))}
                      <option value="Outro (Especificar na descrição)" className="bg-black">💡 Outro (Especificar na descrição)</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* ANEXOS */}
            <div className="space-y-6">
               <h4 className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] pb-3 border-b border-white/5 pt-4">
                  <Upload className="w-4 h-4 text-slate-500" /> 3. Geometria / Assets
               </h4>
               
               <div className="space-y-4">
                 <div className="relative group">
                   <input type="file" accept=".stl,.obj,.zip,.jpg,.jpeg,.png,.webp" className="hidden" id="file-upload" onChange={e => setFile(e.target.files?.[0] || null)} />
                   <label htmlFor="file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-10 bg-black/20 cursor-pointer group-hover:border-[#00D1FF] group-hover:bg-[#00D1FF]/5 transition-all group-active:scale-95 shadow-inner">
                     <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#00D1FF] group-hover:text-black transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                       <Upload className="w-6 h-6" />
                     </div>
                     <span className="text-sm font-bold text-white group-hover:text-[#00D1FF] transition-colors text-center">
                       {file ? file.name : "Anexar Malha 3D (.STL, .OBJ) ou Imagem"}
                     </span>
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2">Max 50MB</span>
                   </label>
                 </div>

                 <div className="relative py-4 flex items-center justify-center">
                   <div className="absolute inset-0 flex items-center w-full"><div className="w-full border-t border-white/5"></div></div>
                   <span className="relative bg-[#111111] px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Ou link de nuvem</span>
                 </div>

                 <input type="url" placeholder="Link (Thingiverse, Printables, Drive)" className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-2xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700" value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} />
               </div>
            </div>

            {/* OBSERVACOES */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Memorial Técnico Opcional</label>
              <textarea rows={4} placeholder="Densidade de preenchimento, espessura de parede especial, acabamento pós-cura..." className="w-full px-5 py-5 bg-black/50 border border-white/10 rounded-3xl focus:bg-black focus:border-[#00D1FF] outline-none transition-all resize-none text-[14px] font-medium text-white placeholder:text-slate-700" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="pt-8 border-t border-white/5">
              <button disabled={loading} type="submit" className="w-full h-16 bg-[#00D1FF] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all active:scale-[0.98] disabled:opacity-50 text-[13px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,209,255,0.3)]">
                {loading ? (isUploading ? "Transferindo dados..." : "Processando rede...") : (
                  <><Send className="w-5 h-5" /> Enviar Para Triagem</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
