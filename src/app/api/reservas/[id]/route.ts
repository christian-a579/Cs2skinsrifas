import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const prisma = getPrisma();
  const { id } = params;

  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: {
      campanha: { select: { id: true, nome: true, precoTitulo: true, slug: true } },
      titulos: { select: { numeroSorte: true, status: true } },
    },
  });

  if (!reserva) {
    return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
  }

  const numeros = reserva.titulos
    .filter((t) => t.status === "pago")
    .map((t) => t.numeroSorte)
    .sort((a, b) => a - b);

  return NextResponse.json({
    id: reserva.id,
    status: reserva.status,
    quantidade: reserva.quantidade,
    total: reserva.total,
    expiresAt: reserva.expiresAt,
    campanha: reserva.campanha,
    numerosPagos: numeros,
    mpPaymentId: reserva.mpPaymentId,
  });
}

