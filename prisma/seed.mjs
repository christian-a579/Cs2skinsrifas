import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Campanha usada pelo front-end (slug e id precisam bater com `CAMPANHAS_FIXAS`)
  const campanha = {
    id: "1",
    slug: "Usp - Kill Confirmed",
    nome: "USP | Kill Confirmed (Testado em Campo)",
    valorPremio: 382.33,
    precoTitulo: 3.8,
    totalTitulos: 100,
    status: "ativa",
    imagemUrl: "/usp_kill_confirmed_valve.png",
  };

  await prisma.campanha.upsert({
    where: { slug: campanha.slug },
    create: campanha,
    update: {
      nome: campanha.nome,
      valorPremio: campanha.valorPremio,
      precoTitulo: campanha.precoTitulo,
      totalTitulos: campanha.totalTitulos,
      status: campanha.status,
      imagemUrl: campanha.imagemUrl,
    },
  });

  // Mantém titulosVendidos como derivado do banco; não setamos manualmente aqui.
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed concluído: campanha criada/atualizada.");
  })
  .catch(async (e) => {
    console.error("Seed falhou:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

