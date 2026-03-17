import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const prisma = getPrisma();
  const url = new URL(request.url);
  const usuarioId = url.searchParams.get("usuarioId");

  if (!usuarioId) {
    return NextResponse.json(
      { error: "usuarioId é obrigatório" },
      { status: 400 },
    );
  }

  const reservas = await prisma.reserva.findMany({
    where: { usuarioId },
    orderBy: { createdAt: "desc" },
    include: {
      campanha: { select: { id: true, nome: true, precoTitulo: true } },
      titulos: { select: { numeroSorte: true, status: true } },
    },
  });

  const data = reservas.map((r) => {
    const numerosPagos = r.titulos
      .filter((t) => t.status === "pago")
      .map((t) => t.numeroSorte)
      .sort((a, b) => a - b);

    return {
      campanhaId: r.campanha.id,
      campanhaNome: r.campanha.nome,
      precoTitulo: r.campanha.precoTitulo,
      quantidade: r.quantidade,
      total: r.total,
      criadaEm: r.createdAt.toISOString(),
      numeros: numerosPagos.length > 0 ? numerosPagos : undefined,
    };
  });

  return NextResponse.json(data);
}

