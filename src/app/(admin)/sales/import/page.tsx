"use client"

import { useState, useEffect } from "react";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  Check, 
  X, 
  Box, 
  Info,
  DollarSign,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as XLSX from "xlsx";

interface Product { 
  id: string; 
  name: string; 
  sellingPrice: number; 
  sku?: string; 
}

interface Material {
  id: string;
  name: string;
}

interface ParsedOrderItem {
  productName: string;
  sku?: string;
  quantity: number;
  price: number;
  productId?: string; // Linked catalog product
}

interface ParsedOrder {
  orderId: string;
  buyer: string;
  status: string;
  items: ParsedOrderItem[];
  netRevenue?: number;
  totalAmount: number;
}

export default function ShopeeImporterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [importingState, setImportingState] = useState<'idle' | 'importing' | 'completed'>('idle');
  const [importProgress, setImportProgress] = useState<{current: number; total: number; success: number; errors: number}>({current: 0, total: 0, success: 0, errors: 0});
  const [importLogs, setImportLogs] = useState<{orderId: string; status: 'pending' | 'success' | 'error'; message: string}[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Customizações solicitadas pelo usuário:
  const [bypassStock, setBypassStock] = useState(true); // Evita baixa de estoque para vendas antigas
  const [registeringItem, setRegisteringItem] = useState<{oIdx: number; iIdx: number} | null>(null);
  const [registeringAll, setRegisteringAll] = useState(false);

  // Carrega produtos do catálogo para mapeamento
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products?limit=500');
        const json = await res.json();
        const productList = Array.isArray(json) ? json : (json?.data ?? []);
        setProducts(productList);
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Carrega materiais do sistema para cadastros em lote automatizados
  useEffect(() => {
    async function loadMaterials() {
      try {
        const res = await fetch('/api/materials?limit=100');
        const json = await res.json();
        const materialList = Array.isArray(json) ? json : (json?.data ?? []);
        setMaterials(materialList);
      } catch (err) {
        console.error("Erro ao carregar materiais:", err);
      }
    }
    loadMaterials();
  }, []);

  // Normalização e mapeamento para dados vindos de planilhas Excel (XLS/XLSX)
  const mapExcelDataToRows = (jsonData: any[]): any[] => {
    if (jsonData.length === 0) return [];
    
    const sample = jsonData[0];
    const keys = Object.keys(sample);
    
    const getKeyValue = (obj: any, matches: string[]): any => {
      const key = keys.find(k => matches.some(m => k.toLowerCase().includes(m)));
      return key ? obj[key] : undefined;
    };
    
    return jsonData.map(item => {
      const orderIdKey = keys.find(k => {
        const lowerKey = k.toLowerCase();
        return (lowerKey.includes('nº do pedido') || lowerKey.includes('n° do pedido') || lowerKey.includes('id do pedido') || lowerKey.includes('order id') || lowerKey.includes('pedido')) &&
               !lowerKey.includes('usuário') && !lowerKey.includes('usuario') && !lowerKey.includes('comprador') && !lowerKey.includes('cliente');
      }) || keys.find(k => {
        const lowerKey = k.toLowerCase();
        return (lowerKey === 'id' || lowerKey === 'order' || lowerKey === 'id_pedido') &&
               !lowerKey.includes('usuário') && !lowerKey.includes('usuario') && !lowerKey.includes('comprador') && !lowerKey.includes('cliente') && !lowerKey.includes('produto');
      });
      
      let rawOrderId = orderIdKey ? item[orderIdKey] : getKeyValue(item, ['pedido', 'order id', 'id do pedido', 'nº do pedido']);
      let orderIdStr = rawOrderId ? String(rawOrderId).trim() : '';
      if (orderIdStr.includes(' ') || orderIdStr.includes('(')) {
        orderIdStr = orderIdStr.split(/[\s(]/)[0];
      }
      const orderId = orderIdStr || undefined;
      const productName = getKeyValue(item, ['produto', 'product name', 'nome do produto', 'nome do item']);
      
      const qtyVal = getKeyValue(item, ['quantidade', 'qtd', 'quantity', 'qte']);
      const quantity = typeof qtyVal === 'number' ? qtyVal : parseInt(String(qtyVal || '1').replace(/[^\d]/g, ''), 10) || 1;
      
      const priceVal = getKeyValue(item, ['preço', 'price', 'unit price', 'preço acordado', 'preço unitário']);
      let price = 0;
      if (typeof priceVal === 'number') {
        price = priceVal;
      } else {
        const cleanPrice = String(priceVal || '0').replace(/[^\d.,]/g, '').replace(',', '.');
        price = parseFloat(cleanPrice) || 0;
      }
      
      // Procura primeiro pelo nome completo do comprador (evitando o ID/nome de usuário)
      const buyerKey = keys.find(k => {
        const lowerKey = k.toLowerCase();
        return (lowerKey.includes('nome do comprador') || lowerKey.includes('destinatário') || lowerKey.includes('destinatario') || lowerKey.includes('recipient name') || lowerKey.includes('nome completo')) &&
               !lowerKey.includes('usuário') && !lowerKey.includes('usuario') && !lowerKey.includes('username');
      }) || keys.find(k => {
        const lowerKey = k.toLowerCase();
        return lowerKey.includes('comprador') && !lowerKey.includes('usuário') && !lowerKey.includes('usuario') && !lowerKey.includes('username');
      }) || keys.find(k => {
        const lowerKey = k.toLowerCase();
        return lowerKey.includes('buyer') && !lowerKey.includes('username') && !lowerKey.includes('id');
      });
      
      const buyer = buyerKey ? item[buyerKey] : getKeyValue(item, ['nome do usuário', 'usuário', 'buyer']);
      const sku = getKeyValue(item, ['sku', 'referência', 'sku do produto', 'código de referência']);
      const status = getKeyValue(item, ['status', 'status do pedido']);
      
      const netVal = getKeyValue(item, ['receita estimada', 'valor a receber', 'net', 'receita líquida', 'payout', 'total estimado']);
      let netRevenue = null;
      if (netVal !== undefined) {
        if (typeof netVal === 'number') {
          netRevenue = netVal;
        } else {
          const cleanNet = String(netVal || '').replace(/[^\d.,]/g, '').replace(',', '.');
          netRevenue = parseFloat(cleanNet) || null;
        }
      }
      
      return {
        orderId: orderId ? String(orderId) : undefined,
        productName: productName ? String(productName) : undefined,
        quantity,
        price,
        buyer: buyer ? String(buyer) : undefined,
        sku: sku ? String(sku) : undefined,
        status: status ? String(status) : undefined,
        netRevenue
      };
    }).filter(r => r.orderId && r.productName); // Apenas linhas válidas com ID e Produto
  };

  // Helper para parsing de CSV robusto
  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const header = lines[0];
    const semicolonCount = (header.match(/;/g) || []).length;
    const commaCount = (header.match(/,/g) || []).length;
    const separator = semicolonCount >= commaCount ? ';' : ',';

    const splitCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = splitCSVLine(header).map(h => h.trim().toLowerCase());
    
    let orderIdIdx = headers.findIndex(h => {
      const lower = h.toLowerCase();
      return (lower.includes('nº do pedido') || lower.includes('n° do pedido') || lower.includes('id do pedido') || lower.includes('order id') || lower.includes('pedido')) &&
             !lower.includes('usuário') && !lower.includes('usuario') && !lower.includes('comprador') && !lower.includes('cliente');
    });
    if (orderIdIdx === -1) {
      orderIdIdx = headers.findIndex(h => {
        const lower = h.toLowerCase();
        return (lower === 'id' || lower === 'order' || lower === 'id_pedido') &&
               !lower.includes('usuário') && !lower.includes('usuario') && !lower.includes('comprador') && !lower.includes('cliente') && !lower.includes('produto');
      });
    }
    const productNameIdx = headers.findIndex(h => h.includes('produto') || h.includes('product name') || h.includes('nome do produto') || h.includes('nome do item'));
    const qtyIdx = headers.findIndex(h => h.includes('quantidade') || h.includes('qtd') || h.includes('quantity') || h.includes('qte'));
    const priceIdx = headers.findIndex(h => h.includes('preço') || h.includes('price') || h.includes('unit price') || h.includes('preço acordado') || h.includes('preço unitário'));
    // Procura primeiro pelo nome completo do comprador (evitando o ID/nome de usuário)
    let buyerIdx = headers.findIndex(h => {
      const lower = h.toLowerCase();
      return (lower.includes('nome do comprador') || lower.includes('destinatário') || lower.includes('destinatario') || lower.includes('recipient name') || lower.includes('nome completo')) &&
             !lower.includes('usuário') && !lower.includes('usuario') && !lower.includes('username');
    });
    if (buyerIdx === -1) {
      buyerIdx = headers.findIndex(h => {
        const lower = h.toLowerCase();
        return lower.includes('comprador') && !lower.includes('usuário') && !lower.includes('usuario') && !lower.includes('username');
      });
    }
    if (buyerIdx === -1) {
      buyerIdx = headers.findIndex(h => {
        const lower = h.toLowerCase();
        return lower.includes('buyer') && !lower.includes('username') && !lower.includes('id');
      });
    }
    if (buyerIdx === -1) {
      buyerIdx = headers.findIndex(h => h.includes('usuário') || h.includes('usuario') || h.includes('username') || h.includes('buyer'));
    }
    const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('referência') || h.includes('sku do produto') || h.includes('código de referência'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('status do pedido'));
    const netRevenueIdx = headers.findIndex(h => h.includes('receita estimada') || h.includes('valor a receber') || h.includes('net') || h.includes('receita líquida') || h.includes('payout') || h.includes('total estimado'));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      if (values.length < headers.length) continue;

      const row: any = {};
      if (orderIdIdx !== -1) {
        let orderIdStr = String(values[orderIdIdx] || '').trim();
        if (orderIdStr.includes(' ') || orderIdStr.includes('(')) {
          orderIdStr = orderIdStr.split(/[\s(]/)[0];
        }
        row.orderId = orderIdStr;
      }
      if (productNameIdx !== -1) row.productName = values[productNameIdx];
      
      if (qtyIdx !== -1) {
        row.quantity = parseInt(values[qtyIdx].replace(/[^\d]/g, ''), 10) || 1;
      } else {
        row.quantity = 1;
      }

      if (priceIdx !== -1) {
        const cleanPrice = values[priceIdx].replace(/[^\d.,]/g, '').replace(',', '.');
        row.price = parseFloat(cleanPrice) || 0;
      } else {
        row.price = 0;
      }

      if (buyerIdx !== -1) row.buyer = values[buyerIdx];
      if (skuIdx !== -1) row.sku = values[skuIdx];
      if (statusIdx !== -1) row.status = values[statusIdx];
      
      if (netRevenueIdx !== -1) {
        const cleanNet = values[netRevenueIdx].replace(/[^\d.,]/g, '').replace(',', '.');
        row.netRevenue = parseFloat(cleanNet) || null;
      }

      rows.push(row);
    }
    return rows;
  };

  const processImportData = (rows: any[]) => {
    const ordersMap: Record<string, ParsedOrder> = {};
    
    rows.forEach(row => {
      const orderId = row.orderId || `SHOPEE-${Math.floor(Math.random() * 90000) + 10000}`;
      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          orderId,
          buyer: row.buyer || 'Cliente Shopee',
          status: row.status || 'Concluído',
          items: [],
          netRevenue: 0,
          totalAmount: 0
        };
      }
      
      let matchedProduct = products.find(p => p.sku && row.sku && p.sku.toLowerCase() === row.sku.toLowerCase());
      if (!matchedProduct) {
        matchedProduct = products.find(p => p.name.toLowerCase() === row.productName?.toLowerCase());
      }
      if (!matchedProduct && row.productName) {
        matchedProduct = products.find(p => row.productName.toLowerCase().includes(p.name.toLowerCase()));
      }
      
      ordersMap[orderId].items.push({
        productName: row.productName || 'Produto Shopee',
        sku: row.sku || '',
        quantity: row.quantity || 1,
        price: row.price || 0,
        productId: matchedProduct?.id || undefined
      });
      
      if (row.netRevenue) {
        ordersMap[orderId].netRevenue = (ordersMap[orderId].netRevenue || 0) + row.netRevenue;
      }
      ordersMap[orderId].totalAmount += (row.price || 0) * (row.quantity || 1);
    });

    const finalOrders = Object.values(ordersMap);
    setParsedOrders(finalOrders);
    
    const autoSelectIds = finalOrders
      .filter(order => order.items.every(item => item.productId !== undefined))
      .map(o => o.orderId);
    setSelectedOrderIds(autoSelectIds);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');
    const reader = new FileReader();
    
    if (isExcel) {
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;
        
        try {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          if (!jsonData || jsonData.length === 0) {
            alert("Nenhum dado válido encontrado na planilha Excel.");
            return;
          }
          
          const rows = mapExcelDataToRows(jsonData);
          if (rows.length === 0) {
            alert("Nenhum pedido válido identificado na planilha. Verifique se as colunas estão corretas.");
            return;
          }
          processImportData(rows);
        } catch (err: any) {
          console.error("Erro ao ler planilha Excel:", err);
          alert("Erro ao ler arquivo Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          alert("Nenhum dado válido encontrado no arquivo CSV. Verifique se as colunas estão corretas.");
          return;
        }
        processImportData(rows);
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleMapProduct = (orderIndex: number, itemIndex: number, productId: string) => {
    const updated = [...parsedOrders];
    updated[orderIndex].items[itemIndex].productId = productId;
    setParsedOrders(updated);

    const order = updated[orderIndex];
    if (order.items.every(item => item.productId !== undefined)) {
      if (!selectedOrderIds.includes(order.orderId)) {
        setSelectedOrderIds([...selectedOrderIds, order.orderId]);
      }
    }
  };

  // AUTO-CADASTRO INDIVIDUAL DO PRODUTO (Salva no banco baseado nos dados da planilha)
  const handleAutoRegisterProduct = async (orderIndex: number, itemIndex: number) => {
    const order = parsedOrders[orderIndex];
    const item = order.items[itemIndex];
    
    if (materials.length === 0) {
      alert("Nenhum material cadastrado no catálogo. Por favor, cadastre um material primeiro em Catálogo > Materiais para servir de base.");
      return;
    }
    
    setRegisteringItem({ oIdx: orderIndex, iIdx: itemIndex });
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.productName,
          materialId: materials[0].id, // Associa ao primeiro material padrão
          sellingPrice: item.price || 0,
          weightGrams: 0,
          sku: item.sku || undefined,
          productionTime: 0,
          additionalCost: 0,
          stockQuantity: 0
        })
      });
      
      if (response.ok) {
        const createdProduct = await response.json();
        
        // Adiciona à lista local de produtos
        const newProd = {
          id: createdProduct.id,
          name: createdProduct.name,
          sellingPrice: createdProduct.sellingPrice,
          sku: createdProduct.sku
        };
        setProducts(prev => [newProd, ...prev]);
        
        // Atualiza todos os itens que possuem o mesmo SKU ou Nome na planilha inteira
        const updated = parsedOrders.map(o => ({
          ...o,
          items: o.items.map(it => {
            const matchesSku = it.sku && item.sku && it.sku.toLowerCase() === item.sku.toLowerCase();
            const matchesName = it.productName.toLowerCase() === item.productName.toLowerCase();
            if (matchesSku || matchesName) {
              return { ...it, productId: createdProduct.id };
            }
            return it;
          })
        }));
        
        setParsedOrders(updated);
        
        // Seleciona automaticamente os pedidos que agora estão 100% mapeados
        const newSelected = [...selectedOrderIds];
        updated.forEach(o => {
          if (o.items.every(it => it.productId !== undefined) && !newSelected.includes(o.orderId)) {
            newSelected.push(o.orderId);
          }
        });
        setSelectedOrderIds(newSelected);
      } else {
        const errData = await response.json();
        alert(`Erro ao cadastrar produto: ${errData.error || response.statusText}`);
      }
    } catch (err: any) {
      alert(`Falha na conexão: ${err.message}`);
    } finally {
      setRegisteringItem(null);
    }
  };

  // AUTO-CADASTRO EM LOTE DE TODOS OS PRODUTOS NÃO VINCULADOS
  const handleAutoRegisterAll = async () => {
    if (materials.length === 0) {
      alert("Nenhum material cadastrado no catálogo. Por favor, cadastre um material primeiro em Catálogo > Materiais para servir de base.");
      return;
    }
    
    setRegisteringAll(true);
    
    // Filtra itens únicos sem vínculo
    const unmappedItems: { productName: string; sku?: string; price: number }[] = [];
    parsedOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.productId === undefined) {
          const alreadyListed = unmappedItems.some(ui => 
            (ui.sku && it.sku && ui.sku.toLowerCase() === it.sku.toLowerCase()) || 
            (ui.productName.toLowerCase() === it.productName.toLowerCase())
          );
          if (!alreadyListed) {
            unmappedItems.push({
              productName: it.productName,
              sku: it.sku,
              price: it.price
            });
          }
        }
      });
    });
    
    if (unmappedItems.length === 0) {
      setRegisteringAll(false);
      return;
    }

    const createdProductMap: Record<string, string> = {}; 
    const newProductsList: Product[] = [];

    for (const item of unmappedItems) {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.productName,
            materialId: materials[0].id,
            sellingPrice: item.price || 0,
            weightGrams: 0,
            sku: item.sku || undefined,
            productionTime: 0,
            additionalCost: 0,
            stockQuantity: 0
          })
        });
        
        if (response.ok) {
          const createdProduct = await response.json();
          newProductsList.push({
            id: createdProduct.id,
            name: createdProduct.name,
            sellingPrice: createdProduct.sellingPrice,
            sku: createdProduct.sku
          });
          
          if (item.sku) {
            createdProductMap[item.sku.toLowerCase()] = createdProduct.id;
          }
          createdProductMap[item.productName.toLowerCase()] = createdProduct.id;
        }
      } catch (err) {
        console.error("Erro ao cadastrar em lote:", err);
      }
    }

    if (newProductsList.length > 0) {
      setProducts(prev => [...newProductsList, ...prev]);
      
      const updated = parsedOrders.map(o => ({
        ...o,
        items: o.items.map(it => {
          let matchedId = it.productId;
          if (!matchedId) {
            if (it.sku && createdProductMap[it.sku.toLowerCase()]) {
              matchedId = createdProductMap[it.sku.toLowerCase()];
            } else if (createdProductMap[it.productName.toLowerCase()]) {
              matchedId = createdProductMap[it.productName.toLowerCase()];
            }
          }
          return { ...it, productId: matchedId };
        })
      }));
      
      setParsedOrders(updated);
      
      const newSelected = [...selectedOrderIds];
      updated.forEach(o => {
        if (o.items.every(it => it.productId !== undefined) && !newSelected.includes(o.orderId)) {
          newSelected.push(o.orderId);
        }
      });
      setSelectedOrderIds(newSelected);
    }
    
    setRegisteringAll(false);
  };

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === parsedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(parsedOrders.map(o => o.orderId));
    }
  };

  const handleImportSelected = async () => {
    if (selectedOrderIds.length === 0) return;
    
    setImportingState('importing');
    setImportLogs([]);
    
    const ordersToImport = parsedOrders.filter(o => selectedOrderIds.includes(o.orderId));
    setImportProgress({
      current: 0,
      total: ordersToImport.length,
      success: 0,
      errors: 0
    });

    const logs: typeof importLogs = [];

    for (let i = 0; i < ordersToImport.length; i++) {
      const order = ordersToImport[i];
      setImportProgress(prev => ({ ...prev, current: i + 1 }));
      
      const logEntry: (typeof importLogs)[0] = {
        orderId: order.orderId,
        status: 'pending',
        message: 'Importando...'
      };
      
      logs.push(logEntry);
      setImportLogs([...logs]);

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.buyer,
            status: (() => {
              const s = order.status.toLowerCase();
              if (s.includes('concluído') || s.includes('concluido') || s.includes('completed') || s.includes('finished')) {
                return 'FINISHED';
              }
              if (s.includes('enviado') || s.includes('enviada') || s.includes('shipped') || s.includes('postado')) {
                return 'SHIPPED';
              }
              if (s.includes('entregue') || s.includes('delivered') || s.includes('recebido')) {
                return 'READY';
              }
              return 'PENDING';
            })(),
            type: "CATALOG",
            totalAmount: order.totalAmount,
            paymentStatus: 'PAID',
            discountAmount: 0,
            saleChannel: 'SHOPEE',
            items: order.items.map(item => ({
              productId: item.productId,
              customName: item.productName,
              quantity: item.quantity,
              price: item.price
            })),
            netRevenue: order.netRevenue && order.netRevenue > 0 ? order.netRevenue : null,
            bypassStock: bypassStock // Passa a instrução de não baixar o estoque
          })
        });

        if (response.ok) {
          logEntry.status = 'success';
          logEntry.message = 'Pedido importado com sucesso!';
          setImportProgress(prev => ({ ...prev, success: prev.success + 1 }));
        } else {
          const errData = await response.json();
          logEntry.status = 'error';
          logEntry.message = `Erro: ${errData.error || response.statusText}`;
          setImportProgress(prev => ({ ...prev, errors: prev.errors + 1 }));
        }
      } catch (err: any) {
        logEntry.status = 'error';
        logEntry.message = `Conexão falhou: ${err.message}`;
        setImportProgress(prev => ({ ...prev, errors: prev.errors + 1 }));
      }
      
      setImportLogs([...logs]);
    }

    setImportingState('completed');
  };

  const handleReset = () => {
    setParsedOrders([]);
    setSelectedOrderIds([]);
    setImportingState('idle');
    setImportLogs([]);
  };

  // Verifica se há itens não catalogados
  const unmappedCount = parsedOrders.reduce((acc, o) => 
    acc + o.items.filter(it => it.productId === undefined).length, 0
  );

  return (
    <div className="bg-transparent min-h-screen text-white font-sans select-none animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10 mt-2">
         <div className="flex items-center gap-4">
            <Link 
              href="/sales" 
              className="p-2.5 bg-[#1a1d24] border border-white/5 rounded-xl text-gray-600 hover:text-white transition-all shadow-lg active:scale-95"
            >
               <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
               <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  Importador de Vendas Shopee 
                  <span className="bg-[#FF4500]/10 text-[#FF4500] text-[10px] font-black tracking-widest px-2.5 py-1 rounded border border-[#FF4500]/20 uppercase">Shopee Excel/CSV</span>
               </h1>
               <p className="text-xs text-gray-600 mt-1 font-bold">Importe planilhas de pedidos exportadas da Shopee nos formatos Excel (XLS/XLSX) ou CSV.</p>
            </div>
         </div>
         
         <button 
           onClick={() => setIsHelpOpen(true)}
           className="bg-[#1a1d24] hover:bg-[#242831] text-gray-500 hover:text-white border border-white/5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-md"
         >
            <HelpCircle className="h-4 w-4 text-[#FF4500]" /> Como Exportar da Shopee?
         </button>
      </div>

      {importingState === 'idle' && parsedOrders.length === 0 ? (
        /* FILE UPLOADER (Midnight Tech Style) */
        <div className="max-w-3xl mx-auto mt-12">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-[3rem] p-16 text-center transition-all duration-300 relative overflow-hidden bg-[#1a1d24] shadow-2xl",
              dragActive ? "border-[#FF4500] bg-[#FF4500]/5 scale-[1.01]" : "border-white/10 hover:border-[#FF4500]/30 hover:bg-[#1a1d24]/60"
            )}
          >
             <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF4500]/5 blur-[80px] pointer-events-none" />
             
             <div className="w-20 h-20 bg-[#14161b] rounded-3xl flex items-center justify-center border border-white/10 mx-auto mb-8 shadow-2xl relative group">
                <UploadCloud className={cn("h-8 w-8 transition-transform group-hover:scale-110", dragActive ? "text-[#FF4500]" : "text-gray-600")} />
                <Sparkles className="h-4.5 w-4.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
             </div>

             <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-3">Arraste seu Relatório de Vendas</h2>
             <p className="text-gray-500 font-bold text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Insira o arquivo <code className="text-[#FF4500] font-mono bg-[#14161b] px-1.5 py-0.5 rounded font-black">.xls</code>, <code className="text-[#FF4500] font-mono bg-[#14161b] px-1.5 py-0.5 rounded font-black">.xlsx</code> ou <code className="text-[#FF4500] font-mono bg-[#14161b] px-1.5 py-0.5 rounded font-black">.csv</code> exportado da Central do Vendedor da Shopee para iniciarmos o mapeamento automático.
             </p>

             <label className="bg-white text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#FF4500] hover:text-white hover:scale-105 transition-all inline-flex items-center gap-3 active:scale-95 cursor-pointer">
                Selecionar Arquivo
                <input 
                  type="file" 
                  accept=".csv,text/csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                  className="hidden" 
                  onChange={handleFileInputChange}
                />
             </label>

             <div className="mt-12 flex items-center justify-center gap-8 text-gray-600 text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-8">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4.5 w-4.5 text-[#FF4500]" /> Suporta Excel (.xls, .xlsx) e CSV</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4.5 w-4.5 text-[#FF4500]" /> Baixa Automática de Estoque</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4.5 w-4.5 text-[#FF4500]" /> Lançamento de Receita Líquida</span>
             </div>
          </div>
        </div>
      ) : importingState === 'idle' || importingState === 'importing' ? (
        /* ORDERS LIST & MAPPER */
        <div className="space-y-8 animate-in fade-in duration-300">
           
           {/* CONFIGURAÇÃO DE ESTOQUE + RESUMO CARD */}
           <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-600/5 blur-[50px] pointer-events-none" />
              
              <div className="space-y-4">
                 <div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">Configurações de Importação</span>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                       {parsedOrders.length} Pedidos Identificados na Planilha
                    </h2>
                 </div>

                 {/* Opção de Evitar Baixa de Estoque solicitada pelo Usuário */}
                 <div className="flex items-start gap-3 bg-[#14161b] border border-[#FF4500]/15 p-4 rounded-2xl max-w-xl">
                    <input 
                      type="checkbox" 
                      id="bypassStockCheck"
                      checked={bypassStock}
                      onChange={(e) => setBypassStock(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-white/10 bg-transparent text-[#FF4500] focus:ring-offset-0 focus:ring-0 checked:bg-[#FF4500] cursor-pointer"
                    />
                    <label htmlFor="bypassStockCheck" className="text-xs text-slate-300 font-bold leading-relaxed cursor-pointer select-none">
                       <span className="text-white block font-black uppercase text-[10px] tracking-wider mb-0.5">Vendas Históricas / Antigas</span>
                       Não dar baixa de estoque ou de matérias-primas no sistema (os produtos e insumos não serão alterados).
                    </label>
                 </div>
              </div>

              {/* Botões de Ação Bulk */}
              <div className="flex flex-wrap items-center gap-4">
                 {unmappedCount > 0 && (
                   <button 
                     onClick={handleAutoRegisterAll}
                     disabled={registeringAll || importingState === 'importing'}
                     className="px-6 py-4 bg-[#14161b] hover:bg-[#20242e] text-amber-500 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                   >
                      {registeringAll ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" /> Cadastrando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Auto-Cadastrar {unmappedCount} Produtos Faltantes
                        </>
                      )}
                   </button>
                 )}

                 <button 
                   onClick={handleReset}
                   disabled={importingState === 'importing'}
                   className="px-6 py-4 bg-[#14161b] hover:bg-[#1f222b] text-gray-500 hover:text-white border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                 >
                    Limpar
                 </button>

                 <button 
                   onClick={handleImportSelected}
                   disabled={selectedOrderIds.length === 0 || importingState === 'importing'}
                   className="px-10 py-4 bg-[#FF4500] hover:bg-[#e03d00] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-[#FF4500]/20 hover:scale-[1.03] transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none flex items-center gap-2"
                 >
                    {importingState === 'importing' ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" /> Importando...
                      </>
                    ) : (
                      `Importar ${selectedOrderIds.length} Pedidos Selecionados`
                    )}
                 </button>
              </div>
           </div>

           {/* ORDERS TAB / STREAM */}
           <div className="bg-[#1a1d24] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    Visualização das Vendas da Planilha
                 </h3>
                 <button 
                   onClick={toggleSelectAll}
                   className="text-[10px] font-black text-[#FF4500] hover:text-white uppercase tracking-widest transition-colors"
                 >
                    {selectedOrderIds.length === parsedOrders.length ? "Desmarcar Todos" : "Selecionar Todos"}
                 </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                 {parsedOrders.map((order, oIdx) => {
                    const isFullyMapped = order.items.every(item => item.productId !== undefined);
                    const isSelected = selectedOrderIds.includes(order.orderId);

                    return (
                      <div 
                        key={order.orderId} 
                        className={cn(
                          "bg-[#14161b] border rounded-3xl p-6 transition-all duration-300 group relative",
                          isSelected ? "border-[#FF4500]/30 shadow-lg shadow-[#FF4500]/2" : "border-white/5",
                          !isFullyMapped && "opacity-80 border-amber-500/20"
                        )}
                      >
                         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            {/* CHECKBOX AND INFO */}
                            <div className="flex items-start gap-4">
                               <input 
                                 type="checkbox" 
                                 checked={isSelected}
                                 disabled={!isFullyMapped || importingState === 'importing'}
                                 onChange={() => toggleSelectOrder(order.orderId)}
                                 className="mt-1.5 h-4.5 w-4.5 rounded border-white/10 bg-transparent text-[#FF4500] focus:ring-offset-0 focus:ring-0 checked:bg-[#FF4500] cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                               />
                               
                               <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                     <h4 className="text-base font-black text-white">{order.buyer}</h4>
                                     <span className="bg-[#FF4500]/5 text-[#FF4500] text-[9px] font-black uppercase px-2 py-0.5 rounded border border-[#FF4500]/10 tracking-widest font-mono">
                                        #{order.orderId}
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                     <span>Status Shopee: {order.status}</span>
                                     <span>•</span>
                                     <span className="text-[#FF4500] font-mono font-bold">R$ {order.totalAmount.toFixed(2)} bruto</span>
                                     {order.netRevenue && order.netRevenue > 0 && (
                                       <>
                                         <span>•</span>
                                         <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                                            <DollarSign className="h-3 w-3" /> {order.netRevenue.toFixed(2)} líq.
                                         </span>
                                       </>
                                     )}
                                  </div>
                               </div>
                            </div>

                            {/* ITEMS MAPPING */}
                            <div className="flex-1 max-w-xl space-y-3">
                               {order.items.map((item, iIdx) => {
                                  const isMatched = item.productId !== undefined;
                                  const isRegisteringThis = registeringItem?.oIdx === oIdx && registeringItem?.iIdx === iIdx;
                                  
                                  return (
                                    <div key={iIdx} className="bg-[#1a1d24] border border-white/5 px-4 py-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                       <div className="space-y-0.5">
                                          <p className="text-xs font-bold text-white uppercase">{item.productName}</p>
                                          <p className="text-[9px] text-gray-600 font-bold tracking-widest uppercase">
                                             QTD: {item.quantity} • Unit: R$ {item.price.toFixed(2)} • SKU da Planilha: {item.sku || 'N/A'}
                                          </p>
                                       </div>

                                       <div className="flex items-center gap-3">
                                          {isMatched ? (
                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1">
                                               <Check className="h-3.5 w-3.5" /> Mapeado
                                            </span>
                                          ) : (
                                            <div className="flex items-center gap-3">
                                               
                                               {/* AUTO-CADASTRO DO PRODUTO NATIVO */}
                                               <button 
                                                 onClick={() => handleAutoRegisterProduct(oIdx, iIdx)}
                                                 disabled={isRegisteringThis}
                                                 className="bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-500 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-amber-500/20 hover:border-transparent transition-all flex items-center gap-1 active:scale-95"
                                               >
                                                  {isRegisteringThis ? (
                                                    <>
                                                      <Loader2 className="h-3 w-3 animate-spin" /> Cadastrando...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Plus className="h-3 w-3" /> Auto-Cadastrar
                                                    </>
                                                  )}
                                               </button>

                                               {/* VINCULAÇÃO MANUAL */}
                                               <div className="flex items-center gap-1">
                                                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                                                  <select 
                                                    onChange={(e) => handleMapProduct(oIdx, iIdx, e.target.value)}
                                                    className="bg-[#14161b] border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl outline-none focus:border-amber-400 max-w-[200px]"
                                                    defaultValue=""
                                                  >
                                                     <option value="" disabled>Vincular manual...</option>
                                                     {products.map(p => (
                                                       <option key={p.id} value={p.id}>{p.name}</option>
                                                     ))}
                                                  </select>
                                               </div>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                  );
                               })}
                            </div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* LOGS E PROGRESSO SE IMPORTANDO */}
           {importingState === 'importing' && (
             <div className="bg-[#1a1d24] border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Progresso da Importação</h3>
                   <span className="text-xs font-mono font-bold text-gray-500">{importProgress.current} de {importProgress.total}</span>
                </div>
                
                {/* PROGRESS BAR */}
                <div className="w-full bg-[#14161b] h-3 rounded-full overflow-hidden border border-white/5">
                   <div 
                     className="bg-[#FF4500] h-full transition-all duration-300"
                     style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                   />
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                   <div className="bg-[#14161b] p-4 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Processados</span>
                      <span className="text-2xl font-black text-white">{importProgress.current}</span>
                   </div>
                   <div className="bg-[#14161b] p-4 rounded-2xl border border-emerald-500/10">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Sucessos</span>
                      <span className="text-2xl font-black text-emerald-400">{importProgress.success}</span>
                   </div>
                   <div className="bg-[#14161b] p-4 rounded-2xl border border-red-500/10">
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Erros</span>
                      <span className="text-2xl font-black text-red-400">{importProgress.errors}</span>
                   </div>
                </div>
             </div>
           )}

        </div>
      ) : (
        /* IMPORT COMPLETED (SUCCESS ZONE) */
        <div className="max-w-2xl mx-auto text-center bg-[#1a1d24] border border-white/5 rounded-[3.5rem] p-16 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] pointer-events-none" />
           
           <div className="w-24 h-24 bg-[#14161b] rounded-[2rem] flex items-center justify-center border border-emerald-500/20 mx-auto mb-8 shadow-2xl relative">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
              <Sparkles className="h-5 w-5 text-amber-400 absolute top-4 right-4 animate-pulse" />
           </div>

           <h1 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">Importação Concluída!</h1>
           <p className="text-gray-500 max-w-md mx-auto font-bold text-sm leading-relaxed mb-10">
              Processamos sua planilha da Shopee com sucesso. {bypassStock ? "Nenhum estoque foi debitado devido à configuração de vendas históricas." : "O estoque dos produtos mapeados foi devidamente debitado."} As transações financeiras foram geradas no painel.
           </p>

           <div className="bg-[#14161b] rounded-2xl p-6 border border-white/5 text-left mb-10 max-h-48 overflow-y-auto space-y-2.5 custom-scrollbar">
              {importLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                   <span className="text-gray-600 font-mono">Pedido #{log.orderId}</span>
                   <span className={cn(
                     "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                     log.status === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                   )}>
                      {log.status === 'success' ? "Sucesso" : "Erro"}
                   </span>
                </div>
              ))}
           </div>

           <div className="flex gap-4 justify-center">
              <button 
                onClick={handleReset}
                className="bg-white text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:scale-105 transition-all active:scale-95"
              >
                 Nova Planilha
              </button>
              <Link 
                href="/sales" 
                className="bg-transparent text-gray-500 border border-white/10 hover:border-white hover:text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                 Voltar para Pedidos
              </Link>
           </div>
        </div>
      )}

      {/* DETALHES DE AJUDA MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsHelpOpen(false)} />
           <div className="relative bg-[#1a1d24] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-500 text-left">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Info className="h-5.5 w-5.5 text-[#FF4500]" /> Como exportar pedidos da Shopee?
                 </h2>
                 <button onClick={() => setIsHelpOpen(false)} className="p-2 text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-6 text-sm text-gray-500 font-medium leading-relaxed">
                 <p>Siga o passo a passo abaixo para gerar o arquivo Excel ou CSV correto para importação no SAMMY3D:</p>
                 
                 <ol className="list-decimal list-inside space-y-4 pl-2">
                    <li>Acesse a sua **Central do Vendedor da Shopee** (seller.shopee.com.br).</li>
                    <li>No menu lateral esquerdo, clique em **Meus Pedidos** sob a seção *Envios*.</li>
                    <li>Vá até a aba **Concluído** (ou *A Enviar*, se deseja planejar a produção antes do envio).</li>
                    <li>No canto superior direito da listagem de pedidos, clique no botão **`Exportar`**.</li>
                    <li>Aguarde o processamento e clique em **`Baixar`** para salvar a planilha em seu computador.</li>
                    <li>Importe o arquivo baixado diretamente nesta tela!</li>
                 </ol>

                 <div className="bg-[#14161b] p-5 rounded-2xl border border-emerald-500/10 flex items-start gap-4 mt-6">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                       <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-1">Planilhas XLS/XLSX Nativas</h4>
                       <p className="text-[11px] leading-relaxed">
                          O SAMMY3D agora lê diretamente arquivos gerados pela Shopee em formato Excel nativo. Você não precisa se preocupar em converter nada. Basta arrastar o arquivo!
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
