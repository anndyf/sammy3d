import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    const [
      materialsCount,
      productsCount,
      products,
      transactions,
      orders,
      orcamentosPendentes,
      naFila,
      aEnviar,
      emTransito
    ] = await Promise.all([
      prisma.material.count(),
      prisma.product.count(),
      prisma.product.findMany({ select: { stockQuantity: true } }),
      prisma.transaction.findMany({ select: { type: true, amount: true, date: true, category: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }),
      prisma.quote.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.findMany({
        where: {
          status: {
            in: ['PENDING', 'PRINTING', 'POST_PROCESSING']
          }
        },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }),
      prisma.order.findMany({
        where: { status: 'FINISHED' },
        orderBy: { updatedAt: 'desc' },
        include: { items: { include: { product: true } } }
      }),
      prisma.order.findMany({
        where: { status: 'SHIPPED' },
        orderBy: { updatedAt: 'desc' },
        include: { items: { include: { product: true } } }
      })
    ]);

    // Faturamento Total (Entradas financeiras)
    const faturamentoTotal = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);

    // Custo de Produção (Saídas financeiras)
    const custoProducao = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    // Lucro Líquido
    const lucroLiquido = faturamentoTotal - custoProducao;

    // Lotes Produzidos (Contagem de pedidos Concluídos/Entregues)
    const lotesProduzidos = orders.filter(o => o.status === 'FINISHED' || o.status === 'DELIVERED').length;

    // Métricas adicionais de estoque
    const stockQuantityTotal = products.reduce((acc, p) => acc + p.stockQuantity, 0);

    // Estatísticas de vendas de produtos
    const salesStats: Record<string, { qty: number; value: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const pName = item.customName || item.product?.name || "Desconhecido";
        if (!salesStats[pName]) {
          salesStats[pName] = { qty: 0, value: 0 };
        }
        salesStats[pName].qty += item.quantity;
        salesStats[pName].value += item.quantity * item.price;
      });
    });

    const sortedSales = Object.entries(salesStats)
      .sort(([, a], [, b]) => b.value - a.value)
      .slice(0, 5)
      .map(([name, stat]) => ({ name, qty: stat.qty, value: stat.value }));

    // Evolução mensal de lucro (últimos 6 meses)
    const monthlyStats: Record<string, { income: number; expense: number; profit: number }> = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Inicializa os últimos 6 meses com zero
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().substring(2)}`;
      monthlyStats[key] = { income: 0, expense: 0, profit: 0 };
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().substring(2)}`;
      if (monthlyStats[key]) {
        if (t.type === 'INCOME') {
          monthlyStats[key].income += t.amount;
        } else {
          monthlyStats[key].expense += t.amount;
        }
        monthlyStats[key].profit = monthlyStats[key].income - monthlyStats[key].expense;
      }
    });

    const chartEvolucao = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      profit: data.profit
    }));

    // Custo de produção por categoria
    const categoryStats: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const cat = t.category || "Geral";
        categoryStats[cat] = (categoryStats[cat] || 0) + t.amount;
      });

    const chartCustos = Object.entries(categoryStats).map(([category, amount]) => ({
      category,
      amount
    }));

    return NextResponse.json({
      metrics: {
        faturamentoTotal,
        lucroLiquido,
        custoProducao,
        lotesProduzidos,
        materialsTotal: materialsCount,
        productsTotal: productsCount,
        totalStock: stockQuantityTotal,
        ordersTotal: orders.length
      },
      orcamentosPendentes,
      naFila,
      aEnviar,
      emTransito,
      topProducts: sortedSales,
      chartEvolucao,
      chartCustos
    });
  } catch (error: any) {
    console.error("Dashboard GET Error:", error);
    return apiError('Erro ao carregar o dashboard.', 500, error.message);
  }
}
