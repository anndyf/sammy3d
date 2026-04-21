import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    const [
      materialsCount,
      productsCount,
      products,
      orderItems,
      transactions,
      recentActivity,
      recentOrders,
      orders
    ] = await Promise.all([
      prisma.material.count(),
      prisma.product.count(),
      prisma.product.findMany({ select: { stockQuantity: true } }),
      prisma.orderItem.findMany({ include: { product: { select: { name: true } } } }),
      prisma.transaction.findMany({ select: { type: true, amount: true, date: true } }),
      prisma.transaction.findMany({ take: 5, orderBy: { date: 'desc' } }),
      prisma.order.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }),
      prisma.order.findMany({ select: { totalAmount: true, createdAt: true, type: true } })
    ]);

    const stockQuantityTotal = products.reduce((acc, p) => acc + p.stockQuantity, 0);

    const salesStats: Record<string, number> = {};
    orderItems.forEach((item) => {
      const pName = item.customName || item.product?.name || "Desconhecido";
      salesStats[pName] = (salesStats[pName] || 0) + item.quantity;
    });
    const sortedSales = Object.entries(salesStats).sort(([, a], [, b]) => b - a);
    const topSeller = sortedSales[0]?.[0] || "Nenhuma Venda";

    const totalIncome  = transactions.filter(t => t.type === 'INCOME') .reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
    const balance      = totalIncome - totalExpense;

    // Métricas mensais (simples)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyIncome = transactions
      .filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((a, t) => a + t.amount, 0);

    return NextResponse.json({
      metrics: {
        materialsTotal:    materialsCount,
        productsTotal:     productsCount,
        totalStock:        stockQuantityTotal,
        topSellingProduct: topSeller,
        balance,
        totalIncome,
        totalExpense,
        monthlyIncome,
        ordersTotal: orders.length
      },
      recentActivity,
      recentOrders,
      topProducts: sortedSales.slice(0, 5).map(([name, qty]) => ({ name, qty }))
    });
  } catch (error: any) {
    console.error("Dashboard GET Error:", error);
    return apiError('Erro ao carregar o dashboard.', 500, error.message);
  }
}
