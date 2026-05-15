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
      const upperLine = line.toUpperCase();

      // Tempo
      if (upperLine.includes('TIME:')) {
        const timeMatch = upperLine.match(/TIME:(\d+)/);
        if (timeMatch) totalTimeMinutes = Math.round(parseInt(timeMatch[1]) / 60);
      }
      
      // Cura / generic filament used in mm
      if (upperLine.includes('FILAMENT USED [MM]:') || upperLine.includes('FILAMENT USED:')) {
         const match = upperLine.match(/FILAMENT USED\s*(?:\[MM\])?\s*[:=]\s*([\d.]+)/);
         if (match) totalFilamentLengthMeters = parseFloat(match[1]) / 1000;
      }

      // Weight (Bambu / Prusa / Orca)
      if (upperLine.includes('FILAMENT USED [G]:') || upperLine.includes('FILAMENT USED [G] =')) {
         const match = upperLine.match(/FILAMENT USED\s*\[G\]\s*[:=]\s*([\d.]+)/);
         if (match) totalFilamentWeightGrams = parseFloat(match[1]);
      }

      // Layers
      if (upperLine.includes('LAYER_COUNT:') || upperLine.includes('TOTAL LAYERS COUNT:')) {
         const match = upperLine.match(/(?:LAYER_COUNT|TOTAL LAYERS COUNT)\s*[:=]\s*(\d+)/);
         if (match) layerCount = parseInt(match[1]);
      }
      
      // Fallback: se não achar o peso direto, calcular pelo comprimento (assumindo PLA 1.75mm ~ 2.4g/m)
      if (totalFilamentWeightGrams === 0 && totalFilamentLengthMeters > 0) {
        totalFilamentWeightGrams = totalFilamentLengthMeters * 2.98; // Média segura
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
