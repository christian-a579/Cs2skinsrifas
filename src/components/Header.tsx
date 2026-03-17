"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UsuarioHeader {
  id: string;
  nome: string;
  sobrenome?: string;
  cpf?: string;
  telefone: string;
}

interface Participacao {
  campanhaId: string;
  campanhaNome: string;
  precoTitulo: number;
  quantidade: number;
  total: number;
  criadaEm: string;
  numeros?: number[];
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioHeader | null>(null);
  const [historico, setHistorico] = useState<Participacao[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadUsuario = useCallback(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("csgorifas:user");
    if (!stored) {
      setUsuario(null);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UsuarioHeader;
      if (parsed && parsed.id && parsed.telefone) {
        setUsuario(parsed);
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    }
  }, []);

  const loadHistorico = useCallback(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("csgorifas:historico");
    if (!stored) {
      setHistorico([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Participacao[];
      setHistorico(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistorico([]);
    }
  }, []);

  useEffect(() => {
    loadUsuario();
  }, [pathname, loadUsuario]);

  useEffect(() => {
    if (usuario) {
      loadHistorico();
    }
  }, [usuario, loadHistorico]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key === "csgorifas:user") {
        loadUsuario();
      }
    };

    const onUpdate = () => loadUsuario();

    window.addEventListener("storage", onStorage);
    window.addEventListener("csgorifas:user:updated", onUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("csgorifas:user:updated", onUpdate);
    };
  }, [loadUsuario]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("csgorifas:user");
      window.dispatchEvent(new Event("csgorifas:user:updated"));
    }
    setUsuario(null);
    router.push("/");
  }

  return (
    <header className="border-b border-zinc-800 bg-dark/95 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-accent/80 shadow-md shadow-accent/40">
            <Image
              src="/img_rifa.png"
              alt="CSGO Rifas"
              fill
              className="object-cover"
              priority
            />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-3 text-sm sm:text-base">
            <Link
              href="/"
              className="text-zinc-300 hover:text-white transition py-1.5 px-3 rounded-full border border-transparent min-h-[34px] box-border inline-flex items-center"
            >
              Campanhas
            </Link>
            <Link
              href="/#ganhadores"
              className="text-zinc-300 hover:text-white transition py-1.5 px-3 rounded-full border border-transparent min-h-[34px] box-border inline-flex items-center"
            >
              Ganhadores
            </Link>
          </nav>

          {mobileMenuOpen ? (
            <div className="sm:hidden absolute left-0 right-0 top-full z-40 mt-1 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg transition-all duration-300 ease-out transform opacity-100 translate-y-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-200 font-medium">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  Fechar
                </button>
              </div>
              <Link
                href="/"
                className="block text-zinc-300 py-2 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Campanhas
              </Link>
              <Link
                href="/#ganhadores"
                className="block text-zinc-300 py-2 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ganhadores
              </Link>
            </div>
          ) : (
            <div className="flex sm:hidden items-center gap-2">
              {usuario ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMostrarHistorico(true)}
                    className="px-2 py-1 rounded-md border border-accent/80 text-accent text-xs font-medium hover:bg-accent hover:text-black transition"
                  >
                    Meus bilhetes
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2 py-1 rounded-md border border-red-500 text-red-300 text-xs font-medium hover:bg-red-500/30 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 py-1 rounded-md border border-accent/80 text-accent text-xs font-medium hover:bg-accent hover:text-black transition"
                  >
                    Cadastro
                  </Link>
                  <Link
                    href="/entrar"
                    className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-white transition"
                  >
                    Login
                  </Link>
                </>
              )}

              <button
                type="button"
                className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium min-h-[28px] inline-flex items-center justify-center"
                aria-label="Abrir menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                ☰
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3">
            {usuario ? (
              <>
                <button
                  type="button"
                  onClick={() => setMostrarHistorico(true)}
                  className="px-3 py-1.5 rounded-full border border-accent/80 text-accent text-sm font-medium hover:bg-accent hover:text-black transition min-h-[34px] box-border"
                >
                  Meus bilhetes
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group relative text-sm rounded-full border border-accent/60 bg-zinc-900/80 px-4 py-1.5 min-h-[34px] box-border inline-flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.6)] hover:border-red-500/80 hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-zinc-200 whitespace-nowrap group-hover:opacity-0 transition-opacity">
                    Olá, {usuario.nome || `Usuário ${usuario.telefone.slice(-4)}`}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-red-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-full border border-accent/80 text-accent text-sm font-medium hover:bg-accent hover:text-black transition min-h-[34px] box-border inline-flex items-center"
                >
                  Cadastro
                </Link>
                <Link
                  href="/entrar"
                  className="px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 hover:text-white transition min-h-[34px] box-border inline-flex items-center"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div
          className={`sm:hidden absolute left-0 right-0 top-full mt-1 z-40 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg transition-all duration-300 ease-out transform ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-200 font-medium">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              Fechar
            </button>
          </div>
          <Link
            href="/"
            className="block text-zinc-300 py-2 hover:text-white transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Campanhas
          </Link>
          <Link
            href="/#ganhadores"
            className="block text-zinc-300 py-2 hover:text-white transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ganhadores
          </Link>
        </div>
      </div>

      {mostrarHistorico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-card border border-zinc-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h3 className="text-xl font-semibold text-white">
                Meus participações
              </h3>
              <button
                type="button"
                onClick={() => setMostrarHistorico(false)}
                className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
              >
                Fechar
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[calc(90vh-96px)]">
              {historico.length === 0 ? (
                <p className="text-zinc-400 text-sm">
                  Nenhuma participação registrada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {historico
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={`${item.campanhaId}-${item.criadaEm}-${index}`}
                        className="border border-zinc-800 rounded-lg p-3 bg-zinc-950"
                      >
                        <p className="text-sm font-semibold text-white">
                          {item.campanhaNome}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Data: {new Date(item.criadaEm).toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Qtd: {item.quantidade} | Total: R${" "}
                          {item.total.toFixed(2)}
                        </p>
                        {item.numeros && item.numeros.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.numeros.map((n) => (
                              <span
                                key={n}
                                className="text-[11px] px-2 py-1 rounded bg-accent text-black"
                              >
                                #{n.toString().padStart(2, "0")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Números serão mostrados após confirmação.
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
