"use client"

import { useState, useEffect } from "react";
import { LayoutDashboard, Filter, Calendar, AlertTriangle, DollarSign, TrendingUp, Activity, Package, FileText, Clock, Truck, Box, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-40 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-gray-600 font-mono uppercase text-[10px] tracking-[0.2em] animate-pulse">Sincronizando painel em tempo real...</div>
      </div>
    );
  }

  // Renderizadores de Gráficos SVG customizados premium
  const renderEvolucaoChart = () => {
    const points = data?.chartEvolucao || [];
    const validPoints = points.filter((p: any) => p.profit > 0 || p.income > 0 || p.expense > 0);
    
    if (validPoints.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center opacity-25">
          <TrendingUp className="h-8 w-8 text-gray-600 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sem dados financeiros</p>
        </div>
      );
    }

    const maxVal = Math.max(...points.map((p: any) => Math.max(Math.abs(p.profit), Math.abs(p.income), Math.abs(p.expense), 100)));
    const height = 180;
    const width = 320;
    
    const getCoords = (val: number, idx: number) => {
      const x = idx * (width / (points.length - 1 || 1));
      const y = height - ((val + maxVal) / (maxVal * 2)) * (height - 20) - 10;
      return { x, y };
    };

    const profitPoints = points.map((p: any, idx: number) => getCoords(p.profit, idx));
    const profitPath = profitPoints.map((p: any, idx: number) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const incomePoints = points.map((p: any, idx: number) => getCoords(p.income, idx));
    const incomePath = incomePoints.map((p: any, idx: number) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex-1 relative mt-4">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Linha Zero */}
            <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            
            {/* Linhas */}
            <path d={incomePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            <path d={profitPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
            <path d={`${profitPath} L ${profitPoints[profitPoints.length-1].x} ${height} L ${profitPoints[0].x} ${height} Z`} fill="url(#profitGrad)" />
            
            {/* Pontos Interativos */}
            {profitPoints.map((p: any, idx: number) => (
              <g key={idx} className="group/dot cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4.5" fill="#10b981" stroke="#14161b" strokeWidth="2" className="transition-all group-hover/dot:r-6" vectorEffect="non-scaling-stroke" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#10b981" className="text-[9px] font-mono font-black opacity-0 group-hover/dot:opacity-100 transition-opacity bg-gray-50 px-1.5 py-0.5 rounded border border-[#10b981]/20">
                  R${points[idx].profit.toFixed(0)}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 text-[9px] font-bold text-gray-600 uppercase tracking-wider font-mono">
          {points.map((p: any, idx: number) => (
            <span key={idx}>{p.month}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderCustosChart = () => {
    const categories = data?.chartCustos || [];
    if (categories.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center opacity-25">
          <Activity className="h-8 w-8 text-gray-600 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sem custos ativos</p>
        </div>
      );
    }
    const maxVal = Math.max(...categories.map((c: any) => c.amount), 100);
    return (
      <div className="w-full h-full flex flex-col justify-end">
        <div className="flex-1 flex items-end justify-between gap-3 h-[180px] mt-4">
          {categories.map((c: any, idx: number) => {
            const pct = (c.amount / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[9px] font-mono font-black text-red-400 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  R${c.amount.toFixed(0)}
                </span>
                <div className="w-full bg-gray-50 rounded-t-lg overflow-hidden border border-gray-200 h-[130px] flex items-end relative">
                  <div 
                    style={{ height: `${pct}%` }} 
                    className="w-full bg-gradient-to-t from-red-600/80 to-red-400/90 rounded-t-lg transition-all duration-700"
                  ></div>
                </div>
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-wider mt-2.5 truncate w-full text-center">
                  {c.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTopProducts = () => {
    const products = data?.topProducts || [];
    if (products.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center opacity-25">
          <Package className="h-8 w-8 text-gray-600 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Nenhuma venda registrada</p>
        </div>
      );
    }
    const maxVal = Math.max(...products.map((p: any) => p.value), 1);
    return (
      <div className="w-full h-full flex flex-col justify-start space-y-4 overflow-y-auto max-h-[200px] pr-1 mt-2">
        {products.map((p: any, idx: number) => {
          const pct = (p.value / maxVal) * 100;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-white uppercase truncate max-w-[160px]">{p.name}</span>
                <span className="text-emerald-400 font-mono">R$ {p.value.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-200">
                <div 
                  style={{ width: `${pct}%` }} 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-600 font-black">
                <span>#{idx+1} RANKING</span>
                <span>{p.qty} UNIDADES VENDIDAS</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Painel de Controle</h1>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-glow-indigo">Sincronizado em Tempo Real</p>
          </div>
        </div>
        
        <div className="flex flex-row items-center gap-3 mt-2 md:mt-0 w-full md:w-auto">
          <button onClick={fetchDashboardData} className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-white transition-all shadow-lg shrink-0">
             <RotateCcw className="h-4 w-4" />
          </button>
          
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-gray-50 border border-gray-200 rounded-xl md:rounded-lg hover:bg-white/5 transition-all text-sm font-medium text-slate-300">
            <Filter className="h-4 w-4 text-blue-600" />
            maio de 2026
            <Calendar className="h-4 w-4 ml-2 text-gray-600" />
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FATURAMENTO TOTAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">FATURAMENTO TOTAL</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-emerald-500/30 transition-colors">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
            R$ {(data?.metrics?.faturamentoTotal || 0).toFixed(2)}
          </p>
        </div>

        {/* LUCRO LÍQUIDO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">LUCRO LÍQUIDO</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-emerald-500/30 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
            R$ {(data?.metrics?.lucroLiquido || 0).toFixed(2)}
          </p>
        </div>

        {/* CUSTO PRODUÇÃO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">CUSTO PRODUÇÃO</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-red-500/30 transition-colors">
              <Activity className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-400 font-mono tracking-tighter">
            R$ {(data?.metrics?.custoProducao || 0).toFixed(2)}
          </p>
        </div>

        {/* LOTES PRODUZIDOS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">LOTES CONCLUÍDOS</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-purple-500/30 transition-colors">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">
            {data?.metrics?.lotesProduzidos || 0}
          </p>
        </div>
      </div>

      {/* QUEUES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ORÇAMENTOS PENDENTES */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="font-bold text-white leading-tight">Orçamentos<br/>Pendentes</h3>
            </div>
            <span className="px-2 py-0.5 bg-gray-50 rounded-md text-[11px] font-bold text-gray-500">{data?.orcamentosPendentes?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center w-full">
            {data?.orcamentosPendentes?.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum orçamento<br/>pendente.</p>
            ) : (
              <div className="w-full text-left space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {data.orcamentosPendentes.map((q: any) => (
                  <div key={q.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col hover:border-amber-500/30 transition-all">
                    <span className="text-[11px] font-black text-white truncate uppercase">{q.projectName || 'Sem Nome'}</span>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[9px] text-gray-600 uppercase font-bold truncate max-w-[120px]">{q.clientName}</span>
                      <span className="text-[8px] font-black text-amber-400 bg-amber-400/5 border border-amber-400/10 px-1.5 py-0.5 rounded uppercase">Pendente</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NA FILA PRODUÇÃO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-white leading-tight">Na Fila<br/>(Produção)</h3>
            </div>
            <span className="px-2 py-0.5 bg-gray-50 rounded-md text-[11px] font-bold text-gray-500">{data?.naFila?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center w-full">
            {data?.naFila?.length === 0 ? (
              <p className="text-sm text-gray-600">Fila de produção vazia.</p>
            ) : (
              <div className="w-full text-left space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {data.naFila.map((o: any) => {
                  const name = o.notes?.split('\n').find((l: string) => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || o.customerName;
                  return (
                    <div key={o.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col hover:border-purple-500/30 transition-all">
                      <span className="text-[11px] font-black text-white truncate uppercase">{name}</span>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[9px] text-gray-600 uppercase font-bold truncate max-w-[100px]">{o.customerName}</span>
                        <span className="text-[8px] font-black text-purple-400 bg-purple-400/5 border border-purple-400/10 px-1.5 py-0.5 rounded uppercase">
                          {o.status === 'PRINTING' ? 'Imprimindo' : o.status === 'POST_PROCESSING' ? 'Acabamento' : 'Fila'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* A ENVIAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-orange-400" />
              <h3 className="font-bold text-white leading-tight">Pronto<br/>(A Enviar)</h3>
            </div>
            <span className="px-2 py-0.5 bg-gray-50 rounded-md text-[11px] font-bold text-gray-500">{data?.aEnviar?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center w-full">
            {data?.aEnviar?.length === 0 ? (
              <p className="text-sm text-gray-600">Tudo enviado! 🎉</p>
            ) : (
              <div className="w-full text-left space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {data.aEnviar.map((o: any) => {
                  const name = o.notes?.split('\n').find((l: string) => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || o.customerName;
                  return (
                    <div key={o.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col hover:border-orange-500/30 transition-all">
                      <span className="text-[11px] font-black text-white truncate uppercase">{name}</span>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[9px] text-gray-600 uppercase font-bold truncate max-w-[120px]">{o.customerName}</span>
                        <span className="text-[8px] font-black text-orange-400 bg-orange-400/5 border border-orange-400/10 px-1.5 py-0.5 rounded uppercase">Pronto</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* EM TRÂNSITO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold text-white leading-tight">Em Trânsito<br/>(Rota)</h3>
            </div>
            <span className="px-2 py-0.5 bg-gray-50 rounded-md text-[11px] font-bold text-gray-500">{data?.emTransito?.length || 0}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-center w-full">
            {data?.emTransito?.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhum pedido em rota.</p>
            ) : (
              <div className="w-full text-left space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {data.emTransito.map((o: any) => {
                  const name = o.notes?.split('\n').find((l: string) => l.startsWith('PROJETO:'))?.replace('PROJETO: ', '') || o.customerName;
                  return (
                    <div key={o.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col hover:border-blue-500/30 transition-all">
                      <span className="text-[11px] font-black text-white truncate uppercase">{name}</span>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[9px] text-gray-600 uppercase font-bold truncate max-w-[120px]">{o.customerName}</span>
                        <span className="text-[8px] font-black text-blue-400 bg-blue-400/5 border border-blue-400/10 px-1.5 py-0.5 rounded uppercase">Em Rota</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* EVOLUÇÃO DO LUCRO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-2">Evolução do Lucro</h3>
          <div className="flex-1 flex items-center justify-center w-full h-full">
             {renderEvolucaoChart()}
          </div>
        </div>

        {/* CUSTOS DE PRODUÇÃO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-2">Custos de Produção</h3>
          <div className="flex-1 flex items-center justify-center w-full h-full">
             {renderCustosChart()}
          </div>
        </div>

        {/* TOP PRODUTOS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-80 flex flex-col">
          <h3 className="font-bold text-white mb-2">Top Produtos (R$)</h3>
          <div className="flex-1 flex items-center justify-center w-full h-full">
             {renderTopProducts()}
          </div>
        </div>
      </div>
    </div>
  );
}
