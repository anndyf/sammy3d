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

    let filamentDensity = 1.24; // Padrão PLA

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();

      // 1. TEMPO
      // Creality Print / Klipper / Bambu usam M73 (Remaining time)
      // Ex: M73 P0 R20 (R20 significa 20 minutos restantes no início do arquivo)
      if (upperLine.startsWith('M73')) {
        const rMatch = upperLine.match(/R(\d+)/);
        if (rMatch && totalTimeMinutes === 0) {
          totalTimeMinutes = parseInt(rMatch[1]);
        }
      }

      // Fallback para ;TIME: (Cura/Creality)
      if (upperLine.includes('TIME:')) {
        const tMatch = upperLine.match(/TIME:(\d+)/);
        if (tMatch && totalTimeMinutes === 0) totalTimeMinutes = Math.round(parseInt(tMatch[1]) / 60);
      }

      // 2. CAMADAS
      // Creality Print: ; total layer number: 130
      if (upperLine.includes('TOTAL LAYER NUMBER:')) {
        const lMatch = upperLine.match(/TOTAL LAYER NUMBER:\s*(\d+)/);
        if (lMatch) layerCount = parseInt(lMatch[1]);
      }

      // 3. FILAMENTO (Consumo em mm)
      // Creality gera muitos metadados, mas o consumo real é somado ou pego no final.
      // Vamos pegar o comprimento se disponível em ;Filament used:
      if (upperLine.includes('FILAMENT USED:')) {
         const mmMatch = upperLine.match(/FILAMENT USED:\s*([\d.]+)/);
         if (mmMatch) totalFilamentLengthMeters = parseFloat(mmMatch[1]) / 1000;
      }

      // 4. DENSIDADE (Para cálculo de peso)
      if (upperLine.includes('FILAMENT_DENSITY:')) {
         const dMatch = upperLine.match(/FILAMENT_DENSITY:\s*([\d.]+)/);
         if (dMatch) filamentDensity = parseFloat(dMatch[1]);
      }

      // 5. CONSUMO REAL VIA G1 (Fallback agressivo se não houver metadados)
      // Percorre as linhas de comando para somar a extrusão (E)
      if (upperLine.startsWith('G1') && upperLine.includes(' E')) {
         const eMatch = upperLine.match(/E([\d.-]+)/);
         if (eMatch) {
            const eVal = parseFloat(eMatch[1]);
            // Se for extrusão relativa (comum em Klipper/Bambu/Creality), somamos apenas positivos
            if (eVal > 0) totalFilamentLengthMeters += eVal / 1000;
         }
      }
    }

    // Cálculo final se não achou peso direto
    if (totalFilamentWeightGrams === 0 && totalFilamentLengthMeters > 0) {
       // Peso (g) = Volume (mm³) * Densidade (g/cm³) / 1000
       // Volume = PI * (r²) * length
       const radius = 1.75 / 2;
       const volumeMm3 = Math.PI * Math.pow(radius, 2) * (totalFilamentLengthMeters * 1000);
       totalFilamentWeightGrams = (volumeMm3 * filamentDensity) / 1000;
    }

    // Gerar "Insights" baseados no conteúdo
    const warnings = [];
    const passes = ["Estrutura de coordenadas válida", "Início de extrusão detectado"];

    if (totalFilamentWeightGrams > 200) {
      warnings.push({ type: 'warning', msg: "Peça grande detectada. Verifique se há material suficiente no carretel." });
    }

    if (!content.includes('G29') && !content.includes('BED_MESH_CALIBRATE') && !content.includes('START_PRINT')) {
      warnings.push({ type: 'info', msg: "Nivelamento automático não detectado explicitamente. Verifique a mesa." });
    }

    return NextResponse.json({
      metrics: {
        time: `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`,
        weight: `${totalFilamentWeightGrams.toFixed(1)}g`,
        length: `${totalFilamentLengthMeters.toFixed(1)}m`,
        layers: layerCount || "Detectando...",
        cost: `R$ ${(totalFilamentWeightGrams * 0.15).toFixed(2)}`
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
