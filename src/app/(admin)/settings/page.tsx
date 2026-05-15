"use client"

import { Settings, Building, FileText, Calculator, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal'>('geral');
  
  return (
    <div className="space-y-8 pb-20">
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
    </div>
  );
}
