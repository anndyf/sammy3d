"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Box,
  Truck,
  ShoppingCart,
  FileText,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Command,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItemsMain = [
  { label: "Visão Geral", icon: LayoutDashboard, href: "/" },
  { label: "Orçamentos", icon: FileText, href: "/quotes" },
  { label: "Catálogo", icon: Package, href: "/catalog" },
  { label: "Almoxarifado", icon: Box, href: "/stock" },
  { label: "Produção", icon: ShoppingCart, href: "/orders" },
  { label: "Vendas", icon: Truck, href: "/orders/list" },
  { label: "Financeiro", icon: Receipt, href: "/finance" },
];

const menuItemsSupport = [
  { label: "Configurações", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-white flex-col z-50 border-r border-slate-100 select-none">
        
        {/* LOGO & TITLE AREA: REPLACE TEAM SELECTOR & REMOVE HOBBY */}
        <div className="px-6 py-10 flex flex-col items-center">
           <div className="flex items-center gap-3 w-full mb-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-black">
                 <img src="/logo.png" alt="SAMMY3D" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold tracking-tighter text-black uppercase">SAMMY3D</h1>
           </div>
           <div className="w-full h-px bg-slate-50 mt-6"></div>
        </div>

        {/* SEARCH BAR REMOVED PER USER REQUEST */}

        <nav className="flex-1 overflow-y-auto px-4 space-y-0.5">
           {menuItemsMain.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all group",
                   isActive 
                     ? "bg-[#F3F3F3]/80 text-black font-semibold shadow-sm ring-1 ring-slate-100/50" 
                     : "text-[#666] hover:text-black hover:bg-[#F3F3F3]/40"
                 )}
               >
                 <item.icon className={cn("h-4 w-4", isActive ? "text-black" : "text-slate-400 group-hover:text-black transition-colors")} />
                 <span>{item.label}</span>
               </Link>
             );
           })}

           <div className="h-px bg-slate-50 my-6 mx-3"></div>

           {menuItemsSupport.map((item) => (
             <Link
               key={item.href}
               href={item.href}
               className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#666] hover:text-black hover:bg-[#F3F3F3]/40 transition-all group"
             >
               <item.icon className="h-4 w-4 text-slate-400 group-hover:text-black" />
               <span>{item.label}</span>
             </Link>
           ))}
        </nav>

        {/* PROFILE (VERCEL STYLE) WITH LOGOUT */}
        <div className="p-4 border-t border-slate-50">
           <div 
             onClick={async () => {
                if (confirm("Deseja encerrar a sessão operacional?")) {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   window.location.href = '/login';
                }
             }}
             className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 group hover:ring-1 hover:ring-red-100 transition-all cursor-pointer"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center text-[10px] font-black italic shadow-sm group-hover:bg-red-500 transition-all">
                    SM
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-700 group-hover:text-red-600 truncate w-[100px]">andressaf</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-red-400">Encerrar Sessão</span>
                 </div>
              </div>
              <LogOut className="h-3.5 w-3.5 text-slate-200 group-hover:text-red-500 transition-all" />
           </div>
        </div>
      </aside>

      {/* MOBILE NAV: REWRITTEN TO MATCH LOGO VIBE */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-14 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_12px_24px_rgba(0,0,0,0.1)] rounded-2xl z-[999] flex items-center justify-around px-2">
         {menuItemsMain.slice(0,5).map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link key={item.href} href={item.href} className={cn("p-2 rounded-xl transition-all flex flex-col items-center gap-1", isActive ? "text-black bg-slate-50" : "text-slate-400")}>
                <item.icon className="h-5 w-5" />
             </Link>
           );
         })}
      </nav>
    </>
  );
}
