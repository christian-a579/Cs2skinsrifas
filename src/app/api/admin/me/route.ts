import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function normalizeCpf(input: string) {
  return input.replace(/\D/g, "");
}

function getProvidedCpf(authorization: string) {
  const auth = authorization || "";
  const provided = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  return normalizeCpf(provided);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  // Observacao: utilizamos authorization Bearer <cpf> para identificar o usuario root no admin.
  const provided = getProvidedCpf(request.headers.get("authorization") || "");
  const adminCpf = normalizeCpf(process.env.ADMIN_CPF || "");

  // Se nao configurado, bloqueia admin.
  if (!adminCpf || !provided) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({ isAdmin: provided === adminCpf });
}

