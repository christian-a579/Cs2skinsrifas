"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nomeTrim = nome.trim();
    const sobrenomeTrim = sobrenome.trim();
    const cpfLimpo = cpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");
    const emailTrim = email.trim();

    if (!nomeTrim) {
      setErro("Nome é obrigatório.");
      return;
    }

    if (!sobrenomeTrim) {
      setErro("Sobrenome é obrigatório.");
      return;
    }

    if (cpfLimpo.length !== 11) {
      setErro("CPF deve ter 11 dígitos.");
      return;
    }

    if (telefoneLimpo.length !== 11) {
      setErro("Telefone inválido. Use DDD + número (11 dígitos).");
      return;
    }

    if (!emailTrim) {
      setErro("E-mail é obrigatório.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErro("E-mail inválido.");
      return;
    }

    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeTrim,
          sobrenome: sobrenomeTrim,
          cpf: cpfLimpo,
          telefone: telefoneLimpo,
          email: emailTrim,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Erro ao fazer login.");
      }

      const user = await res.json();
      localStorage.setItem("csgorifas:user", JSON.stringify(user));
      window.dispatchEvent(new Event("csgorifas:user:updated"));

      setSucesso(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-card border border-zinc-800 rounded-xl p-6 relative">
      {sucesso && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-accent/60 bg-zinc-900/95 px-6 py-4 shadow-lg shadow-accent/20">
            <span className="text-3xl" aria-hidden>✓</span>
            <p className="text-lg font-semibold text-accent">Cadastro Efetuado</p>
            <p className="text-xs text-zinc-400">Redirecionando...</p>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-white mb-2">Cadastro</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Informe nome, sobrenome, CPF, telefone e e-mail para criar sua conta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm text-zinc-300">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-accent"
              placeholder="Nome"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-zinc-300">Sobrenome</label>
            <input
              type="text"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-accent"
              placeholder="Sobrenome"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-zinc-300">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-zinc-300">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-zinc-300">
            Telefone (WhatsApp)
          </label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            placeholder="(99) 99999-9999"
            required
          />
          <p className="text-xs text-zinc-500">
            Usaremos esse número para identificar sua conta. Um telefone por
            usuário.
          </p>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando || sucesso}
          className="w-full py-2.5 rounded-lg bg-accent text-black font-semibold text-sm hover:bg-yellow-500 transition disabled:opacity-70"
        >
          {carregando ? "Entrando..." : sucesso ? "Cadastro Efetuado!" : "Continuar"}
        </button>
      </form>
    </div>
  );
}
