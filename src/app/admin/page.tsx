"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Campanha } from "@/lib/types";
import { Roulette0to99 } from "@/components/Roulette0to99";

type UsuarioLocal = {
  cpf?: string;
};

type GanhadorRow = {
  id: string;
  nome: string;
  telefone: string;
  premio: string;
  campanhaSlug: string;
  numeroSorte: number;
  dataPremiacao: string;
};

type SortResponse = {
  numeroSorte: number;
  ganhador: {
    id: string;
    nome: string;
    telefone: string;
    premio: string;
    campanhaSlug: string;
    dataPremiacao: string;
  };
  campanhaSlug: string;
};

type RouletteState = {
  spinning: boolean;
  targetNumber: number | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"ativas" | "ganhadores">("ativas");

  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [ganhadores, setGanhadores] = useState<GanhadorRow[]>([]);

  const [rouletteByCampanhaId, setRouletteByCampanhaId] = useState<
    Record<string, RouletteState>
  >({});

  const user = useMemo<UsuarioLocal>(() => {
    try {
      if (typeof window === "undefined") return {};
      const storedUser = window.localStorage.getItem("csgorifas:user");
      return storedUser ? (JSON.parse(storedUser) as UsuarioLocal) : {};
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const cpf = user.cpf || "";
        const res = await fetch("/api/admin/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${cpf}` },
          cache: "no-store",
        });
        const data = (await res.json()) as { isAdmin: boolean };
        if (cancelled) return;
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user.cpf]);

  useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      try {
        const cpf = user.cpf || "";

        const [campRes, ganhRes] = await Promise.all([
          fetch("/api/admin/campanhas-ativas", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          }),
          fetch("/api/admin/ganhadores", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          }),
        ]);

        const campData = (await campRes.json()) as any[];
        const ganhData = (await ganhRes.json()) as GanhadorRow[];

        setCampanhas(
          (Array.isArray(campData) ? campData : []).map((c) => ({
            id: String(c.id),
            slug: String(c.slug),
            nome: String(c.nome),
            valorPremio: Number(c.valorPremio),
            precoTitulo: Number(c.precoTitulo),
            totalTitulos: Number(c.totalTitulos),
            titulosVendidos: Number(c.titulosVendidos),
            status: (c.status ?? "ativa") as any,
            imagemUrl: c.imagemUrl ?? undefined,
            dataConclusao: c.dataConclusao ? new Date(c.dataConclusao) : undefined,
          })) as Campanha[],
        );
        setGanhadores(Array.isArray(ganhData) ? ganhData : []);
      } catch {
        // ignore
      }
    };

    load();
  }, [isAdmin, user.cpf]);

  const rootCpf = user.cpf || "";

  async function sortear(campanha: Campanha) {
    if (!isAdmin) return;

    setRouletteByCampanhaId((prev) => ({
      ...prev,
      [campanha.id]: { spinning: true, targetNumber: null },
    }));

    try {
      const res = await fetch("/api/admin/sortear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rootCpf}`,
        },
        body: JSON.stringify({ campanhaSlug: campanha.slug }),
      });

      const data = (await res.json().catch(() => null)) as
        | SortResponse
        | null
        | { error?: string };

      if (!res.ok || !data || "error" in data) {
        alert((data as any)?.error || "Falha ao sortear");
        setRouletteByCampanhaId((prev) => ({
          ...prev,
          [campanha.id]: { spinning: false, targetNumber: null },
        }));
        return;
      }

      const target = (data as SortResponse).numeroSorte;
      setRouletteByCampanhaId((prev) => ({
        ...prev,
        [campanha.id]: { spinning: true, targetNumber: target },
      }));

      // Atualiza lista depois da animacao (evita ver estado antes)
      setTimeout(async () => {
        try {
          const cpf = rootCpf || "";
          const ganhRes = await fetch("/api/admin/ganhadores", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          });
          const ganhData = (await ganhRes.json()) as GanhadorRow[];
          setGanhadores(Array.isArray(ganhData) ? ganhData : []);

          const campRes = await fetch("/api/admin/campanhas-ativas", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          });
          const campData = (await campRes.json()) as any[];
          setCampanhas(
            (Array.isArray(campData) ? campData : []).map((c) => ({
              id: String(c.id),
              slug: String(c.slug),
              nome: String(c.nome),
              valorPremio: Number(c.valorPremio),
              precoTitulo: Number(c.precoTitulo),
              totalTitulos: Number(c.totalTitulos),
              titulosVendidos: Number(c.titulosVendidos),
              status: (c.status ?? "ativa") as any,
              imagemUrl: c.imagemUrl ?? undefined,
              dataConclusao: c.dataConclusao
                ? new Date(c.dataConclusao)
                : undefined,
            })) as Campanha[],
          );
        } catch {
          // ignore
        }
      }, 3600);
    } catch {
      setRouletteByCampanhaId((prev) => ({
        ...prev,
        [campanha.id]: { spinning: false, targetNumber: null },
      }));
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Carregando Admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Admin</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Acoes de sorteio para rifas e visualizacao de ganhadores.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("ativas")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            tab === "ativas"
              ? "bg-accent text-black border-accent"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Rifas ativas
        </button>
        <button
          type="button"
          onClick={() => setTab("ganhadores")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            tab === "ganhadores"
              ? "bg-accent text-black border-accent"
              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Ganhadores
        </button>
      </div>

      {tab === "ativas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campanhas.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              Nenhuma campanha ativa no momento.
            </p>
          ) : (
            campanhas.map((campanha) => {
              const state = rouletteByCampanhaId[campanha.id] ?? {
                spinning: false,
                targetNumber: null,
              };
              return (
                <div
                  key={campanha.id}
                  className="bg-card border border-zinc-800 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Campanha</p>
                      <p className="text-white font-semibold">
                        {campanha.nome}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {campanha.slug}
                      </p>
                      <p className="text-sm text-zinc-300 mt-2">
                        Progresso:{" "}
                        <span className="text-accent font-semibold">
                          {campanha.totalTitulos > 0
                            ? Math.round(
                                (campanha.titulosVendidos /
                                  campanha.totalTitulos) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => sortear(campanha)}
                        disabled={state.spinning}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                          state.spinning
                            ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                            : "bg-accent text-black hover:bg-yellow-500"
                        }`}
                      >
                        {state.spinning ? "Sortear..." : "Sortear"}
                      </button>
                    </div>
                  </div>

                  <Roulette0to99
                    spinning={state.spinning}
                    targetNumber={state.targetNumber}
                    onFinished={() => {
                      // marca que terminou para desabilitar o botao
                      setRouletteByCampanhaId((prev) => ({
                        ...prev,
                        [campanha.id]: {
                          spinning: false,
                          targetNumber: state.targetNumber,
                        },
                      }));
                    }}
                  />

                  {typeof state.targetNumber === "number" && (
                    <p className="text-xs text-zinc-400 mt-3">
                      Resultado:{" "}
                      <span className="text-accent font-semibold">
                        #{state.targetNumber.toString().padStart(2, "0")}
                      </span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "ganhadores" && (
        <div className="space-y-4">
          {ganhadores.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              Nenhum ganhador cadastrado ainda.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ganhadores.map((g) => (
                <div
                  key={g.id}
                  className="bg-card border border-zinc-800 rounded-lg p-4"
                >
                  <p className="text-white font-medium">{g.nome}</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Premio: {g.premio}
                  </p>
                  <p className="text-sm text-accent mt-1">
                    Numero #{g.numeroSorte.toString().padStart(2, "0")}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    {new Date(g.dataPremiacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

