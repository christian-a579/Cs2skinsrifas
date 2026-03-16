# Passo a passo: o que subir no Git e o que NÃO subir

Use este guia para preparar o projeto CSGORIFAS para o GitHub antes do deploy (Vercel ou outro).

---

## O que NÃO subir (ficam só na sua máquina)

| Item | Motivo |
|------|--------|
| **`.env`** | Contém chaves e senhas (Mercado Pago, banco). Quem clonar o repo não deve ter suas credenciais. |
| **`node_modules/`** | Dependências; são instaladas com `npm install`. Muito grande e desnecessário no Git. |
| **`.next/`** | Pasta de build do Next.js; é gerada com `npm run build`. |
| **`prisma/dev.db`** (e outros `*.db`) | Banco SQLite local; pode ter dados de teste. Em produção usa-se outro banco ou você configura na Vercel. |
| **`.env.local`**, **`.env.production.local`** | Variáveis de ambiente locais e de produção; nunca versionar. |
| **Outros** | `out/`, logs, pastas de IDE (`.vscode`, `.idea`), arquivos do sistema (`.DS_Store`). |

O arquivo **`.gitignore`** na raiz do projeto já está configurado para ignorar tudo isso. Assim, mesmo que você tente dar `git add .`, o Git não vai incluir esses arquivos.

---

## O que SUBIR no Git

| Item | Motivo |
|------|--------|
| **`src/`** | Todo o código da aplicação (páginas, componentes, APIs, libs). |
| **`prisma/schema.prisma`** | Modelos do banco; necessário para gerar o Prisma Client. |
| **`prisma/migrations/`** | Migrações do banco (se existirem); necessárias para rodar em produção. |
| **`public/`** | Imagens, ícones e arquivos estáticos (se existir). |
| **`package.json`** e **`package-lock.json`** | Lista de dependências e versões; o servidor usa para `npm install`. |
| **`next.config.mjs`** | Configuração do Next.js. |
| **`tailwind.config.ts`**, **`postcss.config.mjs`** | Configuração de Tailwind/PostCSS. |
| **`tsconfig.json`** | Configuração do TypeScript. |
| **`.gitignore`** | Define o que não entra no Git. |
| **`DEPLOY-HOSTINGER.md`**, **`PASSO-A-PASSO-GIT.md`** | Documentação (opcional, mas útil). |

Resumindo: **código fonte, configs e schema do Prisma** entram; **`.env`, `node_modules`, `.next` e banco local** não entram.

---

## Passo a passo no seu PC

### 1. Garantir que o `.gitignore` está na raiz

O projeto já tem um `.gitignore` na pasta `CSGORIFAS` que ignora `.env`, `node_modules`, `.next`, `*.db`, etc. Não remova esse arquivo.

### 2. Abrir o terminal na pasta do projeto

```bash
cd c:\dev\CSGORIFAS
```

### 3. Inicializar o Git (se ainda não tiver)

```bash
git init
```

Se já tiver usado `git init` antes, pode pular para o passo 4.

### 4. Ver o que será commitado

```bash
git status
```

Você deve ver arquivos como `src/`, `prisma/schema.prisma`, `package.json`, `next.config.mjs`, etc. **Não** deve aparecer `.env`, `node_modules` nem `.next`.

### 5. Adicionar tudo (respeitando o .gitignore)

```bash
git add .
```

Só entram os arquivos que **não** estão no `.gitignore`.

### 6. Primeiro commit

```bash
git commit -m "Primeiro commit: projeto CSGORIFAS pronto para deploy"
```

### 7. Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login.
2. Clique em **“+”** → **“New repository”**.
3. Nome sugerido: **CSGORIFAS** (ou o que preferir).
4. Deixe **público** ou privado (Vercel conecta nos dois).
5. **Não** marque “Add a README” nem “Add .gitignore” (você já tem).
6. Clique em **“Create repository”**.

### 8. Conectar seu projeto ao repositório e enviar

O GitHub vai mostrar algo como “push an existing repository”. No seu terminal:

```bash
git remote add origin https://github.com/SEU_USUARIO/CSGORIFAS.git
git branch -M main
git push -u origin main
```

Substitua **SEU_USUARIO** pelo seu usuário do GitHub. Se o repositório for **privado**, o Git pode pedir login (usuário + senha ou token).

---

## Depois do primeiro push

- **Variáveis de ambiente:** na Vercel (ou outro host), você configura manualmente as variáveis que estão no seu `.env` (por exemplo: `DATABASE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_BASE_URL`). Assim as chaves não ficam no código nem no Git.
- **Banco:** em produção você pode usar um banco em nuvem (ex.: Neon, PlanetScale) e colocar a `DATABASE_URL` só nas variáveis de ambiente do host.

---

## Checklist rápido

- [ ] `.gitignore` na raiz (já feito no projeto)
- [ ] Não commitar `.env`
- [ ] Não commitar `node_modules` nem `.next`
- [ ] Não commitar `prisma/dev.db` (ou outros `.db`)
- [ ] Subir `src/`, `prisma/schema.prisma`, `package.json`, `package-lock.json`, configs (Next, Tailwind, TS)
- [ ] Repositório criado no GitHub
- [ ] `git add .` → `git commit` → `git remote add origin` → `git push`

Com isso, o que sobe no Git é só o que deve ser versionado; o que não deve (segredos e artefatos) fica fora.
