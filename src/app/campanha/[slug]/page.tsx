import { notFound } from "next/navigation";
import { SeletorTitulos } from "@/components/SeletorTitulos";
import type { Campanha } from "@/lib/types";

const PACOTES = [1, 3, 5, 10, 15, 20];

function telefoneFinal(telefone: string) {
  const digits = telefone.replace(/\D/g, "");
  if (!digits) return "—";
  return `...${digits.slice(-4)}`;
}

async function fetchCampanha(slug: string): Promise<Campanha | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/campanhas/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error("Erro ao buscar campanha", await res.text());
    return null;
  }

  return res.json();
}

export default async function CampanhaPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const campanha = await fetchCampanha(slug);

  if (!campanha) notFound();

  const percentual =
    campanha.totalTitulos > 0
      ? Math.min(
          100,
          Math.floor((campanha.titulosVendidos / campanha.totalTitulos) * 100),
        )
      : 0;
  const isConcluida = campanha.status === "concluida";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">
        #{campanha.id} {campanha.nome}
      </h1>

      <div className="bg-card border border-zinc-800 rounded-lg p-6 mb-6">
        <p className="text-zinc-400 text-sm mb-1">Meus títulos</p>
        <p className="text-3xl font-bold text-accent mb-4">{percentual}%</p>
        <p className="text-zinc-400 mb-2">
          por apenas{" "}
          <span className="text-white font-semibold">
            R$ {campanha.precoTitulo.toFixed(2)}
          </span>
        </p>

        <h2 className="text-lg font-semibold text-white mt-6 mb-2">
          Títulos Premiados
        </h2>
        <p className="text-zinc-400 text-sm mb-2">
          Quanto mais títulos, mais chances de ganhar!!
        </p>
        <p className="text-zinc-400 text-sm mb-4">
          Os números são de 0 a 99, sendo sorteados aleatoriamente. O resultado
          do sorteio é divulgado no WhatsApp, Instagram e aqui no site.
        </p>

        {!isConcluida && (
          <SeletorTitulos
            precoTitulo={campanha.precoTitulo}
            pacotes={PACOTES}
          />
        )}

        {isConcluida && (
          <div className="py-4 text-zinc-500 text-center">
            Campanha encerrada em {campanha.dataConclusao}
            {campanha.ganhador && (
              <div className="mt-3 text-sm text-zinc-400 space-y-1">
                <p>
                  Vencedor:{" "}
                  <span className="text-white font-medium">
                    {campanha.ganhador.nome}
                  </span>
                </p>
                <p>
                  Telefone:{" "}
                  <span className="text-accent font-semibold">
                    {telefoneFinal(campanha.ganhador.telefone)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
        <p className="font-medium text-zinc-300 mb-2">Descrição / Regulamento</p>
        <p>
          PRIMEIRO: {campanha.nome} — VALOR: R$ {campanha.valorPremio.toFixed(2)}
          . A cada R$ 30,00 gastos no site uma entrada (acumulativo) para
          concorrer ao sorteio mensal.
        </p>
      </div>
    </div>
  );
}
