"use client"

import { useState } from "react";
import { HelpCircle, Search, BookOpen, PlayCircle, MessageSquare, ChevronDown, ChevronRight, Mail, Phone, LifeBuoy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HelpDeskPage() {
  const [search, setSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Como o sistema calcula o preço no Emissor de Orçamentos?",
      a: "O sistema multiplica o consumo do material pelo custo unitário, adiciona a taxa base de eletricidade (Watts por hora) e o tempo de operador. Sobre esse Custo de Fabricação, aplicamos sua Margem de Lucro configurada."
    },
    {
      q: "O Analisador .gcode lê todos os fatiadores?",
      a: "Sim. A nossa IA processa os G-Codes gerados no Cura, PrusaSlicer, Bambu Studio e OrcaSlicer, extraindo tempo, peso e detectando padrões de risco (como warp e overhangs) através da leitura das camadas."
    },
    {
      q: "Como conectar minha loja WooCommerce ou Shopify?",
      a: "Acesse o menu 'Sistema > Configurações', navegue até a aba 'Integrações' e cole suas chaves de API. O sistema buscará novos pedidos a cada 15 minutos e os colocará na sua aba 'Vendas'."
    },
    {
      q: "A linha de Produção Kamban atualiza o cliente automaticamente?",
      a: "Sempre que você mover um card para a coluna 'Pronto', o sistema pode enviar um e-mail automático ou preparar uma mensagem de WhatsApp avisando seu cliente que o pedido está aguardando coleta/envio."
    }
  ];

  return (
    <div className="space-y-12 pb-20 max-w-[1000px] mx-auto">
      
      {/* HEADER HERO */}
      <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-12 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500"></div>
         <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="w-16 h-16 rounded-2xl bg-[#14161b] border border-white/5 flex items-center justify-center mb-6 shadow-inner relative z-10">
           <LifeBuoy className="h-8 w-8 text-cyan-400" />
         </div>
         
         <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 relative z-10">
           Como podemos te ajudar hoje?
         </h1>
         <p className="text-slate-400 font-bold max-w-xl mx-auto mb-8 relative z-10">
           Explore tutoriais, resolva dúvidas na nossa base de conhecimento ou abra um chamado direto com nossa engenharia.
         </p>

         <div className="relative w-full max-w-2xl mx-auto z-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
            <input 
              type="text" 
              placeholder="Ex: Como exportar relatórios em PDF..." 
              className="w-full bg-[#14161b] border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-lg font-bold text-white outline-none focus:border-cyan-500 transition-all shadow-2xl placeholder:text-slate-600" 
              value={search} 
              onChange={e=>setSearch(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* VIDEOS */}
         <div className="col-span-1 space-y-6">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Tutoriais em Vídeo</h3>
            
            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-2 space-y-2 shadow-lg">
               <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="p-3 bg-[#14161b] rounded-lg group-hover:bg-cyan-500/10 transition-colors">
                     <PlayCircle className="h-5 w-5 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Primeiros Passos</h4>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">3 min de vídeo</p>
                  </div>
               </a>
               <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="p-3 bg-[#14161b] rounded-lg group-hover:bg-blue-500/10 transition-colors">
                     <PlayCircle className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Fluxo de Kamban</h4>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">5 min de vídeo</p>
                  </div>
               </a>
               <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="p-3 bg-[#14161b] rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                     <PlayCircle className="h-5 w-5 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Setup de Impressoras</h4>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">8 min de vídeo</p>
                  </div>
               </a>
            </div>

            <div className="bg-gradient-to-br from-[#1a1d24] to-[#14161b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <MessageSquare className="h-6 w-6 text-cyan-400 mb-4" />
               <h3 className="text-sm font-black text-white mb-2">Suporte Direto</h3>
               <p className="text-[11px] text-slate-400 font-bold mb-6">Fale diretamente com nossa equipe técnica para dúvidas avançadas.</p>
               <button className="w-full bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                 Abrir Ticket <ArrowRight className="h-3 w-3" />
               </button>
            </div>
         </div>

         {/* FAQS */}
         <div className="col-span-1 md:col-span-2 space-y-6">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Perguntas Frequentes</h3>
            
            <div className="space-y-4">
               {faqs.map((faq, idx) => {
                 const isActive = activeFaq === idx;
                 return (
                   <div 
                     key={idx} 
                     className={cn(
                       "bg-[#1a1d24] border rounded-2xl overflow-hidden transition-all duration-300 shadow-lg cursor-pointer",
                       isActive ? "border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.05)]" : "border-white/5 hover:border-white/10"
                     )}
                     onClick={() => setActiveFaq(isActive ? null : idx)}
                   >
                      <div className="p-6 flex items-center justify-between gap-4">
                         <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                         <div className={cn(
                           "p-1.5 rounded-md transition-all",
                           isActive ? "bg-cyan-500/10 text-cyan-400" : "bg-[#14161b] text-slate-500"
                         )}>
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isActive && "rotate-180")} />
                         </div>
                      </div>
                      <div className={cn(
                        "px-6 text-[13px] text-slate-400 font-medium leading-relaxed overflow-hidden transition-all duration-300",
                        isActive ? "max-h-40 pb-6 opacity-100" : "max-h-0 py-0 opacity-0"
                      )}>
                         <div className="h-px w-full bg-white/5 mb-6"></div>
                         {faq.a}
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 flex items-center justify-between mt-8">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center">
                     <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-white">Manual Completo (PDF)</h4>
                     <p className="text-[11px] text-slate-400 mt-1">Todas as rotinas, cadastros e relatórios.</p>
                  </div>
               </div>
               <button className="px-6 py-3 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                  Baixar 14.2mb
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
