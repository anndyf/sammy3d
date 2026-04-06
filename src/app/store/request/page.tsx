"use client"

import { useState } from "react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h2>
          <p className="text-gray-500 mb-8">
            Recebemos seu pedido de orçamento. Nossa equipe analisará os detalhes e entrará em contato via WhatsApp em breve.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({
                clientName: "", clientContact: "", projectName: "", description: "",
                purpose: "", length: "", width: "", height: "",
                preferredColor: "", externalLink: ""
              });
              setFile(null);
            }} 
            className="inline-block w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all mb-3 shadow-xl"
          >
            Enviar Outro Orçamento
          </button>
          <Link href="/store" className="inline-block w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-black transition-all">
            Ou Voltar para a Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100 animate-in zoom-in duration-700">
             <img src="/logo.png" alt="Sammy3D Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Solicitar Orçamento 3D</h1>
          <p className="text-gray-500 text-lg">Envie os detalhes do seu projeto personalizado e entraremos em contato com o valor estimado.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-black p-6 text-white text-center">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Formulário de Projeto Personalizado</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Seu Nome
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> WhatsApp / Contato
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="(00) 90000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  value={formData.clientContact}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" /> Nome do Projeto / Peça
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Suporte para Headset"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  value={formData.projectName}
                  onChange={e => setFormData({...formData, projectName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Finalidade da Peça
                </label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-sm"
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                >
                  <option value="">Selecione a finalidade...</option>
                  <option value="Decorativa (Action Figure, Vaso, etc)">Decorativa (Action Figure, Vaso, etc)</option>
                  <option value="Protótipo Funcional (Teste de encaixe)">Protótipo Funcional (Teste de encaixe)</option>
                  <option value="Peça de Reposição (Uso mecânico)">Peça de Reposição (Uso mecânico)</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="space-y-8 p-1">
              <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 group">
                 <div className="w-full md:w-1/3 aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:scale-[1.02]">
                    <img src="/box-dimensions.png" alt="Guia de Dimensões" className="w-full h-full object-contain p-4" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <h4 className="text-sm font-bold text-gray-900">Guia de Dimensões Técnicas</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Identifique a <strong>Altura (h)</strong>, <strong>Largura (l)</strong> e <strong>Comprimento (c)</strong> para um orçamento preciso.</p>
                 </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Dimensões Centímetros (cm) ou Milímetros (mm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-300 pl-1">Altura</span>
                      <input type="text" placeholder="Ex: 10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center focus:bg-white focus:border-black outline-none transition-all font-mono" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-300 pl-1">Largura</span>
                      <input type="text" placeholder="Ex: 5" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center focus:bg-white focus:border-black outline-none transition-all font-mono" value={formData.width} onChange={e=>setFormData({...formData, width: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-300 pl-1">Compr.</span>
                      <input type="text" placeholder="Ex: 5" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center focus:bg-white focus:border-black outline-none transition-all font-mono" value={formData.length} onChange={e=>setFormData({...formData, length: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   Cor de Preferência
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Branco, Preto, Bronze..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-sm"
                  value={formData.preferredColor}
                  onChange={e => setFormData({...formData, preferredColor: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" /> Possui o arquivo 3D ou fotos de referência?
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".stl,.obj,.zip,.jpg,.jpeg,.png,.webp"
                  className="hidden" 
                  id="file-upload" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-8 bg-gray-50/50 cursor-pointer group-hover:border-black group-hover:bg-white transition-all group-active:scale-95 shadow-sm"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {file ? file.name : "Clique para anexar arquivo ou fotos"}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Arquivos 3D ou Imagens (JPG, PNG)</span>
                </label>
              </div>

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                  <span className="bg-white px-3">Ou cole um link externo</span>
                </div>
              </div>

              <div className="mt-4">
                <input 
                  type="url" 
                  placeholder="Link do Thingiverse, Printables, Google Drive, etc..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-sm font-medium"
                  value={formData.externalLink}
                  onChange={e => setFormData({...formData, externalLink: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" /> Descrição Adicional (Opcional)
              </label>
              <textarea 
                rows={3}
                placeholder="Descreva detalhes como nível de preenchimento ou se deseja pintura..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all resize-none text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="pt-4">
              <button 
                disabled={loading}
                type="submit" 
                className="w-full py-4 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (isUploading ? "Enviando arquivo..." : "Quase lá...") : (
                  <>
                    <Send className="w-5 h-5" /> Enviar Solicitação
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-4 uppercase tracking-widest leading-relaxed">
                Ao enviar, você autoriza o contato para fins de orçamento. <br/> Nossa equipe retornará em horário comercial.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
