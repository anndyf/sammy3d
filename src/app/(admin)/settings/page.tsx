"use client"

import { useState } from "react";
import { Settings, Shield, Globe, ShoppingCart, MessageCircle, Save, Key, Bell, CreditCard, ExternalLink, Command, Smartphone, Zap, Info, ChevronRight, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Business State
  const [businessName, setBusinessName] = useState("Sammy 3D Laboratório");
  const [whatsapp, setWhatsapp] = useState("5575992921020");
  
  // Marketplaces Fees
  const [shopeeFee, setShopeeFee] = useState("14");
  const [shopeeFixed, setShopeeFixed] = useState("5.00");
  const [mlFee, setMlFee] = useState("12");
  const [mlFreeShippingThreshold, setMlFreeShippingThreshold] = useState("79.00");

  const [newPassword, setNewPassword] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
       alert("Configurações sincronizadas com sucesso no núcleo de dados.");
       setLoading(false);
    }, 1200);
  };

  const tabs = [
    { id: 'business', label: 'Identidade', icon: Globe, desc: 'Naming e Branding' },
    { id: 'marketplaces', label: 'Marketplaces', icon: ShoppingCart, desc: 'Taxas e Logística' },
    { id: 'public_store', label: 'Página Pública', icon: ExternalLink, desc: 'Interface do Cliente' },
    { id: 'security', label: 'Segurança', icon: Shield, desc: 'Acesso e Terminais' },
  ];

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-white/5 px-6 py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
                    <Settings className="h-6 w-6 text-white" />
                 </div>
                 <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Central de Operação</h1>
              </div>
              <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.2em]">Configure os parâmetros analíticos e de interface da Sammy 3D.</p>
           </div>
           
           <button 
             onClick={handleSave}
             disabled={loading}
             className="bg-white text-black h-14 px-10 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
           >
             {loading ? <Zap className="h-4 w-4 animate-spin text-blue-600" /> : <Save className="h-4 w-4" />}
             Sincronizar Nodes
           </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-16">
        
        {/* TABS SIDEBAR (INDUSTRIAL GLASS) */}
        <aside className="w-full md:w-[260px] flex flex-col gap-2">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "group flex items-center justify-between px-5 py-4 rounded-2xl transition-all border text-left scale-100 active:scale-95",
                 activeTab === tab.id 
                   ? "bg-white/10 text-white border-white/20 shadow-2xl backdrop-blur-xl" 
                   : "text-slate-500 border-transparent hover:bg-white/5 hover:text-white"
               )}
             >
                <div className="flex items-center gap-4">
                   <tab.icon className={cn("h-5 w-5 transition-all", activeTab === tab.id ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400")} />
                   <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase tracking-widest leading-none mb-1">{tab.label}</span>
                      <span className="text-[9px] font-bold text-slate-600 group-hover:text-slate-500 transition-colors uppercase">{tab.desc}</span>
                   </div>
                </div>
                {activeTab === tab.id && <ChevronRight className="h-4 w-4 text-blue-500 animate-in slide-in-from-left-2" />}
             </button>
           ))}
           
           <div className="mt-12 p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                 <Lock className="h-3 w-3" /> Status do Sistema
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Córtex Online</span>
              </div>
              <div className="pt-2">
                 <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tighter">Versão Industrial v2.4.0</p>
              </div>
           </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 space-y-16 animate-in slide-in-from-right-8 duration-700">
           
           {activeTab === 'business' && (
              <section className="space-y-10">
                 <div className="space-y-2 border-l-2 border-blue-500 pl-6 py-2">
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Branding & Contato</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Defina a identidade corporativa para orçamentos e comunicações.</p>
                 </div>
                 
                 <div className="space-y-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">Nome da operação</label>
                          <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[15px] font-bold text-white outline-none focus:border-blue-500 transition-all shadow-inner" value={businessName} onChange={e=>setBusinessName(e.target.value)} />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-1">API WhatsApp Comercial</label>
                          <div className="relative">
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[15px] font-mono text-white outline-none focus:border-blue-500 transition-all shadow-inner" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
                             <Phone className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-800" />
                          </div>
                       </div>
                    </div>

                    <div className="bg-blue-600/5 p-8 rounded-2xl border border-blue-500/10 space-y-5 shadow-inner">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><Smartphone className="h-5 w-5 text-blue-500" /></div>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest">Sincronização de Marca</p>
                       </div>
                       <p className="text-[13px] text-slate-400 leading-relaxed font-medium">Seu logotipo atual está hospedado em: <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-blue-400 font-mono text-[11px]">/public/logo.png</code>.</p>
                       <button className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-white transition-all border-b border-blue-500/30 pb-1">Substituir Arquivo de Identidade (.PNG)</button>
                    </div>
                 </div>
              </section>
           )}

           {activeTab === 'marketplaces' && (
              <section className="space-y-10">
                 <div className="space-y-2 border-l-2 border-orange-500 pl-6 py-2">
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Marketplaces & Taxas</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Parametrize o cálculo automático de recebimento líquido por canal.</p>
                 </div>

                 <div className="space-y-8">
                    {/* SHOPEE CARD */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-2xl">S</div>
                          <div>
                             <h4 className="text-lg font-black text-white uppercase tracking-tight">Shopee Brasil</h4>
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Canais de varejo em massa</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Percentual Venda (%)</label>
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[22px] font-black text-white outline-none focus:border-orange-500 transition-all text-center" value={shopeeFee} onChange={e=>setShopeeFee(e.target.value)} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Logística Fixa (R$)</label>
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[22px] font-black text-white outline-none focus:border-orange-500 transition-all text-center" value={shopeeFixed} onChange={e=>setShopeeFixed(e.target.value)} />
                          </div>
                       </div>
                    </div>

                    {/* ML CARD */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl group hover:border-yellow-500/30 transition-all shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-3xl rounded-full -mr-16 -mt-16" />
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl shadow-2xl">M</div>
                          <div>
                             <h4 className="text-lg font-black text-white uppercase tracking-tight">Mercado Livre</h4>
                             <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Logística prime e alta escala</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Comissão Média (%)</label>
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[22px] font-black text-white outline-none focus:border-yellow-400 transition-all text-center" value={mlFee} onChange={e=>setMlFee(e.target.value)} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gatilho Frete (R$)</label>
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[22px] font-black text-white outline-none focus:border-yellow-400 transition-all text-center" value={mlFreeShippingThreshold} onChange={e=>setMlFreeShippingThreshold(e.target.value)} />
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
           )}

           {activeTab === 'security' && (
              <section className="space-y-10">
                 <div className="space-y-2 border-l-2 border-red-500 pl-6 py-2">
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Protocolo de Acesso</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Gerencie chaves e terminais de auditoria do sistema.</p>
                 </div>

                 <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Senha Master Atual</label>
                          <div className="relative">
                             <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[15px] text-white outline-none focus:border-red-500 transition-all font-mono shadow-inner" />
                             <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-800 hover:text-white transition-colors">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                             </button>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Nova Chave Criptog.</label>
                          <input type="password" placeholder="Mínimo 8 caracteres" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[15px] text-white outline-none focus:border-emerald-500 transition-all font-mono shadow-inner" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                       </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-red-600/5 border border-red-600/10 flex gap-6 items-start">
                       <div className="p-3 bg-red-600/10 rounded-xl shrink-0"><Lock className="h-6 w-6 text-red-600" /></div>
                       <div className="space-y-2">
                          <p className="text-[12px] font-black text-white uppercase tracking-widest">Protocolo de Segurança Crítico</p>
                          <p className="text-[13px] text-slate-500 leading-relaxed italic">Alterar a chave mestre forçará o <span className="text-red-500 font-bold">LOGOUT IMEDIATO</span> de todos os terminais Sammy 3D ativos em campo. Use com extrema cautela.</p>
                       </div>
                    </div>
                 </div>
              </section>
           )}

           {activeTab === 'public_store' && (
              <section className="space-y-10">
                 <div className="space-y-2 border-l-2 border-emerald-500 pl-6 py-2">
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Página Pública</h3>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Interface de interação direta com o cliente final.</p>
                 </div>

                 <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl space-y-12">
                    <div className="space-y-8">
                       <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-emerald-500" /><span className="text-[11px] font-black text-white uppercase tracking-widest">Banners & Alertas de Site</span></div>
                       <div className="grid grid-cols-1 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Banner Global (Headline)</label>
                             <input type="text" placeholder="Ex: Entrega Expressa para toda Alagoinhas-BA" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[14px] text-white outline-none focus:border-emerald-500" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Título do formulário 3D</label>
                             <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-[14px] text-white outline-none focus:border-emerald-500" defaultValue="Solicitar Orçamento de Engenharia 3D" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 pt-10 border-t border-white/5">
                       <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-emerald-500" /><span className="text-[11px] font-black text-white uppercase tracking-widest">Gates de Serviço</span></div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-emerald-600/5 border border-emerald-600/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-600/10 transition-all">
                             <div className="flex flex-col">
                                <span className="text-[13px] font-black text-white uppercase tracking-tight">Loja Ativa</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase">Acesso Liberado</span>
                             </div>
                             <div className="w-12 h-6 bg-emerald-600 rounded-full flex items-center justify-end px-1.5"><div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg" /></div>
                          </div>
                          <div className="p-6 bg-emerald-600/5 border border-emerald-600/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-600/10 transition-all">
                             <div className="flex flex-col">
                                <span className="text-[13px] font-black text-white uppercase tracking-tight">Orçamentos</span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase">Formulário Ativo</span>
                             </div>
                             <div className="w-12 h-6 bg-emerald-600 rounded-full flex items-center justify-end px-1.5"><div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg" /></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
           )}

        </main>
      </div>
    </div>
  );
}
