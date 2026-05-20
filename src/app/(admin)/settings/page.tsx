"use client"

import { 
  Settings, 
  Building, 
  FileText, 
  Calculator, 
  Save, 
  ShieldCheck, 
  Store, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal' | 'integracoes'>('geral');
  
  // Estados para Integração da Shopee
  const [partnerId, setPartnerId] = useState("");
  const [partnerKey, setPartnerKey] = useState("");
  const [isSandbox, setIsSandbox] = useState(true);
  const [shopId, setShopId] = useState("");
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [savingConfigs, setSavingConfigs] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Estados para alertas de retorno do OAuth
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Carrega configurações ao carregar a página
  useEffect(() => {
    async function loadConfigs() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const configs = data.data || {};
          
          setPartnerId(configs["shopee_partner_id"] || "");
          setPartnerKey(configs["shopee_partner_key"] || "");
          setIsSandbox(configs["shopee_sandbox"] === "true");
          setShopId(configs["shopee_shop_id"] || "");
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      } finally {
        setLoadingConfigs(false);
      }
    }
    loadConfigs();
    
    // Define a URL do webhook baseada no host atual
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/shopee/webhook`);
      
      // Trata os retornos de sucesso/erro da Shopee passados pela URL de callback
      const params = new URLSearchParams(window.location.search);
      const success = params.get("shopee_success");
      const error = params.get("shopee_error");
      const errorMessage = params.get("message");

      if (success === "true") {
        setToast({
          type: 'success',
          message: 'Sua loja da Shopee foi conectada com sucesso em tempo real!'
        });
        setActiveTab('integracoes');
        // Limpa os query parameters da URL de forma elegante sem recarregar a página
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        setToast({
          type: 'error',
          message: errorMessage || 'Falha ao autorizar sua loja com a Shopee. Verifique suas credenciais.'
        });
        setActiveTab('integracoes');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSaveShopeeConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfigs(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopee_partner_id: partnerId.trim(),
          shopee_partner_key: partnerKey.trim(),
          shopee_sandbox: isSandbox ? "true" : "false",
          app_url: window.location.origin
        })
      });

      if (res.ok) {
        setToast({
          type: 'success',
          message: 'Configurações de integração salvas com sucesso!'
        });
      } else {
        throw new Error("Erro ao salvar");
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Erro ao salvar as credenciais no banco de dados.'
      });
    } finally {
      setSavingConfigs(false);
    }
  };

  const handleDisconnectShopee = async () => {
    if (!confirm("Tem certeza que deseja desconectar sua loja da Shopee? Os pedidos não serão mais sincronizados em tempo real.")) {
      return;
    }
    setSavingConfigs(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopee_shop_id: "",
          shopee_access_token: "",
          shopee_refresh_token: "",
          shopee_token_expires_at: ""
        })
      });

      if (res.ok) {
        setShopId("");
        setToast({
          type: 'success',
          message: 'Loja Shopee desconectada com sucesso!'
        });
      } else {
        throw new Error("Erro ao desconectar");
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Erro ao desconectar loja.'
      });
    } finally {
      setSavingConfigs(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20 select-none animate-in fade-in duration-500">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#14161b] border-emerald-500/20 text-emerald-400' 
            : 'bg-[#14161b] border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-pulse" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
          )}
          <div className="text-xs font-black tracking-tight">{toast.message}</div>
          <button onClick={() => setToast(null)} className="ml-3 text-slate-500 hover:text-white font-bold text-xs uppercase">Fechar</button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Settings className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Configurações</h1>
         </div>
         
         {/* TABS */}
         <div className="flex items-center gap-6 border-b border-white/5 pb-0">
            <button 
              onClick={() => setActiveTab('geral')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'geral' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              Geral & Empresa
              {activeTab === 'geral' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('fiscal')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'fiscal' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              <ShieldCheck className="h-4 w-4" />
              Emissor Fiscal
              {activeTab === 'fiscal' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('integracoes')}
              className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'integracoes' ? 'text-[#FF4500]' : 'text-slate-400 hover:text-white'}`}
            >
              <Store className="h-4 w-4" />
              Integrações
              {activeTab === 'integracoes' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF4500] rounded-t-full"></div>
              )}
            </button>
         </div>
      </div>

      {activeTab === 'geral' && (
        <div className="max-w-4xl space-y-6">
          
          {/* EMPRESA CARD */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-6">
                <Building className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Dados da sua Empresa</h2>
             </div>

             <div className="flex flex-col md:flex-row gap-8">
                {/* LOGO UPLOAD */}
                <div className="flex flex-col items-center gap-3">
                   <div className="w-40 h-40 bg-[#14161b] border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors group overflow-hidden relative">
                      {/* Custom CSS Kitty Logo (Large) */}
                      <div className="relative w-24 h-24 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
                         <div className="absolute -top-2 -left-2 w-8 h-8 bg-cyan-400 rotate-[-15deg] rounded-sm"></div>
                         <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-400 rotate-[15deg] rounded-sm"></div>
                         <div className="w-full h-full bg-cyan-400 rounded-2xl relative z-10 flex flex-col items-center justify-center border-4 border-black/10">
                            <div className="absolute -top-8 w-12 h-8 flex gap-1 items-end">
                               <div className="w-3 h-4 bg-amber-400 rounded-t-sm"></div>
                               <div className="w-3 h-6 bg-amber-400 rounded-t-sm"></div>
                               <div className="w-3 h-4 bg-amber-400 rounded-t-sm"></div>
                            </div>
                            <div className="flex gap-4 mb-2">
                               <div className="text-xl font-black text-black select-none leading-none">X</div>
                               <div className="text-xl font-black text-black select-none leading-none">X</div>
                            </div>
                            <div className="w-6 h-2 border-b-4 border-black/30 rounded-full"></div>
                         </div>
                      </div>
                   </div>
                   <span className="text-[10px] font-medium text-slate-500">Clique para alterar (Max 2MB)</span>
                </div>

                {/* FORM FIELDS */}
                <div className="flex-1 space-y-4">
                   <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nome da Empresa / Fantasia</label>
                      <input type="text" defaultValue="SAMMY3D" className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">CPF / CNPJ (Visual)</label>
                         <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                      </div>
                      <div>
                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Telefone</label>
                         <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                      </div>
                   </div>

                   <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">E-mail de Contato</label>
                      <input type="email" className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                   </div>

                   <div>
                      <label className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                        Chave PIX
                      </label>
                      <div className="flex gap-2">
                         <select className="w-1/3 bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                            <option>Telefone</option>
                            <option>CPF/CNPJ</option>
                            <option>E-mail</option>
                            <option>Aleatória</option>
                         </select>
                         <input type="text" defaultValue="75991162829" className="flex-1 bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors font-mono" />
                      </div>
                   </div>

                   <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Endereço Completo</label>
                      <input type="text" className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                   </div>
                </div>
             </div>
          </div>

          {/* ORÇAMENTO CARD */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Configurações de Orçamento</h2>
             </div>
             
             <div className="space-y-4">
                <div className="w-full md:w-1/2">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Validade Padrão do Orçamento</label>
                   <select className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors">
                      <option>7 dias</option>
                      <option>15 dias</option>
                      <option>30 dias</option>
                   </select>
                </div>
                
                <div>
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Termos e Condições (Rodapé do PDF)</label>
                   <textarea 
                     rows={3} 
                     placeholder="Ex: Pagamento 50% na entrada. Prazo de entrega a combinar..."
                     className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors resize-none" 
                   />
                   <p className="text-[10px] text-slate-500 mt-2 font-medium">Este texto aparecerá automaticamente em todos os novos orçamentos gerados.</p>
                </div>
             </div>
          </div>

          {/* PARÂMETROS CARD */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-6">
                <Calculator className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Parâmetros de Cálculo</h2>
             </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Tarifa de Energia (R$/kWh)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">R$</span>
                       <input type="text" defaultValue="1,32" className="w-full bg-[#14161b] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Taxa de Embalagem (R$)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">R$</span>
                       <input type="text" defaultValue="1,50" className="w-full bg-[#14161b] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                 </div>

                 <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                       Taxa de Falha
                       <div className="text-amber-500" title="Estimativa de falha média em impressões">⚠️</div>
                    </label>
                    <div className="relative">
                       <input type="text" defaultValue="5" className="w-full bg-[#14161b] border border-white/5 rounded-lg pl-4 pr-8 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">%</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Margem Lucro (%)</label>
                    <div className="relative">
                       <input type="text" defaultValue="100" className="w-full bg-[#14161b] border border-white/5 rounded-lg pl-4 pr-8 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">%</span>
                    </div>
                 </div>
              </div>
          </div>

          <div className="flex justify-end pt-4">
             <button className="bg-emerald-500 text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
               <Save className="h-4 w-4" />
               Salvar Tudo
             </button>
          </div>
        </div>
      )}

      {activeTab === 'fiscal' && (
        <div className="max-w-4xl bg-[#1a1d24] border border-white/5 rounded-2xl p-8 text-center shadow-lg">
          <ShieldCheck className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Emissor de Notas Fiscais</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Emita Notas Fiscais de Produto (NF-e) ou de Serviço (NFS-e) diretamente a partir de suas vendas faturadas no SAMMY3D.</p>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">Configurar Certificado Digital</button>
        </div>
      )}

      {activeTab === 'integracoes' && (
        <div className="max-w-4xl space-y-6">
          
          {/* STATUS DE CONEXÃO CARD */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
             {shopId && <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 blur-[50px] pointer-events-none" />}
             {!shopId && <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FF4500]/5 blur-[50px] pointer-events-none" />}
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#FF4500]/10 rounded-2xl flex items-center justify-center border border-[#FF4500]/20">
                      <Store className="h-6 w-6 text-[#FF4500]" />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        Integração Shopee
                        {shopId ? (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Ativa</span>
                        ) : (
                          <span className="bg-slate-500/10 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">Inativa</span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-bold">Importação e sincronização automática de pedidos e estoque em tempo real.</p>
                   </div>
                </div>

                {shopId ? (
                  <button 
                    onClick={handleDisconnectShopee}
                    className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Desconectar Loja
                  </button>
                ) : (
                  <a 
                    href="/api/shopee/auth"
                    className={`bg-[#FF4500] hover:bg-[#ff5d20] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#FF4500]/20 active:scale-95 ${
                      !partnerId || !partnerKey ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    Conectar Loja Shopee <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
             </div>

             {shopId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#14161b] border border-white/5 rounded-2xl p-5">
                   <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ID da Loja Integrada</div>
                      <div className="text-sm font-mono font-black text-white">{shopId}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Modo de Operação</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${isSandbox ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        {isSandbox ? 'Ambiente de Testes (Sandbox)' : 'Ambiente Produção (Live)'}
                      </div>
                   </div>
                </div>
             ) : (
                <div className="bg-[#14161b] border border-dashed border-white/5 rounded-2xl p-8 text-center">
                   <Lock className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                   <h3 className="text-sm font-bold text-white mb-1">Passo 1: Salve suas credenciais de desenvolvedor</h3>
                   <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                     Preencha as credenciais da Shopee Open Platform abaixo, salve-as e clique no botão <strong>"Conectar Loja Shopee"</strong> para fazer o login oficial da sua loja.
                   </p>
                </div>
             )}
          </div>

          {/* CREDENCIAIS FORM */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <Lock className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white tracking-tight">Credenciais da API da Shopee</h2>
             </div>

             {loadingConfigs ? (
                <div className="flex items-center justify-center py-10">
                   <Loader2 className="h-8 w-8 text-[#FF4500] animate-spin" />
                </div>
             ) : (
                <form onSubmit={handleSaveShopeeConfigs} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Partner ID (ID do Parceiro)</label>
                         <input 
                           type="text" 
                           value={partnerId}
                           onChange={(e) => setPartnerId(e.target.value)}
                           placeholder="Ex: 1005602"
                           className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-[#FF4500] transition-colors" 
                           required
                         />
                      </div>
                      <div>
                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Partner Key (Chave do Parceiro)</label>
                         <input 
                           type="password" 
                           value={partnerKey}
                           onChange={(e) => setPartnerKey(e.target.value)}
                           placeholder="••••••••••••••••••••••••••••••••"
                           className="w-full bg-[#14161b] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-[#FF4500] transition-colors" 
                           required
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex items-center gap-3">
                         <button
                           type="button"
                           onClick={() => setIsSandbox(!isSandbox)}
                           className={`w-12 h-6 rounded-full p-1 transition-all ${isSandbox ? 'bg-amber-500' : 'bg-slate-700'}`}
                         >
                           <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isSandbox ? 'translate-x-6' : ''}`}></div>
                         </button>
                         <div>
                            <span className="text-xs font-bold text-white block">Ambiente Sandbox (Testes)</span>
                            <span className="text-[10px] text-slate-500 font-bold block">Desative para conectar com a loja real de produção.</span>
                         </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={savingConfigs}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
                      >
                         {savingConfigs ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                           <Save className="h-4 w-4" />
                         )}
                         Salvar Credenciais
                      </button>
                   </div>
                </form>
             )}
          </div>

          {/* WEBHOOK URL CARD */}
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Configurar URL de Webhook</h2>
             </div>
             
             <p className="text-xs text-slate-400 mb-6 leading-relaxed">
               Para receber as notificações de novos pedidos e atualizações de pagamento em tempo real, copie a URL abaixo e insira no campo <strong>"Webhook URL"</strong> do Console de Desenvolvedor da Shopee (em <em>Console &gt; App Management &gt; Webhook Settings</em>).
             </p>

             <div className="flex items-center gap-3 bg-[#14161b] border border-white/5 rounded-xl p-3">
                <div className="flex-1 font-mono text-xs text-slate-400 select-all truncate px-2">{webhookUrl}</div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                >
                   {copied ? (
                     <>
                       <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado!
                     </>
                   ) : (
                     <>
                       <Copy className="h-3.5 w-3.5" /> Copiar URL
                     </>
                   )}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
