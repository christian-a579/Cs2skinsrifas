import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function normalizeCpf(input: string) {
  return input.replace(/\D/g, "");
}

function isAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const provided = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  const adminCpf = normalizeCpf(process.env.ADMIN_CPF || "");
  return (
    normalizeCpf(provided) !== "" && normalizeCpf(provided) === adminCpf
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  campanhaSlug: string;
  numeroSorte: number; // 0..99
};

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const campanhaSlug = body?.campanhaSlug;
  const numeroSorte = body?.numeroSorte;

  if (!campanhaSlug || typeof campanhaSlug !== "string") {
    return NextResponse.json(
      { error: "campanhaSlug é obrigatório" },
      { status: 400 },
    );
  }

  if (
    typeof numeroSorte !== "number" ||
    !Number.isInteger(numeroSorte) ||
    numeroSorte < 0 ||
    numeroSorte > 99
  ) {
    return NextResponse.json(
      { error: "numeroSorte inválido (use 0..99)" },
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

    const tituloPago = await tx.titulo.findFirst({
      where: {
        campanhaId: campanha.id,
        numeroSorte,
        status: "pago",
      },
      include: {
        usuario: { select: { id: true, nome: true, telefone: true } },
      },
    });

    if (!tituloPago) {
      return {
        ok: false as const,
        status: 404,
        error: "Título pago não encontrado para esse número",
      };
    }

    const ganhador = await tx.ganhador.create({
      data: {
        campanhaId: campanha.id,
        usuarioId: tituloPago.usuarioId,
        tituloId: tituloPago.id,
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
      ganhador: {
        id: ganhador.id,
        nome: ganhador.usuario.nome,
        telefone: ganhador.usuario.telefone,
        premio: ganhador.campanha.nome,
        campanhaSlug: ganhador.campanha.slug,
        numeroSorte: ganhador.titulo.numeroSorte,
        dataPremiacao: ganhador.dataPremiacao.toISOString(),
      },
    };
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.ganhador);
}

