"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  UploadCloud, 
  Package, 
  Wallet, 
  FileText, 
  Hammer, 
  Zap, 
  History, 
  Cpu, 
  BarChart3, 
  Users, 
  Printer, 
  Disc, 
  Store, 
  Tags, 
  Settings, 
  Crown, 
  HelpCircle, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  icon: any; // Using any to avoid complex Lucide type conflicts in this setup
  href: string;
  isPro?: boolean;
  isSubItem?: boolean;
}

interface SidebarGroup {
  title: string | null;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    title: null,
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Vendas", icon: ShoppingCart, href: "/sales" },
      { label: "Importar Marketplace", icon: UploadCloud, href: "/sales/import", isSubItem: true },
      { label: "Produtos", icon: Package, href: "/catalog" },
      { label: "Financeiro", icon: Wallet, href: "/finance" },
    ]
  },
  {
    title: "PRODUÇÃO",
    items: [
      { label: "Orçamento", icon: FileText, href: "/quotes" },
      { label: "Analisador .gcode", icon: Cpu, href: "/intelligence/gcode" },
      { label: "Produção Manual", icon: Hammer, href: "/production/manual" },
      { label: "Histórico de Produção", icon: History, href: "/production/history" },
      { label: "Relatórios Avançados", icon: BarChart3, href: "/intelligence/reports" },
    ]
  },
  {
    title: "CADASTROS",
    items: [
      { label: "Meus Clientes", icon: Users, href: "/customers" },
      { label: "Impressoras", icon: Printer, href: "/printers" },
      { label: "Filamentos", icon: Disc, href: "/stock" },
      { label: "Canais de Venda", icon: Store, href: "/channels" },
      { label: "Custos Extras / Insumos", icon: Tags, href: "/costs" },
    ]
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Configurações", icon: Settings, href: "/settings" },
      { label: "Assinatura", icon: Crown, href: "/subscription" },
      { label: "Ajuda / Manual", icon: HelpCircle, href: "/help" },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] bg-[#1a1d24] flex-col z-50 border-r border-white/5 select-none text-slate-300">
        
        {/* LOGO & TITLE AREA */}
        <div className="px-6 py-8 flex flex-col items-center">
           <div className="w-20 h-20 rounded-2xl bg-[#1e293b] border-2 border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] relative overflow-hidden group">
              {/* Custom CSS Kitty Logo */}
              <div className="relative w-12 h-12 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 {/* Ears */}
                 <div className="absolute -top-1 -left-1 w-4 h-4 bg-cyan-400 rotate-[-15deg] rounded-sm"></div>
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rotate-[15deg] rounded-sm"></div>
                 {/* Face */}
                 <div className="w-full h-full bg-cyan-400 rounded-xl relative z-10 flex flex-col items-center justify-center border-2 border-black/20">
                    {/* Crown */}
                    <div className="absolute -top-4 w-6 h-4 flex gap-0.5 items-end">
                       <div className="w-1.5 h-2 bg-amber-400 rounded-t-sm"></div>
                       <div className="w-1.5 h-3 bg-amber-400 rounded-t-sm"></div>
                       <div className="w-1.5 h-2 bg-amber-400 rounded-t-sm"></div>
                    </div>
                    {/* Eyes X X */}
                    <div className="flex gap-2 mb-1">
                       <div className="text-[10px] font-black text-black select-none leading-none">X</div>
                       <div className="text-[10px] font-black text-black select-none leading-none">X</div>
                    </div>
                    {/* Mouth */}
                    <div className="w-3 h-1 border-b-2 border-black/40 rounded-full"></div>
                 </div>
              </div>
           </div>
           <div className="px-4 py-1 bg-[#1e293b] border border-white/10 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] shadow-inner">
             Admin Center
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 custom-scrollbar">
           {sidebarGroups.map((group, groupIndex) => (
             <div key={groupIndex} className="space-y-1">
               {group.title && (
                 <div className="flex items-center gap-3 px-3 mb-2 mt-4">
                   <h3 className="text-[10px] font-black text-white uppercase tracking-[0.15em]">{group.title}</h3>
                   <div className="h-px bg-white/5 flex-1"></div>
                 </div>
               )}
               
               {group.items.map((item) => {
                 const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className={cn(
                       "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all group",
                       isActive 
                         ? "bg-white/5 text-cyan-400 font-bold" 
                         : "text-slate-400 hover:text-white hover:bg-white/5",
                       item.isSubItem && "ml-6 border-l border-white/10 rounded-l-none pl-4 py-1.5 text-[12px]"
                     )}
                   >
                     <div className="flex items-center gap-3">
                       {!item.isSubItem && <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white transition-colors")} />}
                       <span>{item.label}</span>
                     </div>
                     {item.isPro && (
                       <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">PRO</span>
                     )}
                   </Link>
                 );
               })}
             </div>
           ))}
        </nav>

        {/* PROFILE WITH LOGOUT */}
        <div className="p-4 border-t border-white/5 bg-[#14161b]">
           <div 
             className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
             onClick={async () => {
                if (confirm("Deseja encerrar a sessão operacional?")) {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   window.location.href = '/login';
                }
             }}
           >
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Logado como</span>
                 <span className="text-[12px] font-bold text-white group-hover:text-cyan-400 truncate w-[130px]">andressamirella21@g...</span>
              </div>
              <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-500 transition-all" />
           </div>
           <div className="text-center mt-3">
             <span className="text-[10px] font-bold text-slate-600">v2.4</span>
           </div>
        </div>
      </aside>

      {/* MOBILE NAV (simplified) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-14 bg-[#1a1d24]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl z-[999] flex items-center justify-around px-2">
         {sidebarGroups[0].items.slice(0,5).map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link key={item.href} href={item.href} className={cn("p-2 rounded-xl transition-all flex flex-col items-center gap-1", isActive ? "text-cyan-400 bg-white/10" : "text-slate-500")}>
                <item.icon className="h-5 w-5" />
             </Link>
           );
         })}
      </nav>
    </>
  );
}
