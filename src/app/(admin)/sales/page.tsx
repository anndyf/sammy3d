"use client"

import { useState, useEffect } from "react";
import { 
  Plus, 
  Printer, 
  CheckCircle2, 
  Package, 
  Search, 
  Clock, 
  Zap, 
  Target, 
  Box, 
  X, 
  ChevronRight, 
  ChevronDown,
  Globe, 
  MoreHorizontal, 
  DollarSign, 
  Truck, 
  Trash2, 
  Save,
  ArrowLeft,
  Filter,
  Eye,
  Edit3,
  ShoppingCart,
  Receipt,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product { id: string; name: string; sellingPrice: number; imageUrl?: string; sku?: string; calculatedCost?: number; }
interface OrderItem { id: string; productId?: string; customName?: string; quantity: number; price: number; product?: Product; }
interface Order { 
  id: string; 
  customerName: string; 
  status: string; 
  channel: string;
  orderNumber?: string;
  totalAmount: number; 
  createdAt: string; 
  items: OrderItem[]; 
  paymentStatus?: string;
  netRevenue?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'vendas' | 'estornos' | 'notas'>('vendas');
  const [searchTerm, setSearchTerm] = useState("");

  // NOVO PEDIDO STATES
  const [customerName, setCustomerName] = useState("Eu");
  const [channel, setChannel] = useState("Shoppe");
  const [orderNumber, setOrderNumber] = useState("123");
  const [cart, setCart] = useState<{productId?: string; customName?: string; quantity: number; price: number, sku?: string, calculatedCost?: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [customPrice, setCustomPrice] = useState("");
  const [netRevenue, setNetRevenue] = useState("");

  // STATE PARA VISUALIZAÇÃO E EDIÇÃO DO PEDIDO
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editChannel, setEditChannel] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState("");
  const [editNetRevenue, setEditNetRevenue] = useState("");

  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);

  let marketplaceTax = 0;
  if (channel === "Shoppe") {
    cart.forEach(item => {
      marketplaceTax += (item.price * item.quantity) * 0.20 + (4.00 * item.quantity);
    });
  } else if (channel === "Mercado Livre") {
    cart.forEach(item => {
      const fixedFee = item.price < 79 ? 6.00 * item.quantity : 0;
      marketplaceTax += (item.price * item.quantity) * 0.12 + fixedFee;
    });
  }

  const productionCost = cart.reduce((acc, c) => acc + ((c.calculatedCost || 0) * c.quantity), 0);
  const netProfit = Math.max(0, subtotal - marketplaceTax - productionCost);

  const fetchData = async () => {
    try {
      const [resO, resP] = await Promise.all([fetch('/api/orders'), fetch('/api/products')]);
      const oData = await resO.json();
      const pData = await resP.json();
      
      const mockOrders: Order[] = [
        {
          id: "12",
          customerName: "Eu",
          status: "ABERTO",
          channel: "Shoppe",
          totalAmount: 49.99,
          createdAt: "2026-05-15T10:00:00Z",
          items: [
            { id: "it1", quantity: 1, price: 49.99, customName: "Kit - Capela Arredondada - 12cm" }
          ]
        }
      ];

      setOrders(Array.isArray(oData) ? oData : (oData?.data ?? mockOrders));
      setProducts(Array.isArray(pData) ? pData : (pData?.data ?? []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSyncShopee = async () => {
    if (!confirm("Deseja sincronizar os pedidos recentes da Shopee? Isso pode levar alguns segundos.")) return;
    
    try {
      const res = await fetch('/api/shopee/sync-history', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Sincronização concluída com sucesso!");
        fetchData();
      } else {
        alert("Erro na sincronização: " + (data.error || "Desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão ao tentar sincronizar.");
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const p = products.find(prod => prod.id === productId);
    if (p) {
      setCustomPrice(p.sellingPrice.toString());
    } else {
      setCustomPrice("");
    }
  };

  const handleAddToCart = () => {
    const p = products.find(prod => prod.id === selectedProduct);
    if (p) {
      const finalPrice = customPrice !== "" ? Number(customPrice) : p.sellingPrice;
      setCart([...cart, { 
        productId: p.id, 
        customName: p.name,
        quantity: Number(selectedQuantity), 
        price: finalPrice, 
        sku: p.sku,
        calculatedCost: p.calculatedCost || 0
      }]);
      setSelectedProduct("");
      setSelectedQuantity("1");
      setCustomPrice("");
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    let activeCart = [...cart];
    
    // Auto-adicionar se o usuário selecionou o produto mas esqueceu de clicar no "+"
    if (activeCart.length === 0 && selectedProduct) {
      const p = products.find(prod => prod.id === selectedProduct);
      if (p) {
        const finalPrice = customPrice !== "" ? Number(customPrice) : p.sellingPrice;
        activeCart.push({
          productId: p.id,
          customName: p.name,
          quantity: Number(selectedQuantity),
          price: finalPrice,
          sku: p.sku,
          calculatedCost: p.calculatedCost || 0
        });
      }
    }

    if (activeCart.length === 0) {
      alert("Por favor, adicione pelo menos um produto ao carrinho antes de criar o pedido.");
      return;
    }

    let saleChannel: 'DIRECT' | 'SHOPEE' | 'ML' = 'DIRECT';
    if (channel === "Shoppe") saleChannel = 'SHOPEE';
    if (channel === "Mercado Livre") saleChannel = 'ML';

    const finalSubtotal = activeCart.reduce((acc, c) => acc + (c.price * c.quantity), 0);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || "Anônimo",
          status: "PENDING",
          type: "CATALOG",
          totalAmount: finalSubtotal,
          paymentStatus: 'PAID', // Venda de marketplace/direta gerada pela tela de Novo Pedido já entra como Paga/Receptada
          discountAmount: 0,
          saleChannel,
          items: activeCart.map(item => ({
            productId: item.productId,
            customName: item.customName,
            quantity: item.quantity,
            price: item.price
          })),
          netRevenue: netRevenue !== "" ? Number(netRevenue) : null
        })
      });

      if (response.ok) {
        setCart([]);
        setCustomerName("Eu");
        setChannel("Shoppe");
        setOrderNumber("");
        setNetRevenue("");
        setIsAdding(false);
        fetchData();
      } else {
        const errData = await response.json();
        alert("Erro ao criar pedido: " + (errData.error || response.statusText));
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao criar pedido.");
    }
  };

  const handleDispatchOrder = async (id: string) => {
    if (!confirm("Confirmar expedição e saída deste pedido? Isso registrará o pagamento como PAGO e gerará a receita no financeiro!")) return;
    try {
      const res = await fetch('/api/orders/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FINISHED', paymentStatus: 'PAID' })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao despachar pedido.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido permanentemente? Isso também removerá qualquer receita gerada por ele no financeiro!")) return;
    try {
      const res = await fetch('/api/orders/' + id, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao excluir pedido.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = order.items.map(function(item) {
        return "<tr>" +
          "<td>" + (item.customName || 'Produto') + "</td>" +
          "<td>" + item.quantity + "</td>" +
          "<td>R$ " + item.price.toFixed(2) + "</td>" +
          "<td>R$ " + (item.price * item.quantity).toFixed(2) + "</td>" +
        "</tr>";
      }).join("");

      printWindow.document.write(
        "<html>" +
          "<head>" +
            "<title>Ordem de Serviço #" + order.id + "</title>" +
            "<style>" +
              "body { font-family: sans-serif; padding: 40px; color: #333; }" +
              "h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }" +
              "table { width: 100%; border-collapse: collapse; margin-top: 20px; }" +
              "th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }" +
              "th { background-color: #f5f5f5; }" +
              ".footer { margin-top: 40px; font-weight: bold; text-align: right; font-size: 1.2rem; }" +
            "</style>" +
          "</head>" +
          "<body>" +
            "<h1>Ordem de Serviço - Sammy3D</h1>" +
            "<p><strong>Pedido ID:</strong> " + order.id + "</p>" +
            "<p><strong>Cliente:</strong> " + order.customerName + "</p>" +
            "<p><strong>Canal de Venda:</strong> " + order.channel + "</p>" +
            "<p><strong>Data:</strong> " + new Date(order.createdAt).toLocaleDateString('pt-BR') + "</p>" +
            "<p><strong>Status:</strong> " + order.status + "</p>" +
            
            "<table>" +
              "<thead>" +
                "<tr>" +
                  "<th>Item</th>" +
                  "<th>Qtd</th>" +
                  "<th>Preço</th>" +
                  "<th>Subtotal</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>" +
                itemsHtml +
              "</tbody>" +
            "</table>" +
            
            "<div class='footer'>" +
              "Total: R$ " + order.totalAmount.toFixed(2) +
            "</div>" +
            
            "<script>" +
              "window.onload = function() { window.print(); window.close(); }" +
            "</script>" +
          "</body>" +
        "</html>"
      );
      printWindow.document.close();
    }
  };

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditCustomerName(order.customerName || "");
    setEditChannel(order.channel || "Venda Direta");
    setEditStatus(order.status || "PENDING");
    setEditPaymentStatus(order.paymentStatus || 'UNPAID');
    setEditTotalAmount((order.totalAmount || 0).toString());
    setEditNetRevenue(order.netRevenue !== null && order.netRevenue !== undefined ? order.netRevenue.toString() : "");
    setIsEditOpen(true);
  };

  const handleOpenView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch('/api/orders/' + selectedOrder.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editCustomerName,
          channel: editChannel,
          status: editStatus,
          paymentStatus: editPaymentStatus,
          totalAmount: Number(editTotalAmount),
          netRevenue: editNetRevenue !== "" ? Number(editNetRevenue) : null
        })
      });
      if (res.ok) {
        setIsEditOpen(false);
        fetchData();
      } else {
        alert("Erro ao salvar alterações do pedido.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isAdding) {
    return (
      <div className="bg-transparent min-h-screen text-white font-sans select-none animate-in fade-in duration-500 pb-20">
        {/* HEADER NOVO PEDIDO */}
        <div className="flex items-center gap-4 mb-10 mt-2">
           <button 
             onClick={() => setIsAdding(false)} 
             className="p-2.5 bg-[#1a1d24] border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-lg active:scale-95"
           >
              <ArrowLeft className="h-5 w-5" />
           </button>
           <h1 className="text-3xl font-black text-white tracking-tight">Novo Pedido</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* LEFT COLUMN */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* DADOS DA VENDA */}
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Dados da Venda</h3>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="space-y-2">
                       <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</label>
                          <span className="text-[9px] font-black text-slate-600 uppercase flex items-center gap-1.5 bg-[#14161b] px-2 py-1 rounded">
                             <LockIcon className="h-2.5 w-2.5" /> Texto Livre (Busca Bloqueada)
                          </span>
                       </div>
                       <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                          <input 
                            type="text" 
                            className="w-full h-14 bg-[#14161b] border border-white/5 rounded-2xl pl-12 pr-12 text-sm text-white font-bold outline-none focus:border-cyan-500/50 transition-all shadow-inner" 
                            value={customerName}
                            onChange={e=>setCustomerName(e.target.value)}
                          />
                          <LockIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Canal de Venda</label>
                          <div className="relative">
                             <select 
                               className="w-full h-14 bg-[#14161b] border border-white/5 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                               value={channel}
                               onChange={e=>setChannel(e.target.value)}
                             >
                                <option value="Venda Direta">Venda Direta</option>
                                <option value="Shoppe">Shoppe</option>
                                <option value="Mercado Livre">Mercado Livre</option>
                             </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nº Pedido (Opcional)</label>
                          <div className="relative">
                             <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-mono font-bold">#</span>
                             <input 
                               type="text" 
                               className="w-full h-14 bg-[#14161b] border border-white/5 rounded-2xl pl-10 pr-5 text-sm text-white font-mono font-bold outline-none focus:border-cyan-500/50 transition-all shadow-inner" 
                               placeholder="123"
                               value={orderNumber}
                               onChange={e=>setOrderNumber(e.target.value)}
                             />
                          </div>
                       </div>

                        {channel !== "Venda Direta" && (
                           <div className="space-y-2 col-span-1 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Receita Líquida do Marketplace (Opcional - R$)</label>
                              <div className="relative">
                                 <input 
                                   type="number" 
                                   step="0.01"
                                   className="w-full h-14 bg-[#14161b] border border-cyan-500/20 rounded-2xl px-5 text-sm text-cyan-400 font-mono font-bold outline-none focus:border-cyan-500/50 transition-all shadow-inner" 
                                   placeholder="Deixe em branco para calcular automaticamente"
                                   value={netRevenue}
                                   onChange={e=>setNetRevenue(e.target.value)}
                                 />
                              </div>
                           </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* ADICIONAR PRODUTOS */}
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                 <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <ShoppingCart className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Adicionar Produtos</h3>
                 </div>

                 <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="w-full relative">
                       <select 
                         className="w-full h-14 bg-[#14161b] border border-white/5 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer" 
                         value={selectedProduct} 
                         onChange={e=>handleProductChange(e.target.value)}
                       >
                         <option value="">Selecione um produto...</option>
                         {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-1 relative">
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="Preço R$"
                            className="w-full h-14 bg-[#14161b] border border-white/5 rounded-2xl px-4 text-sm font-bold text-white text-center outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            value={customPrice} 
                            onChange={e=>setCustomPrice(e.target.value)} 
                          />
                       </div>
                       <input 
                         type="number" 
                         className="w-24 h-14 bg-[#14161b] border border-white/5 rounded-2xl px-4 text-sm font-bold text-white text-center outline-none focus:border-cyan-500/50 transition-all" 
                         value={selectedQuantity} 
                         onChange={e=>setSelectedQuantity(e.target.value)} 
                       />
                       <button 
                         onClick={handleAddToCart} 
                         className="w-14 h-14 shrink-0 bg-cyan-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-95 text-2xl font-black"
                       >+</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {cart.map((item, idx) => (
                       <div key={idx} className="bg-[#14161b] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/30 transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[#1a1d24] border border-white/5 rounded-xl flex items-center justify-center shadow-inner">
                                <Box className="h-6 w-6 text-cyan-400" />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">{item.customName || 'Produto'}</h4>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SKU: {item.sku || 'N/A'}</span>
                             </div>
                          </div>
                          
                          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-10 mt-4 md:mt-0 bg-[#1a1d24]/50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                             <div className="text-center flex-1 md:flex-none">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">QTD</p>
                                <div className="bg-[#1a1d24] px-4 py-1.5 rounded-lg border border-white/5 text-sm font-black text-white">{item.quantity}</div>
                             </div>
                             <div className="text-center flex-1 md:flex-none">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Preço Unit.</p>
                                <div className="bg-[#1a1d24] px-4 py-1.5 rounded-lg border border-white/5 text-sm font-black text-white font-mono">R$ {item.price.toFixed(2)}</div>
                             </div>
                             <div className="text-right flex-[2] md:flex-none">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Total</p>
                                <p className="text-lg font-black text-cyan-400 font-mono">R$ {(item.price * item.quantity).toFixed(2)}</p>
                             </div>
                             <button 
                               onClick={() => handleRemoveFromCart(idx)}
                               className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-end md:self-auto"
                             >
                                <Trash2 className="h-5 w-5" />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* DESPESAS / EMBALAGEM */}
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                 <div className="flex items-center gap-3 mb-6">
                    <TagIcon className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Despesas / Embalagem</h3>
                 </div>
                 
                 <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <select className="w-full h-12 bg-[#14161b] border border-white/5 rounded-xl px-4 text-[11px] font-bold text-white outline-none appearance-none cursor-pointer">
                          <option>Adicionar item...</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <input type="number" defaultValue="1" className="w-14 h-12 bg-[#14161b] border border-white/5 rounded-xl px-2 text-center text-[11px] font-bold text-white" />
                    <button className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-600/20">+</button>
                 </div>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="bg-[#1a1d24] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="space-y-5 relative z-10">
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-slate-500">Subtotal (Venda)</span>
                       <span className="text-sm font-black text-white font-mono">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-red-500/80">(-) Taxas Marketplace</span>
                       <span className="text-sm font-black text-red-500/80 font-mono">- R$ {marketplaceTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-slate-600">(-) Custo Prod. (Peça)</span>
                       <span className="text-sm font-black text-slate-600 font-mono">- R$ {productionCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-orange-500/80">(-) Custos Extras</span>
                       <span className="text-sm font-black text-orange-500/80 font-mono">- R$ 0.00</span>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-white/5 flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lucro Estimado</p>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Lucro Líquido</h3>
                    </div>
                    <p className="text-3xl font-black text-emerald-400 font-mono drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">R$ {netProfit.toFixed(2)}</p>
                 </div>

                 <button 
                   onClick={handleCreateOrder}
                   className="w-full h-18 bg-emerald-500 text-white rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                 >
                    <Receipt className="h-6 w-6 group-hover:rotate-12 transition-transform" /> Criar Pedido
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-in fade-in duration-500 pb-20">
      
      {/* HEADER SECTION (Image 1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Package className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Pedidos</h1>
         </div>
         
         <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-auto">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Buscar pedido..." 
                 className="w-full md:w-72 bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-medium outline-none focus:border-cyan-500/30 transition-all shadow-xl" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)} 
               />
            </div>
            <div className="relative w-full md:w-auto">
               <select className="w-full md:w-auto bg-[#1a1d24] border border-white/5 rounded-xl px-5 py-3 text-sm font-bold text-white outline-none appearance-none cursor-pointer pr-10 shadow-xl">
                  <option>Todos</option>
                  <option>Abertos</option>
                  <option>Finalizados</option>
               </select>
               <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#1a1d24] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 shadow-xl cursor-pointer hover:border-white/10">
               <div className="w-4 h-4 border-2 border-white/20 rounded mr-1"></div>
               Selecionar
            </div>
            <button 
              onClick={handleSyncShopee}
              className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto mt-2 md:mt-0"
            >
              <RotateCcw className="h-4 w-4" /> Sync Shopee
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-cyan-400 text-black px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95 w-full md:w-auto mt-2 md:mt-0"
            >
              <Plus className="h-5 w-5" /> Novo Pedido
            </button>
         </div>
      </div>

      {/* TABS (Image 1) */}
      <div className="flex items-center gap-2 bg-[#1a1d24]/50 p-2 rounded-2xl w-full md:w-fit mb-10 border border-white/5 overflow-x-auto whitespace-nowrap custom-scrollbar">
         <button 
           onClick={() => setActiveTab('vendas')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeTab === 'vendas' ? "bg-[#1e293b] text-cyan-400 border border-cyan-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            <ShoppingCart className="h-4 w-4" /> Vendas
         </button>
         <button 
           onClick={() => setActiveTab('estornos')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeTab === 'estornos' ? "bg-[#1e293b] text-cyan-400 border border-cyan-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            <RotateCcw className="h-4 w-4" /> Estornos
         </button>
         <button 
           onClick={() => setActiveTab('notas')}
           className={cn(
             "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
             activeTab === 'notas' ? "bg-[#1e293b] text-cyan-400 border border-cyan-500/20 shadow-lg" : "text-slate-500 hover:text-white"
           )}
         >
            <Receipt className="h-4 w-4" /> Notas Fiscais
         </button>
      </div>

      {/* ORDERS LIST (Image 1 Style) */}
      <div className="space-y-4">
         {orders.map(order => (
           <div key={order.id} className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 
                 <div className="flex items-center gap-6">
                    <div className="w-6 h-6 border-2 border-white/10 rounded-lg group-hover:border-cyan-500/50 transition-colors cursor-pointer flex items-center justify-center">
                       {/* Custom checkbox visual */}
                    </div>
                    
                    <div className="space-y-1">
                       <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-white tracking-tight truncate max-w-[300px] md:max-w-[400px]">
                            {order.channel?.toUpperCase() === 'SHOPPE' || order.channel?.toUpperCase() === 'SHOPEE' || order.channel?.toUpperCase() === 'MERCADO LIVRE' || order.channel?.toUpperCase() === 'ML'
                              ? (order.items && order.items.length > 0 
                                  ? order.items.map(i => i.customName || i.product?.name).filter(Boolean).join(', ') 
                                  : 'Pedido Marketplace')
                              : order.customerName}
                          </h3>
                          <span className="text-slate-500 text-xs font-medium">
                            ({order.customerName})
                          </span>
                          <span className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5">
                             {order.status}
                          </span>
                          <UserGroupIcon className="h-4 w-4 text-slate-600 hidden md:block" />
                       </div>
                       <div className="flex items-center gap-3 text-[11px] font-bold">
                          <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span className="text-slate-700">• via</span>
                          <span className="text-cyan-400/80 uppercase tracking-widest">{order.channel}</span>
                          <span className="bg-[#14161b] px-2 py-0.5 rounded text-slate-600 font-mono"># {order.id}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap md:flex-nowrap items-center gap-3 mt-4 md:mt-0">
                     <button 
                       onClick={() => handleOpenView(order)}
                       className="flex-1 md:flex-none p-3 bg-[#14161b] border border-white/5 rounded-xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-sm flex items-center justify-center"
                       title="Visualizar Pedido"
                     >
                        <Eye className="h-5 w-5" />
                     </button>
                     <button 
                       onClick={() => handlePrintOrder(order)}
                       className="flex-1 md:flex-none p-3 bg-[#14161b] border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                       title="Imprimir Pedido"
                     >
                        <Printer className="h-5 w-5" />
                     </button>
                     <button 
                       onClick={() => handleDispatchOrder(order.id)}
                       className="flex-[2] md:flex-none flex items-center justify-center gap-2 bg-[#10b981] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#059669] transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)] active:scale-95"
                       title="Dar Saída"
                     >
                        <Truck className="h-4 w-4" /> Saída
                     </button>
                     <button 
                       onClick={() => handleDeleteOrder(order.id)}
                       className="flex-1 md:flex-none p-3 bg-[#14161b] border border-white/5 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-sm flex items-center justify-center"
                       title="Excluir Pedido"
                     >
                        <Trash2 className="h-5 w-5" />
                     </button>
                     <button 
                       onClick={() => handleOpenEdit(order)}
                       className="flex-1 md:flex-none p-3 bg-[#14161b] border border-white/5 rounded-xl text-slate-700 hover:text-white transition-all shadow-sm flex items-center justify-center"
                       title="Editar Pedido"
                     >
                        <Edit3 className="h-5 w-5" />
                     </button>
                  </div>
              </div>

              {/* FOOTER OF ITEM CARD */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-start gap-4">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    {order.items.length} itens - Total:
                 </span>
                 <span className="text-lg font-black text-white font-mono">
                    R$ {order.totalAmount.toFixed(2)}
                 </span>
              </div>
           </div>
         ))}

         {orders.length === 0 && !loading && (
           <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                 <Box className="h-8 w-8 text-slate-700" />
              </div>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Nenhum pedido encontrado nesta aba.</p>
           </div>
         )}
      </div>

      {/* DETALHES DO PEDIDO MODAL */}
      {isViewOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewOpen(false)} />
           <div className="relative bg-[#1a1d24] border border-white/10 rounded-[2rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Detalhes do Pedido</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">ID: {selectedOrder.id}</p>
                 </div>
                 <button onClick={() => setIsViewOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cliente</span>
                       <span className="text-md font-bold text-white uppercase">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Canal de Venda</span>
                       <span className="text-md font-bold text-cyan-400 uppercase">{selectedOrder.channel}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status Operacional</span>
                       <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-slate-300">
                          {selectedOrder.status}
                       </span>
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status de Pagamento</span>
                       <span className={cn(
                          "inline-flex items-center px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          selectedOrder.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                       )}>
                          {selectedOrder.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                       </span>
                    </div>
                 </div>

                 <div className="border-t border-white/5 pt-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Itens do Pedido</span>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                       {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#14161b] border border-white/5 p-4 rounded-xl">
                             <div>
                                <h4 className="text-xs font-bold text-white uppercase">{item.customName || 'Produto'}</h4>
                                <span className="text-[9px] font-bold text-slate-600">Qtd: {item.quantity} x R$ {item.price.toFixed(2)}</span>
                             </div>
                             <span className="text-xs font-bold text-cyan-400 font-mono">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="border-t border-white/5 pt-6 flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor do Pedido</p>
                       <h3 className="text-xl font-black text-white uppercase">Total Geral</h3>
                    </div>
                    <p className="text-3xl font-black text-emerald-400 font-mono">R$ {selectedOrder.totalAmount.toFixed(2)}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* EDITAR PEDIDO MODAL */}
      {isEditOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditOpen(false)} />
           <div className="relative bg-[#1a1d24] border border-white/10 rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Editar Pedido</h2>
                 <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleUpdateOrder} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome do Cliente</label>
                    <input required type="text" className="w-full bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500" value={editCustomerName} onChange={e=>setEditCustomerName(e.target.value)} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Canal de Venda</label>
                       <select className="w-full h-[60px] bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-xs font-black text-white outline-none focus:border-cyan-500 appearance-none" value={editChannel} onChange={e=>setEditChannel(e.target.value)}>
                          <option value="Shoppe">Shopee</option>
                          <option value="Mercado Livre">Mercado Livre</option>
                          <option value="Venda Direta">Venda Direta</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Status Operacional</label>
                       <select className="w-full h-[60px] bg-[#14161b] border border-white/5 rounded-xl px-5 py-4 text-xs font-black text-white outline-none focus:border-cyan-500 appearance-none" value={editStatus} onChange={e=>setEditStatus(e.target.value)}>
                          <option value="PENDING">Pendente</option>
                          <option value="PICKING">Separação</option>
                          <option value="PRINTING">Imprimindo</option>
                          <option value="READY">Pronto</option>
                          <option value="FINISHED">Concluído</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-cyan-400 text-black h-16 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-xl shadow-cyan-400/10 mt-4">
                    Salvar Alterações
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}

// ICONS
function LockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function UserGroupIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function TagIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8z"/><line x1="7" x2="7.01" y1="7" y2="7"/>
    </svg>
  );
}
