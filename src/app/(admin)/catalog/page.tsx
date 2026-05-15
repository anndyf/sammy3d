"use client"

import { useState, useEffect } from "react";
import { Plus, Search, Tag, Box, DollarSign, Clock, Settings2, Trash2, Edit3, Eye, Image as ImageIcon, ChevronDown, ChevronUp, AlertCircle, ShoppingCart, ArrowRight, Share2, MoreHorizontal, LayoutGrid, List, X, ExternalLink, Globe, Monitor, Smartphone, MessageCircle, Calculator, Sparkles, Package, Info, Activity, UploadCloud, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material { id: string; name: string; color?: string; costPerUnit: number; totalAmount: number; unitType: string; }
interface Product { id: string; name: string; description?: string; imageUrl?: string; productionTime: number; weightGrams: number; additionalCost: number; materialId: string; category: string; subcategory?: string; sku?: string; shopeeUrl?: string; calculatedCost: number; sellingPrice: number; stockQuantity: number; material: Material; parentId?: string | null; variations?: Product[]; }

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'loading' | '', message: string}>({type: '', message: ''});

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
  const [parentId, setParentId] = useState<string | null>(null);

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
      const [resP, resM] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/materials')
      ]);
      
      const pData = await resP.json();
      const mData = await resM.json();

      const products = Array.isArray(pData) ? pData : (pData?.data ?? []);
      const materials = Array.isArray(mData) ? mData : (mData?.data ?? []);

      setProducts(products);
      setMaterials(materials);
    } catch (e: any) { 
      console.error("❌ Falha crítica no carregamento:", e);
      setStatus({ type: 'error', message: 'Falha ao buscar dados na nuvem.' });
    } finally { setLoading(false); }
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
    
    const totalMinutes = p.productionTime || 0;
    setHours(Math.floor(totalMinutes / 60).toString());
    setMinutes((totalMinutes % 60).toString());
    setShopeeUrl(p.shopeeUrl || "");
    setImageUrl(p.imageUrl || "");

    if (p.category && !availableCategories.includes(p.category)) {
      setAvailableCategories(prev => [...prev, p.category]);
    }
    
    setParentId(p.parentId || null);
    setIsAddingMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddVariation = (p: Product) => {
    setViewingProduct(null);
    setEditingProduct(null);
    setName(p.name + " - Nova Variação");
    setCategory(p.category || "");
    setSubcategory(p.subcategory || "");
    setSku(p.sku ? p.sku + "-VAR" : "");
    setDescription(p.description || "");
    setSellingPrice(p.sellingPrice.toString());
    setStockQuantity("0");
    setWeightGrams(p.weightGrams.toString());
    setMaterialId("");
    
    const totalMinutes = p.productionTime || 0;
    setHours(Math.floor(totalMinutes / 60).toString());
    setMinutes((totalMinutes % 60).toString());
    setShopeeUrl(p.shopeeUrl || "");
    setImageUrl(p.imageUrl || "");
    
    setParentId(p.id);
    setIsAddingMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 800;
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_SIZE) { height = Math.round((height * MAX_SIZE) / width); width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width = Math.round((width * MAX_SIZE) / height); height = MAX_SIZE; }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas não suportado'));
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Imagem muito grande! Limite máximo: 10MB.");
      return;
    }

    try {
      setStatus({ type: 'loading', message: '🗜️ Comprimindo imagem...' });
      const compressed = await compressImage(file);
      setImageUrl(compressed);
      setStatus({ type: '', message: '' });
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
      setStatus({ type: 'error', message: '❌ Erro ao processar imagem.' });
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    
    const showStatus = (type: 'success' | 'error', message: string) => {
      setStatus({ type, message });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    setSaving(true);
    setStatus({ type: 'loading', message: '📡 Transmitindo dados para a nuvem...' });
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, category, subcategory, sku, description, 
          sellingPrice: parseFloat(sellingPrice), 
          stockQuantity: parseInt(stockQuantity),
          weightGrams: parseFloat(weightGrams) || 0,
          materialId,
          productionTime: (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0),
          shopeeUrl,
          imageUrl,
          parentId
        })
      });
      
      const result = await res.json();

      if (res.ok) {
        showStatus('success', '✅ Produto Salvo com Sucesso!');
        setIsAddingMode(false); setEditingProduct(null); setParentId(null);
        setName(""); setCategory(""); setSubcategory(""); setSku(""); setDescription(""); setSellingPrice(""); setStockQuantity("");
        setWeightGrams(""); setMaterialId(""); setHours(""); setMinutes(""); setShopeeUrl(""); setImageUrl("");
        fetchData();
      } else {
        showStatus('error', `❌ Erro: ${result.error || 'Falha no servidor'}`);
      }
    } catch (e: any) { 
      console.error(e);
      showStatus('error', `❌ Falha de Conexão: ${e.message}`);
    } finally {
      setSaving(false);
    }
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
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-fade-in pb-40">
      
      {/* STATUS NOTIFICATION BAR */}
      {status.message && (
        <div 
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border backdrop-blur-md",
            status.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : 
            status.type === 'error' ? "bg-red-500/90 text-white border-red-400" : 
            "bg-blue-500/90 text-white border-blue-400"
          )}
        >
           {status.type === 'loading' ? <Sparkles className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
           <span className="text-[13px] font-bold tracking-tight">{status.message}</span>
        </div>
      )}

      {/* VERCEL HEADER AREA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-transparent rounded-xl">
               <Package className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Catálogo de Produtos</h1>
         </div>
         <button 
           onClick={() => setIsAddingMode(!isAddingMode)}
           className="bg-cyan-500 text-black px-6 py-2.5 h-11 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg"
         >
           {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
           {isAddingMode ? "Fechar Catálogo" : "Novo Produto"}
         </button>
      </div>

      <div>
        {!isAddingMode && (
          <div className="space-y-6">
             <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white outline-none hover:border-white/10 focus:bg-[#1a1d24] focus:border-cyan-500 transition-all shadow-sm" 
                  value={searchTerm} 
                  onChange={e=>setSearchTerm(e.target.value)} 
                />
             </div>

             <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-[#1a1d24]">
                   <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">IMAGEM</div>
                   <div className="col-span-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">NOME / DESCRIÇÃO</div>
                   <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">SKU</div>
                   <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">TIPO</div>
                   <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">ESTOQUE</div>
                   <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">CUSTO UNIT.</div>
                   <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">PREÇO VENDA</div>
                   <div className="col-span-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">AÇÕES</div>
                </div>

                {products.length > 0 || loading ? (
                  <div className="divide-y divide-white/5">
                     {loading ? (
                       <div className="py-16 text-center text-xs text-slate-500 uppercase tracking-widest italic font-mono">
                          Carregando...
                       </div>
                     ) : (
                       filteredProducts.map(prod => (
                         <div key={prod.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group">
                            <div className="col-span-1">
                               <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                                  {prod.imageUrl ? (
                                    <img src={prod.imageUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="h-5 w-5 text-slate-500" />
                                  )}
                               </div>
                            </div>
                            
                            <div className="col-span-3">
                               <p className="text-sm font-bold text-white truncate">{prod.name || 'Sem Nome'}</p>
                            </div>

                            <div className="col-span-2">
                               <p className="text-sm text-slate-400 truncate">{prod.sku || 'N/A'}</p>
                            </div>

                            <div className="col-span-1">
                               <span className="inline-block px-2.5 py-1 bg-[#1e293b] text-slate-300 text-[10px] font-bold rounded-lg border border-white/10">
                                  {prod.category || 'Geral'}
                               </span>
                            </div>

                            <div className="col-span-1 text-center">
                               <span className={cn(
                                 "text-sm font-bold",
                                 (prod.stockQuantity || 0) > 0 ? "text-white" : "text-red-400"
                               )}>
                                  {prod.stockQuantity || 0}
                               </span>
                            </div>

                            <div className="col-span-2">
                               <p className="text-sm font-bold text-slate-300 font-mono">
                                  R$ {(prod.calculatedCost || 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="col-span-1">
                               <p className="text-sm font-bold text-emerald-400 font-mono">
                                  R$ {(prod.sellingPrice || 0).toFixed(2)}
                               </p>
                            </div>

                            <div className="col-span-1 flex items-center justify-end gap-2">
                               <button onClick={() => setViewingProduct(prod)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors" title="Ver Detalhes">
                                  <Info className="h-4 w-4" />
                               </button>
                               <button onClick={() => handleEdit(prod)} className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded-md transition-colors" title="Editar">
                                  <Edit3 className="h-4 w-4" />
                               </button>
                               <button className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Excluir">
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
                ) : (
                   <div className="py-24 text-center">
                      <Box className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-bold text-slate-400">Nenhum produto encontrado</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {isAddingMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsAddingMode(false); setEditingProduct(null); }} />
             
             <div className="relative w-full max-w-xl bg-[#1a1d24] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-xl font-bold text-white">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                   <button 
                     onClick={() => { setIsAddingMode(false); setEditingProduct(null); }}
                     className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"
                   >
                      <X className="h-6 w-6" />
                   </button>
                </div>

                <form className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar" onSubmit={handleSave}>
                   <div className="flex justify-center mb-4">
                      <label className="w-40 h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all group relative overflow-hidden">
                         {imageUrl ? (
                            <img src={imageUrl} className="w-full h-full object-cover" />
                         ) : (
                            <>
                               <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Foto</span>
                            </>
                         )}
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                         <input 
                           type="text" 
                           className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 force-white-text" 
                           required 
                           value={name} 
                           onChange={e=>setName(e.target.value)} 
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU (Cód.)</label>
                         <input 
                           type="text" 
                           className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 force-white-text font-mono" 
                           value={sku} 
                           onChange={e=>setSku(e.target.value)} 
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                         <textarea 
                           className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 min-h-[100px] force-white-text" 
                           value={description} 
                           onChange={e=>setDescription(e.target.value)} 
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                               <Tag className="h-3 w-3" /> Tipo
                            </label>
                            <select 
                              className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all"
                              required
                              value={category}
                              onChange={e=>setCategory(e.target.value)}
                            >
                               <option value="">Outros / Diversos</option>
                               {availableCategories.map(cat => (
                                 <option key={cat} value={cat}>{cat}</option>
                               ))}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                               <Activity className="h-3 w-3" /> Personalização
                            </label>
                            <select 
                              className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all"
                              value={subcategory}
                              onChange={e=>setSubcategory(e.target.value)}
                            >
                               <option value="">Sem Personalização</option>
                               {availableSubcategories.map(sub => (
                                 <option key={sub} value={sub}>{sub}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço de Venda (R$)</label>
                            <input type="number" step="0.01" className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 force-white-text" required value={sellingPrice} onChange={e=>setSellingPrice(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Estoque Inicial</label>
                            <input type="number" className="w-full bg-[#242933] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 force-white-text" value={stockQuantity} onChange={e=>setStockQuantity(e.target.value)} />
                         </div>
                      </div>

                      <div className="bg-black/20 border border-white/5 border-dashed rounded-xl p-4 flex items-center gap-4 group">
                         <div className="p-2 bg-white/5 rounded-lg text-slate-600">
                            <Lock className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Configuração Fiscal Bloqueada</p>
                            <p className="text-[9px] font-medium text-slate-600">Disponível no plano PRO Fiscal</p>
                         </div>
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={saving}
                     className={cn(
                       "w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-sm font-black uppercase tracking-[0.1em] rounded-xl shadow-[0_4px_20px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_30px_rgba(34,211,238,0.4)] hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50",
                       saving && "animate-pulse"
                     )}
                   >
                      {saving ? 'PROCESSANDO...' : 'Salvar Produto'}
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>

       {/* SLIDE-OVER: FICHA TÉCNICA (SOMENTE VISUALIZAÇÃO) */}
       {viewingProduct && (
         <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
               
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-black text-white">
                  <div>
                     <h3 className="text-xl font-bold tracking-tight">Ficha Técnica</h3>
                     <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">{viewingProduct.sku || 'SKU-PENDENTE'}</p>
                  </div>
                  <button onClick={() => setViewingProduct(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><X className="h-5 w-5" /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12">
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

                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3 text-emerald-500" /> Inteligência de Preço</p>
                     <div className="bg-white border border-slate-100 rounded-2xl p-6 divide-y divide-slate-50 shadow-sm">
                        <div className="flex justify-between py-3">
                           <span className="text-[13px] font-medium text-slate-500">Custo de Produção</span>
                           <span className="font-mono font-bold text-black">
                              R$ {(viewingProduct.calculatedCost || 0).toFixed(2)}
                           </span>
                        </div>
                        <div className="flex justify-between py-3">
                           <span className="text-[13px] font-medium text-slate-500">Preço de Venda</span>
                           <span className="font-mono font-extrabold text-black">R$ {viewingProduct.sellingPrice.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>

                  {viewingProduct.variations && viewingProduct.variations.length > 0 && (
                    <div className="space-y-4">
                       <p className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2"><List className="h-3 w-3 text-purple-500" /> Variações Disponíveis</p>
                       <div className="grid grid-cols-1 gap-3">
                          {viewingProduct.variations.map(variation => (
                             <div key={variation.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center group">
                                <div>
                                   <p className="text-[12px] font-bold text-black">{variation.name}</p>
                                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{variation.material?.name || 'S/ Material'} • R$ {variation.sellingPrice.toFixed(2)}</p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setViewingProduct(null); handleEdit(variation); }}
                                  className="p-2 text-slate-400 hover:text-black hover:bg-slate-200 rounded-lg transition-all"
                                >
                                   <Edit3 className="h-4 w-4" />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-slate-100 bg-[#FAFAFA] flex gap-4">
                  <button 
                    onClick={() => handleAddVariation(viewingProduct)}
                    className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl text-[13px] font-bold uppercase shadow-sm hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Criar Variação
                  </button>
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
