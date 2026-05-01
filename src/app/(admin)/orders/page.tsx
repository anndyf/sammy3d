"use client"

import { useState, useEffect } from "react";
import { Plus, ListTodo, Printer, CheckCircle2, Package, Search, Clock, Zap, Target, Box, X, ChevronRight, Globe, MoreHorizontal, DollarSign, Truck, Trash2 } from "lucide-react";
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
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-white/5 px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">Linha de Produção</h1>
              <p className="text-[14px] text-slate-400">Controle tático de manufatura e fila de impressão 3D.</p>
           </div>
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="bg-white text-black px-6 py-2 h-10 rounded-lg text-[13px] font-bold hover:bg-slate-200 transition-all flex items-center gap-2 shadow-2xl"
           >
             {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAdding ? "Cancelar OS" : "Nova Ordem de Serviço"}
           </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12">
        
        {isAdding && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-10 shadow-2xl animate-in slide-in-from-top-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Cliente</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all" value={customerName} onChange={e=>setCustomerName(e.target.value)} /></div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem do Item</span>
                       <button onClick={() => setIsCustom(!isCustom)} className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", isCustom ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/10 text-white")}>
                          {isCustom ? 'Personalizado' : 'Catálogo'}
                       </button>
                    </div>
                    
                    <div className="flex gap-4">
                       {isCustom ? (
                          <div className="flex-1 flex gap-2">
                             <input type="text" placeholder="Nome do Item..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[13px] text-white outline-none focus:border-amber-500 transition-all font-bold" value={customName} onChange={e=>setCustomName(e.target.value)} />
                             <input type="number" placeholder="Preço" className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-[13px] text-white outline-none focus:border-amber-500 transition-all font-mono" value={customPrice} onChange={e=>setCustomPrice(e.target.value)} />
                          </div>
                       ) : (
                          <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[13px] font-bold text-white outline-none" value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}>
                            <option value="" className="bg-black text-white">Selecionar do Catálogo...</option>
                            {products.map(p=><option key={p.id} value={p.id} className="bg-black text-white">{p.name}</option>)}
                          </select>
                       )}
                       <button onClick={handleAddToCart} className={cn("w-12 h-12 rounded-lg flex items-center justify-center shadow-2xl font-black text-xl transition-all", isCustom ? "bg-amber-500 text-black" : "bg-white text-black hover:bg-slate-200")}>+</button>
                    </div>
                 </div>
             </div>
             <div className="flex flex-col gap-6">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 min-h-[140px] space-y-3 shadow-inner">
                   {cart.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">Carrinho Vazio</div>}
                   {cart.map((c, i) => (
                      <div key={i} className="flex justify-between items-center text-[13px] font-bold text-slate-300">
                        <span>{c.quantity}x {c.customName || products.find(p=>p.id===c.productId)?.name}</span>
                        <span>R$ {(c.price*c.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                </div>
                <button onClick={handleCreateOrder} className="w-full h-14 bg-blue-600 text-white rounded-lg text-[14px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-500 transition-all">Lançar OS na Fila &rarr;</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
           
           {/* FILA PENDENTE */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock className="h-4 w-4" /> Fila OS ({pending.length})</h4>
              </div>
              <div className="space-y-4">
                 {pending.map(order => (
                    <div key={order.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(0,112,243,0.1)] transition-all group flex flex-col gap-4 cursor-pointer shadow-2xl">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-mono font-bold text-slate-500 tracking-tighter group-hover:text-blue-400 transition-colors">#{order.id.slice(-6)}</span>
                             <span className="text-[9px] font-mono text-slate-600">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleTogglePayment(order); }} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-2xl", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500 border-white/10 hover:border-white hover:text-white")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[15px] font-bold text-white truncate tracking-tight">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                             {order.items.map(item => (
                                <span key={item.id} className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-tighter", item.customName ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-slate-400 border-white/5 bg-white/5")}>
                                   {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                </span>
                             ))}
                          </div>
                       </div>
                       <button onClick={(e)=>{ e.stopPropagation(); handleChangeStatus(order.id, 'PRINTING'); }} className="w-full py-3.5 bg-white/5 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all">Iniciar Manufatura &rarr;</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* IMPRESSORA */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2"><Printer className="h-4 w-4" /> Impressora ({printing.length})</h4>
              </div>
              <div className="space-y-4">
                 {printing.map(order => (
                    <div key={order.id} className="bg-white/5 backdrop-blur-md border-2 border-blue-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,112,243,0.2)] flex flex-col gap-4 relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">Em Manufatura</span>
                             <span className="text-[9px] font-mono text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500 border-white/10")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[15px] font-bold text-white tracking-tight leading-tight">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                              {order.items.map(item => (
                                 <span key={item.id} className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border uppercase", item.customName ? "text-amber-400 border-amber-500/20 bg-amber-500/10" : "text-blue-400 bg-blue-500/10 border-blue-500/20")}>
                                    {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                 </span>
                              ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'FINISHED')} className="w-full py-4 bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:brightness-110 transition-all">Finalizar Lote &crarr;</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* PRONTO */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Finalizados ({finished.length})</h4>
              </div>
              <div className="space-y-4">
                 {finished.map(order => (
                    <div key={order.id} className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-emerald-500 rounded-2xl p-6 opacity-60 hover:opacity-100 transition-all flex flex-col gap-4 shadow-2xl group">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Concluído</span>
                             <span className="text-[9px] font-mono text-slate-600">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                           <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500 border-white/10")}>
                                 {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                              </button>
                           </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[15px] font-bold text-white tracking-tight">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                              {order.items.map(item => (
                                 <span key={item.id} className={cn("text-[9px] font-medium px-2 py-0.5 rounded-md uppercase", item.customName ? "text-amber-500 bg-amber-500/5 border border-amber-500/10" : "text-slate-500 bg-white/5")}>
                                    {item.quantity}x {item.customName || item.product?.name || "Sem Nome"}
                                 </span>
                              ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'SHIPPED')} className="w-full py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all shadow-2xl">Despachar Pedido</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* ENVIADOS (HISTÓRICO) */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                 <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><Truck className="h-4 w-4" /> Histórico ({shipped.length})</h4>
              </div>
              <div className="space-y-4">
                 {shipped.map(order => (
                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 opacity-30 hover:opacity-100 transition-all flex flex-col gap-3 group grayscale hover:grayscale-0">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-mono text-slate-600 group-hover:text-white transition-colors">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                           <div className="flex gap-2 items-center">
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="px-2 py-1 text-slate-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                 <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Enviado</span>
                           </div>
                        </div>
                       <p className="text-[14px] font-bold text-slate-500 group-hover:text-white truncate transition-colors">{order.customerName}</p>
                    </div>
                 ))}
                 {shipped.length === 0 && (
                   <div className="p-10 border-2 border-dashed border-white/5 rounded-2xl text-center text-[10px] text-slate-700 uppercase tracking-widest font-black italic">Vazio</div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
