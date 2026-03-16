import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.campanha.count();

  if (count > 0) {
    return NextResponse.json({ message: "Já existem campanhas no banco." });
  }

  await prisma.campanha.createMany({
    data: [
      {
        slug: "ak-47-neon-rider-field-tested",
        nome: "AK-47 | Neon Rider (Field-Tested)",
        valorPremio: 382.33,
        precoTitulo: 3.8,
        totalTitulos: 100,
        titulosVendidos: 28,
        status: "ativa",
        imagemUrl: "/img_rifa.png",
      },
      {
        slug: "m4a1-s-neon-red",
        nome: "M4A1-S | Neon Red",
        valorPremio: 420.0,
        precoTitulo: 4.2,
        totalTitulos: 120,
        titulosVendidos: 60,
        status: "em_breve",
        imagemUrl: "/img_rifa.png",
      },
      {
        slug: "ak-47-dragon-fire",
        nome: "AK-47 | Dragon Fire",
        valorPremio: 510.5,
        precoTitulo: 5.1,
        totalTitulos: 90,
        titulosVendidos: 90,
        status: "concluida",
        dataConclusao: new Date("2026-03-11T11:47:00"),
        imagemUrl: "/img_rifa.png",
      },
    ],
  });

  return NextResponse.json({ message: "Seed criada com sucesso." });
}

