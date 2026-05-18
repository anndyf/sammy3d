"use client"

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Download, 
  Printer, 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  Loader2,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BestSellerItem {
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  historicQty: number;
  currentQty: number;
}

export default function AdvancedReportsPage() {
  const [ranking, setRanking] = useState<BestSellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("30");

  // Dados MOCK mantidos para demonstrar os outros gráficos de impressora
  const weeklyProduction = [
    { day: "Seg", success: 80, fail: 20, label: "24h" },
    { day: "Ter", success: 95, fail: 5, label: "26h" },
    { day: "Qua", success: 60, fail: 40, label: "18h" },
    { day: "Qui", success: 100, fail: 0, label: "30h" },
    { day: "Sex", success: 85, fail: 15, label: "22h" },
    { day: "Sáb", success: 90, fail: 10, label: "25h" },
    { day: "Dom", success: 40, fail: 10, label: "8h" },
  ];

  const materialUsage = [
    { name: "PLA Preto", used: 8.5, max: 10, color: "bg-cyan-500" },
    { name: "PETG Cinza", used: 4.2, max: 10, color: "bg-indigo-500" },
    { name: "ABS Branco", used: 2.1, max: 10, color: "bg-emerald-500" },
    { name: "Resina Standard", used: 1.5, max: 10, color: "bg-amber-500" },
  ];

  const printers = [
    { name: "Bambu Lab P1S", status: "online", efficiency: 98, hours: 340 },
    { name: "Creality K1", status: "online", efficiency: 85, hours: 210 },
    { name: "Elegoo Saturn 3", status: "maintenance", efficiency: 60, hours: 45 },
    { name: "Ender 3 V2", status: "offline", efficiency: 40, hours: 1200 },
  ];

  // Carrega e processa pedidos para gerar o ranking de itens mais vendidos real-time
  useEffect(() => {
    async function loadBestSellers() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders?limit=5000');
        const json = await res.json();
        const ordersList = Array.isArray(json) ? json : (json?.data ?? []);
        
        const counts: Record<string, BestSellerItem> = {};

        ordersList.forEach((order: any) => {
          // Apenas pedidos concluídos (FINISHED) contam nos relatórios financeiros e de vendas
          if (order.status !== 'FINISHED') return;

          const isHistoric = order.notes?.includes('[HISTÓRICO]') || order.notes?.includes('[HISTORICO]') || false;

          (order.items || []).forEach((item: any) => {
            // Chave única baseada no ID do produto ou nome customizado
            const key = item.productId || item.customName || 'desconhecido';
            if (!counts[key]) {
              counts[key] = {
                name: item.customName || item.product?.name || 'Produto Sem Nome',
                sku: item.product?.sku || 'Sem SKU',
                quantity: 0,
                revenue: 0,
                historicQty: 0,
                currentQty: 0
              };
            }
            
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            
            counts[key].quantity += qty;
            counts[key].revenue += qty * price;
            
            if (isHistoric) {
              counts[key].historicQty += qty;
            } else {
              counts[key].currentQty += qty;
            }
          });
        });

        const sorted = Object.values(counts).sort((a, b) => b.quantity - a.quantity);
        setRanking(sorted);
      } catch (err) {
        console.error("Erro ao computar itens mais vendidos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBestSellers();
  }, [timeRange]);

  // Estatísticas agregadas baseadas no ranking
  const totalItemsSold = ranking.reduce((acc, item) => acc + item.quantity, 0);
  const totalHistoricSold = ranking.reduce((acc, item) => acc + item.historicQty, 0);
  const totalCurrentSold = ranking.reduce((acc, item) => acc + item.currentQty, 0);
  const totalSalesRevenue = ranking.reduce((acc, item) => acc + item.revenue, 0);

  // Filtra itens com base na barra de pesquisa
  const filteredRanking = ranking.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1a1d24] border border-white/5 rounded-2xl flex relative shadow-lg">
               <BarChart3 className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 uppercase italic">
                Painel de Inteligência e Vendas
              </h1>
              <p className="text-xs text-slate-500 font-bold">BI, Analytics e classificação profunda do catálogo de produtos vendidos.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
               <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <select 
                 value={timeRange}
                 onChange={(e) => setTimeRange(e.target.value)}
                 className="w-48 bg-[#14161b] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black text-white outline-none focus:border-cyan-500 transition-all cursor-pointer appearance-none uppercase tracking-widest shadow-md"
               >
                  <option value="30">Últimos 30 Dias</option>
                  <option value="7">Últimos 7 Dias</option>
                  <option value="year">Este Ano</option>
               </select>
            </div>
            <button className="bg-[#14161b] border border-white/5 text-slate-400 px-5 py-2.5 h-10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all flex items-center gap-2 shadow-md">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
         </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Faturamento Líquido</span>
               <div className="flex items-center gap-1 text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  <TrendingUp className="h-3 w-3" /> Receita
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
              R$ {totalSalesRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Soma de todas as vendas concluídas</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total de Itens Vendidos</span>
               <div className="flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  <ShoppingBag className="h-3 w-3" /> Volume
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
              {totalItemsSold} <span className="text-xs text-slate-500 font-bold">und</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Quantidade total de produtos expedidos</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vendas Históricas</span>
               <div className="flex items-center gap-1 text-[9px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  <Bookmark className="h-3 w-3" /> Sem Estoque
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
              {totalHistoricSold} <span className="text-xs text-slate-500 font-bold">und</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Importadas sem deduzir inventário</p>
         </div>

         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vendas Atuais</span>
               <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3" /> Estoque Real
               </div>
            </div>
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter relative z-10">
              {totalCurrentSold} <span className="text-xs text-slate-500 font-bold">und</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-2 relative z-10">Vendas que deram baixa no inventário</p>
         </div>
      </div>

      {/* SEÇÃO PRINCIPAL: RANKING DE ITENS MAIS VENDIDOS */}
      <div className="bg-[#1a1d24] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-pulse" /> Classificação de Itens Mais Vendidos (Catálogo)
               </h3>
               <p className="text-xs text-slate-500 font-bold mt-1">Classificação completa baseada nas vendas finalizadas do sistema.</p>
            </div>

            {/* BARRA DE PESQUISA */}
            <div className="relative max-w-sm w-full">
               <Search className="h-4 w-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Buscar por produto ou SKU..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#14161b] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-all font-bold placeholder-slate-600"
               />
            </div>
         </div>

         {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Computando dados de vendas...</p>
           </div>
         ) : filteredRanking.length === 0 ? (
           <div className="text-center py-20 space-y-3">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-black text-white uppercase">Nenhum produto vendido encontrado</h4>
              <p className="text-xs text-slate-500 font-bold">Faça a importação de planilhas de vendas finalizadas para popular o ranking.</p>
           </div>
         ) : (
           /* LISTA DE RANKING (Premium Tech Look) */
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredRanking.map((item, idx) => {
                 // Estilização das 3 primeiras medalhas
                 const isGold = idx === 0;
                 const isSilver = idx === 1;
                 const isBronze = idx === 2;

                 return (
                   <div 
                     key={idx}
                     className={cn(
                       "bg-[#14161b] border rounded-3xl p-5 hover:bg-[#181b24] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 relative group",
                       isGold ? "border-amber-500/10 shadow-lg shadow-amber-500/1" : 
                       isSilver ? "border-slate-300/10 shadow-lg shadow-slate-300/1" : 
                       isBronze ? "border-amber-700/10 shadow-lg shadow-amber-700/1" : "border-white/5"
                     )}
                   >
                      {/* RANK E INFO DO PRODUTO */}
                      <div className="flex items-center gap-5">
                         {/* Badge de Posição do Ranking */}
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg shadow-2xl relative overflow-hidden select-none border",
                           isGold ? "bg-gradient-to-br from-amber-300 to-amber-600 text-black border-amber-300/30" :
                           isSilver ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black border-slate-300/30" :
                           isBronze ? "bg-gradient-to-br from-amber-700 to-amber-900 text-white border-amber-700/30" :
                           "bg-[#1a1d24] text-slate-400 border-white/5"
                         )}>
                            #{idx + 1}
                         </div>

                         <div className="space-y-1">
                            <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase">{item.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                               <span>SKU: <span className="font-mono text-slate-300">{item.sku}</span></span>
                               <span>•</span>
                               <span className="text-cyan-400 font-mono">R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} faturados</span>
                            </div>
                         </div>
                      </div>

                      {/* DISTRIBUIÇÃO E DETALHES DE VENDAS */}
                      <div className="flex flex-wrap items-center gap-8">
                         
                         {/* PROGRESS BAR DE TIPOS DE VENDA */}
                         <div className="w-[180px] space-y-1.5">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                               <span>Estoque Real: {item.currentQty}</span>
                               <span>Histórico: {item.historicQty}</span>
                            </div>
                            <div className="w-full h-2 bg-[#1a1d24] rounded-full overflow-hidden border border-white/5 flex">
                               {item.currentQty > 0 && (
                                 <div 
                                   className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                                   style={{ width: `${(item.currentQty / item.quantity) * 100}%` }}
                                   title={`Vendas Reais: ${item.currentQty}`}
                                 />
                               )}
                               {item.historicQty > 0 && (
                                 <div 
                                   className="bg-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                                   style={{ width: `${(item.historicQty / item.quantity) * 100}%` }}
                                   title={`Vendas Históricas: ${item.historicQty}`}
                                 />
                               )}
                            </div>
                         </div>

                         {/* QUANTIDADE TOTAL VENDIDA */}
                         <div className="text-right min-w-[80px]">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Total Vendido</p>
                            <p className="text-2xl font-black text-white font-mono">{item.quantity} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-normal">und</span></p>
                         </div>
                      </div>

                   </div>
                 );
              })}
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* CHART 1: PRODUCAO DIARIA */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Volume de Impressão</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-8">Relação entre Sucessos e Falhas ao longo da semana.</p>
            
            <div className="flex items-end justify-between gap-2 h-48 mt-10">
               {weeklyProduction.map((data, idx) => (
                 <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-3 group relative cursor-pointer">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#14161b] border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-white whitespace-nowrap shadow-xl z-20">
                      {data.label} prod.
                    </div>
                    
                    <div className="w-full max-w-[40px] flex flex-col-reverse justify-start relative">
                       {/* Success Bar */}
                       <div 
                         className="w-full bg-cyan-500 rounded-b-md rounded-t-sm transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                         style={{ height: `${data.success}%` }}
                       ></div>
                       {/* Fail Bar */}
                       {data.fail > 0 && (
                          <div 
                            className="w-full bg-red-500 rounded-t-md opacity-80 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                            style={{ height: `${data.fail}%`, marginBottom: '2px' }}
                          ></div>
                       )}
                    </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.day}</span>
                 </div>
               ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sucesso</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Falha</span>
               </div>
            </div>
         </div>

         {/* CHART 2: CONSUMO DE MATERIAIS */}
         <div className="bg-[#1a1d24] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Consumo de Insumos</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-8">Os materiais que mais estão rodando nas suas máquinas.</p>

            <div className="space-y-6">
               {materialUsage.map((mat, idx) => {
                 const percent = (mat.used / mat.max) * 100;
                 return (
                   <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[12px] font-bold text-white flex items-center gap-2">
                            <Box className="h-3.5 w-3.5 text-slate-500" /> {mat.name}
                         </span>
                         <span className="text-[11px] font-mono text-slate-400">{mat.used} kg</span>
                      </div>
                      <div className="w-full h-3 bg-[#14161b] rounded-full overflow-hidden border border-white/5">
                         <div 
                           className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]", mat.color)} 
                           style={{ width: `${percent}%` }}
                         ></div>
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
               <button className="w-full py-3 bg-[#14161b] border border-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                  Ver Relatório Completo de Estoque
               </button>
            </div>
         </div>
      </div>

      {/* STATUS DAS IMPRESSORAS */}
      <div className="bg-[#1a1d24] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
         <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#14161b]">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Status das Impressoras</h3>
               <p className="text-[11px] text-slate-500 font-bold">Saúde e eficiência de cada equipamento do seu parque.</p>
            </div>
            <Printer className="h-6 w-6 text-slate-600" />
         </div>

         <div className="divide-y divide-white/5">
            {printers.map((printer, idx) => (
               <div key={idx} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-xl flex items-center justify-center border",
                       printer.status === 'online' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                       printer.status === 'maintenance' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                       "bg-red-500/10 border-red-500/20 text-red-400"
                     )}>
                        {printer.status === 'online' ? <CheckCircle2 className="h-5 w-5" /> :
                         printer.status === 'maintenance' ? <AlertTriangle className="h-5 w-5" /> :
                         <AlertTriangle className="h-5 w-5" />}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">{printer.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                           {printer.status === 'online' ? 'Produzindo' : printer.status === 'maintenance' ? 'Manutenção' : 'Parada'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Horas Totais</p>
                        <p className="text-lg font-black text-white font-mono">{printer.hours}h</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Eficiência (OEE)</p>
                        <p className={cn(
                          "text-lg font-black font-mono",
                          printer.efficiency > 80 ? "text-emerald-400" : printer.efficiency > 50 ? "text-amber-500" : "text-red-400"
                        )}>{printer.efficiency}%</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}
