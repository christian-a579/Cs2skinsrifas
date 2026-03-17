"use client";

import { useEffect, useState } from "react";

type GanhadorRow = {
  id: string;
  nome: string;
  premio: string;
  numeroSorte: number;
  dataPremiacao: string;
};

export function GanhadoresSection() {
  const [ganhadores, setGanhadores] = useState<GanhadorRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/ganhadores", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as GanhadorRow[];
        if (!cancelled && Array.isArray(data)) setGanhadores(data);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="ganhadores" className="mb-16">
      <h2 className="text-2xl font-bold text-white mb-2">🎉 Ganhadores</h2>
      <p className="text-zinc-400 mb-6">Últimos ganhadores</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ganhadores.map((g) => (
          <div
            key={g.id}
            className="bg-card border border-zinc-800 rounded-lg p-4"
          >
            <p className="font-medium text-white">{g.nome}</p>
            <p className="text-sm text-zinc-400 mt-1">Prêmio: {g.premio}</p>
            <p className="text-sm text-accent mt-1">Número da sorte {g.numeroSorte}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Data da premiação{" "}
              {new Date(g.dataPremiacao).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
