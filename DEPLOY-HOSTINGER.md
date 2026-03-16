# Passo a passo: subir o site na Hostinger (VPS)

O projeto CSGORIFAS é Next.js + Prisma. No plano **compartilhado** da Hostinger isso não roda. É preciso usar **VPS** (Virtual Private Server) da Hostinger.

---

## Pré-requisitos

- Contratar um **VPS** na Hostinger (plano KVM 1 ou superior).
- Ter o **IP da VPS** e a **senha root** (enviada por e-mail após a ativação).
- Projeto no **Git** (GitHub/GitLab) **ou** conseguir enviar os arquivos por SFTP/SCP.

---

## 1. Acessar a VPS por SSH

No **PowerShell** ou **Prompt de Comando** (Windows):

```bash
ssh root@SEU_IP_VPS
```

Substitua `SEU_IP_VPS` pelo IP que a Hostinger informou. Digite a senha quando pedir.

*(No Windows 10/11 o SSH já vem instalado. Se der erro, use o PuTTY com o mesmo IP e usuário `root`.)*

---

## 2. Atualizar o servidor e instalar Node.js

Na VPS (já conectado via SSH):

```bash
apt update && apt upgrade -y
```

Instalar Node.js 20 (LTS):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Conferir:

```bash
node -v
npm -v
```

---

## 3. Instalar PM2 e Nginx

**PM2** – para manter o Next.js rodando 24h:

```bash
npm install -g pm2
```

**Nginx** – para receber as requisições e repassar para o Next.js:

```bash
apt install -y nginx
```

---

## 4. Colocar o projeto na VPS

### Opção A – Via Git (recomendado)

Se o projeto estiver no GitHub/GitLab:

```bash
cd /var/www
git clone https://github.com/SEU_USUARIO/CSGORIFAS.git
cd CSGORIFAS
```

*(Se o repositório for privado, configure SSH key ou token.)*

### Opção B – Via upload (SFTP/SCP)

1. No seu PC, na pasta do projeto, gere um arquivo com o que subir (sem `node_modules` e `.next`):

   - Compacte a pasta do projeto em **ZIP** (excluindo `node_modules` e `.next`).
   - Envie o ZIP para a VPS (FileZilla em modo SFTP, WinSCP ou `scp`).
   - Na VPS, por exemplo em `/var/www/`:
     ```bash
     cd /var/www
     unzip CSGORIFAS.zip
     cd CSGORIFAS
     ```

2. Envie também o arquivo **`prisma/dev.db`** (se você já tiver dados) para o mesmo projeto na VPS, na pasta `prisma/`.

---

## 5. Instalar dependências e configurar ambiente

Ainda dentro da pasta do projeto na VPS (`/var/www/CSGORIFAS` ou similar):

```bash
npm install
```

Criar o arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Conteúdo mínimo (ajuste a URL do site quando tiver domínio):

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="https://seudominio.com"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-f6775463-4b1e-42c1-825e-fe9003749fbf"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-3295641180613748-031616-28e92ee270504c784891567155c648d4-282306584"
```

Salvar: `Ctrl+O`, Enter, depois `Ctrl+X`.

Se ainda não existir o banco, criar e gerar o Prisma Client:

```bash
npx prisma generate
npx prisma migrate deploy
```

*(Se você subiu o `dev.db` da sua máquina, pode pular `migrate deploy` e usar só `prisma generate`.)*

---

## 6. Build e rodar com PM2

```bash
npm run build
pm2 start npm --name "csgorifas" -- start
pm2 save
pm2 startup
```

O último comando (`pm2 startup`) vai mostrar uma linha para você colar e executar (para o app subir após reinício do servidor). Execute essa linha.

Conferir se está rodando:

```bash
pm2 status
curl http://localhost:3000
```

Se o `curl` devolver HTML, o Next.js está ok na porta 3000.

---

## 7. Configurar Nginx (proxy para o Next.js)

Criar o arquivo de configuração do site:

```bash
nano /etc/nginx/sites-available/csgorifas
```

Colar (troque `seudominio.com` pelo seu domínio ou use o IP da VPS para testar):

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    # Se ainda não tiver domínio, use: server_name SEU_IP_VPS;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site e testar:

```bash
ln -s /etc/nginx/sites-available/csgorifas /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Se você usou o **IP** no `server_name`, acesse no navegador: `http://SEU_IP_VPS`.

---

## 8. Apontar o domínio na Hostinger (se tiver domínio)

1. No painel da Hostinger: **Domínios** → seu domínio → **DNS / Nameservers**.
2. Crie um registro **A** apontando para o **IP da VPS**:
   - Tipo: **A**
   - Nome: `@` (e outro para `www` se quiser)
   - Valor/Destino: **IP da sua VPS**
   - TTL: 14400 ou padrão

A propagação pode levar alguns minutos até 24h.

---

## 9. HTTPS (SSL) com certificado gratuito

Na VPS, com domínio já apontando para o IP:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com -d www.seudominio.com
```

Siga as perguntas (e-mail, aceitar termos). O Certbot ajusta o Nginx para HTTPS.

---

## Resumo dos comandos (na ordem)

```bash
# 1. Conectar
ssh root@SEU_IP_VPS

# 2. Instalar Node, PM2 e Nginx
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx
npm install -g pm2

# 3. Projeto (exemplo com Git)
cd /var/www
git clone https://github.com/SEU_USUARIO/CSGORIFAS.git
cd CSGORIFAS

# 4. Ambiente e build
npm install
nano .env   # colar variáveis
npx prisma generate
npx prisma migrate deploy   # ou só generate se já subiu o dev.db
npm run build

# 5. Rodar com PM2
pm2 start npm --name "csgorifas" -- start
pm2 save
pm2 startup   # e executar a linha que aparecer

# 6. Nginx (criar /etc/nginx/sites-available/csgorifas e ativar)
ln -s /etc/nginx/sites-available/csgorifas /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Atualizar o site depois

Quando fizer mudanças no código:

```bash
cd /var/www/CSGORIFAS
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart csgorifas
```

---

## Observações

- **Backup do banco:** o SQLite fica em `prisma/dev.db`. Faça cópia periódica (ex.: por SFTP ou script com `cp` para uma pasta de backup).
- **Mercado Pago:** em produção, use as chaves de produção e confira no painel do Mercado Pago a URL de retorno/notificação (deve ser `https://seudominio.com/...`).
- **Firewall:** na VPS, deixe as portas 80 e 443 abertas (o Nginx usa elas). No painel da Hostinger VPS pode haver firewall para liberar.

Se algo falhar, confira: `pm2 logs csgorifas` e `tail -f /var/log/nginx/error.log`.
