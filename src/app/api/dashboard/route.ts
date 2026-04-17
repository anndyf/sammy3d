import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    // Consultas paralelas para máxima performance
    const [
      materialsCount,
      productsCount,
      products,
      orderItems,
      transactions,
      recentActivity,
    ] = await Promise.all([
      prisma.material.count(),
      prisma.product.count(),
      prisma.product.findMany({ select: { stockQuantity: true } }),
      prisma.orderItem.findMany({ include: { product: { select: { name: true } } } }),
      prisma.transaction.findMany({ select: { type: true, amount: true } }),
      prisma.transaction.findMany({ take: 7, orderBy: { date: 'desc' } }),
    ]);

    // Total em estoque
    const stockQuantityTotal = products.reduce((acc, p) => acc + p.stockQuantity, 0);

    // Peça mais vendida
    const salesStats: Record<string, number> = {};
    orderItems.forEach((item) => {
      const pName = item.product?.name || "Desconhecido";
      salesStats[pName] = (salesStats[pName] || 0) + item.quantity;
    });
    const topSeller = Object.entries(salesStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "Nenhuma Venda";

    // Balanço financeiro
    const totalIncome  = transactions.filter(t => t.type === 'INCOME') .reduce((a, t) => a + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
    const balance      = totalIncome - totalExpense;

    return NextResponse.json({
      metrics: {
        materialsTotal:    materialsCount,
        productsTotal:     productsCount,
        totalStock:        stockQuantityTotal,
        topSellingProduct: topSeller,
        balance,
        totalIncome,
        totalExpense,
      },
      recentActivity,
    });
  } catch (error: any) {
    console.error("Dashboard GET Error:", error);
    return apiError('Erro ao carregar o dashboard.', 500, error.message);
  }
}
