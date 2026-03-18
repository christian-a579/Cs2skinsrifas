import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const prisma = getPrisma();
  const { slug } = params;

  const campanha = await prisma.campanha.findUnique({
    where: { slug },
    include: {
      ganhador: {
        include: {
          usuario: { select: { nome: true, telefone: true } },
          titulo: { select: { numeroSorte: true } },
        },
      },
    },
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
    ganhador:
      campanha.status === "concluida" && campanha.ganhador
        ? {
            nome: campanha.ganhador.usuario.nome,
            telefone: campanha.ganhador.usuario.telefone,
            numeroSorte: campanha.ganhador.titulo.numeroSorte,
          }
        : undefined,
  };

  return NextResponse.json(data);
}

