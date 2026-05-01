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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-black/60 backdrop-blur-2xl flex-col z-50 border-r border-white/10 select-none">
        
        {/* LOGO & TITLE AREA */}
        <div className="px-6 py-10 flex flex-col items-center">
           <div className="flex items-center gap-3 w-full mb-2">
              <div style={{ backgroundColor: '#ffffff' }} className="w-10 h-10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
                 <img src="/logo.png" alt="SAMMY3D" className="w-full h-full object-cover" style={{ filter: 'invert(1)' }} />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase">SAMMY3D</h1>
           </div>
           <div className="w-full h-px bg-white/5 mt-6"></div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-0.5 custom-scrollbar">
           {menuItemsMain.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all group",
                   isActive 
                     ? "bg-white/10 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/10" 
                     : "text-slate-400 hover:text-white hover:bg-white/5"
                 )}
               >
                 <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors")} />
                 <span>{item.label}</span>
               </Link>
             );
           })}

           <div className="h-px bg-white/5 my-6 mx-3"></div>

           {menuItemsSupport.map((item) => (
             <Link
               key={item.href}
               href={item.href}
               className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
             >
               <item.icon className="h-4 w-4 text-slate-500 group-hover:text-white" />
               <span>{item.label}</span>
             </Link>
           ))}
        </nav>

        {/* PROFILE WITH LOGOUT */}
        <div className="p-4 border-t border-white/5">
           <div 
             onClick={async () => {
                if (confirm("Deseja encerrar a sessão operacional?")) {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   window.location.href = '/login';
                }
             }}
             className="flex items-center justify-between p-2 rounded-lg hover:bg-red-500/10 group transition-all cursor-pointer"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black italic shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                    SM
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-white group-hover:text-red-500 truncate w-[100px]">andressaf</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-red-400">Encerrar Sessão</span>
                 </div>
              </div>
              <LogOut className="h-3.5 w-3.5 text-slate-600 group-hover:text-red-500 transition-all" />
           </div>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-14 bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl z-[999] flex items-center justify-around px-2">
         {menuItemsMain.slice(0,5).map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link key={item.href} href={item.href} className={cn("p-2 rounded-xl transition-all flex flex-col items-center gap-1", isActive ? "text-white bg-white/10" : "text-slate-500")}>
                <item.icon className="h-5 w-5" />
             </Link>
           );
         })}
      </nav>
    </>
  );
}
