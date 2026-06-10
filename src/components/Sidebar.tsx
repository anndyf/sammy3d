"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  LogOut,
  Menu,
  X
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
      { label: "Analisador .gcode", icon: Cpu, href: "/production/smart" },
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOP STICKY HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e3a8a]/90 backdrop-blur-lg border-b border-blue-800/50 flex items-center justify-between px-6 z-[990] select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <div className="relative w-5 h-5 flex flex-col items-center justify-center">
              <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-blue-400 rotate-[-15deg] rounded-sm"></div>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rotate-[15deg] rounded-sm"></div>
              <div className="w-full h-full bg-blue-400 rounded-md relative z-10 flex items-center justify-center border border-black/10">
                <span className="text-[6px] font-black text-white select-none leading-none">XX</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest leading-none mb-0.5">Sammy 3D OS</span>
            <span className="text-[11px] font-bold text-white leading-none group-hover:text-blue-200">Painel Operacional</span>
          </div>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 bg-white/10 border border-white/10 rounded-xl text-blue-200 active:scale-90 transition-transform"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY BACKDROP */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] animate-in fade-in duration-300"
        />
      )}

      {/* MOBILE DRAWER SIDEBAR PANEL */}
      <aside 
        className={cn(
          "md:hidden fixed top-0 left-0 h-screen w-[280px] bg-[#1e3a8a] border-r border-blue-800/50 z-[1001] flex flex-col transition-transform duration-300 ease-out select-none",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* DRAWER LOGO AREA */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-blue-800/50 bg-[#1e3a8a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <div className="relative w-4 h-4 bg-blue-400 rounded-md flex items-center justify-center">
                <span className="text-[5px] font-black text-white leading-none">XX</span>
              </div>
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-wider">SAMMY3D OS</span>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 bg-white/10 border border-white/10 rounded-lg text-blue-200 hover:text-white"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* DRAWER LINKS NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
           {sidebarGroups.map((group, groupIndex) => (
             <div key={groupIndex} className="space-y-1">
               {group.title && (
                 <div className="flex items-center gap-3 px-3 mb-2 mt-4">
                   <h3 className="text-[9px] font-black text-blue-300 uppercase tracking-[0.15em]">{group.title}</h3>
                   <div className="h-px bg-white/10 flex-1"></div>
                 </div>
               )}
               
               {group.items.map((item) => {
                 const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     onClick={() => setIsDrawerOpen(false)}
                     className={cn(
                       "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all group active:scale-[0.98]",
                       isActive 
                         ? "bg-white/10 text-white font-bold border-l-4 border-blue-400 pl-4 rounded-l-none" 
                         : "text-blue-100/70 hover:text-white hover:bg-white/5",
                       item.isSubItem && "ml-6 border-l border-white/10 rounded-l-none pl-4 py-1.5 text-[12px]"
                     )}
                   >
                     <div className="flex items-center gap-3">
                       {!item.isSubItem && <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-blue-400" : "text-blue-200 group-hover:text-white transition-colors")} />}
                       <span>{item.label}</span>abel}</span>
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

        {/* DRAWER FOOTER */}
        <div className="p-4 border-t border-blue-800/50 bg-[#1e3a8a]">
           <div 
             className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group active:scale-95"
             onClick={async () => {
                if (confirm("Deseja encerrar a sessão operacional?")) {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   window.location.href = '/login';
                }
             }}
           >
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Logado como</span>
                 <span className="text-[11px] font-bold text-white group-hover:text-blue-200 truncate w-[160px]">andressamirella21@g...</span>
              </div>
              <LogOut className="h-4 w-4 text-blue-300 group-hover:text-white transition-all" />
           </div>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] bg-[#1e3a8a] flex-col z-50 border-r border-blue-800/50 select-none text-blue-100">
        
        {/* LOGO & TITLE AREA */}
        <div className="px-6 py-8 flex flex-col items-center">
           <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 relative overflow-hidden group">
              {/* Custom CSS Kitty Logo */}
              <div className="relative w-12 h-12 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 {/* Ears */}
                 <div className="absolute -top-1 -left-1 w-4 h-4 bg-white rotate-[-15deg] rounded-sm"></div>
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rotate-[15deg] rounded-sm"></div>
                 {/* Face */}
                 <div className="w-full h-full bg-white rounded-xl relative z-10 flex flex-col items-center justify-center border-2 border-black/10">
                    {/* Crown */}
                    <div className="absolute -top-4 w-6 h-4 flex gap-0.5 items-end">
                       <div className="w-1.5 h-2 bg-amber-400 rounded-t-sm"></div>
                       <div className="w-1.5 h-3 bg-amber-400 rounded-t-sm"></div>
                       <div className="w-1.5 h-2 bg-amber-400 rounded-t-sm"></div>
                    </div>
                    {/* Eyes X X */}
                    <div className="flex gap-2 mb-1">
                       <div className="text-[10px] font-black text-[#1e3a8a] select-none leading-none">X</div>
                       <div className="text-[10px] font-black text-[#1e3a8a] select-none leading-none">X</div>
                    </div>
                    {/* Mouth */}
                    <div className="w-3 h-1 border-b-2 border-[#1e3a8a] rounded-full"></div>
                 </div>
              </div>
           </div>
            <div className="flex flex-col text-center">
                 <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Sammy 3D OS</span>
                 <span className="text-[12px] font-bold text-white group-hover:text-blue-200 truncate w-[130px]">Painel Operacional</span>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 custom-scrollbar">
           {sidebarGroups.map((group, groupIndex) => (
             <div key={groupIndex} className="space-y-1">
               {group.title && (
                 <div className="flex items-center gap-3 px-3 mb-2 mt-4">
                   <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.15em]">{group.title}</h3>
                   <div className="h-px bg-white/10 flex-1"></div>
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
                         ? "bg-white/10 text-white font-bold border-l-4 border-blue-400 pl-4 rounded-l-none" 
                         : "text-blue-100/70 hover:text-white hover:bg-white/5",
                       item.isSubItem && "ml-6 border-l border-white/10 rounded-l-none pl-4 py-1.5 text-[12px]"
                     )}
                   >
                     <div className="flex items-center gap-3">
                       {!item.isSubItem && <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-blue-400" : "text-blue-200 group-hover:text-white transition-colors")} />}
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
        <div className="p-4 border-t border-blue-800/50 bg-[#1e3a8a]">
           <div 
             className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
             onClick={async () => {
                if (confirm("Deseja encerrar a sessão operacional?")) {
                   await fetch('/api/auth/logout', { method: 'POST' });
                   window.location.href = '/login';
                }
             }}
           >
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Logado como</span>
                 <span className="text-[12px] font-bold text-white group-hover:text-blue-200 truncate w-[130px]">andressamirella21@g...</span>
              </div>
              <LogOut className="h-4 w-4 text-blue-300 group-hover:text-white transition-all" />
           </div>
           <div className="text-center mt-3">
             <span className="text-[10px] font-bold text-blue-200/50">v2.4</span>
           </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#081d24]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl z-[990] flex items-center justify-around px-2 select-none">
         {/* ITEM 1: DASHBOARD */}
         <Link 
           href="/dashboard" 
           className={cn(
             "p-3 rounded-xl transition-all flex items-center justify-center active:scale-90",
             pathname === "/dashboard" ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,245,255,0.15)] border border-cyan-400/20" : "text-slate-500 hover:text-white"
           )}
         >
            <LayoutDashboard className="h-5 w-5" />
         </Link>

         {/* ITEM 2: VENDAS */}
         <Link 
           href="/sales" 
           className={cn(
             "p-3 rounded-xl transition-all flex items-center justify-center active:scale-90",
             pathname.startsWith("/sales") ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,245,255,0.15)] border border-cyan-400/20" : "text-slate-500 hover:text-white"
           )}
         >
            <ShoppingCart className="h-5 w-5" />
         </Link>

         {/* ITEM 3: ANALISADOR GCODE */}
         <Link 
           href="/production/smart" 
           className={cn(
             "p-3 rounded-xl transition-all flex items-center justify-center active:scale-90",
             pathname === "/production/smart" ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,245,255,0.15)] border border-cyan-400/20" : "text-slate-500 hover:text-white"
           )}
         >
            <Cpu className="h-5 w-5" />
         </Link>

         {/* ITEM 4: ESTOQUE (FILAMENTOS) */}
         <Link 
           href="/stock" 
           className={cn(
             "p-3 rounded-xl transition-all flex items-center justify-center active:scale-90",
             pathname === "/stock" ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,245,255,0.15)] border border-cyan-400/20" : "text-slate-500 hover:text-white"
           )}
         >
            <Disc className="h-5 w-5" />
         </Link>

         {/* ITEM 5: MENU TRIGGER */}
         <button 
           onClick={() => setIsDrawerOpen(true)} 
           className={cn(
             "p-3 rounded-xl transition-all flex items-center justify-center active:scale-90",
             isDrawerOpen ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,245,255,0.15)] border border-cyan-400/20" : "text-slate-500 hover:text-white"
           )}
         >
            <Menu className="h-5 w-5" />
         </button>
      </nav>
    </>
  );
}
