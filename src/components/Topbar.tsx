"use client"

import { useState, useEffect } from "react";
import { Bell, Monitor } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [mounted, setMounted] = useState(false);
  const [quoteCount, setQuoteCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Busca inicial e polling para orçamentos (Simples e Eficaz)
    const fetchCount = async () => {
       try {
          const res = await fetch('/api/notifications/count');
          const data = await res.json();
          setQuoteCount(data.count || 0);
       } catch (e) {
          console.error("Erro ao sincronizar notificações");
       }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000); // 10s polling (Vercel-Fast)
    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return <header className="h-14 bg-white border-b border-slate-100 sticky top-0 z-40 w-full" />
  }

  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 md:px-12 lg:px-24 xl:px-32 border-b border-slate-100 sticky top-0 z-40 select-none animate-in fade-in duration-300">
      
      {/* BRAND & STATUS AREA: SIMPLIFIED */}
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg shadow-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sistema Operacional</span>
         </div>
      </div>

      {/* VERCEL ACTIONS */}
      <div className="flex items-center gap-4">
        <Link href="/store" target="_blank" className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors hidden lg:flex items-center gap-2 border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-xs">
           Ver Loja Pública
        </Link>
        
        <div className="h-4 w-px bg-slate-100 hidden lg:block"></div>

        <div className="flex items-center gap-1">
           <Link href="/quotes" className="p-2 text-slate-400 hover:text-black hover:bg-slate-50 rounded-lg transition-all relative">
              <Bell className="h-4 w-4" />
              {quoteCount > 0 && (
                <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white border-none shadow-sm animate-bounce">
                   {quoteCount}
                </div>
              )}
           </Link>
        </div>

        {/* PROFILE AVATAR */}
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 p-0.5 cursor-pointer hover:border-slate-300 transition-all">
           <div className="w-full h-full rounded-full bg-orange-400 flex items-center justify-center text-[10px] font-black text-white italic shadow-sm">
              SM
           </div>
        </div>
      </div>
    </header>
  );
}
