# CSGO Rifas – Site de Rifas de Skins CS2

Site inspirado no cs2pro.com.br: rifas/sorteios de skins de Counter-Strike 2.

## Por onde começar – Roadmap

### Fase 1 – Base (onde estamos)
- [x] Estrutura do projeto (Next.js + TypeScript + Tailwind)
- [ ] Página inicial com listagem de campanhas
- [ ] Página de campanha (detalhes + compra de títulos)
- [ ] Página de ganhadores
- [ ] Layout, header, footer

### Fase 2 – Dados e lógica
- [ ] Banco de dados (ex: PostgreSQL ou SQLite)
- [ ] Modelos: Campanha, Usuário, Título, Ganhador
- [ ] API: criar/listar campanhas, comprar títulos, sortear

### Fase 3 – Usuários e pagamento
- [ ] Cadastro e login
- [ ] Integração com gateway de pagamento (PIX, cartão)
- [ ] Histórico de compras e “minhas rifas”

### Fase 4 – Finalização
- [ ] Sorteio automático (número aleatório, notificação ao ganhador)
- [ ] Regulamento, FAQ, termos
- [ ] Deploy (Vercel + banco em nuvem)

## Stack sugerida

| Camada      | Tecnologia        |
|------------|-------------------|
| Frontend   | Next.js 14 (App Router), React, Tailwind CSS |
| Backend    | Next.js API Routes ou backend separado (Node/Express) |
| Banco      | Prisma + PostgreSQL (ou SQLite para dev) |
| Pagamento  | Stripe, Mercado Pago ou similar |
| Auth       | NextAuth.js ou similar |

## Como rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Estrutura de pastas (resumo)

```
/app          → páginas (home, campanha/[slug], ganhadores)
/components   → Header, CardCampanha, SeletorTitulos, etc.
/lib          → funções, tipos, conexão com DB
/public       → imagens, ícones
```
