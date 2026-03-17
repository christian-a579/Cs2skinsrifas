/*
  Warnings:

  - A unique constraint covering the columns `[campanhaId,numeroSorte]` on the table `Titulo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('reservada', 'paga', 'expirada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusTitulo" AS ENUM ('reservado', 'pago', 'expirado', 'cancelado');

-- AlterTable
ALTER TABLE "Titulo" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "reservaId" TEXT,
ADD COLUMN     "status" "StatusTitulo" NOT NULL DEFAULT 'reservado';

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'reservada',
    "quantidade" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mpPaymentId" TEXT,
    "mpPreferenceId" TEXT,
    "externalReference" TEXT,
    "campanhaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_mpPaymentId_key" ON "Reserva"("mpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_externalReference_key" ON "Reserva"("externalReference");

-- CreateIndex
CREATE INDEX "Reserva_campanhaId_status_expiresAt_idx" ON "Reserva"("campanhaId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "Reserva_usuarioId_createdAt_idx" ON "Reserva"("usuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "Titulo_campanhaId_status_expiresAt_idx" ON "Titulo"("campanhaId", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Titulo_campanhaId_numeroSorte_key" ON "Titulo"("campanhaId", "numeroSorte");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Titulo" ADD CONSTRAINT "Titulo_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;
