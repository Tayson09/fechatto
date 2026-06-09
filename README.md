# Fechatto

CRM imobiliário feito pra corretores. O objetivo é simples: organizar a carteira de clientes, acompanhar o funil e não perder nenhum follow-up.

## Tecnologias

Next.js 16 com App Router, TypeScript, PostgreSQL, Prisma, NextAuth, Tailwind CSS 4 e Zod.

## Como rodar

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` na raiz do projeto copiando o `.env.example` e preencha com as credenciais do banco:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"
NEXTAUTH_SECRET="uma string longa qualquer"
NEXTAUTH_URL="http://localhost:3000"
```

Aplique as migrations para criar as tabelas:

```bash
npx prisma migrate deploy
```

Suba o servidor:

```bash
npm run dev
```

Acesse `http://localhost:3000`, crie uma conta e comece a usar.

## O que já está funcionando

Módulo de clientes completo: lista com busca e filtros, cadastro e edição, ficha detalhada, histórico de interações, kanban do funil com drag-and-drop e página de follow-ups com alertas de vencimento. Dashboard com métricas e gráficos do mês.

Os módulos de imóveis, negociações, visitas e comissões estão no schema do banco mas ainda sem interface.

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # páginas públicas (login, registro)
│   ├── (main)/          # páginas protegidas (dashboard, clientes...)
│   └── api/             # endpoints do backend
├── components/
│   ├── ui/              # componentes base (button, card, input, modal...)
│   └── clients/         # componentes do módulo de clientes
├── server/
│   ├── services/        # regras de negócio
│   ├── repositories/    # queries no banco
│   └── validators/      # schemas de validação com Zod
├── lib/                 # configurações globais (auth, prisma, erros)
└── types/               # tipos TypeScript compartilhados entre front e back
```

## Outros comandos úteis

```bash
npx prisma studio       # abre uma interface visual pra ver o banco
npx prisma migrate dev  # cria uma nova migration durante o desenvolvimento
npx prisma generate     # regenera o Prisma Client após mudanças no schema
```
