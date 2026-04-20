"use client"

import { useState, useEffect } from "react";
import { Plus, Search, Filter, AlertTriangle, ArrowUpRight, Box, Trash2, Edit3, Settings2, History, Droplets, Zap, Clock, Package, MoreHorizontal, ChevronDown, ChevronUp, Palette, Scale, CheckCircle2, X, RotateCcw, Monitor, Command, Info, Globe, Smartphone, Bell, Share2, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material { id: string; name: string; type: string; color?: string; costPerUnit: number; totalAmount: number; remainingAmount: number; unitType: string; }

export default function StockPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingModo, setIsAddingModo] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("FILAMENT");
  const [color, setColor] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [unitType, setUnitType] = useState("g");
  const [recordExpense, setRecordExpense] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch('/api/materials');
      const json = await res.json();
      // A API retorna { data: Material[], meta: ... } ou o array diretamente dependendo da implementação
      const data = json.data || json; 
      if (Array.isArray(data)) setMaterials(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setName(m.name);
    setType(m.type);
    setColor(m.color || "");
    setCostPerUnit(m.costPerUnit.toString());
    setTotalAmount(m.totalAmount.toString());
    setUnitType(m.unitType);
    setIsAddingModo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingMaterial ? "PUT" : "POST";
    const url = editingMaterial ? `/api/materials/${editingMaterial.id}` : "/api/materials";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, type, color, 
          costPerUnit: parseFloat(costPerUnit), 
          totalAmount: parseFloat(totalAmount),
          unitType,
          recordExpense,
          amountPaid: parseFloat(amountPaid || costPerUnit),
          remainingAmount: editingMaterial ? editingMaterial.remainingAmount : parseFloat(totalAmount)
        })
      });
      if (res.ok) {
        setIsAddingModo(false); setEditingMaterial(null);
        setName(""); setType("FILAMENT"); setColor(""); setCostPerUnit(""); setTotalAmount(""); setUnitType("g");
        setRecordExpense(false); setAmountPaid("");
        fetchData();
      } else {
        const err = await res.json();
        console.error("Erro ao salvar:", err);
        alert(`Erro ao cadastrar: ${err.details || 'Verifique os campos e tente novamente.'}`);
      }
    } catch (e: any) { 
      console.error(e); 
      alert("Falha crítica na rede ou no servidor. Tente novamente mais tarde.");
    }
  };

  const totalStockValue = materials.reduce((acc, m) => acc + m.costPerUnit, 0);
  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-white/5 px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">Almoxarifado</h1>
              <p className="text-[14px] text-slate-400">Gestão tática e auditoria de insumos para produção 3D.</p>
           </div>
           <button 
             onClick={() => setIsAddingModo(!isAddingModo)}
             className="bg-white text-black px-6 py-2 h-10 rounded-lg text-[13px] font-bold hover:bg-slate-200 transition-all flex items-center gap-2 shadow-2xl"
           >
             {isAddingModo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAddingModo ? "Fechar Inventário" : "Lançar Novo Insumo"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-10">
        
        {/* VERCEL STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><Wallet className="h-3.5 w-3.5" /> Valor de Compra Total</span>
              <p className="text-2xl font-black text-white font-mono">R$ {totalStockValue.toFixed(2)}</p>
           </div>
           <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><TrendingUp className="h-3.5 w-3.5" /> Média por Lote</span>
              <p className="text-2xl font-black text-white font-mono">R$ {(totalStockValue / (materials.length || 1)).toFixed(2)}</p>
           </div>
           <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Insumos Críticos</span>
              <p className="text-2xl font-black text-red-500 font-mono tracking-widest">{materials.filter(m => (m.remainingAmount / m.totalAmount) < 0.2).length}</p>
           </div>
        </div>

        {isAddingModo && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-10 shadow-2xl animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h3 className="text-[13px] font-bold text-white uppercase tracking-widest flex items-center gap-2"><Plus className="h-4 w-4 text-blue-500" /> {editingMaterial ? 'Ajuste de Custo Material' : 'Registro de Novo Lote Industrial'}</h3>
                <div className="bg-white/10 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/10">{editingMaterial ? 'Edição' : 'Entrada'}</div>
             </div>
             
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* TIPO */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tipo de Insumo</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all cursor-pointer" required value={type} onChange={e=>setType(e.target.value)}>
                        <option value="FILAMENT" className="bg-black">🧵 Filamento</option>
                        <option value="RESIN" className="bg-black">🧪 Resina</option>
                        <option value="ACCESSORY" className="bg-black">🔩 Acessório</option>
                      </select>
                   </div>
                   {/* NOME */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nome / Marca</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all" required value={name} onChange={e=>setName(e.target.value)} placeholder="ex: Polymaker PLA+" />
                   </div>
                   {/* COR */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Cor</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all" value={color} onChange={e=>setColor(e.target.value)} placeholder="ex: Preto, Branco..." />
                   </div>
                   {/* CUSTO TOTAL */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Custo Total (R$)</label>
                      <input type="number" step="0.01" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all" required value={costPerUnit} onChange={e=>setCostPerUnit(e.target.value)} placeholder="ex: 89.90" />
                   </div>
                   {/* TAMANHO LOTE */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Quantidade no Lote</label>
                      <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all" required value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} placeholder="ex: 1000" />
                   </div>
                   {/* UNIDADE */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Unidade de Medida</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:bg-white/10 focus:border-white transition-all cursor-pointer" value={unitType} onChange={e=>setUnitType(e.target.value)}>
                        <option value="g" className="bg-black">g (gramas)</option>
                        <option value="kg" className="bg-black">kg (quilos)</option>
                        <option value="ml" className="bg-black">ml (mililitros)</option>
                        <option value="un" className="bg-black">un (unidades)</option>
                      </select>
                   </div>
                </div>

                <div className="flex flex-col gap-6 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/5 text-black focus:ring-white transition-all" checked={recordExpense} onChange={e=>setRecordExpense(e.target.checked)} />
                       <div>
                          <p className="text-[12px] font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">Registrar no Livro Caixa</p>
                          <p className="text-[10px] text-slate-500 font-medium">Lançar automaticamente como despesa de produção</p>
                       </div>
                    </label>

                    {recordExpense && (
                       <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 animate-in fade-in zoom-in duration-300">
                          <div className="space-y-1.5 flex flex-col max-w-xs">
                             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Valor Efetivamente Pago (R$)</label>
                             <input type="number" step="0.01" className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none shadow-2xl focus:border-white transition-all" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} placeholder={costPerUnit || "0.00"} />
                             <p className="text-[9px] text-slate-500 pt-1 italic">Deixe em branco para usar o custo total informado acima.</p>
                          </div>
                       </div>
                    )}
                 </div>

                <div className="flex justify-end pt-4 gap-4">
                   <button type="button" onClick={()=>{setIsAddingModo(false); setEditingMaterial(null);}} className="px-10 h-10 bg-white/5 text-slate-500 rounded-lg text-[12px] font-bold uppercase transition-all hover:bg-white/10">Cancelar</button>
                   <button type="submit" className="bg-white text-black px-10 h-10 rounded-lg text-[13px] font-black uppercase shadow-2xl hover:bg-slate-200 transition-all">{editingMaterial ? 'Salvar Alteração' : 'Cadastrar Lote'}</button>
                </div>
             </form>
          </div>
        )}

         {/* SEARCH & FILTERS */}
         <div className="flex items-center justify-between pb-8 border-b border-white/5">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Filtrar almoxarifado..." 
                 className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[14px] text-white outline-none hover:border-white/20 focus:bg-white/10 focus:border-blue-500 transition-all shadow-2xl" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* MATERIAL LIST SECTION */}
         <div className="space-y-1">
            {/* TABLE HEADER VERCEL STYLE */}
            <div className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-lg mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none gap-6">
               <div className="flex-1 flex items-center gap-4 pl-1">Insumo / Variante</div>
               <div className="w-[180px] text-center">Nível de Estoque</div>
               <div className="w-[120px] text-center">Custo/G</div>
               <div className="w-[120px] text-right">Inv. Total</div>
               <div className="w-[60px] text-right">Ação</div>
            </div>

            {loading ? <div className="py-20 text-center text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black italic">Mapeando Matéria-Prima...</div> : 
              filteredMaterials.map(mat => {
                const percentage = (mat.remainingAmount / mat.totalAmount) * 100;
                const isCritical = percentage <= 20;
                // Conversão de unidades para o cálculo de custo por grama
                const divider = mat.unitType === 'kg' ? mat.totalAmount * 1000 : mat.totalAmount;
                const costPerGram = mat.costPerUnit / divider;

                return (
                  <div 
                    key={mat.id} 
                    className="flex items-center px-6 py-5 border border-white/10 rounded-xl mb-3 bg-white/5 backdrop-blur-md hover:border-blue-500 hover:shadow-[0_0_30px_rgba(0,112,243,0.1)] transition-all group gap-6 cursor-pointer"
                    onClick={() => handleEdit(mat)}
                  >
                     {/* NAME & COLOR */}
                     <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:text-black transition-all", mat.type === 'FILAMENT' ? "text-blue-500" : "text-emerald-500")}>
                           {mat.type === 'FILAMENT' ? <Droplets className="h-5 w-5 stroke-[2]" /> : <Box className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[14px] font-bold text-white truncate leading-tight flex items-center gap-2">
                              {mat.name}
                              {isCritical && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                           </h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{mat.color || 'Industrial'}</p>
                        </div>
                     </div>

                     {/* CAPACITY BAR */}
                     <div className="w-[180px] space-y-1.5 flex flex-col justify-center">
                        <div className="flex justify-between items-center px-1">
                           <span className={cn("text-[9px] font-black tracking-widest uppercase", isCritical ? "text-amber-500" : "text-slate-500 uppercase")}>{isCritical ? 'Recomprar' : 'Estoque'}</span>
                           <span className="text-[10px] font-mono font-bold text-white">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                           <div 
                             className={cn("h-full transition-all duration-1000", isCritical ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(0,112,243,0.5)]")} 
                             style={{ width: `${percentage}%` }} 
                           />
                        </div>
                     </div>

                     {/* COST PER UNIT */}
                     <div className="w-[120px] text-center">
                        <p className="text-[14px] font-mono font-bold text-white">R$ {costPerGram.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">por grama</p>
                     </div>

                     {/* TOTAL INVESTMENT */}
                     <div className="w-[120px] text-right">
                        <p className="text-[14px] font-bold text-slate-400 font-mono">R$ {mat.costPerUnit.toFixed(2)}</p>
                     </div>

                     {/* ACTIONS */}
                     <div className="w-[60px] flex justify-end">
                        <div className="p-2 border border-white/10 rounded-md group-hover:border-white group-hover:bg-white/10 transition-all">
                           <Edit3 className="h-4 w-4 text-slate-700 group-hover:text-white" />
                        </div>
                     </div>
                  </div>
                );
              })
            }
         </div>
      </div>
    </div>
  );
}
