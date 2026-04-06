"use client"

import { useState, useEffect } from "react";
import { Plus, Search, Tag, Box, DollarSign, Clock, Settings2, Trash2, Edit3, Eye, Image as ImageIcon, ChevronDown, ChevronUp, AlertCircle, ShoppingCart, ArrowRight, Share2, MoreHorizontal, LayoutGrid, List, X, ExternalLink, Globe, Monitor, Smartphone, MessageCircle, Calculator, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material { id: string; name: string; color?: string; costPerUnit: number; totalAmount: number; unitType: string; }
interface Product { id: string; name: string; description?: string; imageUrl?: string; productionTime: number; weightGrams: number; additionalCost: number; materialId: string; category: string; subcategory?: string; sku?: string; shopeeUrl?: string; calculatedCost: number; sellingPrice: number; stockQuantity: number; material: Material; }

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const defaultTaxonomy = ["ARTICULADOS", "SENSORIAIS", "CHAVEIROS", "FIDGETS", "PLACAS", "FLEXIVEIS", "MULTICOLOR", "PINTADO", "INDUSTRIAL"];
  const [availableCategories, setAvailableCategories] = useState(defaultTaxonomy);
  const [newCatInput, setNewCatInput] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const [availableSubcategories, setAvailableSubcategories] = useState(defaultTaxonomy);
  const [newSubcatInput, setNewSubcatInput] = useState("");
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);

  const addCategory = () => {
    if (newCatInput && !availableCategories.includes(newCatInput.toUpperCase())) {
      const formatted = newCatInput.toUpperCase().trim();
      setAvailableCategories(prev => [...prev, formatted]);
      setAvailableSubcategories(prev => [...prev, formatted]);
      setCategory(formatted);
      setNewCatInput("");
      setIsAddingCat(false);
    }
  };

  const addSubcategory = () => {
    if (newSubcatInput && !availableSubcategories.includes(newSubcatInput.toUpperCase())) {
      const formatted = newSubcatInput.toUpperCase().trim();
      setAvailableCategories(prev => [...prev, formatted]);
      setAvailableSubcategories(prev => [...prev, formatted]);
      setSubcategory(formatted);
      setNewSubcatInput("");
      setIsAddingSubcat(false);
    }
  };

  const generateSKU = (n: string, c: string) => {
    if (!n || !c) return "";
    const prefix = c.substring(0, 3).toUpperCase();
    const slug = n.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
    return `${prefix}-${slug}`;
  };

  useEffect(() => {
    if (!editingProduct && name && category && (!sku || sku.includes('-'))) {
      setSku(generateSKU(name, category));
    }
  }, [name, category]);

  const fetchData = async () => {
    try {
      const [resP, resM] = await Promise.all([fetch('/api/products'), fetch('/api/materials')]);
      const pData = await resP.json();
      const mData = await resM.json();
      if (Array.isArray(pData)) setProducts(pData);
      if (Array.isArray(mData)) setMaterials(mData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category || "");
    setSubcategory(p.subcategory || "");
    setSku(p.sku || "");
    setDescription(p.description || "");
    setSellingPrice(p.sellingPrice.toString());
    setStockQuantity(p.stockQuantity.toString());
    setWeightGrams(p.weightGrams.toString());
    setMaterialId(p.materialId);
    
    // Converter minutos totais para H:Min
    const totalMinutes = p.productionTime || 0;
    setHours(Math.floor(totalMinutes / 60).toString());
    setMinutes((totalMinutes % 60).toString());
    setShopeeUrl(p.shopeeUrl || "");
    setImageUrl(p.imageUrl || "");

    // Garantir que a categoria do produto editado esteja no select, se for customizada
    if (p.category && !availableCategories.includes(p.category)) {
      setAvailableCategories(prev => [...prev, p.category]);
    }
    
    setIsAddingMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito pesada! Tente uma foto menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const totalTimeMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, category, subcategory, sku, description, 
          sellingPrice: parseFloat(sellingPrice), 
          stockQuantity: parseInt(stockQuantity),
          weightGrams: parseFloat(weightGrams),
          materialId,
          productionTime: totalTimeMinutes,
          shopeeUrl,
          imageUrl
        })
      });
      if (res.ok) {
        setIsAddingMode(false); setEditingProduct(null);
        setName(""); setCategory(""); setSubcategory(""); setSku(""); setDescription(""); setSellingPrice(""); setStockQuantity("");
        setWeightGrams(""); setMaterialId(""); setHours(""); setMinutes(""); setShopeeUrl(""); setImageUrl("");
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const selectedMaterial = materials.find(m => m.id === materialId);
  const costPerGram = selectedMaterial ? 
    (selectedMaterial.unitType?.toLowerCase() === 'kg' ? 
      selectedMaterial.costPerUnit / (selectedMaterial.totalAmount * 1000) : 
      selectedMaterial.costPerUnit / (selectedMaterial.totalAmount || 1)) 
    : 0;
  
  const timeCost = ((parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)) / 60 * 0.40;
  const estimatedProdCost = ((parseFloat(weightGrams) || 0) * costPerGram) + timeCost;
  const suggestedPrice = estimatedProdCost * 3.5;
  const grossProfit = parseFloat(sellingPrice || "0") - estimatedProdCost;
  const marginPercentage = parseFloat(sellingPrice) > 0 ? (grossProfit / parseFloat(sellingPrice)) * 100 : 0;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans select-none animate-fade-in pb-40">
      
      {/* VERCEL HEADER AREA */}
      <div className="border-b border-slate-100 px-6 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-black">Catálogo de Design</h1>
              <p className="text-[14px] text-slate-500">Portfólio técnico de ativos e peças de alta precisão 3D.</p>
           </div>
           <button 
             onClick={() => setIsAddingMode(!isAddingMode)}
             className="bg-black text-white px-4 py-2 h-10 rounded-lg text-[13px] font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
           >
             {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             {isAddingMode ? "Fechar Catálogo" : "Novo Design"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {!isAddingMode && (
          <div className="space-y-12">
             {/* SEARCH & FILTERS */}
             <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                <div className="relative w-full max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300" />
                   <input 
                     type="text" 
                     placeholder="Buscar no portfólio..." 
                     className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-[14px] outline-none hover:border-slate-300 focus:bg-white focus:border-black transition-all shadow-sm" 
                     value={searchTerm} 
                     onChange={e=>setSearchTerm(e.target.value)} 
                   />
                </div>
             </div>

             {/* PRODUCT GRID: VERCEL PREMIUM CARD DESIGN */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? <div className="col-span-full py-32 text-center text-[10px] text-slate-300 uppercase tracking-[0.3em] italic font-mono">Indexando Matrizes 3D...</div> : 
                  filteredProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all cursor-pointer flex flex-col"
                    >
                       {/* IMAGE CONTAINER: INCREASED SIZE */}
                       <div className="aspect-square w-full bg-[#FAFAFA] relative border-b border-slate-50 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center p-8 group-hover:scale-105 duration-700 ease-in-out">
                             {prod.imageUrl ? (
                               <img src={prod.imageUrl} className="w-full h-full object-contain drop-shadow-2xl" />
                             ) : (
                               <div className="flex flex-col items-center gap-2 opacity-10">
                                  <ImageIcon className="h-16 w-16" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Sem Preview</span>
                               </div>
                             )}
                          </div>
                          {/* ACTIONS: QUICK VIEW & EDIT */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-10">
                             <div 
                               className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-black hover:text-white transition-all cursor-pointer"
                               onClick={(e) => { e.stopPropagation(); setViewingProduct(prod); }}
                             >
                                <Eye className="h-4 w-4" />
                             </div>
                             <div 
                               className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm hover:bg-black hover:text-white transition-all cursor-pointer"
                               onClick={(e) => { e.stopPropagation(); handleEdit(prod); }}
                             >
                                <Edit3 className="h-4 w-4" />
                             </div>
                          </div>
                          
                          <div className="absolute bottom-4 left-4">
                             <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/50 text-[10px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                                {prod.category || 'Peça Industrial'}
                             </div>
                          </div>
                       </div>

                       {/* INFO CONTAINER */}
                       <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                             <div className="flex justify-between items-start gap-4">
                                <h3 className="text-[18px] font-bold text-black tracking-tight leading-tight">{prod.name}</h3>
                                <div className="text-right">
                                   <p className="text-[18px] font-mono font-black text-black">R$ {prod.sellingPrice.toFixed(2)}</p>
                                </div>
                             </div>
                             <p className="text-[12px] font-mono font-semibold text-slate-300 uppercase tracking-widest">SKU: {prod.sku || 'S-3D-PORT'}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  prod.stockQuantity > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-400"
                                )} />
                                <span className={cn(
                                  "text-[11px] font-bold uppercase tracking-widest",
                                  prod.stockQuantity > 0 ? "text-emerald-600" : "text-red-500"
                                )}>
                                   {prod.stockQuantity > 0 ? `${prod.stockQuantity} UN` : 'Sem Estoque'}
                                </span>
                             </div>

                          </div>
                       </div>
                    </div>
                  ))
                }
             </div>
          </div>
        )}

        {isAddingMode && (
          <div className="bg-white border border-slate-100 rounded-xl p-10 animate-in slide-in-from-top-4 duration-500 shadow-2xl">
             <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                <h3 className="text-[15px] font-bold text-black uppercase tracking-[0.2em] flex items-center gap-3"><Tag className="h-4.5 w-4.5 text-blue-500" /> {editingProduct ? 'Ajuste de Ativo Industrial' : 'Registro de Ativo Industrial'}</h3>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 uppercase tracking-widest">{editingProduct ? 'Editando' : 'Novo Item'}</div>
             </div>
             
             <form className="space-y-10" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identificação do Modelo</label>
                      <input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-4 text-[14px] outline-none focus:bg-white focus:border-black transition-all" required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Oreo Box" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Categoria Técnica</label>
                      <div className="flex gap-2">
                         <select className="flex-1 bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-4 text-[14px] outline-none" required value={category} onChange={e=>setCategory(e.target.value)}>
                            <option value="">Selecionar...</option>
                            {availableCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                         </select>
                         <button type="button" onClick={()=>setIsAddingCat(!isAddingCat)} className="p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-black hover:text-white transition-all"><Plus className="h-4 w-4" /></button>
                      </div>
                      {isAddingCat && (
                        <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                           <input type="text" placeholder="Nome da Categoria..." className="flex-1 bg-white border border-black rounded-lg px-3 py-2 text-xs uppercase font-bold" value={newCatInput} onChange={e=>setNewCatInput(e.target.value)} />
                           <button type="button" onClick={addCategory} className="bg-black text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase">Incluir</button>
                        </div>
                      )}
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Subcategoria Técnica</label>
                      <div className="flex gap-2">
                         <select className="flex-1 bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-4 text-[14px] outline-none" value={subcategory} onChange={e=>setSubcategory(e.target.value)}>
                            <option value="">Selecionar...</option>
                            {availableSubcategories.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                         </select>
                         <button type="button" onClick={()=>setIsAddingSubcat(!isAddingSubcat)} className="p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-black hover:text-white transition-all"><Plus className="h-4 w-4" /></button>
                      </div>
                      {isAddingSubcat && (
                        <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                           <input type="text" placeholder="Nome da Subcategoria..." className="flex-1 bg-white border border-black rounded-lg px-3 py-2 text-xs uppercase font-bold" value={newSubcatInput} onChange={e=>setNewSubcatInput(e.target.value)} />
                           <button type="button" onClick={addSubcategory} className="bg-black text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase">Incluir</button>
                        </div>
                      )}
                   </div>
                   <div className="space-y-2 relative group">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                         SKU Global 
                         {!editingProduct && name && category && <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />}
                      </label>
                      <input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-lg px-4 py-4 text-[14px] outline-none font-mono font-bold text-blue-600" value={sku} onChange={e=>setSku(e.target.value)} placeholder="AUTO-GEN" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Material Base</label>
                      <select className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none" required value={materialId} onChange={e=>setMaterialId(e.target.value)}>
                         <option value="">Selecionar Insumo...</option>
                         {materials.map(m => (
                           <option key={m.id} value={m.id}>{m.name} ({m.color})</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Peso da Peça (g)</label>
                      <input type="number" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none" required value={weightGrams} onChange={e=>setWeightGrams(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Preço de Venda (R$)</label>
                      <input type="number" step="0.01" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none" required value={sellingPrice} onChange={e=>setSellingPrice(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tempo de Impressão</label>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 relative">
                            <input type="number" placeholder="H" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none focus:bg-white focus:border-black transition-all" value={hours} onChange={e=>setHours(e.target.value)} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">hrs</span>
                         </div>
                         <div className="flex-1 relative">
                            <input type="number" placeholder="Min" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none focus:bg-white focus:border-black transition-all" value={minutes} onChange={e=>setMinutes(e.target.value)} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">min</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* CALCULATED COST & PRICING INTELLIGENCE */}
                <div className="space-y-6">
                   <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col md:grid md:grid-cols-3 items-center gap-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                            <Calculator className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-[12px] font-bold text-black uppercase tracking-widest">Custo de Produção</p>
                            <p className="text-2xl font-black text-black font-mono">R$ {estimatedProdCost.toFixed(2)}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                         <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                            <DollarSign className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sugestão de Venda</p>
                            <p className="text-2xl font-black text-emerald-600 font-mono">R$ {suggestedPrice.toFixed(2)}</p>
                         </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 border-l border-slate-200 pl-8">
                         <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Lucro Bruto Estimado</p>
                         <div className="flex flex-col items-end">
                            <p className={cn("text-3xl font-black font-mono leading-none", grossProfit > 0 ? "text-black" : "text-red-500")}>
                               R$ {grossProfit.toFixed(2)}
                            </p>
                            <p className={cn("text-[13px] font-bold uppercase tracking-widest mt-1", marginPercentage > 50 ? "text-emerald-500" : "text-amber-500")}>
                               {marginPercentage.toFixed(1)}% de Margem
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* MARKETPLACE PROJECTION */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-700">
                      <div className="bg-[#FAFAFA] border border-slate-100 rounded-2xl p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Retorno Shopee</span>
                            <div className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded uppercase">14% + R$ 5.00</div>
                         </div>
                         <div className="flex items-baseline justify-between">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Taxa Est: <span className="text-black font-mono">R$ {(parseFloat(sellingPrice || "0") * 0.14 + 5).toFixed(2)}</span></div>
                            <div className="text-right">
                               <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Líquido a Receber</p>
                               <p className="text-2xl font-black text-black font-mono">R$ {(parseFloat(sellingPrice || "0") - (parseFloat(sellingPrice || "0") * 0.14) - 5).toFixed(2)}</p>
                            </div>
                         </div>
                      </div>

                      <div className="bg-[#FAFAFA] border border-slate-100 rounded-2xl p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-yellow-600 uppercase tracking-widest">Retorno Mercado Livre</span>
                            <div className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[9px] font-black rounded uppercase">12% + Taxa Fixa</div>
                         </div>
                         <div className="flex items-baseline justify-between">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Taxa Est: <span className="text-black font-mono">R$ {(parseFloat(sellingPrice || "0") * 0.12 + (parseFloat(sellingPrice || "0") < 79 ? 6 : 0)).toFixed(2)}</span></div>
                            <div className="text-right">
                               <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Líquido a Receber</p>
                               <p className="text-2xl font-black text-black font-mono">R$ {(parseFloat(sellingPrice || "0") - (parseFloat(sellingPrice || "0") * 0.12) - (parseFloat(sellingPrice || "0") < 79 ? 6 : 0)).toFixed(2)}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Qtd Estoque (UN)</label>
                      <input type="number" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl px-4 py-4 text-[14px] outline-none" value={stockQuantity} onChange={e=>setStockQuantity(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Link Anúncio Shopee</label>
                      <div className="relative group">
                         <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                         <input type="url" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl pl-11 pr-4 py-4 text-[14px] outline-none focus:bg-white focus:border-orange-500/30 transition-all font-mono" value={shopeeUrl} onChange={e=>setShopeeUrl(e.target.value)} placeholder="https://shopee.com.br/..." />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Foto do Produto</label>
                      <div className="flex gap-2">
                         <div className="relative flex-1 group">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                            <input type="text" className="w-full bg-[#FAFAFA] border border-slate-100 rounded-xl pl-11 pr-4 py-4 text-[14px] outline-none focus:bg-white focus:border-blue-500/30 transition-all font-mono" value={imageUrl.startsWith('data:') ? 'IMAGEM CARREGADA' : imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="URL ou Upload..." />
                         </div>
                         <label className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                         </label>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Breve Descritivo Técnico</label>
                   <textarea className="w-full bg-[#FAFAFA] border border-slate-100 rounded-2xl px-4 py-4 text-[14px] min-h-[160px] outline-none" value={description} onChange={e=>setDescription(e.target.value)} />
                </div>
                <div className="flex justify-end pt-4 gap-4">
                   <button 
                     type="button"
                     onClick={() => { setIsAddingMode(false); setEditingProduct(null); }}
                     className="px-10 h-14 bg-slate-50 text-slate-400 rounded-xl text-[13px] font-bold uppercase transition-all"
                   >
                     Cancelar
                   </button>
                   <button type="submit" className="bg-black text-white px-12 h-14 rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-3">
                      {editingProduct ? 'Atualizar Ativo' : 'Autorizar Ativo'}
                   </button>
                </div>
             </form>
          </div>
        )}
      </div>

       {/* SLIDE-OVER: FICHA TÉCNICA (SOMENTE VISUALIZAÇÃO) */}
       {viewingProduct && (
         <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
               
               {/* HEADER */}
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-black text-white">
                  <div>
                     <h3 className="text-xl font-bold tracking-tight">Ficha Técnica</h3>
                     <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">{viewingProduct.sku || 'SKU-PENDENTE'}</p>
                  </div>
                  <button onClick={() => setViewingProduct(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><X className="h-5 w-5" /></button>
               </div>

               {/* CONTENT */}
               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  
                  {/* PREVIEW & NAME */}
                  <div className="flex items-center gap-6">
                     <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                        {viewingProduct.imageUrl ? <img src={viewingProduct.imageUrl} className="w-full h-full object-contain" /> : <Box className="h-8 w-8 text-slate-300" />}
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-black tracking-tight">{viewingProduct.name}</h4>
                        <div className="flex gap-2 mt-1">
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase tracking-widest">{viewingProduct.category}</span>
                           <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase tracking-widest">{viewingProduct.material?.name || 'PLA Standard'}</span>
                        </div>
                     </div>
                  </div>

                  {/* CORE STATS */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Estimado</p>
                        <p className="text-xl font-bold text-black">{viewingProduct.weightGrams}g</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo Impressão</p>
                        <p className="text-xl font-bold text-black">{Math.floor(viewingProduct.productionTime / 60)}h {viewingProduct.productionTime % 60}min</p>
                     </div>
                  </div>

                  {/* PRICING INTEL */}
                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3 text-emerald-500" /> Inteligência de Preço</p>
                     <div className="bg-white border border-slate-100 rounded-2xl p-6 divide-y divide-slate-50 shadow-sm">
                        <div className="flex justify-between py-3">
                           <span className="text-[13px] font-medium text-slate-500">Custo de Produção</span>
                           <span className="font-mono font-bold text-black">
                              R$ {(
                                viewingProduct.calculatedCost || 
                                ((viewingProduct.weightGrams * (
                                  (viewingProduct.material?.costPerUnit || 0) / 
                                  ((viewingProduct.material?.unitType?.toLowerCase() === 'kg' ? viewingProduct.material?.totalAmount * 1000 : viewingProduct.material?.totalAmount) || 1)
                                )) + (viewingProduct.productionTime / 60 * 0.40))
                              ).toFixed(2)}
                           </span>
                        </div>
                        <div className="flex justify-between py-3">
                           <span className="text-[13px] font-medium text-slate-500">Preço de Venda</span>
                           <span className="font-mono font-extrabold text-black">R$ {viewingProduct.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-3">
                           <span className="text-[13px] font-black text-emerald-600 uppercase tracking-widest">Lucro Bruto Estimado</span>
                           <span className="font-mono font-black text-emerald-600">
                              R$ {(
                                viewingProduct.sellingPrice - (
                                  viewingProduct.calculatedCost || 
                                  ((viewingProduct.weightGrams * (
                                    (viewingProduct.material?.costPerUnit || 0) / 
                                    ((viewingProduct.material?.unitType?.toLowerCase() === 'kg' ? viewingProduct.material?.totalAmount * 1000 : viewingProduct.material?.totalAmount) || 1)
                                  )) + (viewingProduct.productionTime / 60 * 0.40))
                                )
                              ).toFixed(2)}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* MARKETPLACE PROJECTION */}
                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2"><Globe className="h-3 w-3 text-blue-500" /> Canais Digitais</p>
                     <div className="grid grid-cols-1 gap-4">
                        <div className="bg-orange-50/30 border border-orange-100 rounded-2xl p-6 flex justify-between items-center">
                           <div>
                              <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Recebimento Shopee</p>
                              <p className="text-[9px] text-orange-400 font-bold uppercase mt-0.5">14% + R$ 5,00 Fee</p>
                           </div>
                           <p className="text-2xl font-black text-orange-700 font-mono">R$ {(viewingProduct.sellingPrice * 0.86 - 5).toFixed(2)}</p>
                        </div>
                        <div className="bg-yellow-50/30 border border-yellow-100 rounded-2xl p-6 flex justify-between items-center">
                           <div>
                              <p className="text-[11px] font-black text-yellow-700 uppercase tracking-widest">Recebimento M. Livre</p>
                              <p className="text-[9px] text-yellow-600 font-bold uppercase mt-0.5">12% + Taxa Variável</p>
                           </div>
                           <p className="text-2xl font-black text-yellow-800 font-mono">R$ {(viewingProduct.sellingPrice * 0.88 - (viewingProduct.sellingPrice < 79 ? 6 : 0)).toFixed(2)}</p>
                        </div>
                     </div>
                  </div>

               </div>

               <div className="p-8 border-t border-slate-100 bg-[#FAFAFA] flex gap-4">
                  <button 
                    onClick={() => { setViewingProduct(null); handleEdit(viewingProduct); }}
                    className="flex-1 bg-black text-white py-4 rounded-xl text-[13px] font-bold uppercase shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" /> Editar Ativo
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
