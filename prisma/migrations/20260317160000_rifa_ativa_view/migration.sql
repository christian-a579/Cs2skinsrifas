-- View: RifaAtiva
-- Consolida participantes da campanha ativa (somente títulos pagos)

CREATE OR REPLACE VIEW "RifaAtiva" AS
SELECT
  c."id"   AS "campanhaId",
  c."slug" AS "campanhaSlug",
  c."nome" AS "campanhaNome",
  u."id"   AS "usuarioId",
  u."nome" AS "usuarioNome",
  u."telefone" AS "usuarioTelefone",
  COUNT(t."id")::int AS "quantidadeCotasPagas",
  ARRAY_AGG(t."numeroSorte" ORDER BY t."numeroSorte") AS "numerosCotasPagas"
FROM "Campanha" c
JOIN "Titulo" t
  ON t."campanhaId" = c."id"
JOIN "Usuario" u
  ON u."id" = t."usuarioId"
WHERE c."status" = 'ativa'
  AND t."status" = 'pago'
GROUP BY
  c."id",
  c."slug",
  c."nome",
  u."id",
  u."nome",
  u."telefone";

