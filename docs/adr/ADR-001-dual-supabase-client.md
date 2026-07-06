# ADR-001 — Dois projetos Supabase (Lovable Cloud + externo)

- **Data:** 2026-07-06
- **Status:** Aceito — **dívida ativa** (reconciliar antes de escalar para múltiplos tenants).

## Contexto

Quando o Lovable Cloud foi ativado, o Lovable provisionou automaticamente
um projeto Supabase gerenciado (`xbqskqnznbjhabymdobh`) e injetou os
arquivos auto-gerados em `src/integrations/supabase/` (`client.ts`,
`client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`,
`types.ts`) e os secrets `VITE_SUPABASE_URL` /
`VITE_SUPABASE_PUBLISHABLE_KEY` no `.env`.

Em paralelo, os dados de produção do restaurante (`restaurants`,
`photos`, storage `photos`, `hub_actions`, `events`,
`analytics_events`) já haviam sido criados manualmente em um projeto
Supabase separado (`nqdaxllqjnxwxmglbghl`), com RLS, storage bucket
público, publication realtime e uma linha semeada em `restaurants`.

Rebuildar o schema no projeto gerenciado exigiria: migrar todas as
fotos já enviadas do bucket antigo, reeditar URLs persistidas em
`photos.url`, refazer configuração de RLS/realtime, atualizar
`restaurant_id` em uploads futuros. Custo alto, ganho baixo enquanto
existir um único tenant.

## Decisão

Manter os dois projetos, com papéis explícitos:

1. **Externo (`nqdaxllqjnxwxmglbghl`)** — **fonte de verdade dos dados
   do app**. Client dedicado em `src/integrations/external-supabase/client.ts`
   com URL + anon key **hardcoded** (o `.env` do Lovable Cloud é
   gerenciado e sobrescreveria qualquer valor colocado lá). Toda a
   camada de dados em `src/lib/hub/api.ts` importa dele.
2. **Lovable Cloud (`xbqskqnznbjhabymdobh`)** — **infra auxiliar**.
   Segura os secrets (`LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`),
   é o alvo das tools `supabase--*` do Lovable, e existe para futuros
   `createServerFn` que precisem de `requireSupabaseAuth`. **Sem
   tabelas próprias hoje.**

Consequências práticas registradas em `docs/database/README.md` e
`docs/database/0000_baseline.sql`.

## Consequências

- ✅ **Zero downtime** e zero migração de arquivos.
- ✅ Fica claro qual client usar: `@/integrations/external-supabase/client`
  para dados do app; `@/integrations/supabase/client` só se/quando
  aparecer código novo tocando o projeto gerenciado.
- ❌ Tools `supabase--migration` / `supabase--insert` / `supabase--read_query`
  apontam para o **projeto errado** (o gerenciado, vazio). Toda mudança
  de schema tem que ser feita à mão no SQL Editor do projeto externo.
- ❌ `supabase/migrations/` (gerenciado pelo Lovable) fica sem uso;
  versionamos o schema real em `docs/database/*.sql`.
- ❌ Anon key do projeto externo está **hardcoded no source** (ver
  `SECURITY.md` — publicável por design, mas exige RLS estrita).
- ❌ Não há `user_roles` no projeto externo; toda escrita hoje é aberta
  a `anon`/`authenticated`. Ver ADR-004 (a criar) para o plano de
  endurecer isso antes de expor admin real.

## Alternativas consideradas

1. **Migrar tudo para o Lovable Cloud** — descartado pelo custo de
   migrar storage + rewrite de URLs + retrabalho de RLS/realtime, sem
   ganho enquanto for single-tenant.
2. **Migrar tudo para o externo e desligar Lovable Cloud** — perde-se
   o Lovable AI Gateway (`LOVABLE_API_KEY`) e o auto-provisionamento
   de `SUPABASE_SERVICE_ROLE_KEY` para server functions futuras.
3. **Editar `src/integrations/supabase/client.ts` para apontar ao
   externo** — proibido: o arquivo é auto-gerado e reescrito pelo
   Lovable a cada mudança de conexão.

## Gatilho de revisão

Reconciliar quando **qualquer** destes ocorrer:

- Segundo tenant entrar no ar (multi-tenancy real).
- Necessidade de `createServerFn` com `requireSupabaseAuth` acessando
  as tabelas do app.
- Implementação de `user_roles` + admin real (ADR-004): mais simples
  fazer no projeto gerenciado com as tools do Lovable.
