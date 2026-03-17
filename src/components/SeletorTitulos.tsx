"use client";

import { useEffect, useState } from "react";

interface SeletorTitulosProps {
  precoTitulo: number;
  pacotes: number[];
  maxQuantidade?: number;
  textoBotao?: string;
  onConfirmar?: (quantidade: number, total: number) => void;
}

export function SeletorTitulos({
  precoTitulo,
  pacotes,
  maxQuantidade: maxProp = 100,
  textoBotao = "Quero participar",
  onConfirmar,
}: SeletorTitulosProps) {
  const max = Math.min(100, Math.max(0, maxProp));
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    setQuantidade((q) => (max === 0 ? 0 : Math.min(max, Math.max(1, q))));
  }, [max]);

  const totalValor = precoTitulo * quantidade;
  const totalFormatado = totalValor.toFixed(2);

  const add = (n: number) =>
    setQuantidade((q) =>
      max === 0 ? 0 : Math.min(max, Math.max(1, q + n)),
    );

  if (max === 0) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-400 text-sm py-4 text-center">
          Nenhuma cota disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pacotes.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => add(num)}
            className="py-3 px-4 rounded-lg border border-zinc-700 font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition"
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
            onClick={() => add(-1)}
            className="h-10 w-10 rounded-full border border-zinc-700 text-lg text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            −
          </button>
          <div className="min-w-[64px] px-4 py-2 rounded-lg border border-zinc-700 text-center font-semibold text-white bg-zinc-900">
            {quantidade}
          </div>
          <button
            type="button"
            onClick={() => add(1)}
            className="h-10 w-10 rounded-full border border-zinc-700 text-lg text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onConfirmar?.(
              Math.min(max, Math.max(1, quantidade)),
              precoTitulo * Math.min(max, Math.max(1, quantidade)),
            )
          }
          className="flex-1 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-yellow-500 transition text-sm sm:text-base"
        >
          {textoBotao} — R$ {totalFormatado}
        </button>
      </div>
      {max < 100 && (
        <p className="text-[11px] text-zinc-500">
          {max} cotas disponíveis
        </p>
      )}
    </div>
  );
}
