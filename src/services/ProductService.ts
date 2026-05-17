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
  static async recalculateKitsContaining(componentId: string) {
    const compositions = await prisma.productComposition.findMany({
      where: { componentId }
    });
    
    for (const comp of compositions) {
      const kitId = comp.kitId;
      const kit = await prisma.product.findUnique({
        where: { id: kitId },
        include: { components: { include: { component: true } } }
      });
      
      if (kit && kit.components) {
        let newCost = 0;
        for (const c of kit.components) {
          const itemCost = c.component?.calculatedCost || 0;
          newCost += itemCost * c.quantity;
        }
        newCost += kit.additionalCost || 0;
        
        await prisma.product.update({
          where: { id: kitId },
          data: { calculatedCost: Number(newCost.toFixed(4)) }
        });
      }
    }
  }

  static async create(data: any) {
    const { materialId, weightGrams, stockQuantity, components } = data;
    
    let calculatedCost = 0;
    const isKit = Array.isArray(components) && components.length > 0;

    if (isKit) {
      const compIds = components.map(c => c.componentId);
      const dbComponents = await prisma.product.findMany({
        where: { id: { in: compIds } }
      });
      for (const comp of components) {
        const matched = dbComponents.find(c => c.id === comp.componentId);
        if (matched) {
          calculatedCost += (matched.calculatedCost || 0) * Number(comp.quantity);
        }
      }
      calculatedCost += Number(data.additionalCost || 0);
    } else {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (!material) throw new Error('Material não encontrado');

      calculatedCost = this.calculateProductionCost(
        Number(weightGrams), 
        material, 
        Number(data.additionalCost || 0)
      );
    }

    const sku = this.generateSKU(data.name, data.category, data.sku);

    // Remover campos que não estão no prisma antes de passar para create
    const { components: _, ...dbData } = data;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...dbData,
          weightGrams: Number(weightGrams || 0),
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
      if (isKit) {
        for (const comp of components) {
          await tx.productComposition.create({
            data: {
              kitId: created.id,
              componentId: comp.componentId,
              quantity: Number(comp.quantity) || 1
            }
          });
        }
      }

      const initialQty = Number(stockQuantity || 0);
      if (initialQty > 0 && !isKit) {
        await MaterialService.deduct(tx, materialId, Number(weightGrams), initialQty);
      }

      return created;
    });

    // Recalcular kits que possam conter este item
    await this.recalculateKitsContaining(product.id);

    return product;
  }

  static async update(id: string, data: any) {
    const { materialId, weightGrams, components } = data;
    
    let calculatedCost = 0;
    const isKit = Array.isArray(components) && components.length > 0;

    if (isKit) {
      const compIds = components.map(c => c.componentId);
      const dbComponents = await prisma.product.findMany({
        where: { id: { in: compIds } }
      });
      for (const comp of components) {
        const matched = dbComponents.find(c => c.id === comp.componentId);
        if (matched) {
          calculatedCost += (matched.calculatedCost || 0) * Number(comp.quantity);
        }
      }
      calculatedCost += Number(data.additionalCost || 0);
    } else {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (!material) throw new Error('Material não encontrado');

      calculatedCost = this.calculateProductionCost(
        Number(weightGrams), 
        material, 
        Number(data.additionalCost || 0)
      );
    }

    const { components: _, ...dbData } = data;

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    const oldQty = oldProduct?.stockQuantity || 0;
    const newQty = Number(data.stockQuantity || 0);

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...dbData,
          weightGrams: Number(weightGrams || 0),
          sellingPrice: Number(data.sellingPrice),
          productionTime: Number(data.productionTime || 0),
          additionalCost: Number(data.additionalCost || 0),
          stockQuantity: newQty,
          calculatedCost: Number(calculatedCost.toFixed(4)),
          parentId: data.parentId || null,
        },
      });

      // Se o estoque aumentou manualmente, dar baixa no material
      if (newQty > oldQty && !isKit) {
        const diff = newQty - oldQty;
        await MaterialService.deduct(tx, materialId, Number(weightGrams), diff);
      }

      // Atualizar Composição
      if (isKit) {
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

      return updated;
    });

    // Recalcular kits que possam conter este item
    await this.recalculateKitsContaining(product.id);

    return product;
  }
}
