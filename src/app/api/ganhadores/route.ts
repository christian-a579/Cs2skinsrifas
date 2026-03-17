import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();

  const ganhadores = await prisma.ganhador.findMany({
    orderBy: { dataPremiacao: "desc" },
    take: 30,
    include: {
      usuario: { select: { nome: true, telefone: true } },
      titulo: { select: { numeroSorte: true } },
      campanha: { select: { nome: true, slug: true } },
    },
  });

  const data = ganhadores.map((g) => ({
    id: g.id,
    nome: g.usuario.nome,
    telefone: g.usuario.telefone,
    premio: g.campanha.nome,
    campanhaSlug: g.campanha.slug,
    numeroSorte: g.titulo.numeroSorte,
    dataPremiacao: g.dataPremiacao.toISOString(),
  }));

  return NextResponse.json(data);
}

