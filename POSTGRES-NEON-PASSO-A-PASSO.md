# Passo a passo: banco PostgreSQL gratuito no Neon

O [Neon](https://neon.tech) oferece PostgreSQL em nuvem com plano gratuito. Depois de criar o banco, você usa a URL no projeto e na Vercel.

---

## 1. Criar conta no Neon

1. Acesse **https://neon.tech**
2. Clique em **"Sign up"** (ou "Get started").
3. Cadastre-se com **GitHub** ou **e-mail**.
4. Confirme o e-mail se pedir.

---

## 2. Criar um projeto (banco)

1. No painel do Neon, clique em **"New Project"**.
2. Preencha:
   - **Project name:** por exemplo `csgorifas` (ou o nome que quiser).
   - **Region:** escolha a mais próxima (ex.: **South America (São Paulo)** se existir, ou **US East**).
   - **PostgreSQL version:** deixe a padrão (16).
3. Clique em **"Create project"**.

---

## 3. Copiar a connection string (URL do banco)

1. Depois que o projeto for criado, o Neon mostra a tela **"Connection details"**.
2. Em **"Connection string"**, escolha a opção **"Pooled connection"** (recomendado para serverless/Vercel).
3. O formato será algo como:
   ```text
   postgresql://usuario:senha@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Clique em **"Copy"** para copiar a URL inteira.  
   **Importante:** a senha aparece só uma vez; se perder, você gera uma nova no Neon (Dashboard → projeto → Settings → Reset password).

---

## 4. Colocar a URL no seu projeto (PC)

1. Abra o arquivo **`.env`** na raiz do projeto (em `C:\dev\CSGORIFAS`).
2. Troque a linha do banco para usar a URL do Neon:
   ```env
   DATABASE_URL="postgresql://usuario:senha@ep-xxx.xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
   Cole exatamente a URL que você copiou do Neon (entre aspas).
3. Salve o arquivo.

---

## 5. Trocar o Prisma de SQLite para PostgreSQL

1. Abra **`prisma/schema.prisma`**.
2. Na parte do **datasource**, troque:
   - De: `provider = "sqlite"`
   - Para: `provider = "postgresql"`
3. Deixe assim:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Salve.

*(Os modelos do schema continuam iguais; o Prisma funciona com os dois bancos.)*

---

## 6. Gerar o cliente e criar as tabelas no Neon

No terminal, na pasta do projeto:

```bash
cd C:\dev\CSGORIFAS
npx prisma generate
npx prisma migrate dev --name init_postgres
```

- **prisma generate** – gera o cliente para PostgreSQL.
- **prisma migrate dev** – cria as tabelas no banco do Neon (Campanha, Usuario, Titulo, Ganhador).

Se pedir um nome para a migração, pode usar `init_postgres`.  
Se der erro de conexão, confira se a `DATABASE_URL` no `.env` está certa e se colocou **Pooled connection** do Neon.

---

## 7. Configurar a URL na Vercel

1. Acesse o painel da **Vercel** → seu projeto (ex.: cs2skinsrifas).
2. Vá em **Settings** → **Environment Variables**.
3. Crie (ou edite) a variável:
   - **Key:** `DATABASE_URL`
   - **Value:** a **mesma** URL do Neon (Pooled connection).
4. Marque o ambiente **Production** (e Preview se quiser).
5. Salve.

Nos próximos deploys, a aplicação na Vercel vai usar o PostgreSQL do Neon.

---

## 8. (Opcional) Popular o banco em produção

Se você quiser as mesmas campanhas de exemplo que tinha no SQLite:

- Crie uma rota temporária ou chame a API de seed **uma vez** no deploy (ex.: `GET https://seu-app.vercel.app/api/dev/seed`).  
  Ou rode localmente com o `.env` já apontando para o Neon:

  ```bash
  npx prisma migrate dev
  ```
  Depois acesse no navegador a URL do seed (se existir) ou use o Prisma Studio:

  ```bash
  npx prisma studio
  ```

---

## Resumo rápido

| Passo | Onde | Ação |
|-------|------|------|
| 1 | neon.tech | Criar conta e projeto |
| 2 | Neon | Copiar **Connection string** (Pooled) |
| 3 | `.env` (PC) | `DATABASE_URL="postgresql://..."` |
| 4 | `prisma/schema.prisma` | `provider = "postgresql"` |
| 5 | Terminal | `npx prisma generate` e `npx prisma migrate dev --name init_postgres` |
| 6 | Vercel → Settings → Environment Variables | Adicionar `DATABASE_URL` com a mesma URL |

---

## Se precisar da senha de novo

No Neon: **Dashboard** → seu projeto → **Settings** → **Reset database password**. Copie a nova URL (ou só a nova senha) e atualize o `.env` e a variável na Vercel.
