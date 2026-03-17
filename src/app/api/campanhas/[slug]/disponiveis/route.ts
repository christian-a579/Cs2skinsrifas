import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const totalCotas = 100;

async function expirarReservas(prisma: ReturnType<typeof getPrisma>) {
  const now = new Date();
  await prisma.reserva.updateMany({
    where: { status: "reservada", expiresAt: { lt: now } },
    data: { status: "expirada" },
  });
  await prisma.titulo.updateMany({
    where: { status: "reservado", expiresAt: { lt: now } },
    data: { status: "expirado" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const prisma = getPrisma();
  const { slug } = params;

  const campanha = await prisma.campanha.findUnique({ where: { slug } });
  if (!campanha) {
    return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
  }
  if (campanha.status !== "ativa") {
    return NextResponse.json({ disponiveis: 0 });
  }

  const rows = await prisma.$transaction(async (tx) => {
    await expirarReservas(tx as any);
    return tx.$queryRaw<Array<{ n: number }>>`
      SELECT (gs.n)::int AS n
      FROM generate_series(0, ${totalCotas - 1}) AS gs(n)
      LEFT JOIN "Titulo" t
        ON t."campanhaId" = ${campanha.id}
       AND t."numeroSorte" = gs.n
       AND t."status" IN ('reservado','pago')
       AND (t."expiresAt" IS NULL OR t."expiresAt" >= NOW())
      WHERE t."id" IS NULL
    `;
  });

  const disponiveis = rows.length;
  return NextResponse.json({ disponiveis });
}
