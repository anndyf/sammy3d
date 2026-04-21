"use client"

import { useState, useEffect } from "react";
import { Search, Plus, Eye, ChevronDown, ChevronUp, Package, Clock, CheckCircle2, Truck, AlertCircle, DollarSign, X, ShoppingCart, Trash2, CreditCard, Banknote, Phone, MessageSquare, User, ArrowRight, MoreHorizontal, LayoutGrid, List, Monitor, Command, Info, Globe, Smartphone, Bell, Share2, Receipt, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product { id: string; name: string; sellingPrice: number; imageUrl?: string; }
interface OrderItem { id: string; product: { name: string; imageUrl?: string; }; quantity: number; price: number; }
interface Order { id: string; customerName: string; customerContact?: string; status: string; type: string; totalAmount: number; discountAmount: number; paymentStatus: string; notes?: string; deadline?: string; createdAt: string; items: OrderItem[]; }

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingModo, setIsAddingModo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [cart, setCart] = useState<{productId: string; quantity: number; price: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [saleChannel, setSaleChannel] = useState<'DIRECT' | 'SHOPEE' | 'ML'>('DIRECT');

  const formatPhone = (v: string) => {
    v = v.replace(/\D/g, ""); 
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerContact(formatPhone(e.target.value));
  };

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
    const p = products.find(prod => prod.id === selectedProduct);
    if (p) {
      setCart([...cart, { productId: p.id, quantity: Number(selectedQuantity), price: p.sellingPrice }]);
      setSelectedProduct(""); setSelectedQuantity("1");
    }
  };

  const cartTotal = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);
  const finalTotal = Math.max(0, cartTotal - parseFloat(discount || "0"));

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Vazio.");
    try {
      const res = await fetch('/api/orders', {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || "Anônimo", customerContact, 
          status: "PENDING", type: "CATALOG", totalAmount: finalTotal,
          paymentStatus: isPaid ? 'PAID' : 'PENDING',
          discountAmount: parseFloat(discount || "0"),
          saleChannel, 
          items: cart
        })
      });
      if (res.ok) {
        setIsAddingModo(false); setCustomerName(""); setCustomerContact(""); setCart([]); setDiscount("0"); setIsPaid(false);
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 uppercase tracking-widest shadow-sm border transition-all";
    switch (status) {
      case 'PENDING': return <span className={cn(base, "bg-amber-50 text-amber-600 border-amber-100")}><Clock className="h-3 w-3" /> Aguardando</span>;
      case 'PICKING': return <span className={cn(base, "bg-sky-50 text-sky-600 border-sky-100")}><Package className="h-3 w-3" /> Pronta Entrega</span>;
      case 'PRINTING': return <span className={cn(base, "bg-blue-50 text-blue-600 border-blue-100 animate-pulse")}><Zap className="h-3 w-3" /> Em Produção</span>;
      case 'FINISHED': return <span className={cn(base, "bg-emerald-50 text-emerald-600 border-emerald-100")}><CheckCircle2 className="h-3 w-3" /> Concluído</span>;
      case 'READY': return <span className={cn(base, "bg-indigo-50 text-indigo-600 border-indigo-100")}><Globe className="h-3 w-3" /> Retirada</span>;
      case 'SHIPPED': return <span className={cn(base, "bg-slate-50 text-slate-400 border-slate-100")}><Truck className="h-3 w-3" /> Despachado</span>;
      default: return <span className={cn(base, "bg-slate-50 text-slate-400 border-slate-100")}>{status}</span>;
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) {
        fetchData();
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (e) { console.error(e); }
  };

  const filteredOrders = orders.filter(o => o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-black min-h-screen text-white font-sans select-none animate-fade-in pb-40 relative">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-white/10 px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00D1FF]/5 blur-[80px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                 Gestão Comercial
              </h1>
              <p className="text-[14px] text-slate-400">Fluxo de caixa industrial e ordens de venda direta.</p>
           </div>
           <button 
             onClick={() => setIsAddingModo(!isAddingModo)}
             className="bg-white text-black px-5 py-2.5 h-11 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
           >
             {isAddingModo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAddingModo ? "Fechar Checkout" : "Nova Venda Direta"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {isAddingModo && (
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-8 mb-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-500 divide-y divide-white/5 relative overflow-hidden">
             <div className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none" />
             <div className="pb-8 grid grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Identificador Cliente</label><input type="text" placeholder="Nome do Cliente" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:bg-black focus:border-[#00D1FF] text-white transition-colors" value={customerName} onChange={e=>setCustomerName(e.target.value)} /></div>
                   <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">WhatsApp</label><input type="text" placeholder="(DD) 9XXXX-XXXX" maxLength={15} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none font-mono focus:bg-black focus:border-[#00D1FF] text-white transition-colors" value={customerContact} onChange={handlePhoneChange} /></div>
                   
                   <div className="pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsPaid(!isPaid)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                          isPaid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                      >
                         <span className="text-[10px] font-black uppercase tracking-widest">Status: {isPaid ? 'Pedido Pago (Capturado)' : 'Aguardando Pagamento'}</span>
                         {isPaid ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </button>
                   </div>
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/10 space-y-4">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-[#00D1FF]" /> Carrinho de Itens</p>
                    
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Canal de Captação</label>
                       <div className="flex gap-1 border border-white/10 rounded-lg p-1 bg-black/50">
                          <button onClick={()=>setSaleChannel('DIRECT')} className={cn("flex-1 py-1.5 text-[9px] font-black tracking-widest rounded-md transition-all uppercase", saleChannel === 'DIRECT' ? "bg-[#00D1FF] text-black" : "text-slate-400 hover:text-white")}>DIRETA</button>
                          <button onClick={()=>setSaleChannel('SHOPEE')} className={cn("flex-1 py-1.5 text-[9px] font-black tracking-widest rounded-md transition-all uppercase", saleChannel === 'SHOPEE' ? "bg-[#FF4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.3)]" : "text-slate-400 hover:text-[#FF4500]")}>SHOPEE</button>
                          <button onClick={()=>setSaleChannel('ML')} className={cn("flex-1 py-1.5 text-[9px] font-black tracking-widest rounded-md transition-all uppercase", saleChannel === 'ML' ? "bg-[#FFE600] text-black shadow-[0_0_15px_rgba(255,230,0,0.3)]" : "text-slate-400 hover:text-[#FFE600]")}>M.LIVRE</button>
                       </div>
                    </div>

                    <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:bg-black focus:border-[#00D1FF] outline-none" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="">Puxar do modelo 3D...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <div className="flex gap-4">
                       <input type="number" min="1" className="w-20 bg-black/50 border border-white/10 rounded-xl px-2 py-3 text-center font-bold text-white focus:border-[#00D1FF] focus:bg-black outline-none" value={selectedQuantity} onChange={(e) => setSelectedQuantity(e.target.value)} />
                       <button onClick={handleAddToCart} className="flex-1 bg-white/10 border border-white/10 text-white rounded-xl text-[11px] uppercase tracking-widest font-black hover:bg-[#00D1FF] hover:text-black hover:border-[#00D1FF] transition-all">Lançar Item</button>
                    </div>
                </div>
             </div>
             
             <div className="pt-8 flex flex-col md:flex-row gap-12 items-start relative z-10">
                <div className="flex-1 space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Borderô Interno</p>
                   {cart.length === 0 ? <p className="text-xs text-slate-600 py-10 text-center uppercase tracking-widest font-black">Lista vazia.</p> : cart.map((item, i) => {
                     const p = products.find(prod => prod.id === item.productId);
                     return <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl hover:border-white/20 transition-all text-sm font-semibold text-slate-200">
                        <span className="flex items-center gap-3"><span className="w-6 h-6 bg-black border border-white/10 rounded flex items-center justify-center text-[10px] text-slate-400">{item.quantity}x</span> {p?.name}</span>
                        <div className="flex items-center gap-4"><span className="font-mono text-[#00D1FF]">R$ {item.price.toFixed(2)}</span><Trash2 className="h-4 w-4 text-red-500 opacity-50 cursor-pointer hover:opacity-100" onClick={()=>setCart(cart.filter((_, idx)=>idx!==i))} /></div>
                     </div>
                   })}
                </div>
                <div className="w-full md:w-[320px] bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-6">
                   <div className="text-right space-y-4">
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Bruto Estimado:</p>
                         <p className="text-4xl font-mono font-black text-slate-400 tracking-tighter opacity-70">R$ {finalTotal.toFixed(2)}</p>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                         <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                           <DollarSign className="h-3 w-3" /> Recebimento Líquido:
                         </p>
                         <p className="text-5xl font-mono font-black text-white tracking-tighter">
                            R$ {(
                               saleChannel === 'DIRECT' ? finalTotal :
                               saleChannel === 'SHOPEE' ? (finalTotal * 0.86 - 5) :
                               (finalTotal * 0.88 - (finalTotal < 79 ? 6 : 0))
                            ).toFixed(2)}
                         </p>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
                            Aplicada a taxa {saleChannel}
                         </p>
                      </div>
                   </div>
                   <button onClick={handleCreateOrder} disabled={cart.length === 0} className="w-full bg-[#00D1FF] text-black py-4 rounded-xl text-[12px] uppercase tracking-widest font-black hover:bg-white transition-all shadow-[0_0_30px_rgba(0,209,255,0.2)] active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500">Confirmar Operação</button>
                </div>
             </div>
          </section>
        )}

        <div className="space-y-1">
           {/* SEARCH & TABLE HEADER */}
           <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 gap-6">
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Pesquisar por ID ou Cliente..." 
                   className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[13px] outline-none hover:border-white/20 focus:bg-white/10 focus:border-[#00D1FF] transition-all text-white placeholder:text-slate-500" 
                   value={searchTerm}
                   onChange={e=>setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex flex-1 items-center gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest pl-10 select-none">
                 <div className="flex-1 text-left">Cliente / Protocolo</div>
                 <div className="w-[180px] text-center">Setor Produção</div>
                 <div className="w-[180px] text-center">Liquidação</div>
                 <div className="w-[120px] text-right">Valor Líquido</div>
                 <div className="w-[80px] text-right">Ação</div>
              </div>
           </div>

           {loading ? <div className="py-20 text-center opacity-30 text-[10px] tracking-[0.3em] uppercase font-black">Verificando Telemetria...</div> : 
             filteredOrders.map(order => (
               <div 
                 key={order.id} 
                 className="flex flex-col border border-white/5 rounded-2xl mb-4 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer shadow-lg"
                 onClick={() => setSelectedOrder(order)}
               >
                  <div className="flex items-center p-5 gap-6">
                     <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 text-slate-400 flex items-center justify-center text-xs font-black shadow-inner group-hover:bg-[#00D1FF] group-hover:text-black group-hover:border-[#00D1FF] transition-all">
                           {order.customerName.substring(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[14px] font-bold text-white truncate leading-tight flex items-center gap-2 group-hover:text-[#00D1FF] transition-colors">
                              {order.customerName}
                           </h4>
                           <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">REF: {order.id.split('_')[1]?.substring(0,6) || order.id.substring(0,6)}</p>
                        </div>
                     </div>

                     <div className="w-[180px] flex justify-center">
                        {getStatusBadge(order.status)}
                     </div>

                     <div className="w-[180px] flex justify-center">
                        <div className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5", order.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-400 border-white/10")}>
                           {order.paymentStatus === 'PAID' ? 'Liquidado' : 'Aguardando'}
                        </div>
                     </div>

                     <div className="w-[120px] text-right">
                        <p className="text-[16px] font-bold text-white tracking-tight font-mono">R$ {order.totalAmount.toFixed(2)}</p>
                     </div>

                     <div className="w-[80px] flex justify-end">
                        <div className="p-2 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-slate-400 group-hover:text-white">
                           <ChevronDown className="h-4 w-4" />
                        </div>
                     </div>
                  </div>

                  <div className="px-6 py-2.5 bg-black/40 border-t border-white/5 flex items-center gap-10">
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest"><Clock className="h-3 w-3" /> Em: {new Date(order.createdAt).toLocaleDateString()}</div>
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest"><User className="h-3 w-3" /> OS Auth: GUEST</div>
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest"><Phone className="h-3 w-3" /> WPP: {order.customerContact || 'Laboratório Interno'}</div>
                  </div>
               </div>
             ))
           }
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
           <div className="relative w-full max-w-md bg-[#111111] h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black text-white">
                 <div>
                    <h3 className="text-xl font-black tracking-tight text-[#00D1FF]">Parâmetros O.S.</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">TOKEN: {selectedOrder.id.substring(0,8)}</p>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><User className="h-4 w-4" /> Cliente</div>
                    <div className="bg-black/50 p-6 rounded-xl border border-white/10">
                       <p className="text-lg font-bold text-white">{selectedOrder.customerName}</p>
                       <p className="text-[11px] font-black tracking-widest text-[#00D1FF] mt-1">{selectedOrder.customerContact || 'S/ Contato'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><ShoppingCart className="h-4 w-4" /> Lote de Fabricação</div>
                    <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/30">
                       {(selectedOrder.items || []).map((item, i) => (
                         <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition-all">
                            <div className="flex flex-col">
                               <span className="text-[13px] font-bold text-white">{item.product?.name || 'Item Avulso'}</span>
                               <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.quantity} volumes</span>
                            </div>
                            <span className="font-mono font-bold text-[#00D1FF]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Liquidado</span>
                       <span className="text-3xl font-black text-white tracking-tighter font-mono">R$ {selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-[#00D1FF] uppercase tracking-widest pl-1">Avançar Setor Operacional</label>
                          <select 
                            className="w-full bg-black border border-white/20 text-white rounded-xl px-4 py-3 text-[12px] font-bold outline-none focus:border-[#00D1FF] cursor-pointer"
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder, e.target.value)}
                          >
                             <option value="PENDING">Aguardando Produção</option>
                             <option value="PICKING">Pronta Entrega</option>
                             <option value="PRINTING">Em Produção (Impressora 3D)</option>
                             <option value="FINISHED">Manufatura Concluída</option>
                             <option value="READY">Disponível p/ Retirada</option>
                             <option value="SHIPPED">Despachado / Enviado</option>
                             <option value="CANCELLED">Estornado</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Auditoria Financeira</label>
                          <select 
                            className={cn(
                               "w-full rounded-xl px-4 py-3 text-[12px] uppercase tracking-widest font-black outline-none transition-all cursor-pointer",
                               selectedOrder.paymentStatus === 'PAID' ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : 
                               selectedOrder.paymentStatus === 'PARTIAL' ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
                               "bg-white/5 border border-white/10 text-slate-300"
                            )}
                            value={selectedOrder.paymentStatus}
                            onChange={async (e) => {
                               const newStatus = e.target.value;
                               try {
                                  const res = await fetch(`/api/orders/${selectedOrder.id}`, { 
                                     method: "PUT", 
                                     headers: { "Content-Type": "application/json" }, 
                                     body: JSON.stringify({ paymentStatus: newStatus }) 
                                  });
                                  if (res.ok) {
                                     fetchData();
                                     setSelectedOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
                                  }
                               } catch (err) { console.error(err); }
                            }}
                          >
                             <option value="PAID">Capital Integralizado (Pago)</option>
                             <option value="PENDING">Aberto (Não Pago)</option>
                             <option value="PARTIAL">Sinal de Produção</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
