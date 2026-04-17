import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (Math.max(1, page) - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip
      }),
      prisma.order.count()
    ]);

    return NextResponse.json({
      data: orders,
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação Manual (Para evitar dependência de Zod e quebra com NaN)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { 
      customerName, customerContact, status, type, totalAmount, 
      discountAmount, deadline, notes, weightGrams, materialId, 
      paymentStatus, items, saleChannel 
    } = body;

    if (!customerName || !totalAmount) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes: customerName, totalAmount' }, { status: 400 });
    }

    const deadlineDate = deadline ? new Date(deadline) : null;

    let finalStatus = status || 'PENDING';
    let allInStock = true;

    // Se for venda de catálogo, checamos estoque primeiro (Read Phase)
    if (type === 'CATALOG' && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ 
          where: { id: item.productId } 
        });
        
        if (!product || product.stockQuantity < Number(item.quantity)) {
          allInStock = false;
        }
      }
      finalStatus = allInStock ? 'PICKING' : 'PENDING';
    } else if (type === 'CUSTOM') {
      finalStatus = 'PENDING';
    }

    // Usando Transações Atômicas ($transaction) para garantir integridade.
    // Se ocorrer erro em qualquer passo, todo o lote é cancelado automaticamente.
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Criar o Pedido
      const order = await tx.order.create({
        data: {
          customerName: String(customerName),
          customerContact: customerContact ? String(customerContact) : null,
          status: finalStatus,
          type: String(type || 'CATALOG'),
          totalAmount: Number(totalAmount) || 0,
          discountAmount: Number(discountAmount) || 0,
          deadline: deadlineDate,
          notes: notes ? String(notes) : null,
          weightGrams: weightGrams ? Number(weightGrams) : null,
          materialId: materialId ? String(materialId) : null,
          paymentStatus: String(paymentStatus || 'UNPAID'),
        }
      });

      // 2. Criar os Itens do Pedido e Baixar Estoque
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          // Criar o OrderItem
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: String(item.productId),
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0
            }
          });

          // Baixar o Estoque se for catálogo
          if (type === 'CATALOG') {
            await tx.product.update({
              where: { id: String(item.productId) },
              data: { stockQuantity: { decrement: Number(item.quantity) || 1 } }
            });
          }
        }
      }

      // 3. Sincronização Financeira: Registrar receita se PAGO
      if (paymentStatus === 'PAID') {
        let netAmount = Number(totalAmount) || 0;
        
        if (saleChannel === 'SHOPEE') {
           netAmount = netAmount * 0.86 - 5;
        } else if (saleChannel === 'ML') {
           netAmount = netAmount * 0.88 - (netAmount < 79 ? 6 : 0);
        }

        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'VENDA_DIRETA',
            amount: Number(netAmount.toFixed(2)),
            description: `[AUTOMAÇÃO] Venda (${saleChannel || 'DIRETA'}): ${customerName} [ID: ${order.id}]`,
            date: new Date()
          }
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, id: result.id, status: result.status }, { status: 201 });
  } catch (error: any) {
    console.error("ORDER POST TRANSACTION FAIL:", error);
    return NextResponse.json({ error: 'Erro ao processar pedido', details: error.message }, { status: 500 });
  }
}
