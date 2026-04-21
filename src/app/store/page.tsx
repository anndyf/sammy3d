"use client"

import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, ChevronRight, Menu, Filter, Box, Truck, MessageCircle, ExternalLink, Sparkles, Zap, Plus, X } from "lucide-react";
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
  
  // Real Shopping Cart System
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const handleAddToCart = (p: Product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === p.id);
      if (exists) {
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const checkoutWhatsApp = () => {
    if (cartItems.length === 0) return;
    const itemsText = cartItems.map(c => `${c.quantity}x ${c.product.name} (R$ ${c.product.sellingPrice.toFixed(2)})`).join('%0A');
    const total = cartItems.reduce((acc, c) => acc + (c.product.sellingPrice * c.quantity), 0);
    const text = encodeURIComponent(`Olá Sammy 3D! 👋 Gostaria de encomendar os seguintes itens:\n\n${decodeURIComponent(itemsText)}\n\n*Total estimado: R$ ${total.toFixed(2)}*\n\nPor favor, confirmem o pedido e o prazo de entrega.`);
    window.open(`https://wa.me/5575992921020?text=${text}`, "_blank");
  };

  const groupedProducts = products.reduce((acc, p) => {
    const cat = p.category || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const dynamicCategories = Object.keys(groupedProducts).sort();
  const displayedProducts = selectedCategory ? { [selectedCategory]: groupedProducts[selectedCategory] || [] } : groupedProducts;
  const cartTotalAmount = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00D1FF] selection:text-black pb-40">
      
      {/* MAGLO PROMO BAR: ALAGOINHAS EXCLUSIVE */}
      <div className="bg-[#111111] border-b border-white/5 py-3 px-6 overflow-hidden relative">
         <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6 animate-fade-in">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D1FF]">
                  <Truck className="w-4 h-4" />
                  <span>Entrega Grátis em Alagoinhas-BA</span>
               </div>
               <div className="hidden md:flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  <span>•</span>
                  <span>Produzido Localmente com Tecnologia 3D</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
                <a href="/store/request" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#00D1FF] text-slate-300 transition-colors flex items-center gap-2 group border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5">
                   Orçamento Especializado
                </a>
            </div>
         </div>
      </div>

      <header className="sticky top-0 bg-black/80 backdrop-blur-2xl z-40 border-b border-white/10">
         <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-24 flex items-center justify-between gap-10">
            
            <div className="flex items-center gap-6 min-w-fit">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                    <img src="/logo.png" className="w-full h-full object-contain invert" alt="Sammy 3D" />
                  </div>
                  <span className="font-medium text-2xl tracking-tighter text-white">sammy<span className="text-[#00D1FF]">3d</span></span>
               </div>
               <nav className="hidden xl:flex items-center gap-8 py-1.5 px-8 bg-white/5 rounded-full border border-white/10">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all", !selectedCategory ? "text-[#00D1FF]" : "text-slate-400 hover:text-white")} onClick={()=>setSelectedCategory(null)}>Explorar Tudo</span>
                  {dynamicCategories.map(cat => (
                    <span key={cat} className={cn("text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap", selectedCategory === cat ? "text-[#00D1FF]" : "text-slate-400 hover:text-white")} onClick={()=>setSelectedCategory(cat)}>{cat}</span>
                  ))}
               </nav>
            </div>

            <div className="flex-1 max-w-sm hidden md:block">
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" />
                  <input type="text" placeholder="O que você imagina hoje?..." className="w-full h-12 pl-14 pr-6 bg-white/5 border border-white/10 rounded-full text-sm outline-none focus:bg-white/10 focus:border-[#00D1FF]/50 transition-all font-light tracking-tight text-white placeholder:text-slate-500" />
               </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
               <div 
                 onClick={() => setIsCartOpen(true)}
                 className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-[#00D1FF] transition-all cursor-pointer group"
               >
                  <ShoppingCart className="w-5 h-5 group-hover:text-[#00D1FF] transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#00D1FF] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.5)]">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
               </div>
            </div>
         </div>
      </header>

      <main className="max-w-[1600px] mx-auto pt-10 md:pt-20 px-6 md:px-10 space-y-24">
         
         {/* HERO SECTION - MIDNIGHT TECH */}
         <section className="relative p-10 md:p-24 overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-[48px] flex flex-col md:flex-row items-center gap-16 text-center md:text-left shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D1FF]/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex-1 space-y-10 z-10">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-full shadow-[0_0_20px_rgba(0,209,255,0.1)]">
                    <Sparkles className="w-4 h-4 text-[#00D1FF]" />
                    <span className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.2em] drop-shadow-md">Engenharia Criativa ODS</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                     O Futuro é <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#FF006E] italic">Impresso 3D</span>.
                  </h2>
                  <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
                     Manufatura aditiva de alta performance na Bahia. Designs exclusivos, resistentes e personalizáveis sob demanda.
                  </p>
               </div>
               <div className="flex items-center gap-6 justify-center md:justify-start flex-col sm:flex-row">
                  <button className="h-16 px-12 bg-white text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                     <Zap className="w-5 h-5 text-blue-600" /> Explorar Acervo
                  </button>
                  <a href="/store/request" className="h-16 px-12 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-[#00D1FF] transition-all">
                    Criar Projeto Único
                  </a>
               </div>
            </div>
            
            <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#00D1FF]/20 to-[#FF006E]/20 rounded-[40px] blur-3xl animate-pulse"></div>
               <div className="w-full h-full bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden p-12 z-10 tilt-effect">
                   <img src="/logo.png" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] invert" alt="Sammy 3D" />
               </div>
            </div>
         </section>

         <div className="space-y-32">
            {loading ? (
              <div className="py-40 text-center text-slate-500 uppercase text-[12px] font-black tracking-[0.6em] animate-pulse">Lendo base de dados industrial...</div>
            ) : Object.keys(displayedProducts).length === 0 ? (
              <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[48px] bg-white/5">
                 <Box className="w-20 h-20 text-slate-700 mb-6" />
                 <p className="text-slate-500 uppercase text-[12px] tracking-[.3em] font-black">Nenhuma peça em catálogo</p>
              </div>
            ) : (
              Object.entries(displayedProducts).map(([category, items]) => (
                <section key={category} className="space-y-12">
                   <div className="flex items-center justify-between border-b border-white/10 pb-8">
                      <div className="space-y-2">
                         <h3 className="text-5xl font-black tracking-tighter text-white">{category}</h3>
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse"></div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-bold">{items.length} Modelos Verificados</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {items.map(p => (
                        <div key={p.id} className="group bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:border-[#00D1FF]/50 hover:bg-white/10 transition-all duration-300 flex flex-col h-full shadow-2xl">
                           
                           {/* IMAGEM DO PRODUTO */}
                           <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 mb-6 border border-white/5 flex items-center justify-center p-8 group-hover:shadow-[0_0_40px_rgba(0,209,255,0.1)] transition-all">
                              {p.imageUrl ? (
                                 <img 
                                   src={p.imageUrl} 
                                   alt={p.name} 
                                   className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" 
                                   onError={(e) => { e.currentTarget.style.display = "none"; }}
                                 />
                              ) : (
                                 <Box className="w-16 h-16 text-slate-800" />
                              )}
                              <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm border border-white/10 text-white rounded-lg flex items-center text-[9px] font-black uppercase tracking-widest z-10">
                                 REF: {p.sku || 'N/A'}
                              </div>
                           </div>

                           {/* INFORMAÇÕES */}
                           <div className="px-2 flex-1 flex flex-col">
                              <div className="space-y-2 mb-8">
                                 <h4 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-[#00D1FF] transition-colors">{p.name}</h4>
                                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black line-clamp-2">
                                    {p.description || "Design industrial de alta durabilidade."}
                                 </p>
                              </div>
                              
                              <div className="mt-auto flex items-end justify-between">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Investimento</span>
                                    <p className="text-3xl font-mono font-black text-white tracking-tighter">
                                       <span className="text-sm text-[#00D1FF] mr-1">R$</span>
                                       {p.sellingPrice.toFixed(2)}
                                    </p>
                                 </div>
                                 <button 
                                   onClick={() => handleAddToCart(p)}
                                   className="w-14 h-14 bg-white/10 hover:bg-[#00D1FF] text-white hover:text-black rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90"
                                 >
                                    <Plus className="w-6 h-6 stroke-[3]" />
                                 </button>
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

      {/* FLYOUT CART SIDERBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
           {/* BACKDROP */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
           
           {/* DRAWER */}
           <div className="relative w-full max-w-md bg-[#111111] h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
              
              <div className="h-24 px-8 border-b border-white/10 flex items-center justify-between bg-black/40">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#00D1FF]">
                       <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-white tracking-tight">Setor de Separação</h2>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cartItems.length} Itens na Fila</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                       <Box className="w-16 h-16 text-slate-600" />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nenhuma peça adicionada</p>
                    </div>
                 ) : (
                    cartItems.map(item => (
                       <div key={item.product.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-6">
                           <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/5 p-2 flex items-center justify-center">
                              {item.product.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-contain" /> : <Box className="w-6 h-6 text-slate-600" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-bold text-white truncate">{item.product.name}</h4>
                              <p className="text-[12px] font-mono text-[#00D1FF] font-bold">R$ {item.product.sellingPrice.toFixed(2)}</p>
                              
                              <div className="flex items-center gap-4 mt-3">
                                 <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white">-</button>
                                    <span className="w-8 text-center text-[12px] font-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white">+</button>
                                 </div>
                                 <button onClick={() => removeFromCart(item.product.id)} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Remover</button>
                              </div>
                           </div>
                       </div>
                    ))
                 )}
              </div>

              <div className="p-8 border-t border-white/10 bg-black/60 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Estimativa Tática</span>
                    <span className="text-3xl font-mono font-black text-white tracking-tighter">R$ {cartTotalAmount.toFixed(2)}</span>
                 </div>
                 
                 <button 
                   onClick={checkoutWhatsApp}
                   disabled={cartItems.length === 0}
                   className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all"
                 >
                    <MessageCircle className="w-5 h-5" /> Efetivar Via WhatsApp
                 </button>
              </div>
           </div>
        </div>
      )}

      <footer className="mt-40 bg-black border-t border-white/10 py-20 px-8 relative overflow-hidden">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00D1FF]/5 blur-[100px] rounded-full pointer-events-none" />
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
            <div className="text-center md:text-left space-y-6">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="bg-white p-2 rounded-xl">
                    <img src="/logo.png" className="w-8 h-8 object-contain invert" alt="Sammy" />
                  </div>
                  <span className="font-black text-3xl tracking-tighter text-white">sammy<span className="text-[#00D1FF]">3d</span></span>
               </div>
               <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">Infraestrutura digital para manufatura aditiva. <br /> Operando em Alagoinhas-BA.</p>
            </div>
            <div className="flex items-center gap-10">
               <nav className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                  <span className="hover:text-white cursor-pointer transition-colors">TikTok</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Configurações</span>
               </nav>
            </div>
         </div>
      </footer>
    </div>
  );
}
