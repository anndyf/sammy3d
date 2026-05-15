"use client"

import { Rocket, Sparkles, ChevronRight } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 bg-[#1a1d24] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] pointer-events-none" />
       
       <div className="w-24 h-24 bg-[#14161b] rounded-3xl flex items-center justify-center border border-white/10 mb-8 shadow-2xl relative group">
          <Rocket className="h-10 w-10 text-cyan-400 animate-bounce" />
          <Sparkles className="h-4 w-4 text-amber-400 absolute top-4 right-4 animate-pulse" />
       </div>

       <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">Feature em Desenvolvimento</h1>
       <p className="text-slate-500 max-w-md mx-auto font-bold text-sm leading-relaxed mb-10">
          Estamos modernizando esta ferramenta para o padrão Midnight Tech v2.0. Em breve você terá acesso total a estas funcionalidades premium.
       </p>

       <button className="bg-white text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-400 hover:scale-105 transition-all flex items-center gap-3 active:scale-95">
          Ativar Notificações de Update <ChevronRight className="h-4 w-4" />
       </button>

       <div className="mt-12 flex items-center gap-4 opacity-20 grayscale">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sammy 3D Labs</span>
       </div>
    </div>
  );
}
