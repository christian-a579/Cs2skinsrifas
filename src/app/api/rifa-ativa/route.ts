import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();

  // View no Postgres: "RifaAtiva"
  const rows = await prisma.$queryRaw<
    Array<{
      campanhaId: string;
      campanhaSlug: string;
      campanhaNome: string;
      usuarioId: string;
      usuarioNome: string;
      usuarioTelefone: string;
      quantidadeCotasPagas: number;
      numerosCotasPagas: number[];
    }>
  >`SELECT * FROM "RifaAtiva" ORDER BY "usuarioNome" ASC`;

  return NextResponse.json(rows);
}

