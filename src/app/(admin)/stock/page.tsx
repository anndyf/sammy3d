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
      const data = await res.json();
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
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black">Almoxarifado</h1>
              <p className="text-[14px] text-slate-500">Gestão tática e auditoria de insumos para produção 3D.</p>
           </div>
           <button 
             onClick={() => setIsAddingModo(!isAddingModo)}
             className="bg-black text-white px-4 py-2 h-10 rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
           >
             {isAddingModo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAddingModo ? "Fechar Inventário" : "Lançar Novo Insumo"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-10">
        
        {/* VERCEL STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><Wallet className="h-3.5 w-3.5" /> Valor de Compra Total</span>
              <p className="text-2xl font-black text-black font-mono">R$ {totalStockValue.toFixed(2)}</p>
           </div>
           <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><TrendingUp className="h-3.5 w-3.5" /> Média por Lote</span>
              <p className="text-2xl font-black text-black font-mono">R$ {(totalStockValue / (materials.length || 1)).toFixed(2)}</p>
           </div>
           <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><AlertTriangle className="h-3.5 w-3.5" /> Insumos Críticos</span>
              <p className="text-2xl font-black text-red-500 font-mono tracking-widest">{materials.filter(m => (m.remainingAmount / m.totalAmount) < 0.2).length}</p>
           </div>
        </div>

        {isAddingModo && (
          <div className="bg-white border border-slate-100 rounded-xl p-8 mb-10 shadow-lg animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                <h3 className="text-[13px] font-bold text-black uppercase tracking-widest flex items-center gap-2"><Plus className="h-4 w-4 text-blue-500" /> {editingMaterial ? 'Ajuste de Custo Material' : 'Registro de Novo Lote Industrial'}</h3>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">{editingMaterial ? 'Edição' : 'Entrada'}</div>
             </div>
             
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* TIPO */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo de Insumo</label>
                      <select className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all cursor-pointer" required value={type} onChange={e=>setType(e.target.value)}>
                        <option value="FILAMENT">🧵 Filamento</option>
                        <option value="RESIN">🧪 Resina</option>
                        <option value="ACCESSORY">🔩 Acessório</option>
                      </select>
                   </div>
                   {/* NOME */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome / Marca</label>
                      <input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" required value={name} onChange={e=>setName(e.target.value)} placeholder="ex: Polymaker PLA+" />
                   </div>
                   {/* COR */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cor</label>
                      <input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" value={color} onChange={e=>setColor(e.target.value)} placeholder="ex: Preto, Branco..." />
                   </div>
                   {/* CUSTO TOTAL */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Custo Total (R$)</label>
                      <input type="number" step="0.01" min="0" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" required value={costPerUnit} onChange={e=>setCostPerUnit(e.target.value)} placeholder="ex: 89.90" />
                   </div>
                   {/* TAMANHO LOTE */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Quantidade no Lote</label>
                      <input type="number" min="0" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all" required value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} placeholder="ex: 1000" />
                   </div>
                   {/* UNIDADE */}
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unidade de Medida</label>
                      <select className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:border-black transition-all cursor-pointer" value={unitType} onChange={e=>setUnitType(e.target.value)}>
                        <option value="g">g (gramas)</option>
                        <option value="kg">kg (quilos)</option>
                        <option value="ml">ml (mililitros)</option>
                        <option value="un">un (unidades)</option>
                      </select>
                   </div>
                </div>

                <div className="flex flex-col gap-6 pt-4 border-t border-slate-50">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input type="checkbox" className="w-5 h-5 rounded border-slate-200 text-black focus:ring-black transition-all" checked={recordExpense} onChange={e=>setRecordExpense(e.target.checked)} />
                       <div>
                          <p className="text-[12px] font-bold text-black uppercase tracking-tight group-hover:text-blue-600 transition-colors">Registrar no Livro Caixa</p>
                          <p className="text-[10px] text-slate-400 font-medium">Lançar automaticamente como despesa de produção</p>
                       </div>
                    </label>

                    {recordExpense && (
                       <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4 animate-in fade-in zoom-in duration-300">
                          <div className="space-y-1.5 flex flex-col max-w-xs">
                             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Valor Efetivamente Pago (R$)</label>
                             <input type="number" step="0.01" className="w-full bg-white border border-slate-100 rounded-lg px-4 py-3 text-[14px] outline-none shadow-sm focus:border-black transition-all" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} placeholder={costPerUnit || "0.00"} />
                             <p className="text-[9px] text-slate-400 pt-1 italic">Deixe em branco para usar o custo total informado acima.</p>
                          </div>
                       </div>
                    )}
                 </div>

                <div className="flex justify-end pt-4 gap-4">
                   <button type="button" onClick={()=>{setIsAddingModo(false); setEditingMaterial(null);}} className="px-10 h-10 bg-slate-50 text-slate-400 rounded-lg text-[12px] font-bold uppercase transition-all">Cancelar</button>
                   <button type="submit" className="bg-black text-white px-10 h-10 rounded-lg text-[13px] font-black uppercase shadow-md hover:bg-slate-800 transition-all">{editingMaterial ? 'Salvar Alteração' : 'Cadastrar Lote'}</button>
                </div>
             </form>
          </div>
        )}

         {/* SEARCH & FILTERS */}
         <div className="flex items-center justify-between pb-8 border-b border-slate-50">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300" />
               <input 
                 type="text" 
                 placeholder="Filtrar almoxarifado..." 
                 className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-[14px] outline-none hover:border-slate-300 focus:bg-white focus:border-black transition-all shadow-sm" 
                 value={searchTerm} 
                 onChange={e=>setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* MATERIAL LIST SECTION */}
         <div className="space-y-1">
            {/* TABLE HEADER VERCEL STYLE */}
            <div className="flex items-center px-6 py-3 bg-[#FAFAFA] border border-slate-100 rounded-lg mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none gap-6">
               <div className="flex-1 flex items-center gap-4 pl-1">Insumo / Variante</div>
               <div className="w-[180px] text-center">Nível de Estoque</div>
               <div className="w-[120px] text-center">Custo/G</div>
               <div className="w-[120px] text-right">Inv. Total</div>
               <div className="w-[60px] text-right">Ação</div>
            </div>

            {loading ? <div className="py-20 text-center text-[10px] text-slate-300 uppercase tracking-[0.4em] font-black italic">Mapeando Matéria-Prima...</div> : 
              filteredMaterials.map(mat => {
                const percentage = (mat.remainingAmount / mat.totalAmount) * 100;
                const isCritical = percentage <= 20;
                // Conversão de unidades para o cálculo de custo por grama
                const divider = mat.unitType === 'kg' ? mat.totalAmount * 1000 : mat.totalAmount;
                const costPerGram = mat.costPerUnit / divider;

                return (
                  <div 
                    key={mat.id} 
                    className="flex items-center px-6 py-5 border border-slate-100 rounded-xl mb-3 bg-white hover:border-black transition-all group gap-6 cursor-pointer"
                    onClick={() => handleEdit(mat)}
                  >
                     {/* NAME & COLOR */}
                     <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-black group-hover:text-white transition-all", mat.type === 'FILAMENT' ? "text-blue-500" : "text-emerald-500")}>
                           {mat.type === 'FILAMENT' ? <Droplets className="h-5 w-5 stroke-[2]" /> : <Box className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[14px] font-bold text-black truncate leading-tight flex items-center gap-2">
                              {mat.name}
                              {isCritical && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                           </h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{mat.color || 'Industrial'}</p>
                        </div>
                     </div>

                     {/* CAPACITY BAR */}
                     <div className="w-[180px] space-y-1.5 flex flex-col justify-center">
                        <div className="flex justify-between items-center px-1">
                           <span className={cn("text-[9px] font-black tracking-widest", isCritical ? "text-amber-600" : "text-slate-400 uppercase")}>{isCritical ? 'Recomprar' : 'Estoque'}</span>
                           <span className="text-[10px] font-mono font-bold text-black">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                           <div 
                             className={cn("h-full transition-all duration-1000", isCritical ? "bg-amber-500" : "bg-black")} 
                             style={{ width: `${percentage}%` }} 
                           />
                        </div>
                     </div>

                     {/* COST PER UNIT */}
                     <div className="w-[120px] text-center">
                        <p className="text-[14px] font-mono font-bold text-black">R$ {costPerGram.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">por grama</p>
                     </div>

                     {/* TOTAL INVESTMENT */}
                     <div className="w-[120px] text-right">
                        <p className="text-[14px] font-bold text-slate-600 font-mono">R$ {mat.costPerUnit.toFixed(2)}</p>
                     </div>

                     {/* ACTIONS */}
                     <div className="w-[60px] flex justify-end">
                        <div className="p-2 border border-slate-100 rounded-md group-hover:border-black transition-all">
                           <Edit3 className="h-4 w-4 text-slate-300 group-hover:text-black" />
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
