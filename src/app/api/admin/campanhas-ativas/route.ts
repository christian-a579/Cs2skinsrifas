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
  const campanhas = await prisma.campanha.findMany({
    where: { status: "ativa" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    campanhas.map((c) => ({
      id: c.id,
      slug: c.slug,
      nome: c.nome,
      valorPremio: c.valorPremio,
      precoTitulo: c.precoTitulo,
      totalTitulos: c.totalTitulos,
      titulosVendidos: c.titulosVendidos,
      status: c.status,
      imagemUrl: c.imagemUrl ?? null,
      dataConclusao: c.dataConclusao ? c.dataConclusao.toISOString() : null,
    })),
  );
}

