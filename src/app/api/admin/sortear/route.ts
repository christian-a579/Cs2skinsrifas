import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function normalizeCpf(input: string) {
  return input.replace(/\D/g, "");
}

function isAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const auth = authorization || "";
  const provided = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const adminCpf = normalizeCpf(process.env.ADMIN_CPF || "");
  return normalizeCpf(provided) !== "" && normalizeCpf(provided) === adminCpf;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = { campanhaSlug: string };

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const campanhaSlug = body?.campanhaSlug;

  if (!campanhaSlug || typeof campanhaSlug !== "string") {
    return NextResponse.json(
      { error: "campanhaSlug é obrigatório" },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    const campanha = await tx.campanha.findUnique({
      where: { slug: campanhaSlug },
    });

    if (!campanha) {
      return {
        ok: false as const,
        status: 404,
        error: "Campanha não encontrada",
      };
    }

    if (campanha.status !== "ativa") {
      return {
        ok: false as const,
        status: 409,
        error: "Campanha não está ativa",
      };
    }

    // Evita duplicar ganhador caso seja chamado duas vezes
    const existing = await tx.ganhador.findUnique({
      where: { campanhaId: campanha.id },
    });
    if (existing) {
      return {
        ok: false as const,
        status: 409,
        error: "Campanha já possui ganhador registrado",
      };
    }

    const titulosPagos = await tx.titulo.findMany({
      where: { campanhaId: campanha.id, status: "pago" },
      select: { id: true, numeroSorte: true, usuarioId: true },
    });

    if (titulosPagos.length === 0) {
      return {
        ok: false as const,
        status: 409,
        error: "Não há títulos pagos disponíveis para sortear",
      };
    }

    const chosen = titulosPagos[Math.floor(Math.random() * titulosPagos.length)];

    const ganhador = await tx.ganhador.create({
      data: {
        campanhaId: campanha.id,
        usuarioId: chosen.usuarioId,
        tituloId: chosen.id,
        dataPremiacao: new Date(),
      },
      include: {
        usuario: { select: { nome: true, telefone: true } },
        titulo: { select: { numeroSorte: true } },
        campanha: { select: { nome: true, slug: true } },
      },
    });

    await tx.campanha.update({
      where: { id: campanha.id },
      data: {
        status: "concluida",
        dataConclusao: new Date(),
      },
    });

    return {
      ok: true as const,
      numeroSorte: ganhador.titulo.numeroSorte,
      ganhador: {
        id: ganhador.id,
        nome: ganhador.usuario.nome,
        telefone: ganhador.usuario.telefone,
        premio: ganhador.campanha.nome,
        campanhaSlug: ganhador.campanha.slug,
        dataPremiacao: ganhador.dataPremiacao.toISOString(),
      },
      campanhaSlug: campanha.slug,
    };
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    numeroSorte: result.numeroSorte,
    ganhador: result.ganhador,
    campanhaSlug: result.campanhaSlug,
  });
}

