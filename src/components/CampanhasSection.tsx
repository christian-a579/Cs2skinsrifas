"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardCampanha } from "./CardCampanha";
import { SeletorTitulos } from "./SeletorTitulos";
import type { Campanha } from "@/lib/types";

type Filtro = "todas" | "ativa" | "concluida" | "em_breve";

const CAMPANHAS_EM_BREVE: Campanha[] = [
  {
    id: "em-breve-1",
    slug: "AWP - Redline",
    nome: "AWP | Redline (Testado em Campo)",
    valorPremio: 420,
    precoTitulo: 4.2,
    totalTitulos: 100,
    titulosVendidos: 0,
    status: "em_breve",
    imagemUrl: "/awp_redline.png",
  },
  {
    id: "em-breve-2",
    slug: "talon-revestimento",
    nome: "Talon | Revestimento Enferrujado (Testado em Campo)",
    valorPremio: 150.0,
    precoTitulo: 2.1,
    totalTitulos: 100,
    titulosVendidos: 0,
    status: "em_breve",
    imagemUrl: "/talon_revestimento.png",
  },
];

export function CampanhasSection() {
  const [filtro, setFiltro] = useState<Filtro>("ativa");
  const [selecionada, setSelecionada] = useState<Campanha | null>(null);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [carregandoCampanhas, setCarregandoCampanhas] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [disponiveis, setDisponiveis] = useState<number>(100);
  const router = useRouter();

  useEffect(() => {
    if (!selecionada || selecionada.status !== "ativa") {
      setDisponiveis(100);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/campanhas/${encodeURIComponent(selecionada.slug)}/disponiveis`,
          { cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { disponiveis?: number };
        if (!cancelled && typeof data?.disponiveis === "number") {
          setDisponiveis(Math.max(0, data.disponiveis));
        }
      } catch {
        if (!cancelled) setDisponiveis(100);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selecionada?.id, selecionada?.slug, selecionada?.status]);

  useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = "csgorifas:campanhas-cache";
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
    let cacheHit = false;

    // Mostra campanhas imediatamente se houver cache no localStorage (sem esperar o fetch).
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            ts?: number;
            campanhas?: Campanha[];
          };
          const ts = typeof parsed?.ts === "number" ? parsed.ts : 0;
          const campanhas = parsed?.campanhas;
          const dentroDoTTL = ts > 0 && Date.now() - ts < CACHE_TTL_MS;
          if (dentroDoTTL && Array.isArray(campanhas) && campanhas.length > 0) {
            if (!cancelled) setCampanhas(campanhas);
            cacheHit = true;
          }
        }
      }
    } catch {
      // ignore cache read errors
    }

    if (cacheHit && !cancelled) {
      setCarregandoCampanhas(false);
    }

    const load = async () => {
      try {
        const res = await fetch(
          `/api/campanhas?_t=${Date.now()}`,
          { cache: "no-store", headers: { Pragma: "no-cache" } },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Campanha[];
        if (!cancelled && Array.isArray(data)) {
          setCampanhas(data);
          // Atualiza cache para render rápido na próxima visita.
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ ts: Date.now(), campanhas: data }),
              );
            }
          } catch {
            // ignore cache write errors
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCarregandoCampanhas(false);
      }
    };
    load();
    const interval = setInterval(load, 10_000); // atualiza a cada 10s
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const campanhasFiltradas = useMemo(() => {
    if (filtro === "em_breve") return CAMPANHAS_EM_BREVE;
    return campanhas.filter((c) =>
      filtro === "todas" ? true : c.status === filtro,
    );
  }, [campanhas, filtro]);

  return (
    <section className="mb-16">
      <div className="text-center mb-6">
        <div className="inline-block rounded-2xl p-[2px] bg-[linear-gradient(90deg,#eab308,#ef4444,#eab308)] shadow-[0_0_18px_rgba(234,179,8,0.65)]">
          <div className="px-8 py-4 rounded-[14px] bg-black/85">
            <h1 className="text-2xl sm:text-3xl font-bold text-accent tracking-wide">
              Campanhas
            </h1>
            <p className="mt-1 text-sm sm:text-base text-zinc-300">
              {filtro === "concluida"
                ? "Concluídas"
                : filtro === "em_breve"
                  ? "Em breve"
                  : "Escolha sua sorte"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          type="button"
          onClick={() => setFiltro("ativa")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filtro === "ativa"
              ? "bg-accent text-black border-accent"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Ativas
        </button>
        <button
          type="button"
          onClick={() => setFiltro("concluida")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filtro === "concluida"
              ? "bg-accent text-black border-accent"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Concluídas
        </button>
        <button
          type="button"
          onClick={() => setFiltro("em_breve")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filtro === "em_breve"
              ? "bg-accent text-black border-accent"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Em breve
        </button>
      </div>

      {carregandoCampanhas && campanhas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-accent/60 border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-400">Carregando campanhas...</p>
        </div>
      )}

      {!carregandoCampanhas && campanhasFiltradas.length === 0 && (
        <p className="text-zinc-400">
          Nenhuma campanha encontrada para esse filtro.
        </p>
      )}

      {campanhasFiltradas.length > 0 && (
        <div className="flex justify-center">
          {campanhasFiltradas.length === 1 && (
            <div className="max-w-sm w-full">
              <CardCampanha
                campanha={campanhasFiltradas[0]}
                onParticipar={() => setSelecionada(campanhasFiltradas[0])}
              />
            </div>
          )}

          {campanhasFiltradas.length === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full justify-items-center">
              {campanhasFiltradas.map((campanha) => (
                <div key={campanha.id} className="w-full max-w-sm h-full">
                  <CardCampanha
                    campanha={campanha}
                    onParticipar={() => setSelecionada(campanha)}
                  />
                </div>
              ))}
            </div>
          )}

          {campanhasFiltradas.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl w-full justify-items-center">
              {campanhasFiltradas.map((campanha) => (
                <div key={campanha.id} className="w-full max-w-sm h-full">
                  <CardCampanha
                    campanha={campanha}
                    onParticipar={() => setSelecionada(campanha)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-xl bg-card border border-zinc-800 shadow-xl my-auto">
            {reservando && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60">
                <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin mb-3" />
                <p className="text-xs text-zinc-300">
                  Reservando suas cotas e preparando o pagamento...
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => (reservando ? null : setSelecionada(null))}
              disabled={reservando}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white text-xl leading-none disabled:opacity-50"
            >
              ×
            </button>
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="text-xs text-zinc-400 mb-1">Rifa selecionada</p>
              <h2 className="text-sm font-semibold text-white">
                {selecionada.nome}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Valor por título:{" "}
                <span className="text-accent font-semibold">
                  R$ {selecionada.precoTitulo.toFixed(2)}
                </span>
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Os números são de 0 a 99, sendo sorteados aleatoriamente. O
                resultado do sorteio é divulgado no WhatsApp, Instagram e aqui no
                site.
              </p>
              <SeletorTitulos
                precoTitulo={selecionada.precoTitulo}
                pacotes={[1, 3, 5, 10, 15, 20]}
                maxQuantidade={disponiveis}
                textoBotao="Comprar"
                onConfirmar={async (quantidade, total) => {
                  if (typeof window === "undefined") return;
                  if (reservando) return;
                  const storedUser =
                    window.localStorage.getItem("csgorifas:user");
                  if (!storedUser) {
                    router.push("/login");
                    return;
                  }

                  const u = JSON.parse(storedUser) as {
                    id: string;
                    nome: string;
                    telefone: string;
                  };
                  const criadaEm = new Date().toISOString();

                  try {
                    setReservando(true);
                    // Reserva as cotas no backend (15 min)
                    const res = await fetch(
                      `/api/campanhas/${selecionada.slug}/reservar`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantidade, usuarioId: u.id }),
                      },
                    );

                    const data = (await res.json().catch(() => null)) as any;
                    if (!res.ok) {
                      const msg = data?.error || "Falha ao reservar cotas";
                      alert(msg);
                      return;
                    }

                    const compra = {
                      campanhaId: selecionada.id,
                      campanhaSlug: selecionada.slug,
                      campanhaNome: selecionada.nome,
                      precoTitulo: selecionada.precoTitulo,
                      quantidade,
                      total: data.total ?? total,
                      criadaEm,
                      reservaId: data.reservaId as string,
                      expiresAt: data.expiresAt as string,
                      numerosReservados: data.numeros as number[],
                    };

                    window.localStorage.setItem(
                      "csgorifas:compra",
                      JSON.stringify(compra),
                    );

                    setSelecionada(null);
                    router.push("/pagamento");
                  } finally {
                    setReservando(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
