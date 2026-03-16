const AUTH_URL = process.env.INFOPAGO_AUTH_URL;
const PIX_COB_URL = process.env.INFOPAGO_PIX_COB_URL;
const CLIENT_ID = process.env.INFOPAGO_CLIENT_ID;
const CLIENT_SECRET = process.env.INFOPAGO_CLIENT_SECRET;
const PIX_KEY = process.env.INFOPAGO_PIX_KEY;

async function getAccessToken() {
  if (!AUTH_URL || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Configuração da API Infopago incompleta. Verifique .env.");
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error("Falha ao obter token da Infopago.");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface PixChargeInput {
  valor: number;
  descricao: string;
}

export interface PixChargeResult {
  txid: string;
  copiaECola: string;
  // outros campos podem ser adicionados conforme a documentação da Infopago
}

export async function criarCobrancaPix({
  valor,
  descricao,
}: PixChargeInput): Promise<PixChargeResult> {
  if (!PIX_COB_URL || !PIX_KEY) {
    throw new Error("Configuração da API Infopago incompleta. Verifique .env.");
  }

  const token = await getAccessToken();

  // IMPORTANTE: ajuste o payload abaixo de acordo com o manual oficial da Infopago.
  const body = {
    chave: PIX_KEY,
    valor,
    descricao,
  };

  const res = await fetch(PIX_COB_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Falha ao criar cobrança Pix na Infopago.");
  }

  const data = await res.json();

  return {
    txid: data.txid,
    copiaECola: data.brcode ?? data.copiaECola ?? "",
  };
}

