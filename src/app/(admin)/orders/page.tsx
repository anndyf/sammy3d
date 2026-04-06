"use client"

import { useState, useEffect } from "react";
import { Plus, ListTodo, Printer, CheckCircle2, Package, Search, Clock, Zap, Target, Box, X, ChevronRight, Globe, MoreHorizontal, DollarSign, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product { id: string; name: string; sellingPrice: number; imageUrl?: string; }
interface OrderItem { id: string; productId: string; quantity: number; price: number; product: Product; }
interface Order { id: string; customerName: string; status: string; type: string; totalAmount: number; createdAt: string; deadline?: string; notes?: string; weightGrams?: number; materialId?: string; paymentStatus?: string; items: OrderItem[]; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState<{productId: string; quantity: number; price: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");

  const fetchData = async () => {
    try {
      const [resO, resP] = await Promise.all([fetch('/api/orders'), fetch('/api/products')]);
      const oData = await resO.json();
      const pData = await resP.json();
      if (Array.isArray(oData)) setOrders(oData);
      if (Array.isArray(pData)) setProducts(pData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddToCart = () => {
    const p = products.find(prod => prod.id === selectedProduct);
    if (p) { setCart([...cart, { productId: p.id, quantity: Number(selectedQuantity), price: p.sellingPrice }]); setSelectedProduct(""); setSelectedQuantity("1"); }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Vazio.");
    const total = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);
    try {
      const res = await fetch('/api/orders', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: customerName || "Anônimo", status: "PENDING", type: "CATALOG", totalAmount: total, items: cart }) });
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
  const pending = orders.filter(o => o.status === 'PENDING');
  const printing = orders.filter(o => o.status === 'PRINTING');
  const finished = orders.filter(o => o.status === 'FINISHED');
  const shipped = orders.filter(o => o.status === 'SHIPPED');

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black">Linha de Produção</h1>
              <p className="text-[14px] text-slate-500">Controle tático de manufatura e fila de impressão 3D.</p>
           </div>
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="bg-black text-white px-4 py-2 h-10 rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
           >
             {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAdding ? "Cancelar OS" : "Nova Ordem de Serviço"}
           </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12">
        
        {isAdding && (
          <div className="bg-white border border-slate-100 rounded-xl p-8 mb-10 shadow-lg animate-in slide-in-from-top-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cliente</label><input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none" value={customerName} onChange={e=>setCustomerName(e.target.value)} /></div>
                <div className="bg-[#FAFAFA] p-6 rounded-xl border border-slate-100 space-y-4">
                   <div className="flex gap-4">
                      <select className="flex-1 bg-white border border-slate-100 rounded-lg px-4 py-3 text-[13px] font-semibold" value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}><option value="">Peça do Catálogo...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                      <button onClick={handleAddToCart} className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center shadow-md">+</button>
                   </div>
                </div>
             </div>
             <div className="flex flex-col gap-6">
                <div className="flex-1 bg-[#FAFAFA] border border-slate-100 rounded-xl p-6 min-h-[140px] space-y-3">
                   {cart.map((c, i) => <div key={i} className="flex justify-between items-center text-[13px] font-bold text-slate-600"><span>{c.quantity}x {products.find(p=>p.id===c.productId)?.name}</span><span>R$ {(c.price*c.quantity).toFixed(2)}</span></div>)}
                </div>
                <button onClick={handleCreateOrder} className="w-full h-14 bg-black text-white rounded-lg text-[14px] font-bold shadow-md hover:bg-slate-800 transition-all">Lançar OS na Fila</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
           
           {/* FILA PENDENTE */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="h-4 w-4" /> Fila OS ({pending.length})</h4>
              </div>
              <div className="space-y-4">
                 {pending.map(order => (
                    <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-black transition-all group shadow-sm flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-mono font-bold text-slate-300 tracking-tighter">#{order.id.slice(-6)}</span>
                             <span className="text-[9px] font-mono text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", order.paymentStatus === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-sky-50 text-sky-600 border-sky-100")}>
                             {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                          </button>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[14px] font-bold text-black truncate">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                             {order.items.map(item => (
                                <span key={item.id} className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                   {item.quantity}x {item.product.name}
                                </span>
                             ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'PRINTING')} className="w-full py-4 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-sm">Iniciar Manufatura &rarr;</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* IMPRESSORA */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                 <h4 className="text-[11px] font-bold text-[#0070F3] uppercase tracking-widest flex items-center gap-2"><Printer className="h-4 w-4" /> Impressora ({printing.length})</h4>
              </div>
              <div className="space-y-4">
                 {printing.map(order => (
                    <div key={order.id} className="bg-white border-2 border-[#0070F3]/40 rounded-2xl p-6 shadow-xl shadow-blue-500/5 flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-[#0070F3] uppercase tracking-[0.2em] animate-pulse">Em Processo</span>
                             <span className="text-[9px] font-mono text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", order.paymentStatus === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-sky-50 text-sky-600 border-sky-100")}>
                             {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                          </button>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[14px] font-bold text-black">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                             {order.items.map(item => (
                                <span key={item.id} className="text-[10px] font-medium text-[#0070F3] bg-blue-50 px-2 py-0.5 rounded-md border border-[#0070F3]/10">
                                   {item.quantity}x {item.product.name}
                                </span>
                             ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'FINISHED')} className="w-full py-4 bg-[#0070F3] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-md hover:brightness-110 transition-all">Finalizar Lote</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* PRONTO */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                 <h4 className="text-[11px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Finalizados ({finished.length})</h4>
              </div>
              <div className="space-y-4">
                 {finished.map(order => (
                    <div key={order.id} className="bg-white border border-slate-100 border-l-4 border-l-black rounded-2xl p-6 opacity-80 hover:opacity-100 transition-all flex flex-col gap-4">
                       <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-mono text-slate-300">Concluído</span>
                             <span className="text-[9px] font-mono text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          <button onClick={() => handleTogglePayment(order)} className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", order.paymentStatus === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-500" : "bg-sky-50 text-sky-600 border-sky-100")}>
                             {order.paymentStatus === 'PAID' ? 'Pago' : 'Pagar'}
                          </button>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[14px] font-bold text-black">{order.customerName}</p>
                          <div className="flex flex-wrap gap-1">
                             {order.items.map(item => (
                                <span key={item.id} className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                   {item.quantity}x {item.product.name}
                                </span>
                             ))}
                          </div>
                       </div>
                       <button onClick={()=>handleChangeStatus(order.id, 'SHIPPED')} className="w-full py-4 bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">Despachar Pedido</button>
                    </div>
                 ))}
              </div>
           </div>

           {/* ENVIADOS (HISTÓRICO) */}
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                 <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><Truck className="h-4 w-4" /> Enviados ({shipped.length})</h4>
              </div>
              <div className="space-y-4">
                 {shipped.map(order => (
                    <div key={order.id} className="bg-[#FAFAFA] border border-slate-100 rounded-2xl p-6 opacity-40 hover:opacity-60 transition-all flex flex-col gap-3 grayscale">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enviado</span>
                       </div>
                       <p className="text-[13px] font-bold text-slate-400 truncate">{order.customerName}</p>
                    </div>
                 ))}
                 {shipped.length === 0 && (
                   <div className="p-10 border-2 border-dashed border-slate-50 rounded-2xl text-center text-[10px] text-slate-200 uppercase tracking-widest font-bold">Nenhum Registro</div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
