import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      {
        error: "MERCADOPAGO_ACCESS_TOKEN não configurado",
      },
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
    items: [
      {
        title: descricao,
        quantity: 1,
        unit_price: Number(valor),
      },
    ],
    payer: {
      email: payerEmail,
      first_name: nome || "Cliente",
    },
    external_reference: referencia,
    back_urls: {
      success: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      failure: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      pending: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_types: [{ id: "atm" }],
    },
  };

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Falha ao criar preferência Mercado Pago",
        details: data,
      },
      { status: response.status || 502 },
    );
  }

  return NextResponse.json({
    preferenceId: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
    data,
  });
}
