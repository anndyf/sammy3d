import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const materialsCount = await prisma.material.count();
    const productsCount = await prisma.product.count();
    
    // Balance and metrics
    const transactions = await prisma.transaction.findMany();
    
    // Novo Cálculo: Total em Estoque Pronta Entrega
    const products = await prisma.product.findMany();
    const stockQuantityTotal = products.reduce((acc, curr) => acc + curr.stockQuantity, 0);

    // Novo Algoritmo: Peça Mais Vendida (Análise Real de Itens de Pedido)
    const orderItems = await prisma.orderItem.findMany({
      include: { product: true }
    });

    const salesStats: Record<string, number> = {};
    orderItems.forEach(item => {
      const pName = item.product?.name || "Desconhecido";
      salesStats[pName] = (salesStats[pName] || 0) + item.quantity;
    });

    let topSeller = "Nenhuma Venda";
    let maxQty = 0;
    Object.entries(salesStats).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topSeller = name;
      }
    });

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    // Recent Activity (Finance)
    const recentActivity = await prisma.transaction.findMany({
      take: 7,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({
      metrics: {
        materialsTotal: materialsCount,
        productsTotal: productsCount,
        totalStock: stockQuantityTotal,
        topSellingProduct: topSeller,
        // Mantendo originais caso volte a precisar
        balance: balance,
        totalIncome: totalIncome,
        totalExpense: totalExpense
      },
      recentActivity
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar o dashboard' }, { status: 500 });
  }
}
