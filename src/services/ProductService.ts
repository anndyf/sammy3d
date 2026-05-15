import { prisma } from '@/lib/prisma';
import { MaterialService } from './MaterialService';

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
        where: { parentId: null },
        include: { 
          material: true,
          variations: {
            include: { material: true }
          },
          components: {
            include: { component: { include: { material: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count({ where: { parentId: null } }),
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
    const { materialId, weightGrams, stockQuantity, components } = data;
    
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material não encontrado');

    const calculatedCost = this.calculateProductionCost(
      Number(weightGrams), 
      material, 
      Number(data.additionalCost || 0)
    );

    const sku = this.generateSKU(data.name, data.category, data.sku);

    // Remover campos que não estão no prisma antes de passar para create
    const { components: _, ...dbData } = data;

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...dbData,
          weightGrams: Number(weightGrams),
          sellingPrice: Number(data.sellingPrice),
          productionTime: Number(data.productionTime || 0),
          additionalCost: Number(data.additionalCost || 0),
          stockQuantity: Number(stockQuantity || 0),
          calculatedCost: Number(calculatedCost.toFixed(4)),
          sku,
          parentId: data.parentId || null,
        },
      });

      // Salvar Composição
      if (Array.isArray(components)) {
        for (const comp of components) {
          await tx.productComposition.create({
            data: {
              kitId: product.id,
              componentId: comp.componentId,
              quantity: Number(comp.quantity) || 1
            }
          });
        }
      }

      const initialQty = Number(stockQuantity || 0);
      if (initialQty > 0) {
        await MaterialService.deduct(tx, materialId, Number(weightGrams), initialQty);
      }

      return product;
    });
  }

  static async update(id: string, data: any) {
    const { materialId, weightGrams, components } = data;
    
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material não encontrado');

    const calculatedCost = this.calculateProductionCost(
      Number(weightGrams), 
      material, 
      Number(data.additionalCost || 0)
    );

    const { components: _, ...dbData } = data;

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    const oldQty = oldProduct?.stockQuantity || 0;
    const newQty = Number(data.stockQuantity || 0);

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...dbData,
          weightGrams: Number(weightGrams),
          sellingPrice: Number(data.sellingPrice),
          productionTime: Number(data.productionTime || 0),
          additionalCost: Number(data.additionalCost || 0),
          stockQuantity: newQty,
          calculatedCost: Number(calculatedCost.toFixed(4)),
          parentId: data.parentId || null,
        },
      });

      // Se o estoque aumentou manualmente, dar baixa no material
      if (newQty > oldQty) {
        const diff = newQty - oldQty;
        await MaterialService.deduct(tx, materialId, Number(weightGrams), diff);
      }

      // Atualizar Composição
      if (Array.isArray(components)) {
        // Limpar anteriores
        await tx.productComposition.deleteMany({ where: { kitId: id } });
        // Adicionar novos
        for (const comp of components) {
          await tx.productComposition.create({
            data: {
              kitId: id,
              componentId: comp.componentId,
              quantity: Number(comp.quantity) || 1
            }
          });
        }
      }

      return product;
    });
  }
}
