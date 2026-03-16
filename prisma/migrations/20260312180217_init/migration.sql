-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valorPremio" REAL NOT NULL,
    "precoTitulo" REAL NOT NULL,
    "totalTitulos" INTEGER NOT NULL,
    "titulosVendidos" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "dataConclusao" DATETIME,
    "imagemUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Titulo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroSorte" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campanhaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Titulo_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Titulo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ganhador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataPremiacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campanhaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tituloId" TEXT NOT NULL,
    CONSTRAINT "Ganhador_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "Campanha" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ganhador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ganhador_tituloId_fkey" FOREIGN KEY ("tituloId") REFERENCES "Titulo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Campanha_slug_key" ON "Campanha"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ganhador_campanhaId_key" ON "Ganhador"("campanhaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ganhador_tituloId_key" ON "Ganhador"("tituloId");
