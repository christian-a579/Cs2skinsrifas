import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = params;

  const campanha = await prisma.campanha.findUnique({
    where: { slug },
  });

  if (!campanha) {
    return NextResponse.json({ message: "Campanha não encontrada" }, { status: 404 });
  }

  const data = {
    id: campanha.id,
    slug: campanha.slug,
    nome: campanha.nome,
    valorPremio: campanha.valorPremio,
    precoTitulo: campanha.precoTitulo,
    totalTitulos: campanha.totalTitulos,
    titulosVendidos: campanha.titulosVendidos,
    status: campanha.status,
    dataConclusao: campanha.dataConclusao
      ? new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(campanha.dataConclusao)
      : undefined,
    imagemUrl: campanha.imagemUrl ?? undefined,
  };

  return NextResponse.json(data);
}

