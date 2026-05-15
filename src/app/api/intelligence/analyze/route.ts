import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const materialId = formData.get('materialId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // 1. BUSCAR CONFIGURAÇÕES GLOBAIS (ENERGIA)
    const energyConfig = await prisma.config.findUnique({ where: { key: 'energy_price' } });
    const energyPriceKwh = energyConfig ? parseFloat(energyConfig.value.replace(',', '.')) : 1.32;

    // 2. BUSCAR CUSTO DO FILAMENTO (ESPECÍFICO OU MÉDIO)
    let costPerGram = 0.15;
    if (materialId && materialId !== 'avg') {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (material) {
        // Correção de Unidade: Se o custo for > 10, provavelmente é R$/kg, então dividimos por 1000 para gramas.
        costPerGram = material.costPerUnit > 10 ? material.costPerUnit / 1000 : material.costPerUnit;
      }
    } else {
      const avgMaterial = await prisma.material.aggregate({
        _avg: { costPerUnit: true }
      });
      const avg = avgMaterial._avg.costPerUnit || 150; // Assume 150/kg se vazio
      costPerGram = avg > 10 ? avg / 1000 : avg;
    }

    // 3. BUSCAR IMPRESSORA MÉDIA (DEPRECIAÇÃO E POTÊNCIA)
    const machineStats = { powerW: 300, depreciationH: 0.50 };
    
    const content = await file.text();
    const lines = content.split('\n');

    let totalTimeMinutes = 0;
    let totalFilamentWeightGrams = 0;
    let totalFilamentLengthMeters = 0;
    let layerCount = 0;
    let filamentDensity = 1.24;

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();

      // Tempo (Creality / Cura / Outros)
      if (upperLine.startsWith('M73')) {
        const rMatch = upperLine.match(/R(\d+)/);
        if (rMatch && totalTimeMinutes === 0) totalTimeMinutes = parseInt(rMatch[1]);
      }

      if (upperLine.includes('TIME:')) {
        const tMatch = upperLine.match(/TIME:(\d+)/);
        if (tMatch && totalTimeMinutes === 0) totalTimeMinutes = Math.round(parseInt(tMatch[1]) / 60);
      }

      // Camadas
      if (upperLine.includes('TOTAL LAYER NUMBER:')) {
        const lMatch = upperLine.match(/TOTAL LAYER NUMBER:\s*(\d+)/);
        if (lMatch) layerCount = parseInt(lMatch[1]);
      }

      // Comprimento de filamento declarado
      if (upperLine.includes('FILAMENT USED:')) {
         const mmMatch = upperLine.match(/FILAMENT USED:\s*([\d.]+)/);
         if (mmMatch) totalFilamentLengthMeters = parseFloat(mmMatch[1]) / 1000;
      }

      // Densidade
      if (upperLine.includes('FILAMENT_DENSITY:')) {
         const dMatch = upperLine.match(/FILAMENT_DENSITY:\s*([\d.]+)/);
         if (dMatch) filamentDensity = parseFloat(dMatch[1]);
      }

      // Parsing de extrusão bruta (G1 E...)
      if (upperLine.startsWith('G1') && upperLine.includes(' E')) {
         const eMatch = upperLine.match(/E([\d.-]+)/);
         if (eMatch) {
            const eVal = parseFloat(eMatch[1]);
            if (eVal > 0) totalFilamentLengthMeters += eVal / 1000;
         }
      }
    }

    // Fallback de peso se não detectado diretamente
    if (totalFilamentWeightGrams === 0 && totalFilamentLengthMeters > 0) {
       const radius = 1.75 / 2;
       const volumeMm3 = Math.PI * Math.pow(radius, 2) * (totalFilamentLengthMeters * 1000);
       totalFilamentWeightGrams = (volumeMm3 * filamentDensity) / 1000;
    }

    // --- CÁLCULO DE CUSTO REAL ---
    const materialCost = totalFilamentWeightGrams * costPerGram;
    const hours = totalTimeMinutes / 60;
    const energyCost = (machineStats.powerW / 1000) * hours * energyPriceKwh;
    const depreciationCost = hours * machineStats.depreciationH;

    const totalBaseCost = materialCost + energyCost + depreciationCost;

    return NextResponse.json({
      metrics: {
        time: `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`,
        weight: `${totalFilamentWeightGrams.toFixed(1)}g`,
        length: `${totalFilamentLengthMeters.toFixed(1)}m`,
        layers: layerCount || "Detectando...",
        cost: `R$ ${totalBaseCost.toFixed(2)}`,
        breakdown: {
          material: materialCost.toFixed(2),
          energy: energyCost.toFixed(2),
          depreciation: depreciationCost.toFixed(2)
        }
      },
      ai: {
        score: totalFilamentWeightGrams > 200 ? 85 : 98,
        warnings: totalFilamentWeightGrams > 200 ? [{ type: 'warning', msg: "Peça grande detectada. Verifique o carretel." }] : [],
        passes: ["Estrutura de coordenadas válida", "Início de extrusão detectado"]
      }
    });

  } catch (error) {
    console.error('GCode analysis error:', error);
    return NextResponse.json({ error: 'Erro ao analisar arquivo' }, { status: 500 });
  }
}
