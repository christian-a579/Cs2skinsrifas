"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  spinning: boolean;
  targetNumber: number | null;
  onFinished?: (targetNumber: number) => void;
  durationMs?: number;
  size?: number; // px (quadrado)
};

function mod360(n: number) {
  return ((n % 360) + 360) % 360;
}

export function Roulette0to99({
  spinning,
  targetNumber,
  onFinished,
  durationMs = 3200,
  size = 220,
}: Props) {
  const numbers = useMemo(() => Array.from({ length: 100 }, (_, i) => i), []);
  const angle = 360 / 100; // 3.6
  const radius = Math.floor(size * 0.38);

  const [rotationDeg, setRotationDeg] = useState(0);
  const [transitionOn, setTransitionOn] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!spinning) return;
    if (typeof targetNumber !== "number") return;

    // Mantem "parado" no alvo: calcula delta modulo 360 em relacao a rotacao atual.
    setTransitionOn(false);
    setRotationDeg((prev) => {
      const currentMod = mod360(prev);
      const targetMod = mod360((-targetNumber * angle) as number);
      const deltaMod = mod360(targetMod - currentMod);
      const extraTurns = 4; // quantidade de voltas para ficar visual

      return prev + extraTurns * 360 + deltaMod;
    });

    // Forca transition depois do setRotationDeg para garantir animacao.
    requestAnimationFrame(() => setTransitionOn(true));

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setTransitionOn(false);
      if (typeof targetNumber === "number") onFinished?.(targetNumber);
    }, durationMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [spinning, targetNumber, durationMs, angle, onFinished]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{ width: size, height: size }}
        className="relative select-none"
      >
        {/* Ponteiro */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "14px solid #eab308",
            filter: "drop-shadow(0 0 8px rgba(234,179,8,0.6))",
          }}
        />

        {/* Disco */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "9999px",
            background: "rgba(24,24,27,0.9)",
            border: "1px solid rgba(234,179,8,0.35)",
            boxShadow: "0 0 20px rgba(234,179,8,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              display: "block",
              transform: `rotate(${rotationDeg}deg)`,
              transition: transitionOn
                ? `transform ${durationMs}ms cubic-bezier(0.1, 0.8, 0.2, 1)`
                : "none",
              willChange: "transform",
            }}
          >
            {numbers.map((n) => {
              const rot = n * angle;
              return (
                <span
                  key={n}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${rot}deg) translateY(-${radius}px) rotate(-${rot}deg)`,
                    transformOrigin: "center",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    width: 22,
                    textAlign: "center",
                  }}
                >
                  {n.toString().padStart(2, "0")}
                </span>
              );
            })}
          </div>

          {/* miolo */}
          <div
            style={{
              position: "absolute",
              inset: size * 0.43,
              borderRadius: "9999px",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(234,179,8,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#eab308",
              fontWeight: 800,
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            {typeof targetNumber === "number" ? targetNumber : "—"}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400">
        {spinning ? "Girando..." : targetNumber !== null ? "Sorteado" : "Pronto"}
      </p>
    </div>
  );
}

