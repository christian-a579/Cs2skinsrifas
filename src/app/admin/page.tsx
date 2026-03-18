"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Campanha } from "@/lib/types";

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

export default function AdminPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"ativas" | "ganhadores">("ativas");

  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [ganhadores, setGanhadores] = useState<GanhadorRow[]>([]);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerModalInfo, setWinnerModalInfo] = useState<{
    nome: string;
    telefone: string;
    numeroSorte: number;
  } | null>(null);

  const [manualNumeroByCampanhaId, setManualNumeroByCampanhaId] = useState<
    Record<string, string>
  >({});
  const [registrandoByCampanhaId, setRegistrandoByCampanhaId] = useState<
    Record<string, boolean>
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

  async function registrarGanhador(campanha: Campanha, numeroSorte: number) {
    if (!isAdmin) return;

    setWinnerModalOpen(false);
    setWinnerModalInfo(null);
    setRegistrandoByCampanhaId((prev) => ({ ...prev, [campanha.id]: true }));

    try {
      const res = await fetch("/api/admin/registrar-ganhador", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rootCpf}`,
        },
        body: JSON.stringify({ campanhaSlug: campanha.slug, numeroSorte }),
      });

      const data = (await res.json().catch(() => null)) as
        | { nome: string; telefone: string; numeroSorte: number }
        | null
        | { error?: string };

      if (!res.ok || !data || "error" in data) {
        alert((data as any)?.error || "Falha ao registrar ganhador");
        return;
      }

      setWinnerModalInfo({
        nome: (data as any).nome || "",
        telefone: (data as any).telefone || "",
        numeroSorte: (data as any).numeroSorte,
      });
      setWinnerModalOpen(true);
    } catch {
      alert("Erro ao registrar ganhador");
    } finally {
      setRegistrandoByCampanhaId((prev) => ({ ...prev, [campanha.id]: false }));
      // Atualiza listas
      try {
        const cpf = rootCpf || "";
        const [ganhRes, campRes] = await Promise.all([
          fetch("/api/admin/ganhadores", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          }),
          fetch("/api/admin/campanhas-ativas", {
            method: "GET",
            headers: { Authorization: `Bearer ${cpf}` },
            cache: "no-store",
          }),
        ]);
        const ganhData = (await ganhRes.json()) as GanhadorRow[];
        const campData = (await campRes.json()) as any[];

        setGanhadores(Array.isArray(ganhData) ? ganhData : []);
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
      } catch {
        // ignore
      }
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

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          step={1}
                          inputMode="numeric"
                          placeholder="Ex.: 86"
                          value={
                            manualNumeroByCampanhaId[campanha.id] ?? ""
                          }
                          onChange={(e) =>
                            setManualNumeroByCampanhaId((prev) => ({
                              ...prev,
                              [campanha.id]: e.target.value,
                            }))
                          }
                          className="w-24 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 px-2 py-1 text-sm outline-none focus:border-accent"
                          aria-label={`Numero sorteado da rifa ${campanha.slug}`}
                        />
                        <button
                          type="button"
                          disabled={Boolean(
                            registrandoByCampanhaId[campanha.id],
                          )}
                          onClick={() => {
                            const raw =
                              manualNumeroByCampanhaId[campanha.id];
                            const n = Number(raw);
                            if (
                              raw === undefined ||
                              raw === "" ||
                              !Number.isInteger(n) ||
                              n < 0 ||
                              n > 99
                            ) {
                              alert("Informe um numero inteiro entre 0 e 99.");
                              return;
                            }
                            registrarGanhador(campanha, n);
                          }}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            registrandoByCampanhaId[campanha.id]
                              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                              : "bg-accent text-black hover:bg-yellow-500"
                          }`}
                        >
                          Registrar
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Digite o numero 0..99 (que esteja com titulo <span className="text-accent">pago</span>).
                      </p>
                    </div>
                  </div>
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

      {winnerModalOpen && winnerModalInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-card border border-zinc-800 shadow-xl p-6">
            <button
              type="button"
              onClick={() => {
                setWinnerModalOpen(false);
                setWinnerModalInfo(null);
              }}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white text-xl leading-none"
              aria-label="Fechar modal do ganhador"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-white mb-2">
              Ganhos!
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              O ganhador foi sorteado com sucesso.
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
              <p className="text-zinc-400 text-xs">Ganhador</p>
              <p className="text-white font-semibold">{winnerModalInfo.nome}</p>

              <p className="text-zinc-400 text-xs mt-3">Telefone</p>
              <p className="text-white">{winnerModalInfo.telefone}</p>

              <p className="text-zinc-400 text-xs mt-3">Número sorteado</p>
              <p className="text-accent font-semibold">
                #{winnerModalInfo.numeroSorte.toString().padStart(2, "0")}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setWinnerModalOpen(false);
                  setWinnerModalInfo(null);
                }}
                className="px-4 py-2 rounded-lg bg-accent text-black font-semibold hover:bg-yellow-500 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

