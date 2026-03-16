import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Retorna o cliente Prisma (criado só na primeira chamada, em runtime).
 * Assim o build na Vercel não tenta conectar ao banco.
 */
export function getPrisma(): PrismaClient {
  if (global.prisma) return global.prisma;
  const client = new PrismaClient({ log: ["error", "warn"] });
  if (process.env.NODE_ENV !== "production") {
    global.prisma = client;
  }
  return client;
}
