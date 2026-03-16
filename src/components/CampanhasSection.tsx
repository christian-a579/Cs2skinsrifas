"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardCampanha } from "./CardCampanha";
import { SeletorTitulos } from "./SeletorTitulos";
import type { Campanha } from "@/lib/types";

type Filtro = "todas" | "ativa" | "concluida" | "em_breve";

const CAMPANHAS_FIXAS: Campanha[] = [
  {
    id: "1",
    slug: "Usp - Kill Confirmed",
    nome: "USP | Kill Confirmed (Testado em Campo)",
    valorPremio: 382.33,
    precoTitulo: 3.8,
    totalTitulos: 100,
    titulosVendidos: 28,
    status: "ativa",
    imagemUrl: "/usp_kill_confirmed_valve.png",
  },
  {
    id: "2",
    slug: "m9-doppler",
    nome: "Baioneta - M9 | Doppler (StatTrak) (Nova de Fabrica)",
    valorPremio: 420,
    precoTitulo: 4.2,
    totalTitulos: 120,
    titulosVendidos: 60,
    status: "em_breve",
    imagemUrl: "/M9_doppler.png",
  },
  {
    id: "3",
    slug: "ak-47-assimov",
    nome: "AK-47 | Assimov (Nova de Fabrica)",
    valorPremio: 510.5,
    precoTitulo: 5.1,
    totalTitulos: 90,
    titulosVendidos: 90,
    status: "concluida",
    imagemUrl: "/ak_assimov_valve.png",
    dataConclusao: "11/03/2026 às 11:47",
  },
  {
    id: "4",
    slug: "awp-descarga eletrica",
    nome: "AWP | Descarga Elétrica (Nova de Fabrica)",
    valorPremio: 299.9,
    precoTitulo: 2.99,
    totalTitulos: 150,
    titulosVendidos: 45,
    status: "ativa",
    imagemUrl: "/awp_descarga eletrica.png",
  },
  {
    id: "5",
    slug: "karambit-degrade",
    nome: "Karambit | Degrade (Nova de Fabrica)",
    valorPremio: 120.5,
    precoTitulo: 1.8,
    totalTitulos: 80,
    titulosVendidos: 10,
    status: "em_breve",
    imagemUrl: "/karambit_degrade_valve.png",
  },
  {
    id: "6",
    slug: "ak-redline",
    nome: "AK-47 | RedLine (Nova de Fabrica)",
    valorPremio: 150.0,
    precoTitulo: 2.1,
    totalTitulos: 70,
    titulosVendidos: 5,
    status: "ativa",
    imagemUrl: "/akredline_valve.png",
  },
];

export function CampanhasSection() {
  const [filtro, setFiltro] = useState<Filtro>("ativa");
  const [selecionada, setSelecionada] = useState<Campanha | null>(null);
  const router = useRouter();

  const campanhasFiltradas = CAMPANHAS_FIXAS.filter((c) =>
    filtro === "todas" ? true : c.status === filtro,
  );

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

      {campanhasFiltradas.length === 0 && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-xl bg-card border border-zinc-800 shadow-xl">
            <button
              type="button"
              onClick={() => setSelecionada(null)}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white text-xl leading-none"
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
              <SeletorTitulos
                precoTitulo={selecionada.precoTitulo}
                pacotes={[1, 3, 5, 10, 15, 20]}
                textoBotao="Comprar"
                onConfirmar={(quantidade, total) => {
                  if (typeof window === "undefined") return;
                  const storedUser =
                    window.localStorage.getItem("csgorifas:user");
                  if (!storedUser) {
                    router.push("/login");
                    return;
                  }

                  const compra = {
                    campanhaId: selecionada.id,
                    campanhaNome: selecionada.nome,
                    precoTitulo: selecionada.precoTitulo,
                    quantidade,
                    total,
                    criadaEm: new Date().toISOString(),
                  };

                  window.localStorage.setItem(
                    "csgorifas:compra",
                    JSON.stringify(compra),
                  );

                  setSelecionada(null);
                  router.push("/pagamento");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
