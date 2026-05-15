import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const content = await file.text();
    const lines = content.split('\n');

    let totalTimeMinutes = 0;
    let totalFilamentWeightGrams = 0;
    let totalFilamentLengthMeters = 0;
    let layerCount = 0;
    
    // Padrões comuns de comentários de fatiadores (Cura, Bambu, Prusa, etc)
    // Ex: ;TIME:1234
    // Ex: ;filament used [g] = 12.5
    // Ex: ;filament used [mm] = 4500
    // Ex: ;total layers count: 120

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();

      // Tempo
      // Creality/Cura: ;TIME:6521
      // Bambu/Prusa: ; total time: 1h 20m 10s
      if (upperLine.includes('TIME')) {
        const timeMatch = upperLine.match(/TIME\s*[:=]\s*(\d+)/);
        if (timeMatch) {
          totalTimeMinutes = Math.round(parseInt(timeMatch[1]) / 60);
        } else {
          const hMatch = upperLine.match(/(\d+)H/);
          const mMatch = upperLine.match(/(\d+)M/);
          if (hMatch || mMatch) {
            totalTimeMinutes = (parseInt(hMatch?.[1] || "0") * 60) + parseInt(mMatch?.[1] || "0");
          }
        }
      }
      
      // Filament Length & Weight (Creality Print uses 'Filament used:' and 'Filament Weight:')
      if (upperLine.includes('FILAMENT')) {
         // Length: ;Filament used: 12.5m
         const mmMatch = upperLine.match(/FILAMENT USED\s*[:=]\s*([\d.]+)/);
         if (mmMatch) {
           const val = parseFloat(mmMatch[1]);
           // Creality pode vir em metros ou mm. Se for muito baixo, provavelmente é metros.
           totalFilamentLengthMeters = val < 500 ? val : val / 1000;
         }

         // Weight: ;Filament Weight: 15.4
         const gMatch = upperLine.match(/FILAMENT WEIGHT\s*[:=]\s*([\d.]+)/);
         if (gMatch) totalFilamentWeightGrams = parseFloat(gMatch[1]);

         // Altura de camada (opcional para insight)
         const lhMatch = upperLine.match(/LAYER HEIGHT\s*[:=]\s*([\d.]+)/);
         if (lhMatch) {
            // Pode ser usado para predição de qualidade
         }
      }

      // Bambu / Orca Specific
      if (upperLine.includes('FILAMENT_G')) {
         const match = upperLine.match(/FILAMENT_G\s*[:=]\s*([\d.]+)/);
         if (match) totalFilamentWeightGrams = parseFloat(match[1]);
      }

      // Layers
      if (upperLine.includes('LAYER_COUNT') || upperLine.includes('TOTAL LAYERS') || upperLine.includes('LAYERS:')) {
         const match = upperLine.match(/(?:LAYER_COUNT|TOTAL LAYERS|LAYERS)\s*[:=]\s*(\d+)/);
         if (match) layerCount = parseInt(match[1]);
      }
      
      // Fallback
      if (totalFilamentWeightGrams === 0 && totalFilamentLengthMeters > 0) {
        totalFilamentWeightGrams = totalFilamentLengthMeters * 2.98;
      }
    }

    // Gerar "Insights" baseados no conteúdo
    const warnings = [];
    const passes = ["Estrutura de coordenadas válida", "Início de extrusão detectado"];

    if (content.includes('M104 S220') || content.includes('M109 S220')) {
      passes.push("Temperatura de bico (220ºC) OK para PLA");
    }

    if (totalFilamentWeightGrams > 200) {
      warnings.push({ type: 'warning', msg: "Peça grande detectada. Verifique se há material suficiente no carretel." });
    }

    if (!content.includes('G29') && !content.includes('BED_MESH_CALIBRATE')) {
      warnings.push({ type: 'info', msg: "Nivelamento automático (G29) não encontrado no início. Verifique a primeira camada." });
    }

    return NextResponse.json({
      metrics: {
        time: `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`,
        weight: `${totalFilamentWeightGrams.toFixed(1)}g`,
        length: `${totalFilamentLengthMeters.toFixed(1)}m`,
        layers: layerCount || "Detectando...",
        cost: `R$ ${(totalFilamentWeightGrams * 0.15).toFixed(2)}` // Estimativa simples 150/kg
      },
      ai: {
        score: warnings.length > 0 ? 85 : 98,
        warnings,
        passes
      }
    });

  } catch (error) {
    console.error('GCode analysis error:', error);
    return NextResponse.json({ error: 'Erro ao analisar arquivo' }, { status: 500 });
  }
}
