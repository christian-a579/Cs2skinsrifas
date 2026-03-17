"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: string;
  nome: string;
  telefone: string;
}

interface Compra {
  campanhaId: string;
  campanhaNome: string;
  precoTitulo: number;
  quantidade: number;
  total: number;
  criadaEm: string;
  reservaId: string;
  expiresAt?: string;
  numerosReservados?: number[];
  numerosPagos?: number[];
}

function mascararTelefone(telefone: string) {
  const digits = telefone.replace(/\D/g, "");
  if (digits.length < 10) return telefone;
  const ddd = digits.slice(0, 2);
  const prefixo = digits.slice(2, 7);
  const sufixo = digits.slice(7);
  return `(${ddd}) ${prefixo[0]}****-${sufixo}`;
}

async function criarPagamentoMercadoPagoPix(compra: Compra, usuario: Usuario) {
  const res = await fetch("/api/mercadopago/pix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      valor: compra.total,
      descricao: `Compra de ${compra.quantidade} título(s) - ${compra.campanhaNome}`,
      referencia: `${compra.campanhaId}-${compra.criadaEm}`,
      nome: usuario.nome,
      telefone: usuario.telefone,
      reservaId: compra.reservaId,
    }),
  });

  const data = (await res.json()) as PixResponse | { error?: string };

  if (!res.ok) {
    const errorText =
      (data as { error?: string }).error ||
      (typeof data === "object" ? JSON.stringify(data) : String(data)) ||
      "Falha ao criar pagamento Pix";
    throw new Error(errorText);
  }

  if (
    !("pixCode" in data) ||
    !data.pixCode ||
    !("qrCode" in data) ||
    !data.qrCode
  ) {
    throw new Error("Retorno do Mercado Pago não contém PIX/QR code");
  }

  return data as PixResponse;
}

interface PixResponse {
  id: number;
  status: string;
  qrCode: string;
  pixCode: string;
}

export default function PagamentoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [compra, setCompra] = useState<Compra | null>(null);
  const [statusReserva, setStatusReserva] = useState<
    "reservada" | "paga" | "expirada" | "cancelada" | null
  >(null);
  const [codigoPix, setCodigoPix] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [mpErro, setMpErro] = useState<string | null>(null);
  const [carregandoMp, setCarregandoMp] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);
  const [restanteSegundos, setRestanteSegundos] = useState(15 * 60);
  const [jaNotificouPagamento, setJaNotificouPagamento] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = window.localStorage.getItem("csgorifas:user");
    const storedCompra = window.localStorage.getItem("csgorifas:compra");

    if (!storedUser || !storedCompra) {
      router.push("/");
      return;
    }

    try {
      const u = JSON.parse(storedUser) as Usuario;
      const c = JSON.parse(storedCompra) as Compra;
      setUsuario(u);
      setCompra(c);
      setStatusReserva("reservada");
      setCodigoPix(
        `0002PIXCSGORIFAS-${btoa(`${c.campanhaId}-${u.telefone}-${c.total}-${c.criadaEm}`).slice(0, 40)}`,
      );

      const loadPix = async () => {
        setCarregandoMp(true);
        setMpErro(null);
        try {
          const pixData = await criarPagamentoMercadoPagoPix(c, u);
          setCodigoPix(pixData.pixCode);
          setQrCodeBase64(pixData.qrCode);
        } catch (err) {
          if (err instanceof Error) {
            setMpErro(err.message);
          } else {
            setMpErro("Erro desconhecido ao gerar Pix");
          }
        } finally {
          setCarregandoMp(false);
        }
      };

      loadPix();

      if (typeof window !== "undefined") {
        const historicoRaw = window.localStorage.getItem("csgorifas:historico");
        const historico: Compra[] = historicoRaw
          ? (JSON.parse(historicoRaw) as Compra[])
          : [];

        const existe = historico.some(
          (h) => h.campanhaId === c.campanhaId && h.criadaEm === c.criadaEm,
        );

        if (!existe) {
          window.localStorage.setItem(
            "csgorifas:historico",
            JSON.stringify([...historico, { ...c, numeros: undefined }]),
          );
        }
      }

      const expiresAtMs = c.expiresAt ? new Date(c.expiresAt).getTime() : 0;
      const remaining = expiresAtMs
        ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
        : 15 * 60;
      setRestanteSegundos(remaining);

      const poll = window.setInterval(async () => {
        try {
          const r = await fetch(`/api/reservas/${c.reservaId}`, { cache: "no-store" });
          const j = await r.json();
          if (!r.ok) return;
          setStatusReserva(j.status);
          if (j.status === "paga") {
            setCompra((prev) => (prev ? { ...prev, numerosPagos: j.numerosPagos } : prev));
          }
        } catch {
          // ignore
        }
      }, 3000);

      const interval = window.setInterval(() => {
        setRestanteSegundos((prev) => {
          if (prev <= 1) {
            window.clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        window.clearInterval(interval);
        window.clearInterval(poll);
        const w = window as any;
        if (w.paymentBrickController) {
          w.paymentBrickController.unmount();
          w.paymentBrickController = undefined;
        }
      };
    } catch {
      router.push("/");
    }
  }, [router]);

  // Notificação visual quando o pagamento for confirmado
  useEffect(() => {
    if (statusReserva === "paga" && !jaNotificouPagamento) {
      setJaNotificouPagamento(true);
      if (typeof window !== "undefined") {
        alert(
          "Pagamento aprovado! Seus bilhetes foram confirmados e já aparecem em 'Meus bilhetes'.",
        );
      }
    }
  }, [statusReserva, jaNotificouPagamento]);

  // Atualiza o histórico local ("Meus bilhetes") com os números pagos
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      statusReserva !== "paga" ||
      !compra ||
      !compra.numerosPagos ||
      compra.numerosPagos.length === 0
    ) {
      return;
    }

    const historicoRaw = window.localStorage.getItem("csgorifas:historico");
    const historico: Compra[] = historicoRaw
      ? (JSON.parse(historicoRaw) as Compra[])
      : [];

    const atualizado = historico.map((h) =>
      // Atualiza pelo `reservaId` quando existir (mais confiável).
      // Fallback para `campanhaId + criadaEm`.
      "reservaId" in h && (h as any).reservaId === compra.reservaId
        ? { ...h, numeros: compra.numerosPagos }
        : h.campanhaId === compra.campanhaId && h.criadaEm === compra.criadaEm
          ? { ...h, numeros: compra.numerosPagos }
        : h,
    );

    window.localStorage.setItem(
      "csgorifas:historico",
      JSON.stringify(atualizado),
    );
    window.dispatchEvent(new Event("csgorifas:historico:updated"));
  }, [statusReserva, compra]);

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoPix);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // ignore
    }
  }

  if (!usuario || !compra) {
    return null;
  }

  const minutos = Math.floor(restanteSegundos / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (restanteSegundos % 60).toString().padStart(2, "0");

  const totalFormatado = compra.total.toFixed(2);
  const precoTituloFormatado = compra.precoTitulo.toFixed(2);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-card border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-2xl animate-spin">
            ⏳
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Aguardando pagamento!
            </p>
            <p className="text-xs text-zinc-400">
              Realize o pagamento para confirmar sua participação.
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 mb-2">
          Você tem{" "}
          <span className="font-semibold text-accent">
            {minutos}:{segundos}
          </span>{" "}
          para pagar.
        </p>

        <ol className="space-y-2 text-xs text-zinc-300 mb-3">
          <li>
            <span className="font-semibold">1.</span> Copie o código PIX abaixo.
          </li>
          <li>
            <span className="font-semibold">2.</span> Abra o app do seu banco e
            escolha a opção PIX, como se fosse fazer uma transferência.
          </li>
          <li>
            <span className="font-semibold">3.</span> Selecione a opção PIX
            copia e cola, cole o código copiado e confirme o pagamento.
          </li>
        </ol>

        {carregandoMp && (
          <p className="text-xs text-blue-300 mb-2">
            Gerando cobrança Mercado Pago...
          </p>
        )}
        {mpErro && <p className="text-xs text-red-300 mb-2">Erro: {mpErro}</p>}

        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-200 truncate"
            value={codigoPix}
            readOnly
          />
          <button
            type="button"
            onClick={copiarCodigo}
            className="px-3 py-2 rounded-lg bg-accent text-black text-xs font-semibold hover:bg-yellow-500 transition"
          >
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMostrarQr(true)}
          className="w-full mt-2 py-2.5 rounded-lg border border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-900 transition"
        >
          Mostrar QR Code
        </button>

        <p className="mt-3 text-[11px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/40 rounded-lg px-3 py-2">
          Este pagamento só pode ser realizado dentro do tempo. Após este
          período, caso o pagamento não seja confirmado, os títulos voltam a
          ficar disponíveis.
        </p>
      </div>

      {mostrarQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-xs rounded-xl bg-card border border-zinc-800 p-5 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setMostrarQr(false)}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white text-xl leading-none"
            >
              ×
            </button>
            <p className="text-sm font-semibold text-white text-center">
              QR Code do pagamento
            </p>
            <div className="h-48 w-48 rounded-xl bg-white flex items-center justify-center text-xs text-zinc-700">
              {qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code Mercado Pago"
                  className="h-44 w-44 object-contain"
                />
              ) : (
                <span>QR CODE</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 text-center px-2">
              {qrCodeBase64
                ? "Escaneie o QR Code acima para pagar com Pix via Mercado Pago."
                : "Aguarde: carregando QR code do Mercado Pago..."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-zinc-800 rounded-xl p-5 space-y-4 text-xs text-zinc-300">
        <div>
          <p className="font-semibold text-white mb-1">
            #{compra.campanhaId} {compra.campanhaNome}
          </p>
          <p className="text-zinc-400">
            {compra.quantidade} títulos — R$ {precoTituloFormatado} cada
          </p>
        </div>

        <div className="border-t border-zinc-800 pt-3 space-y-1">
          <p className="font-semibold text-white text-xs mb-1">
            Detalhes da sua compra
          </p>
          <p>
            <span className="font-medium text-zinc-200">Nome</span>:{" "}
            {usuario.nome || "—"}
          </p>
          <p>
            <span className="font-medium text-zinc-200">Telefone</span>:{" "}
            {mascararTelefone(usuario.telefone)}
          </p>
          <p>
            <span className="font-medium text-zinc-200">Quantidade</span>:{" "}
            {compra.quantidade} título(s)
          </p>
          <p>
            <span className="font-medium text-zinc-200">Valor total</span>: R${" "}
            {totalFormatado}
          </p>
        </div>

        <div className="border-t border-zinc-800 pt-3 space-y-1">
          <p className="font-semibold text-white text-xs mb-1">
            Números da rifa
          </p>
          {compra.numerosPagos && compra.numerosPagos.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {compra.numerosPagos.map((n) => (
                <span
                  key={n}
                  className="px-2 py-1 rounded-md bg-zinc-900 border border-accent/40 text-[11px] text-accent font-semibold"
                >
                  #{n.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          ) : statusReserva === "expirada" ? (
            <p className="text-[11px] text-red-300">
              Reserva expirada. Volte para a campanha e tente novamente.
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Os números da sua rifa serão liberados aqui assim que o pagamento
              for confirmado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
