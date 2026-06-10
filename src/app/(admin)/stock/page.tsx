"use client"

import { useState, useEffect } from "react";
import { Plus, Search, Filter, AlertTriangle, ArrowUpRight, Box, Trash2, Edit3, Settings2, History, Droplets, Zap, Clock, Package, MoreHorizontal, ChevronDown, ChevronUp, Palette, Scale, CheckCircle2, X, RotateCcw, Monitor, Command, Info, Globe, Smartphone, Bell, Share2, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material { id: string; name: string; type: string; color?: string; costPerUnit: number; totalAmount: number; remainingAmount: number; unitType: string; }

export default function StockPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("FILAMENT");
  const [color, setColor] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [unitType, setUnitType] = useState("g");
  const [recordExpense, setRecordExpense] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch('/api/materials');
      const json = await res.json();
      const list = json.data?.data || json.data || [];
      if (Array.isArray(list)) setMaterials(list);
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
    setRemainingAmount(m.remainingAmount.toString());
    setUnitType(m.unitType);
    setIsAddingMode(true);
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
          remainingAmount: parseFloat(remainingAmount || totalAmount)
        })
      });
      if (res.ok) {
        setIsAddingMode(false); setEditingMaterial(null);
        setName(""); setType("FILAMENT"); setColor(""); setCostPerUnit(""); setTotalAmount(""); setRemainingAmount(""); setUnitType("g");
        setRecordExpense(false); setAmountPaid("");
        fetchData();
      } else {
        const err = await res.json();
        console.error("Erro ao salvar:", err);
        alert(`Erro ao cadastrar: ${err.error || err.details || 'Verifique os campos e tente novamente.'}`);
      }
    } catch (e: any) { 
      console.error(e); 
      alert("Falha crítica na rede ou no servidor. Tente novamente mais tarde.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este insumo? Isso não pode ser desfeito.")) return;
    
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(`Erro ao excluir: ${err.error || err.message || err.details || 'Tente novamente.'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Falha na rede.");
    }
  };

  const totalStockValue = materials.reduce((acc, m) => acc + m.costPerUnit, 0);
  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Inventário de Insumos</h1>
         </div>
         <button 
           onClick={() => {
             setName(""); setType("FILAMENT"); setColor(""); setCostPerUnit(""); setTotalAmount("1000"); setRemainingAmount("");
             setIsAddingMode(!isAddingMode);
           }}
           className="bg-blue-600 text-white px-6 py-2.5 h-11 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg uppercase tracking-widest"
         >
           {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
           {isAddingMode ? "Fechar" : "Novo Filamento"}
         </button>
      </div>

      <div className="space-y-8">
        
        {/* SEARCH & FILTER BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 items-center">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou marca..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all shadow-sm" 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-white transition-colors">
              <Filter className="h-5 w-5" />
           </button>
        </div>

        {isAddingMode && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10 shadow-lg animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" /> 
                  {editingMaterial ? 'Editar Insumo' : 'Novo Insumo'}
                </h3>
                <div className="bg-gray-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-gray-200">
                  {editingMaterial ? 'Edição' : 'Cadastro'}
                </div>
             </div>
             
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Tipo</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 transition-all cursor-pointer" required value={type} onChange={e=>setType(e.target.value)}>
                        <option value="FILAMENT" className="bg-gray-50">🧵 Filamento</option>
                        <option value="RESIN" className="bg-gray-50">🧪 Resina</option>
                      </select>
                   </div>
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Nome / Marca</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all" required value={name} onChange={e=>setName(e.target.value)} placeholder="ex: VOOLT PRETO PETG" />
                   </div>
                   <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Variante / Cor</label>
                      <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all" value={color} onChange={e=>setColor(e.target.value)} placeholder="ex: VOOLT3D - PETG" />
                   </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Custo do Rolo (R$)</label>
                       <input type="number" step="0.01" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all" required value={costPerUnit} onChange={e=>setCostPerUnit(e.target.value)} placeholder="ex: 98.00" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Peso do Rolo / Unidade (g)</label>
                       <input type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all" required value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} placeholder="ex: 1000" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Estoque Atual Total (g)</label>
                       <input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 transition-all" required value={remainingAmount} onChange={e=>setRemainingAmount(e.target.value)} placeholder="ex: 4000" />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                   <button type="button" onClick={()=>{setIsAddingMode(false); setEditingMaterial(null);}} className="px-8 h-11 bg-gray-50 text-gray-500 rounded-lg text-sm font-bold transition-all hover:bg-white/5 hover:text-white">Cancelar</button>
                   <button type="submit" className="bg-blue-600 text-white px-8 h-11 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">{editingMaterial ? 'Salvar' : 'Cadastrar'}</button>
                </div>
             </form>
          </div>
        )}

        {/* CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? <div className="col-span-full py-20 text-center text-gray-600 uppercase tracking-widest font-black italic">Mapeando Filamentos...</div> : 
             filteredMaterials.map(mat => {
               const divider = mat.unitType === 'kg' ? mat.totalAmount * 1000 : mat.totalAmount;
               const costPerGram = mat.costPerUnit / divider;
               const rolls = (mat.remainingAmount / 1000).toFixed(1);

               return (
                 <div key={mat.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl hover:border-blue-600/30 transition-all group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <div className="min-w-0">
                          <h4 className="text-lg font-black text-white truncate leading-tight uppercase tracking-tight">{mat.name}</h4>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{mat.color || 'Industrial'}</p>
                       </div>
                       <div className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-inner shrink-0" style={{ backgroundColor: mat.color?.toLowerCase().includes('preto') ? '#000' : mat.color?.toLowerCase().includes('branco') ? '#fff' : '#444' }}></div>
                    </div>

                    <div className="space-y-2 mb-6 flex-1">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 font-bold">Preço Médio (Rolo):</span>
                          <span className="text-white font-mono font-bold">R$ {mat.costPerUnit.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 font-bold">Estoque (Rolos):</span>
                          <span className="text-white font-mono font-bold">{rolls}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 font-bold">Estoque (Gramas):</span>
                          <span className="text-white font-mono font-bold">{mat.remainingAmount}g</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 font-bold">Custo/g:</span>
                          <span className="text-blue-600 font-mono font-bold">R$ {costPerGram.toFixed(4)}</span>
                       </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                       <button className="flex-1 bg-emerald-500 text-black h-10 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                          <RotateCcw className="h-3.5 w-3.5" /> Abastecer
                       </button>
                       <button 
                         onClick={() => handleEdit(mat)}
                         className="w-12 h-10 bg-slate-800 text-gray-500 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all"
                       >
                          <Edit3 className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={(e) => handleDelete(e, mat.id)}
                         className="w-12 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
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
