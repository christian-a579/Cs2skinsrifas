import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Garante que a rota /api/campanhas não seja servida por cache.
// O frontend usa polling e precisa refletir novas campanhas imediatamente.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const prisma = getPrisma();
  const campanhas = await prisma.campanha.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const data = campanhas.map((c) => ({
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    valorPremio: c.valorPremio,
    precoTitulo: c.precoTitulo,
    totalTitulos: c.totalTitulos,
    titulosVendidos: c.titulosVendidos,
    status: c.status,
    dataConclusao: c.dataConclusao
      ? new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(c.dataConclusao)
      : undefined,
    imagemUrl: c.imagemUrl ?? undefined,
  }));

  return NextResponse.json(data);
}

