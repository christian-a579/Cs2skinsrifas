import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
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

  const { valor, descricao, referencia, nome, telefone } = body as {
    valor?: number;
    descricao?: string;
    referencia?: string;
    nome?: string;
    telefone?: string;
  };

  if (!valor || !descricao) {
    return NextResponse.json(
      { error: "Campos obrigatórios: valor, descricao" },
      { status: 400 },
    );
  }

  const payerEmail = telefone
    ? `${telefone.replace(/\D/g, "") || "cliente"}@csgorifas.local`
    : `cliente@csgorifas.local`;

  const payload = {
    transaction_amount: Number(valor),
    description: descricao,
    payment_method_id: "pix",
    external_reference: referencia,
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

  return NextResponse.json({
    id: data.id,
    status: data.status,
    qrCode: transactionData?.qr_code_base64 || null,
    pixCode: transactionData?.qr_code || null,
    data,
  });
}
