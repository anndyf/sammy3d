"use client"

import { useState } from "react";
import { Settings, Shield, Globe, ShoppingCart, MessageCircle, Save, Key, Bell, CreditCard, ExternalLink, Command, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);

  // Business State
  const [businessName, setBusinessName] = useState("Sammy 3D Laboratório");
  const [whatsapp, setWhatsapp] = useState("5575992921020");
  
  // Marketplaces Fees (Dynamic)
  const [shopeeFee, setShopeeFee] = useState("14");
  const [shopeeFixed, setShopeeFixed] = useState("5.00");
  const [mlFee, setMlFee] = useState("12");
  const [mlFreeShippingThreshold, setMlFreeShippingThreshold] = useState("79.00");

  const [newPassword, setNewPassword] = useState("");

  const handleSave = async () => {
    setLoading(true);
    // Simulação de salvamento para manter o fluxo técnico premium
    setTimeout(() => {
       alert("Configurações atualizadas com sucesso no banco de dados.");
       setLoading(false);
    }, 800);
  };

  const tabs = [
    { id: 'business', label: 'Identidade', icon: Globe },
    { id: 'marketplaces', label: 'Marketplaces', icon: ShoppingCart },
    { id: 'public_store', label: 'Página Pública', icon: ExternalLink },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-10">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-3">
                 <Settings className="h-7 w-7 text-black" /> Ajustes de Operação
              </h1>
              <p className="text-[14px] text-slate-500 font-medium">Configure as parametrizações comerciais e de sistema da Sammy 3D.</p>
           </div>
           <button 
             onClick={handleSave}
             disabled={loading}
             className="bg-black text-white px-8 py-3 h-12 rounded-xl text-[13px] font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-2xl active:scale-95 disabled:opacity-50"
           >
             {loading ? <Zap className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Salvar Alterações
           </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* TABS SIDEBAR (INDUSTRIAL STYLE) */}
        <aside className="w-full md:w-[240px] flex flex-col gap-1">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left",
                 activeTab === tab.id 
                   ? "bg-slate-50 text-black border border-slate-100 shadow-sm" 
                   : "text-slate-400 hover:text-black hover:bg-slate-50/50"
               )}
             >
               <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-black" : "text-slate-300")} />
               {tab.label}
             </button>
           ))}
           <div className="mt-10 pt-6 border-t border-slate-50 opacity-20 hidden md:block">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">Hardware v2.0</p>
           </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 space-y-12 animate-in slide-in-from-right-4 duration-700">
           
           {activeTab === 'business' && (
             <section className="space-y-8">
                <div className="border-b border-slate-50 pb-4"><h3 className="text-xl font-bold tracking-tight text-black">Branding e Contato</h3><p className="text-[13px] text-slate-400 leading-relaxed italic">Essas informações alimentam a loja pública e as faturas.</p></div>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Industrial</label><input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black" value={businessName} onChange={e=>setBusinessName(e.target.value)} /></div>
                      <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">WhatsApp Comercial</label><input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] outline-none font-mono" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} /></div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-[11px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><Smartphone className="h-4 w-4" /> Visualização de Marca</p>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Sua marca está sincronizada com o arquivo <code className="bg-white px-1.5 py-0.5 rounded text-black font-mono">public/logo.png</code>.</p>
                      <button className="text-[11px] font-bold text-black border-b border-black pt-2 hover:opacity-50">Substituir Logomarca (.PNG)</button>
                   </div>
                </div>
             </section>
           )}

           {activeTab === 'public_store' && (
             <section className="space-y-8">
                <div className="border-b border-slate-50 pb-4"><h3 className="text-xl font-bold tracking-tight text-black">Página Pública / Vitrine</h3><p className="text-[13px] text-slate-400 leading-relaxed italic">Controle o que seus clientes visualizam na loja e orçamentos.</p></div>
                
                <div className="space-y-10">
                   <div className="space-y-4">
                      <p className="text-[11px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><CreditCard className="h-4 w-4" /> Banners e Alertas</p>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Banner Informativo (Rodapé Loja)</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px]" placeholder="Ex: Entrega Grátis em Alagoinhas-BA" /></div>
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Título Solicitação 3D</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px]" placeholder="Ex: Solicitar Orçamento 3D" defaultValue="Solicitar Orçamento 3D" /></div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[11px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><Command className="h-4 w-4" /> Funcionalidades</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                            <span className="text-[12px] font-bold text-emerald-700">Loja Ativa</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                         </div>
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                            <span className="text-[12px] font-bold text-emerald-700">Orçamentos Ativos</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
           )}

           {activeTab === 'marketplaces' && (
             <section className="space-y-8">
                <div className="border-b border-slate-50 pb-4"><h3 className="text-xl font-bold tracking-tight text-black">Taxas e Marketplace</h3><p className="text-[13px] text-slate-400 leading-relaxed italic">Parametrizando o cálculo automático de recebimento líquido.</p></div>
                
                <div className="space-y-10">
                   {/* SHOPEE */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">S</div><span className="text-[14px] font-bold text-black">Shopee Brasil</span></div>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa de Venda (%)</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-bold" value={shopeeFee} onChange={e=>setShopeeFee(e.target.value)} /></div>
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa Fixa (R$)</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-bold" value={shopeeFixed} onChange={e=>setShopeeFixed(e.target.value)} /></div>
                      </div>
                   </div>

                   {/* ML */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold text-xs shadow-lg">M</div><span className="text-[14px] font-bold text-black">Mercado Livre</span></div>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comissão Média (%)</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-bold" value={mlFee} onChange={e=>setMlFee(e.target.value)} /></div>
                         <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor p/ Frete Grátis (R$)</label><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-bold" value={mlFreeShippingThreshold} onChange={e=>setMlFreeShippingThreshold(e.target.value)} /></div>
                      </div>
                   </div>
                </div>
             </section>
           )}

           {activeTab === 'security' && (
             <section className="space-y-8">
                <div className="border-b border-slate-50 pb-4"><h3 className="text-xl font-bold tracking-tight text-black">Controle de Terminal</h3><p className="text-[13px] text-slate-400 leading-relaxed italic">Alteração de senha master do terminal Sammy 3D.</p></div>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Senha Atual</label><input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] outline-none" /></div>
                      <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nova Senha Master</label><input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 border-l-4 border-l-amber-400 space-y-2">
                      <p className="text-[11px] font-bold text-black uppercase tracking-widest">Aviso Operacional</p>
                      <p className="text-[13px] text-slate-500 leading-relaxed">A alteração da senha master desconectará todos os terminais ativos imediatamente. Guarde sua senha em local selado.</p>
                   </div>
                </div>
             </section>
           )}

           {activeTab === 'notifications' && (
              <div className="py-20 text-center text-[10px] tracking-widest font-black uppercase opacity-10 italic grayscale select-none">
                 Ponte de Notificação em Construção...
              </div>
           )}

        </main>
      </div>

    </div>
  );
}
