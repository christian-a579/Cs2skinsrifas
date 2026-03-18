# CSGO Rifas – Site de Rifas de Skins CS2

Site inspirado no cs2pro.com.br: rifas/sorteios de skins de Counter-Strike 2.

## O que já existe (atual)

- Next.js (App Router) + Tailwind
- PostgreSQL (Neon) + Prisma
- Reservas de cotas com expiração (15 minutos)
- Integração Mercado Pago (PIX) + webhook para confirmar o pagamento
- UI de campanhas (cards) e compra de títulos

Observacao: as cotas sao tratadas como numeros de 0 a 99. Ao comprar `quantidade = 4`, o sistema reserva 4 numeros variados dentro de [0..99] que estejam disponiveis.

## Requisitos

- Node.js 18+ (recomendado Node 20)
- Um banco PostgreSQL (Neon)
- Credenciais Mercado Pago:
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` (para frontend, se for usado)

## Variaveis de ambiente

Edite o arquivo `.env` na raiz do projeto com pelo menos:

```env
# Neon / Postgres
DATABASE_URL="postgresql://..."

# URL base usada em callbacks/back_urls do Mercado Pago
NEXT_PUBLIC_BASE_URL="https://www.cs2skinsrifas.com.br"

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."

# Links dos cards (aparecem apenas na home)
NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL="https://chat.whatsapp.com/..."
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/seu_perfil"
```

## Como rodar localmente (dev)

1. Instale dependencias:

```bash
npm install
```

2. Aponte `DATABASE_URL` no `.env` (Neon).

3. Rode as migrations (gera as tabelas e o historico):

```bash
npx prisma migrate dev --name init_postgres
```

4. (Opcional) Seed:

Abra no navegador:

`http://localhost:3000/api/dev/seed`

5. Inicie o servidor:

```bash
npm run dev
```

## Rotas do backend (reserva e pagamento)

- Listar campanhas:
  - `GET /api/campanhas`
- Buscar campanha por slug:
  - `GET /api/campanhas/[slug]`
- Reservar cotas (15 min):
  - `POST /api/campanhas/[slug]/reservar`
  - Payload esperado:
    - `quantidade` (inteiro >= 1)
    - `usuarioId` (id do usuario logado)
- Mercado Pago PIX:
  - `POST /api/mercadopago/pix`
  - O frontend envia `reservaId` para o backend criar a cobranca vinculada a reserva
- Webhook Mercado Pago:
  - `POST /api/mercadopago/webhook`
  - Ao receber `approved`, a reserva fica `paga` e os numeros ficam disponiveis para o usuario.

## Como funciona a separacao de rifas (multi campanhas)

- Cada `Campanha` eh uma rifa separada.
- Cada compra cria uma `Reserva` vinculada a uma `Campanha` e a um `Usuario`.
- Os numeros reservados ficam em `Titulo`, com relacao para:
  - `campanhaId`
  - `usuarioId`
  - `reservaId`

Assim, se voce criar 4 campanhas ativas diferentes, cada uma tem seu conjunto de cotas/reservas independentes.

## Deploy na Vercel

1. Garanta que seu build roda migrations:
   - O `package.json` ja esta com `build` usando `prisma migrate deploy`.
2. Configure na Vercel:
   - `DATABASE_URL` (Neon, pooled connection)
   - `MERCADOPAGO_ACCESS_TOKEN`
   - e as `NEXT_PUBLIC_*` usadas no frontend (base url, links etc.)
3. No Mercado Pago, configure o webhook para:
   - `https://SEU_DOMINIO/api/mercadopago/webhook`
   - habilite pelo menos o evento `Pagamentos`.

## Estrutura de pastas (resumo)

```
/app          -> pages (home, campanha/[slug], pagamento etc.) e API routes
/components   -> Header, CardCampanha, SeletorTitulos, WhatsApp/Instagram cards
/lib          -> Prisma client/connection e tipos
/public       -> imagens e recursos estaticos
```
