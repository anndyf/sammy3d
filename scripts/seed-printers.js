const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Semeando impressoras iniciais...');

  const printers = [
    {
      name: "HI",
      model: "HI COMBO",
      type: "FDM",
      price: 3800,
      lifespan: 5000,
      powerW: 300,
      depreciation: 0.76,
      status: "OPERATIONAL"
    },
    {
      name: "K1C",
      model: "K1C",
      type: "FDM",
      price: 900,
      lifespan: 5000,
      powerW: 350,
      depreciation: 0.18,
      status: "OPERATIONAL"
    }
  ];

  for (const p of printers) {
    const existing = await prisma.printer.findFirst({
      where: { name: p.name }
    });

    if (!existing) {
      await prisma.printer.create({
        data: p
      });
      console.log(`Impressora ${p.name} cadastrada com sucesso!`);
    } else {
      console.log(`Impressora ${p.name} já existe no banco.`);
    }
  }

  console.log('Semeação concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
