import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
  const prisma = getPrisma();
  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "MERCADOPAGO_ACCESS_TOKEN não configurado" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { valor, descricao, referencia, nome, telefone, reservaId } = body as {
    valor?: number;
    descricao?: string;
    referencia?: string;
    nome?: string;
    telefone?: string;
    reservaId?: string;
  };

  if (!valor || !descricao || !reservaId) {
    return NextResponse.json(
      { error: "Campos obrigatórios: valor, descricao, reservaId" },
      { status: 400 },
    );
  }

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { usuario: true },
  });
  if (!reserva) {
    return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
  }
  if (reserva.status !== "reservada") {
    return NextResponse.json({ error: "Reserva não está mais válida" }, { status: 409 });
  }
  if (reserva.expiresAt.getTime() < Date.now()) {
    await prisma.reserva.update({ where: { id: reservaId }, data: { status: "expirada" } });
    await prisma.titulo.updateMany({
      where: { reservaId, status: "reservado" },
      data: { status: "expirado" },
    });
    return NextResponse.json({ error: "Reserva expirada" }, { status: 410 });
  }

  // Mercado Pago valida formato de e-mail. Domínios .local costumam falhar.
  // Como o cadastro não exige e-mail, geramos um e-mail determinístico a partir do telefone.
  const telefoneDigits =
    typeof telefone === "string"
      ? telefone.replace(/\D/g, "")
      : reserva.usuario.telefone.replace(/\D/g, "");

  const usuarioEmail = reserva.usuario.email?.trim();
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const payerEmail =
    usuarioEmail && basicEmailRegex.test(usuarioEmail)
      ? usuarioEmail
      : telefoneDigits.length > 0
        ? `cliente+${telefoneDigits}@cs2skinsrifas.com.br`
        : `cliente@cs2skinsrifas.com.br`;

  const payload = {
    transaction_amount: Number(valor),
    description: descricao,
    payment_method_id: "pix",
    external_reference: reserva.externalReference || referencia || reservaId,
    payer: {
      email: payerEmail,
      first_name: nome || "Cliente",
    },
  };

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? (data as any).message || (data as any).error || JSON.stringify(data)
        : String(data);

    return NextResponse.json(
      {
        error: "Falha na criação da cobrança Mercado Pago",
        details: message,
      },
      { status: response.status || 502 },
    );
  }

  const transactionData = data?.point_of_interaction?.transaction_data || null;

  // Salva o payment id e status inicial
  await prisma.reserva.update({
    where: { id: reservaId },
    data: {
      mpPaymentId: String(data.id),
    },
  });

  return NextResponse.json({
    id: data.id,
    status: data.status,
    qrCode: transactionData?.qr_code_base64 || null,
    pixCode: transactionData?.qr_code || null,
    data,
  });
}
