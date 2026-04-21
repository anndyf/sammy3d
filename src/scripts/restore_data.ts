// @ts-nocheck
import { PrismaClient as PrismaClientPostgres } from '@prisma/client';
import initSqlite from 'better-sqlite3';
import { join } from 'path';

async function restore() {
  const sqlite = initSqlite(join(process.cwd(), 'prisma/dev.db'));
  const postgres = new PrismaClientPostgres();

  console.log('--- Iniciando Restauração de Dados (SQLite -> Postgres) ---');

  try {
    // 1. Restaurar Materiais
    const materials = sqlite.prepare('SELECT * FROM Material').all();
    console.log(`Encontrados ${materials.length} materiais.`);
    for (const m: any of materials) {
      await postgres.material.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          name: m.name,
          type: m.type,
          color: m.color,
          costPerUnit: m.costPerUnit,
          totalAmount: m.totalAmount,
          remainingAmount: m.remainingAmount,
          unitType: m.unitType,
          createdAt: new Date(m.createdAt),
        }
      });
    }

    // 2. Restaurar Produtos
    const products = sqlite.prepare('SELECT * FROM Product').all();
    console.log(`Encontrados ${products.length} produtos.`);
    for (const p: any of products) {
      await postgres.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          productionTime: p.productionTime,
          weightGrams: p.weightGrams,
          additionalCost: p.additionalCost || 0,
          materialId: p.materialId,
          category: p.category || 'Geral',
          subcategory: p.subcategory,
          sku: p.sku,
          shopeeUrl: p.shopeeUrl,
          calculatedCost: p.calculatedCost || 0,
          sellingPrice: p.sellingPrice || 0,
          stockQuantity: p.stockQuantity || 0,
          createdAt: new Date(p.createdAt),
        }
      });
    }

    // 3. Restaurar Orçamentos (Quotes)
    const quotes = sqlite.prepare('SELECT * FROM Quote').all();
    console.log(`Encontrados ${quotes.length} orçamentos.`);
    for (const q: any of quotes) {
      await postgres.quote.upsert({
        where: { id: q.id },
        update: {},
        create: {
          id: q.id,
          clientName: q.clientName,
          clientContact: q.clientContact,
          projectName: q.projectName,
          purpose: q.purpose,
          dimensions: q.dimensions,
          preferredColor: q.preferredColor,
          description: q.description,
          fileUrl: q.fileUrl,
          externalLink: q.externalLink,
          status: q.status,
          createdAt: new Date(q.createdAt),
        }
      });
    }

    // 4. Restaurar Pedidos (Orders)
    const orders = sqlite.prepare('SELECT * FROM "Order"').all();
    console.log(`Encontrados ${orders.length} pedidos.`);
    for (const o: any of orders) {
      await postgres.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          customerName: o.customerName,
          customerContact: o.customerContact,
          status: o.status,
          type: o.type,
          totalAmount: o.totalAmount,
          discountAmount: o.discountAmount || 0,
          notes: o.notes,
          paymentStatus: o.paymentStatus || 'UNPAID',
          createdAt: new Date(o.createdAt),
        }
      });
    }

    // 5. Restaurar Itens de Pedido (OrderItems)
    const orderItems = sqlite.prepare('SELECT * FROM OrderItem').all();
    console.log(`Encontrados ${orderItems.length} itens de pedido.`);
    for (const oi: any of orderItems) {
      await postgres.orderItem.create({
        data: {
          id: oi.id,
          orderId: oi.orderId,
          productId: oi.productId,
          quantity: oi.quantity,
          price: oi.price,
        }
      });
    }

    console.log('--- Restauração Concluída com Sucesso! ---');
  } catch (err) {
    console.error('Erro na restauração:', err);
  } finally {
    await postgres.$disconnect();
  }
}

restore();
