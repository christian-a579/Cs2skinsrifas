import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

async function fetchPayment(paymentId: string) {
  if (!ACCESS_TOKEN) return null;
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as any;
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  const payload = await request.json().catch(() => null);

  // Mercado Pago pode enviar formatos diferentes; o mais comum é vir "data.id" e "type"
  const paymentId =
    payload?.data?.id ??
    payload?.id ??
    payload?.["data.id"] ??
    payload?.["payment_id"] ??
    null;

  if (!paymentId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const payment = await fetchPayment(String(paymentId));
  if (!payment) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const status = String(payment.status || "");
  const mpPaymentId = String(payment.id || paymentId);

  const reserva = await prisma.reserva.findFirst({
    where: { mpPaymentId },
  });

  if (!reserva) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (status === "approved") {
    await prisma.$transaction(async (tx) => {
      await tx.reserva.update({
        where: { id: reserva.id },
        data: { status: "paga" },
      });
      await tx.titulo.updateMany({
        where: { reservaId: reserva.id },
        data: { status: "pago", expiresAt: null },
      });
      // Atualiza contador (não é a fonte da verdade, mas ajuda no UI)
      const paidCount = await tx.titulo.count({
        where: { campanhaId: reserva.campanhaId, status: "pago" },
      });
      await tx.campanha.update({
        where: { id: reserva.campanhaId },
        data: { titulosVendidos: paidCount },
      });
    });
  } else if (status === "cancelled" || status === "rejected") {
    await prisma.$transaction(async (tx) => {
      await tx.reserva.update({
        where: { id: reserva.id },
        data: { status: "cancelada" },
      });
      await tx.titulo.updateMany({
        where: { reservaId: reserva.id, status: "reservado" },
        data: { status: "cancelado" },
      });
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

