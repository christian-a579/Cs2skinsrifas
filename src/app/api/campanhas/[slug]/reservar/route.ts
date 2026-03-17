import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

interface Params {
  params: { slug: string };
}

function nowPlusMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

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

export async function POST(request: Request, { params }: Params) {
  const prisma = getPrisma();
  const { slug } = params;

  const body = await request.json().catch(() => null);
  const quantidade = body?.quantidade;
  const usuarioId = body?.usuarioId;

  if (!usuarioId || typeof usuarioId !== "string") {
    return NextResponse.json({ error: "usuarioId é obrigatório" }, { status: 400 });
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) {
    return NextResponse.json({ error: "quantidade inválida" }, { status: 400 });
  }

  const campanha = await prisma.campanha.findUnique({ where: { slug } });
  if (!campanha) {
    return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
  }
  if (campanha.status !== "ativa") {
    return NextResponse.json({ error: "Campanha não está ativa" }, { status: 409 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Requisito do usuário: sempre 100 cotas (0..99)
  const totalCotas = 100;

  try {
    const result = await prisma.$transaction(async (tx) => {
      await expirarReservas(tx as any);

      // Busca números disponíveis (0..99) que não estejam pagos nem reservados (não expirados)
      const availableRows = await tx.$queryRaw<Array<{ n: number }>>`
        SELECT (gs.n)::int AS n
        FROM generate_series(0, ${totalCotas - 1}) AS gs(n)
        LEFT JOIN "Titulo" t
          ON t."campanhaId" = ${campanha.id}
         AND t."numeroSorte" = gs.n
         AND t."status" IN ('reservado','pago')
         AND (t."expiresAt" IS NULL OR t."expiresAt" >= NOW())
        WHERE t."id" IS NULL
      `;

      const available = availableRows.map((r) => Number(r.n));
      if (available.length < quantidade) {
        return { ok: false as const, reason: "Sem cotas suficientes" };
      }

      // Seleção aleatória sem pegar sequência (embaralha e pega N)
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      const numeros = available.slice(0, quantidade);

      const expiresAt = nowPlusMinutes(15);
      const total = Number((campanha.precoTitulo * quantidade).toFixed(2));

      const reserva = await tx.reserva.create({
        data: {
          campanhaId: campanha.id,
          usuarioId,
          quantidade,
          total,
          expiresAt,
          // externalReference será usado no Mercado Pago
          externalReference: `${campanha.id}-${usuarioId}-${Date.now()}`,
        },
      });

      await tx.titulo.createMany({
        data: numeros.map((n) => ({
          campanhaId: campanha.id,
          usuarioId,
          numeroSorte: n,
          status: "reservado",
          expiresAt,
          reservaId: reserva.id,
        })),
      });

      return { ok: true as const, reservaId: reserva.id, numeros, expiresAt, total };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("Erro ao reservar cotas", e);
    const msg =
      e instanceof Error && e.message
        ? e.message
        : "Erro ao reservar cotas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

