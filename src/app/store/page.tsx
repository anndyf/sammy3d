"use client"

import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, ChevronRight, Menu, Filter, Box, Truck, MessageCircle, ExternalLink, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string; name: string; description: string; sellingPrice: number; stockQuantity: number;
  imageUrl?: string; category: string; subcategory?: string; shopeeUrl?: string; sku?: string;
}

const FIXED_CATEGORIES = ["Chaveiros", "Fidgets", "Sensoriais", "Decorativos", "Placas", "Jogos"];

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchCatalog();
  }, []);

  const handleWhatsAppOrder = (p: Product) => {
    const text = encodeURIComponent(`Olá Sammy 3D! 👋 Quero garantir o modelo *${p.name}* (Ref: ${p.sku || 'N/A'}) no valor de R$ ${p.sellingPrice.toFixed(2)}. Sou de Alagoinhas-BA.`);
    window.open(`https://wa.me/5575992921020?text=${text}`, "_blank");
  };

  // Agrupamento Dinâmico (Sincronizado com o Catálogo Real)
  const groupedProducts = products.reduce((acc, p) => {
    const cat = p.category || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  // Lista de categorias únicas para o menu
  const dynamicCategories = Object.keys(groupedProducts).sort();

  const displayedProducts = selectedCategory 
    ? { [selectedCategory]: groupedProducts[selectedCategory] || [] }
    : groupedProducts;

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#00D1FF] selection:text-black">
      
      {/* MAGLO PROMO BAR: ALAGOINHAS EXCLUSIVE */}
      <div className="bg-[#1C1C1C] text-white py-3 px-6 overflow-hidden relative">
         <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6 animate-fade-in">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D1FF]">
                  <Truck className="w-3 h-3" />
                  <span>Entrega Grátis em Alagoinhas-BA</span>
               </div>
               <div className="hidden md:flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] opacity-40">
                  <span>•</span>
                  <span>Produzido Localmente com Tecnologia 3D</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
                <a href="https://shopee.com.br/sammy3d" target="_blank" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#FF006E] transition-colors flex items-center gap-2 group">
                   Visite nossa vitrine Shopee
                   <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                </a>
            </div>
         </div>
      </div>

      <header className="sticky top-0 bg-white/80 backdrop-blur-2xl z-50 border-b border-slate-50">
         <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-24 flex items-center justify-between gap-10">
            
            <div className="flex items-center gap-6 min-w-fit">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1C1C1C] rounded-2xl p-2 flex items-center justify-center shadow-lg">
                    <img src="/logo.png" className="w-full h-full object-contain" alt="Sammy 3D" />
                  </div>
                  <span className="font-medium text-2xl tracking-tighter text-[#1C1C1C]">sammy<span className="text-[#FF006E]">3d</span></span>
               </div>
               <nav className="hidden xl:flex items-center gap-8 py-1 px-8 bg-slate-50 rounded-full border border-slate-100">
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all", !selectedCategory ? "text-[#00D1FF]" : "text-slate-400 hover:text-black")} onClick={()=>setSelectedCategory(null)}>Explorar Tudo</span>
                  {dynamicCategories.map(cat => (
                    <span key={cat} className={cn("text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap", selectedCategory === cat ? "text-[#00D1FF]" : "text-slate-400 hover:text-black")} onClick={()=>setSelectedCategory(cat)}>{cat}</span>
                  ))}
               </nav>
            </div>

            <div className="flex-1 max-w-sm hidden md:block">
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#00D1FF] transition-colors" />
                  <input type="text" placeholder="O que você imagina hoje?..." className="w-full h-12 pl-14 pr-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm outline-none focus:bg-white focus:border-[#00D1FF]/30 transition-all font-light tracking-tight" />
               </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
               <div className="relative w-12 h-12 rounded-2xl bg-[#00D1FF] flex items-center justify-center text-black shadow-lg shadow-[#00D1FF]/10 hover:scale-[1.05] transition-all cursor-pointer">
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  <span className="absolute -top-1 -right-1 bg-[#FF006E] text-white text-[9px] font-bold w-4 h-4 rounded-lg flex items-center justify-center ring-2 ring-white">0</span>
               </div>
               <button className="xl:hidden" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>
                  <Menu className="w-6 h-6" />
               </button>
            </div>
         </div>
      </header>

      <main className="max-w-[1600px] mx-auto pt-10 md:pt-20 px-6 md:px-10 space-y-16">
         
         {/* HERO SECTION */}
         <section className="relative p-10 md:p-20 overflow-hidden bg-white border border-slate-50 rounded-[64px] flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="flex-1 space-y-10 z-10">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#00D1FF]/10 rounded-full">
                    <Sparkles className="w-4 h-4 text-[#00D1FF]" />
                    <span className="text-[10px] font-bold text-[#00D1FF] uppercase tracking-[0.2em]">Tecnologia Sammy 3D</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-black leading-[0.9]">Peças Épicas, <br /> <span className="italic font-normal">Entrega Local</span>.</h2>
                  <p className="text-xl text-slate-400 font-light max-w-xl leading-relaxed">Impressão 3D de alta performance pensada para Alagoinhas. Design exclusivo, resistência e frete grátis via WhatsApp.</p>
               </div>
               <div className="flex items-center gap-4 justify-center md:justify-start flex-col sm:flex-row">
                  <button className="h-16 px-12 bg-[#1C1C1C] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-[#00D1FF] hover:text-black transition-all shadow-2xl">
                     <Zap className="w-4 h-4" /> Ver Coleções
                  </button>
                  <a href="https://wa.me/5575992921020" target="_blank" className="h-16 px-12 border-2 border-slate-100 text-black rounded-full text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:border-[#00D1FF] transition-all">
                    Chamar no WhatsApp
                  </a>
               </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center">
               <div className="absolute inset-0 bg-[#00D1FF]/10 rounded-full blur-[100px] animate-pulse"></div>
               <div className="w-80 h-80 bg-white rounded-[56px] border-2 border-[#F1F5F9] shadow-2xl flex items-center justify-center overflow-hidden p-10 animate-float">
                   <img src="/logo.png" className="w-full h-full object-contain" alt="Sammy 3D" />
               </div>
            </div>
         </section>

         <div className="space-y-32 py-20">
            {loading ? (
              <div className="py-40 text-center text-slate-100 uppercase text-[10px] tracking-[0.6em] animate-pulse">Sincronizando Acervo...</div>
            ) : Object.keys(displayedProducts).length === 0 ? (
              <div className="py-40 text-center maglo-card border-dashed">
                 <Box className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                 <p className="text-slate-300 uppercase text-[10px] tracking-[.3em] font-bold">Nenhum tesouro encontrado</p>
              </div>
            ) : (
              Object.entries(displayedProducts).map(([category, items]) => (
                <section key={category} className="space-y-12">
                   <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                      <div className="space-y-1">
                         <h3 className="text-4xl font-light tracking-tighter text-black">{category}</h3>
                         <p className="text-[10px] text-[#00D1FF] uppercase tracking-[0.3em] font-bold">Sammy Select • {items.length} itens</p>
                      </div>
                      <button className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-black transition-colors">
                        Ver tudo <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                      {items.map(p => (
                        <div key={p.id} className="group bg-white rounded-[48px] p-6 border-2 border-transparent hover:border-slate-50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                           <div className="relative aspect-square rounded-[40px] overflow-hidden bg-[#F8FAFC] mb-8 group-hover:scale-[1.02] transition-transform duration-700 p-8 flex items-center justify-center">
                              {p.imageUrl ? (
                                 <img 
                                   src={p.imageUrl} 
                                   alt={p.name} 
                                   className="w-full h-full object-contain drop-shadow-2xl" 
                                   onError={(e) => {
                                      e.currentTarget.src = ""; // Force trigger the fallback
                                      e.currentTarget.style.display = "none";
                                      // Logic to show fallback icon would need a state, 
                                      // but we can just use a sibling div and toggle it.
                                   }}
                                 />
                              ) : (
                                 <Box className="w-16 h-16 text-slate-200 opacity-20" />
                              )}
                              <div className="absolute top-4 left-4 h-8 px-4 bg-black/80 backdrop-blur-sm shadow-lg text-white rounded-full flex items-center text-[8px] font-bold uppercase tracking-widest z-10">
                                 # {p.sku || 'S-3D'}
                              </div>
                              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-200 hover:text-[#FF006E] transition-all shadow-sm cursor-pointer scale-0 group-hover:scale-100">
                                 <Heart className="w-5 h-5" />
                              </div>
                           </div>

                           <div className="px-2 flex-1 flex flex-col">
                              <div className="space-y-1 mb-6">
                                 <h4 className="text-xl font-medium text-black tracking-tight">{p.name}</h4>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    {p.category} {p.subcategory && <span className="text-[#00D1FF]"> • {p.subcategory}</span>}
                                 </p>
                              </div>
                              
                              <div className="mt-auto space-y-6">
                                 <div className="flex items-end gap-2">
                                    <span className="text-sm font-bold text-[#00D1FF] mb-1">R$</span>
                                    <p className="text-4xl font-light text-black tracking-tighter">{p.sellingPrice.toFixed(2)}</p>
                                 </div>

                                 <div className="flex flex-col gap-3">
                                    {p.shopeeUrl ? (
                                      <a 
                                        href={p.shopeeUrl} 
                                        target="_blank" 
                                        className="w-full h-14 bg-[#1C1C1C] text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#FF006E] transition-all shadow-lg active:scale-95 group/btn"
                                      >
                                         <ShoppingCart className="w-4 h-4 text-[#FF006E] group-hover/btn:text-white" /> Adquirir na Shopee
                                      </a>
                                    ) : (
                                      <button 
                                        onClick={() => handleWhatsAppOrder(p)}
                                        className="w-full h-14 bg-[#1C1C1C] text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#00D1FF] hover:text-black transition-all shadow-lg active:scale-95 group/btn"
                                      >
                                         <MessageCircle className="w-4 h-4 text-[#00D1FF] group-hover/btn:text-black" /> Peça Sob Encomenda
                                      </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
              ))
            )}
         </div>
      </main>

      <footer className="mt-40 bg-white border-t border-slate-100 py-20 px-8">
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left space-y-6">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <img src="/logo.png" className="w-10 h-10 object-contain" alt="Sammy" />
                  <span className="font-medium text-2xl tracking-tighter text-black">sammy<span className="text-[#FF006E]">3d</span></span>
               </div>
               <p className="text-sm text-slate-400 font-light max-w-sm leading-relaxed">Alta performance em manufatura aditiva 3D. <br /> Alagoinhas-BA • Brasil.</p>
            </div>
            <div className="flex items-center gap-10">
               <nav className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span className="hover:text-[#00D1FF] cursor-pointer transition-colors">Instagram</span>
                  <span className="hover:text-[#00D1FF] cursor-pointer transition-colors">TikTok</span>
                  <span className="hover:text-[#00D1FF] cursor-pointer transition-colors">WhatsApp</span>
               </nav>
            </div>
         </div>
      </footer>

    </div>
  );
}
