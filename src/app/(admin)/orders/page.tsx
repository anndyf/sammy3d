"use client"

import { useState, useEffect } from "react";
import { Plus, ListTodo, Printer, CheckCircle2, Package, Search, Clock, Zap, Target, Box, X, ChevronRight, Globe, MoreHorizontal, DollarSign, Truck, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product { id: string; name: string; sellingPrice: number; imageUrl?: string; }
interface OrderItem { id: string; productId?: string; customName?: string; quantity: number; price: number; product?: Product; }
interface Order { id: string; customerName: string; status: string; type: string; totalAmount: number; createdAt: string; deadline?: string; notes?: string; weightGrams?: number; materialId?: string; paymentStatus?: string; items: OrderItem[]; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState<{productId?: string; customName?: string; quantity: number; price: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const fetchData = async () => {
    try {
      const [resO, resP] = await Promise.all([fetch('/api/orders'), fetch('/api/products')]);
      const oData = await resO.json();
      const pData = await resP.json();
      // Suporte ao novo formato paginado { data: [], meta: {} }
      setOrders(Array.isArray(oData) ? oData : (oData?.data ?? []));
      setProducts(Array.isArray(pData) ? pData : (pData?.data ?? []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddToCart = () => {
    if (isCustom) {
      if (!customName || !customPrice) return alert("Preencha o nome e valor.");
      setCart([...cart, { customName, quantity: Number(selectedQuantity), price: Number(customPrice) }]);
      setCustomName("");
      setCustomPrice("");
      setSelectedQuantity("1");
    } else {
      const p = products.find(prod => prod.id === selectedProduct);
      if (p) {
        setCart([...cart, { productId: p.id, quantity: Number(selectedQuantity), price: p.sellingPrice }]);
        setSelectedProduct("");
        setSelectedQuantity("1");
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Vazio.");
    const total = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);
    try {
      const res = await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || "Anônimo",
          status: "PENDING",
          type: cart.some(c => c.customName) ? "ORDER" : "CATALOG",
          totalAmount: total,
          items: cart
        })
      });
      if (res.ok) { setIsAdding(false); setCustomerName(""); setCart([]); fetchData(); }
    } catch (e) { console.error(e); }
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleTogglePayment = async (order: Order) => {
    const newStatus = order.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: newStatus }) });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar e excluir esta Ordem de Serviço? Isso não pode ser desfeito.")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };
  const pending = orders.filter(o => o.status === 'PENDING');
  const printing = orders.filter(o => o.status === 'PRINTING');
  const finished = orders.filter(o => o.status === 'FINISHED');
  const shipped = orders.filter(o => o.status === 'SHIPPED');

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <ListTodo className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Gestão de Vendas</h1>
         </div>
         <button 
           onClick={() => setIsAdding(!isAdding)}
           className="bg-cyan-500 text-black px-6 py-2.5 h-11 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg"
         >
           {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
           {isAdding ? "Cancelar Venda" : "Nova Venda"}
         </button>
      </div>

      <div className="space-y-12">
        
        {isAdding && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsAdding(false)} className="p-2 bg-[#1a1d24] border border-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                   <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-black text-white tracking-tight">Novo Pedido</h2>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: 8 COLS */}
                <div className="lg:col-span-8 space-y-8">
                   
                   {/* DADOS DA VENDA */}
                   <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-xl">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                         <Box className="h-5 w-5 text-indigo-400" />
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">Dados da Venda</h3>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cliente</label>
                               <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> Texto Livre (Busca Bloqueada)</span>
                            </div>
                            <div className="relative">
                               <input 
                                 type="text" 
                                 placeholder="Nome do cliente (Texto Livre)" 
                                 className="w-full bg-[#14161b] border border-white/5 rounded-xl px-12 py-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all font-bold" 
                                 value={customerName} 
                                 onChange={e=>setCustomerName(e.target.value)} 
                               />
                               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                               <Box className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700" />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Canal de Venda</label>
                               <select className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                  <option>Venda Direta</option>
                                  <option>Mercado Livre</option>
                                  <option>Shopee</option>
                               </select>
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nº Pedido (Opcional)</label>
                               <input 
                                 type="text" 
                                 placeholder="Ex: #123" 
                                 className="w-full bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500 transition-all font-mono" 
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* ADICIONAR PRODUTOS */}
                   <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-8 shadow-xl">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                         <Target className="h-5 w-5 text-cyan-400" />
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">Adicionar Produtos</h3>
                      </div>

                      <div className="flex gap-4 mb-8">
                         <select 
                           className="flex-1 bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all cursor-pointer" 
                           value={selectedProduct} 
                           onChange={e=>setSelectedProduct(e.target.value)}
                         >
                           <option value="">Selecione um produto...</option>
                           {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                         <input 
                           type="number" 
                           className="w-24 bg-[#14161b] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white text-center outline-none" 
                           value={selectedQuantity} 
                           onChange={e=>setSelectedQuantity(e.target.value)} 
                         />
                         <button onClick={handleAddToCart} className="w-14 h-14 bg-cyan-500 text-black rounded-xl flex items-center justify-center shadow-lg hover:bg-cyan-400 transition-all font-black text-xl">+</button>
                      </div>

                      <div className="bg-[#14161b]/50 border border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                         {cart.length === 0 ? (
                            <>
                               <Box className="h-12 w-12 text-slate-700 mb-4" />
                               <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Nenhum produto adicionado ao carrinho.</p>
                            </>
                         ) : (
                            <div className="w-full space-y-4">
                               {cart.map((c, i) => (
                                  <div key={i} className="flex justify-between items-center bg-[#14161b] p-4 rounded-xl border border-white/5">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#1a1d24] rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-black">{c.quantity}x</div>
                                        <span className="font-bold text-white">{c.customName || products.find(p=>p.id===c.productId)?.name}</span>
                                     </div>
                                     <span className="font-mono font-black text-cyan-400 text-lg">R$ {(c.price*c.quantity).toFixed(2)}</span>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* RIGHT COLUMN: 4 COLS */}
                <div className="lg:col-span-4 space-y-8">
                   
                   {/* DESPESAS / EMBALAGEM */}
                   <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                         <DollarSign className="h-5 w-5 text-amber-500" />
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">Despesas / Embalagem</h3>
                      </div>
                      
                      <div className="flex gap-2">
                         <select className="flex-1 bg-[#14161b] border border-white/5 rounded-lg px-4 py-3 text-[11px] font-bold text-white outline-none">
                            <option>Adicionar item...</option>
                         </select>
                         <input type="number" defaultValue="1" className="w-14 bg-[#14161b] border border-white/5 rounded-lg px-2 py-3 text-center text-[11px] font-bold text-white" />
                         <button className="w-10 h-10 bg-amber-500 text-black rounded-lg flex items-center justify-center font-black shadow-lg">+</button>
                      </div>
                   </div>

                   {/* SUMMARY */}
                   <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Subtotal (Venda)</span>
                            <span className="text-white font-mono font-bold">R$ {cart.reduce((acc,c)=>acc+(c.price*c.quantity),0).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-red-500/70 font-bold">(-) Taxas Marketplace</span>
                            <span className="text-red-500/70 font-mono font-bold">- R$ 0.00</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-red-500/70 font-bold">(-) Custo Prod. (Peça)</span>
                            <span className="text-red-500/70 font-mono font-bold">- R$ 0.00</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-red-500/70 font-bold">(-) Custos Extras</span>
                            <span className="text-red-500/70 font-mono font-bold">- R$ 0.00</span>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                         <div>
                            <p className="text-xl font-black text-white uppercase tracking-tight">Lucro Líquido</p>
                         </div>
                         <p className="text-2xl font-black text-emerald-400 font-mono">R$ {cart.reduce((acc,c)=>acc+(c.price*c.quantity),0).toFixed(2)}</p>
                      </div>

                      <button onClick={handleCreateOrder} className="w-full h-16 bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3">
                         <Save className="h-5 w-5" /> Criar Pedido
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
           
           {/* PENDENTE */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="h-4 w-4" /> Pendentes ({pending.length})</h4>
              </div>
              <div className="space-y-4">
                 {pending.map(order => (
                    <div key={order.id} className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group flex flex-col gap-4 shadow-lg">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-mono font-bold text-slate-500 tracking-tighter">#{order.id.slice(-6)}</span>
                             <span className="text-[9px] font-mono text-slate-600">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleTogglePayment(order); }} className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-sm", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#14161b] text-slate-400 border border-white/5 hover:border-white/20")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-bold text-white truncate">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                             {order.items.map(item => (
                                <span key={item.id} className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase", item.customName ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-slate-400 border-white/5 bg-[#14161b]")}>
                                   {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                </span>
                             ))}
                          </div>
                       </div>
                       <button onClick={(e)=>{ e.stopPropagation(); handleChangeStatus(order.id, 'PRINTING'); }} className="w-full py-3 bg-[#14161b] border border-white/5 text-slate-300 text-[11px] font-bold uppercase tracking-widest rounded-lg hover:text-white hover:bg-white/5 transition-all">Enviar para Produção &rarr;</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* EM PRODUÇÃO */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2"><Printer className="h-4 w-4" /> Produção ({printing.length})</h4>
              </div>
              <div className="space-y-4">
                 {printing.map(order => (
                    <div key={order.id} className="bg-[#1a1d24] border border-cyan-500/30 rounded-2xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Em Andamento</span>
                             <span className="text-[9px] font-mono text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#14161b] text-slate-400 border border-white/5")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-bold text-white">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                              {order.items.map(item => (
                                 <span key={item.id} className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase", item.customName ? "text-amber-500 border-amber-500/20 bg-amber-500/10" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20")}>
                                    {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                 </span>
                              ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'FINISHED')} className="w-full py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-cyan-500/20 transition-all">Finalizar &crarr;</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* PRONTO */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Pronto ({finished.length})</h4>
              </div>
              <div className="space-y-4">
                 {finished.map(order => (
                    <div key={order.id} className="bg-[#1a1d24] border border-white/5 border-l-4 border-l-emerald-500 rounded-2xl p-6 flex flex-col gap-4 shadow-lg group">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Aguardando Envio</span>
                             <span className="text-[9px] font-mono text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#14161b] text-slate-400 border border-white/5")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-bold text-white">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                              {order.items.map(item => (
                                 <span key={item.id} className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase", item.customName ? "text-amber-500 bg-amber-500/5 border-amber-500/20" : "text-slate-400 bg-[#14161b] border-white/5")}>
                                    {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                 </span>
                              ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'SHIPPED')} className="w-full py-3 bg-[#14161b] border border-white/5 text-slate-300 text-[11px] font-bold uppercase tracking-widest rounded-lg hover:text-white hover:bg-white/5 transition-all">Despachar Pedido</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* ENVIADOS (HISTÓRICO) */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Truck className="h-4 w-4" /> Histórico ({shipped.length})</h4>
              </div>
              <div className="space-y-4">
                 {shipped.map(order => (
                    <div key={order.id} className="bg-[#14161b] border border-white/5 rounded-2xl p-6 flex flex-col gap-3 group opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-mono text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                           <div className="flex gap-2 items-center">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 text-slate-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Enviado</span>
                           </div>
                        </div>
                       <p className="text-sm font-bold text-slate-400 group-hover:text-white truncate transition-colors">{order.customerName}</p>
                    </div>
                 ))}
                 {shipped.length === 0 && (
                   <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vazio</div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
