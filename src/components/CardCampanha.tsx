import Image from "next/image";
import type { Campanha } from "@/lib/types";

interface CardCampanhaProps {
  campanha: Campanha;
  onParticipar?: () => void;
}

export function CardCampanha({ campanha, onParticipar }: CardCampanhaProps) {
  const percentual = Math.round(
    (campanha.titulosVendidos / campanha.totalTitulos) * 100
  );
  const isConcluida = campanha.status === "concluida";
  const fundo = "/fundo.png"; // layout padrão do card (escudo, etc.)
  const arma = campanha.imagemUrl; // png da arma específica (opcional)
  const scale = campanha.displayScale ?? 1.1;
  // deslocamento vertical padrão mais para cima; pode ser ajustado por campanha
  const offsetY = campanha.displayOffsetY ?? -10;

  return (
    <article className="bg-card border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition flex flex-col group h-full min-h-[320px]">
      <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
        {/* Fundo padrão da rifa */}
        <Image
          src={fundo}
          alt="Fundo da rifa"
          fill
          className="object-cover"
          priority
        />
        {/* PNG da arma por cima do fundo */}
        {arma && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glow por trás da arma */}
            <div className="absolute h-28 w-48 sm:h-32 sm:w-56 rounded-full bg-[radial-gradient(circle,#eab30855,transparent_60%)] blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
            <div
              className="relative h-28 w-48 sm:h-28 sm:w-48 drop-shadow-[0_12px_20px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform flex items-center justify-center"
              style={{ transform: `translateY(${offsetY}px) scale(${scale})` }}
            >
              <Image
                src={arma}
                alt={campanha.nome}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1 min-h-[140px]">
        <h2 className="font-semibold text-sm text-white line-clamp-2" title={campanha.nome}>
          {campanha.nome}
        </h2>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Progresso: {percentual}%</span>
          <span className="text-accent font-semibold">
            R$ {campanha.precoTitulo.toFixed(2)}
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <button
          type="button"
          disabled={isConcluida}
          onClick={isConcluida ? undefined : onParticipar}
          className={`mt-auto block w-full py-2.5 rounded font-medium text-center text-sm transition ${
            isConcluida
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-accent text-black hover:bg-yellow-500"
          }`}
        >
          {isConcluida
            ? `CONCLUÍDO ${campanha.dataConclusao ?? ""}`
            : "Quero participar"}
        </button>
      </div>
    </article>
  );
}
