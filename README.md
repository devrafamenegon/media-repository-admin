## Media Repository Admin

Admin (Next.js) que expõe as rotas `/api/*` (consumidas pelo `media-repository-client`) e persiste dados via **Postgres + Prisma**.

### Pré-requisitos

- **Node.js**: recomendado **20+**
- **Postgres**: um banco local rodando (Docker ou instalação nativa)
- **Clerk**: chaves para autenticação (Publishable + Secret)

### Variáveis de ambiente

Por segurança do workspace, o template está em `env.example` (sem o ponto). Crie um arquivo `.env.local` e copie o conteúdo:

- Copie `env.example` → `.env.local`
- Preencha no mínimo:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `ARCHIVED_SECRET` (se for usar a área de arquivados)

### Deploy na Vercel + Supabase (Postgres)

- **Use o Pooler (PgBouncer) do Supabase no `DATABASE_URL`** (melhor para serverless).
- **Garanta `sslmode=require`** nas URLs.
- Se sua senha tiver `@` ou `$`, **faça URL-encode** (`@` → `%40`, `$` → `%24`) para não quebrar a string.

### Subir local

Na pasta `media-repository-admin`:

```bash
npm install
npx prisma db push
npm run dev
```

O admin sobe em `http://localhost:3000` e a API fica em `http://localhost:3000/api`.

### Observação (CORS)

O `next.config.mjs` do admin já libera (por padrão) requisições do client em `http://localhost:3001`.
