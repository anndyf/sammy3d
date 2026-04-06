import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerContact, status, type, totalAmount, discountAmount, deadline, notes, weightGrams, materialId, paymentStatus, items } = body;

    const id = `ord_${Date.now()}`;
    const now = new Date().toISOString();
    const deadlineDate = deadline ? new Date(deadline).toISOString() : null;

    // LÓGICA DE ESTOQUE INTELIGENTE
    let finalStatus = status || 'PENDING';
    
    // Se for venda de catálogo (tem itens predefinidos)
    if (type === 'CATALOG' && items && items.length > 0) {
      let allInStock = true;
      for (const item of items) {
        const product = await prisma.product.findUnique({ 
          where: { id: item.productId } 
        });
        
        // Se um item não tiver estoque suficiente, o pedido INTEIRO vai para produção
        if (!product || product.stockQuantity < item.quantity) {
          allInStock = false;
        }
        
        // SEMPRE baixamos o estoque da peça pronta (pode ficar negativo indicando que falta produzir)
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: Number(item.quantity) } }
        });
      }
      
      // Se tiver tudo em estoque, já marca como Pronta Entrega automaticamente
      if (allInStock) {
        finalStatus = 'PICKING';
      } else {
        finalStatus = 'PENDING';
      }
    } else if (type === 'CUSTOM') {
       // Projetos especiais sempre entram como PENDING na fila de produção
       finalStatus = 'PENDING';
    }

    // BYPASS PRISMA CACHE: SQL Direto para criação de ordens
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Order" (id, customerName, customerContact, status, type, totalAmount, discountAmount, deadline, notes, weightGrams, materialId, paymentStatus, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, customerName, customerContact || null, finalStatus, type || 'CATALOG', Number(totalAmount), Number(discountAmount || 0), deadlineDate, notes || null, Number(weightGrams) || null, materialId || null, paymentStatus || 'UNPAID', now, now
    );

    // Salva os itens vinculados
    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: id,
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price)
          }
        });
      }
    }

     // SINCRONIZAÇÃO FINANCEIRA: Se pago, gera transação de receita
     if (paymentStatus === 'PAID') {
        const { saleChannel } = body;
        let netAmount = Number(totalAmount);
        
        // Aplica taxas de marketplace se necessário
        if (saleChannel === 'SHOPEE') {
           netAmount = netAmount * 0.86 - 5;
        } else if (saleChannel === 'ML') {
           netAmount = netAmount * 0.88 - (netAmount < 79 ? 6 : 0);
        }

        // Verifica se já não existe (prevenção de duplicidade)
        const existing = await prisma.transaction.findFirst({
          where: { description: { contains: `[ID: ${id}]` } }
        });
 
        if (!existing) {
          await prisma.transaction.create({
            data: {
              type: 'INCOME',
              category: 'VENDA_DIRETA',
              amount: Number(netAmount.toFixed(2)),
              description: `[AUTOMAÇÃO] Venda (${saleChannel || 'DIRETA'}): ${customerName} [ID: ${id}]`,
              date: new Date()
            }
          });
        }
     }

    return NextResponse.json({ success: true, id, status: finalStatus }, { status: 201 });
  } catch (error: any) {
    console.error("ORDER POST SQL FAIL:", error);
    return NextResponse.json({ error: 'Erro ao criar pedido via SQL', details: error.message }, { status: 500 });
  }
}
