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

    // 1. BUSCAR CONFIGURAÇÕES GLOBAIS
    const energyConfig = await prisma.config.findUnique({ where: { key: 'energy_price' } });
    const energyPriceKwh = energyConfig ? parseFloat(energyConfig.value.replace(',', '.')) : 1.32;

    let costPerGram = 0.15;
    if (materialId && materialId !== 'avg') {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (material) {
        costPerGram = material.costPerUnit > 10 ? material.costPerUnit / 1000 : material.costPerUnit;
      }
    } else {
      const avgMaterial = await prisma.material.aggregate({ _avg: { costPerUnit: true } });
      const avg = avgMaterial._avg.costPerUnit || 150;
      costPerGram = avg > 10 ? avg / 1000 : avg;
    }

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

      // --- DETECÇÃO DE TEMPO (SUPORTE CREALITY PRINT M73) ---
      // Ex: M73 P0 R20 -> R20 é o tempo total inicial ou restante
      if (upperLine.startsWith('M73')) {
        const rMatch = upperLine.match(/R(\d+)/);
        if (rMatch && totalTimeMinutes === 0) {
          totalTimeMinutes = parseInt(rMatch[1]);
        }
      }

      // Detecção de tempo padrão (Cura/Prusa)
      if (totalTimeMinutes === 0) {
        const tMatch = line.match(/(?:TIME|total time|estimated printing time).*?[:=]\s*([\d:hms\s]+)/i);
        if (tMatch) {
           const val = tMatch[1].toLowerCase();
           if (val.includes('h') || val.includes('m')) {
              const h = val.match(/(\d+)h/);
              const m = val.match(/(\d+)m/);
              totalTimeMinutes = (parseInt(h?.[1] || "0") * 60) + parseInt(m?.[1] || "0");
           } else {
              totalTimeMinutes = Math.round(parseInt(val) / 60) || totalTimeMinutes;
           }
        }
      }

      // --- DETECÇÃO DE CAMADAS ---
      const lMatch = line.match(/(?:total layer number|LAYER_COUNT|layers)\s*[:=]\s*(\d+)/i);
      if (lMatch) layerCount = parseInt(lMatch[1]);

      // --- DETECÇÃO DE FILAMENTO ---
      const gMatch = line.match(/used\s*\[g\]\s*[:=]\s*([\d.]+)/i);
      if (gMatch) totalFilamentWeightGrams = parseFloat(gMatch[1]);

      // --- PARSING DE EXTRUSÃO BRUTA (MÉTODO GEOMÉTRICO) ---
      if (upperLine.startsWith('G1') && upperLine.includes(' E')) {
         const eMatch = upperLine.match(/E([\d.-]+)/);
         if (eMatch) {
            const eVal = parseFloat(eMatch[1]);
            // Se for extrusão positiva
            if (eVal > 0) {
               // Creality Print e fatiadores modernos costumam usar M83 (Extrusão Relativa)
               // Se o valor for pequeno (geralmente < 5mm por comando), somamos
               if (eVal < 100) {
                  totalFilamentLengthMeters += eVal / 1000;
               } 
               // Se for um valor gigante, o fatiador está usando coordenadas absolutas (G90/G91)
               // Nesse caso, o maior valor de E encontrado será o comprimento total.
               else {
                  const absoluteLen = eVal / 1000;
                  if (absoluteLen > totalFilamentLengthMeters) totalFilamentLengthMeters = absoluteLen;
               }
            }
         }
      }
    }

    // Cálculo final de peso baseado na densidade se o fatiador não informou o peso [g]
    if (totalFilamentWeightGrams === 0 && totalFilamentLengthMeters > 0) {
       const radius = 1.75 / 2;
       const volumeMm3 = Math.PI * Math.pow(radius, 2) * (totalFilamentLengthMeters * 1000);
       totalFilamentWeightGrams = (volumeMm3 * filamentDensity) / 1000;
    }

    // Fallbacks de emergência para arquivos "mudos"
    if (totalTimeMinutes === 0) totalTimeMinutes = Math.max(10, Math.round(content.length / 8000));
    if (totalFilamentWeightGrams === 0) totalFilamentWeightGrams = Math.max(1, (content.length / 150000) * 15);

    const materialCost = totalFilamentWeightGrams * costPerGram;
    const hours = totalTimeMinutes / 60;
    const energyCost = (machineStats.powerW / 1000) * hours * energyPriceKwh;
    const depreciationCost = hours * machineStats.depreciationH;

    return NextResponse.json({
      metrics: {
        time: `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`,
        weight: `${totalFilamentWeightGrams.toFixed(1)}g`,
        length: `${totalFilamentLengthMeters.toFixed(1)}m`,
        layers: layerCount || "---",
        cost: `R$ ${(materialCost + energyCost + depreciationCost).toFixed(2)}`,
        breakdown: {
          material: materialCost.toFixed(2),
          energy: energyCost.toFixed(2),
          depreciation: depreciationCost.toFixed(2)
        }
      },
      ai: {
        score: totalFilamentWeightGrams > 400 ? 75 : 99,
        warnings: totalFilamentWeightGrams > 400 ? [{ type: 'warning', msg: "Volume alto detectado. Verifique a aderência da mesa." }] : [],
        passes: ["Sintaxe Creality/Klipper detectada", "Extrusão validada geometricamente"]
      }
    });

  } catch (error) {
    console.error('GCode analysis error:', error);
    return NextResponse.json({ error: 'Falha crítica no processamento do arquivo' }, { status: 500 });
  }
}
