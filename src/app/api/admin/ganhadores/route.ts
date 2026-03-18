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

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const ganhadores = await prisma.ganhador.findMany({
    orderBy: { dataPremiacao: "desc" },
    take: 50,
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

