import { ganhadoresMock } from "@/lib/mockData";

export function GanhadoresSection() {
  return (
    <section id="ganhadores" className="mb-16">
      <h2 className="text-2xl font-bold text-white mb-2">🎉 Ganhadores</h2>
      <p className="text-zinc-400 mb-6">Últimos ganhadores</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ganhadoresMock.map((g) => (
          <div
            key={g.id}
            className="bg-card border border-zinc-800 rounded-lg p-4"
          >
            <p className="font-medium text-white">{g.nome}</p>
            <p className="text-sm text-zinc-400 mt-1">Prêmio: #{g.premio}</p>
            <p className="text-sm text-accent mt-1">Número da sorte {g.numeroSorte}</p>
            <p className="text-xs text-zinc-500 mt-2">Data da premiação {g.dataPremiacao}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
