const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpeza do banco de dados...');
  
  // Deleta os registros na ordem inversa das chaves estrangeiras para evitar erros de constraint
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`Deletados ${deletedOrderItems.count} itens de pedidos.`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deletados ${deletedOrders.count} pedidos.`);

  const deletedCompositions = await prisma.productComposition.deleteMany({});
  console.log(`Deletadas ${deletedCompositions.count} composições de kits.`);

  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`Deletados ${deletedProducts.count} produtos.`);

  const deletedMaterials = await prisma.material.deleteMany({});
  console.log(`Deletados ${deletedMaterials.count} materiais.`);

  const deletedQuotes = await prisma.quote.deleteMany({});
  console.log(`Deletados ${deletedQuotes.count} orçamentos.`);

  const deletedTransactions = await prisma.transaction.deleteMany({});
  console.log(`Deletadas ${deletedTransactions.count} transações financeiras.`);

  console.log('Banco de dados limpo com sucesso! (Configurações do sistema preservadas)');
}

main()
  .catch((e) => {
    console.error('Erro ao limpar banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
