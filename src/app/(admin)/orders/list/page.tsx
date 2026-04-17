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
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40 relative">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black">Gestão Comercial</h1>
              <p className="text-[14px] text-slate-500">Fluxo de caixa industrial e ordens de venda direta.</p>
           </div>
           <button 
             onClick={() => setIsAddingModo(!isAddingModo)}
             className="bg-black text-white px-4 py-2 h-10 rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
           >
             {isAddingModo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAddingModo ? "Fechar Checkout" : "Nova Venda Direta"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {isAddingModo && (
          <section className="bg-white border border-slate-100 rounded-xl p-8 mb-10 shadow-lg animate-in slide-in-from-top-4 duration-500 divide-y divide-slate-50">
             <div className="pb-8 grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-1.5"><label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identificador Cliente</label><input type="text" placeholder="Nome" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black" value={customerName} onChange={e=>setCustomerName(e.target.value)} /></div>
                   <div className="space-y-1.5"><label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">WhatsApp</label><input type="text" placeholder="(DD) 9XXXX-XXXX" maxLength={15} className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none font-mono" value={customerContact} onChange={handlePhoneChange} /></div>
                   
                   <div className="pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsPaid(!isPaid)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                          isPaid ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"
                        )}
                      >
                         <span className="text-[12px] font-bold uppercase tracking-widest">Status: {isPaid ? 'Pedido Pago' : 'Aguardando Pagamento'}</span>
                         {isPaid ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </button>
                   </div>
                </div>
                <div className="bg-[#FAFAFA] p-6 rounded-xl border border-slate-100 space-y-4">
                    <p className="text-[12px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Carrinho de Itens</p>
                    
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Canal de Venda: {saleChannel}</label>
                       <div className="flex bg-white border border-slate-100 rounded-lg p-0.5">
                          <button onClick={()=>setSaleChannel('DIRECT')} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all", saleChannel === 'DIRECT' ? "bg-black text-white" : "text-slate-400 hover:text-black")}>DIRETA</button>
                          <button onClick={()=>setSaleChannel('SHOPEE')} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all", saleChannel === 'SHOPEE' ? "bg-orange-600 text-white" : "text-slate-400 hover:text-orange-500")}>SHOPEE</button>
                          <button onClick={()=>setSaleChannel('ML')} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all", saleChannel === 'ML' ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-yellow-600")}>M.LIVRE</button>
                       </div>
                    </div>

                    <select className="w-full bg-white border border-slate-100 rounded-lg px-4 py-3 text-[14px]" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="">Selecionar Modelo...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <div className="flex gap-4"><input type="number" min="1" className="w-20 bg-white border border-slate-100 rounded-lg px-2 py-3 text-center font-bold" value={selectedQuantity} onChange={(e) => setSelectedQuantity(e.target.value)} /><button onClick={handleAddToCart} className="flex-1 bg-black text-white rounded-lg text-[13px] font-semibold hover:bg-slate-800">Lançar Item</button></div>
                </div>
             </div>
             
             <div className="pt-8 flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-4">
                   <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Resumo do Checkout</p>
                   {cart.length === 0 ? <p className="text-xs text-slate-400 py-10 text-center opacity-30 italic">Nenhum item selecionado.</p> : cart.map((item, i) => {
                     const p = products.find(prod => prod.id === item.productId);
                     return <div key={i} className="flex justify-between items-center bg-[#FAFAFA] border border-transparent p-3 rounded-lg hover:border-slate-100 transition-all text-sm font-semibold text-slate-700">
                        <span className="flex items-center gap-3"><span className="w-6 h-6 bg-white border border-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400">{item.quantity}x</span> {p?.name}</span>
                        <div className="flex items-center gap-4"><span className="font-mono text-slate-400">R$ {item.price.toFixed(2)}</span><Trash2 className="h-4 w-4 text-slate-200 cursor-pointer hover:text-red-500" onClick={()=>setCart(cart.filter((_, idx)=>idx!==i))} /></div>
                     </div>
                   })}
                </div>
                <div className="w-full md:w-[320px] bg-slate-50 border border-slate-100 p-6 rounded-xl flex flex-col gap-6">
                   <div className="text-right space-y-4">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Total Bruto:</p>
                         <p className="text-4xl font-bold text-slate-400 tracking-tighter opacity-70">R$ {finalTotal.toFixed(2)}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                         <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-2 italic flex items-center justify-end gap-2">
                           <DollarSign className="h-3 w-3" /> Recebimento Líquido:
                         </p>
                         <p className="text-5xl font-black text-black tracking-tighter">
                            R$ {(
                               saleChannel === 'DIRECT' ? finalTotal :
                               saleChannel === 'SHOPEE' ? (finalTotal * 0.86 - 5) :
                               (finalTotal * 0.88 - (finalTotal < 79 ? 6 : 0))
                            ).toFixed(2)}
                         </p>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 italic">
                            Descontadas as taxas {saleChannel}
                         </p>
                      </div>
                   </div>
                   <button onClick={handleCreateOrder} disabled={cart.length === 0} className="w-full bg-black text-white py-4 rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95">Confirmar e Salvar</button>
                </div>
             </div>
          </section>
        )}

        <div className="space-y-1">
           {/* SEARCH & TABLE HEADER VERCEL STYLE */}
           <div className="flex items-center justify-between pb-8 border-b border-slate-100 mb-6 gap-6">
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                 <input 
                   type="text" 
                   placeholder="Filtrar por cliente..." 
                   className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg pl-10 pr-4 py-2 text-[14px] outline-none hover:border-slate-200 focus:bg-white focus:border-black transition-all" 
                   value={searchTerm}
                   onChange={e=>setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex flex-1 items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-10 select-none">
                 <div className="flex-1 text-left">Cliente / Protocolo</div>
                 <div className="w-[180px] text-center">Produção</div>
                 <div className="w-[180px] text-center">Liquidação</div>
                 <div className="w-[120px] text-right">Valor Final</div>
                 <div className="w-[80px] text-right">Ação</div>
              </div>
           </div>

           {loading ? <div className="py-20 text-center opacity-30 text-[13px] tracking-widest font-mono italic">Sincronizando banco de dados...</div> : 
             filteredOrders.map(order => (
               <div 
                 key={order.id} 
                 className="flex flex-col border border-slate-100 rounded-xl mb-4 bg-white hover:border-black transition-all group relative overflow-hidden cursor-pointer"
                 onClick={() => setSelectedOrder(order)}
               >
                  <div className="flex items-center p-6 gap-6">
                     <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                           {order.customerName.substring(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[15px] font-bold text-black truncate leading-tight flex items-center gap-2">
                              {order.customerName}
                              <Globe className="h-3 w-3 text-slate-200" />
                           </h4>
                           <p className="text-[12px] text-slate-400 font-medium font-mono uppercase">ID: #{order.id.split('_')[1]?.substring(0,6) || order.id.substring(0,6)}</p>
                        </div>
                     </div>

                     <div className="w-[180px] flex justify-center">
                        {getStatusBadge(order.status)}
                     </div>

                     <div className="w-[180px] flex justify-center">
                        <div className={cn("px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1.5", order.paymentStatus === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-sky-50 text-sky-600 border-sky-100")}>
                           {order.paymentStatus === 'PAID' ? 'Liquidado' : 'Pendente'}
                        </div>
                     </div>

                     <div className="w-[120px] text-right">
                        <p className="text-[17px] font-bold text-black tracking-tight font-mono">R$ {order.totalAmount.toFixed(2)}</p>
                     </div>

                     <div className="w-[80px] flex justify-end">
                        <div className="p-2 border border-slate-100 rounded-md hover:bg-slate-50 transition-all">
                           <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                     </div>
                  </div>

                  <div className="px-6 py-2 bg-[#FAFAFA] border-t border-slate-50 flex items-center gap-10">
                     <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest"><Clock className="h-3 w-3" /> Produzido em {new Date(order.createdAt).toLocaleDateString()}</div>
                     <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest"><User className="h-3 w-3" /> Admin: sammy_root</div>
                     <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest"><Phone className="h-3 w-3" /> {order.customerContact || 'Direto / Laboratório'}</div>
                  </div>
               </div>
             ))
           }
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
           <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-black text-white">
                 <div>
                    <h3 className="text-xl font-bold tracking-tight">Detalhes da OS</h3>
                    <p className="text-[11px] font-mono text-slate-400 uppercase">Token: #{selectedOrder.id.substring(0,8)}</p>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest"><User className="h-4 w-4" /> Dados do Cliente</div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                       <p className="text-lg font-bold text-black">{selectedOrder.customerName}</p>
                       <p className="text-sm text-slate-500 mt-1">{selectedOrder.customerContact || 'Contato não informado'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest"><ShoppingCart className="h-4 w-4" /> Itens do Pedido</div>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                       {(selectedOrder.items || []).map((item, i) => (
                         <div key={i} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-all">
                            <div className="flex flex-col">
                               <span className="text-[14px] font-bold text-black">{item.product?.name || 'Item do Catálogo'}</span>
                               <span className="text-[11px] text-slate-400 uppercase font-bold tracking-widest">{item.quantity} unidades</span>
                            </div>
                            <span className="font-mono font-bold text-black">R$ {(item.price * item.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[13px] font-black uppercase text-black">Liquidação Total</span>
                       <span className="text-3xl font-black text-black tracking-tighter font-mono">R$ {selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="pt-6 space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mudar Status Logístico</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:border-black cursor-pointer shadow-sm"
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder, e.target.value)}
                          >
                             <option value="PENDING">Aguardando Produção</option>
                             <option value="PICKING">Pronta Entrega</option>
                             <option value="PRINTING">Em Produção (Impressora)</option>
                             <option value="FINISHED">Concluído / Embalado</option>
                             <option value="READY">Disponível p/ Retirada</option>
                             <option value="SHIPPED">Despachado / Enviado</option>
                             <option value="CANCELLED">Cancelado / Estornado</option>
                          </select>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status de Liquidação</label>
                          <select 
                            className={cn(
                               "w-full border rounded-xl px-4 py-3 text-[13px] font-bold outline-none transition-all cursor-pointer shadow-sm",
                               selectedOrder.paymentStatus === 'PAID' ? "bg-emerald-50 border-emerald-500 text-emerald-600" : 
                               selectedOrder.paymentStatus === 'PARTIAL' ? "bg-amber-50 border-amber-500 text-amber-600" :
                               "bg-sky-50 border-sky-500 text-sky-600"
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
                             <option value="PAID">Já Liquidado (Recebido)</option>
                             <option value="PENDING">Pagamento Pendente</option>
                             <option value="PARTIAL">Pagamento Parcial / Sinal</option>
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
