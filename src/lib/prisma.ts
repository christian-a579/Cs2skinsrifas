import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  if (global.prisma) return global.prisma;
  const client = new PrismaClient({ log: ["error", "warn"] });
  if (process.env.NODE_ENV !== "production") {
    global.prisma = client;
  }
  return client;
}

// Proxy: só cria o client quando for usado (em runtime). No build da Vercel
// o módulo é carregado mas nenhuma chamada ao banco acontece, evitando erro.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as Record<string, unknown>)[prop as string];
  },
});

