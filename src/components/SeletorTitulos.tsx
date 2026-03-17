"use client";

import { useState } from "react";

interface SeletorTitulosProps {
  precoTitulo: number;
  pacotes: number[];
  textoBotao?: string;
  onConfirmar?: (quantidade: number, total: number) => void;
}

export function SeletorTitulos({
  precoTitulo,
  pacotes,
  textoBotao = "Quero participar",
  onConfirmar,
}: SeletorTitulosProps) {
  const MAX_QUANTIDADE = 100;
  const [quantidade, setQuantidade] = useState(1);
  const totalValor = precoTitulo * quantidade;
  const totalFormatado = totalValor.toFixed(2);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pacotes.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() =>
              setQuantidade(() => Math.min(MAX_QUANTIDADE, Math.max(1, num)))
            }
            className={`py-3 px-4 rounded-lg border font-medium transition ${
              quantidade === num
                ? "border-accent bg-accent/10 text-accent"
                : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            + {num}
            {num === 3 && (
              <span className="block text-xs text-zinc-500 mt-0.5">
                Mais popular
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setQuantidade((q) => Math.max(1, Math.min(MAX_QUANTIDADE, q - 1)))
            }
            className="h-10 w-10 rounded-full border border-zinc-700 text-lg text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            −
          </button>
          <div className="min-w-[64px] px-4 py-2 rounded-lg border border-zinc-700 text-center font-semibold text-white bg-zinc-900">
            {quantidade}
          </div>
          <button
            type="button"
            onClick={() =>
              setQuantidade((q) =>
                Math.min(MAX_QUANTIDADE, Math.max(1, q + 1)),
              )
            }
            className="h-10 w-10 rounded-full border border-zinc-700 text-lg text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onConfirmar?.(
              Math.min(MAX_QUANTIDADE, Math.max(1, quantidade)),
              precoTitulo *
                Math.min(MAX_QUANTIDADE, Math.max(1, quantidade)),
            )
          }
          className="flex-1 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-yellow-500 transition text-sm sm:text-base"
        >
          {textoBotao} — R$ {totalFormatado}
        </button>
      </div>
    </div>
  );
}
