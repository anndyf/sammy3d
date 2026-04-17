import { prisma } from '@/lib/prisma';

export class ProductService {
  /**
   * Calcula o custo de produção baseado no peso e material.
   */
  static calculateProductionCost(weightGrams: number, material: any, additionalCost: number = 0) {
    const divider = (material.unitType === 'kg' || material.unitType === 'l')
      ? material.totalAmount * 1000 : material.totalAmount;
    const costPerGram = material.costPerUnit / (divider || 1);
    return weightGrams * costPerGram + additionalCost;
  }

  /**
   * Gera um SKU único baseado na categoria e nome.
   */
  static generateSKU(name: string, category: string, providedSku?: string) {
    if (providedSku) return providedSku;
    
    const catPrefix = (category || 'GEN').substring(0, 3).toUpperCase();
    const namePart  = name
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
    const random    = Math.floor(Math.random() * 900) + 100;
    
    return `${catPrefix}-${namePart}-${random}`;
  }

  /**
   * Lista produtos com paginação.
   */
  static async list(page: number = 1, limit: number = 100) {
    const skip = (Math.max(1, page) - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        include: { material: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count(),
    ]);

    return { 
      data, 
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    };
  }

  /**
   * Cria um novo produto e realiza baixa inicial de material se necessário.
   */
  static async create(data: any) {
    const { materialId, weightGrams, stockQuantity } = data;
    
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material não encontrado');

    const calculatedCost = this.calculateProductionCost(
      Number(weightGrams), 
      material, 
      Number(data.additionalCost || 0)
    );

    const sku = this.generateSKU(data.name, data.category, data.sku);

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...data,
          weightGrams: Number(weightGrams),
          sellingPrice: Number(data.sellingPrice),
          productionTime: Number(data.productionTime || 0),
          additionalCost: Number(data.additionalCost || 0),
          stockQuantity: Number(stockQuantity || 0),
          calculatedCost: Number(calculatedCost.toFixed(4)),
          sku,
        },
      });

      const initialQty = Number(stockQuantity || 0);
      if (initialQty > 0) {
        let deduction = Number(weightGrams) * initialQty;
        if (material.unitType === 'kg' || material.unitType === 'l') deduction /= 1000;
        
        await tx.material.update({
          where: { id: materialId },
          data: { remainingAmount: { decrement: deduction } },
        });
      }

      return product;
    });
  }
}
