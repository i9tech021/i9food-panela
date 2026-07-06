# 8. Checklist do Backend (estado real)

> Reescrito em 2026-07-06. Reflete o que está **feito**, **parcial** e
> **pendente** no Supabase externo (`nqdaxllqjnxwxmglbghl`).
> Schema versionado: `docs/database/0000_baseline.sql`.

## ✅ Feito
- Tabela `restaurants` + linha do Panela da Roça seedada.
- Tabela `photos` (RLS aberta anon+authenticated) + índices por restaurante.
- Bucket público `photos` + policies de storage (read/insert/delete anon+authenticated).
- Realtime na tabela `photos` (publication `supabase_realtime`).
- Tabela `hub_actions` (vazia; UI cai no seed).
- Tabela `events` (vazia).
- Tabela `analytics_events` (append-only) + insert anônimo.
- Client dedicado (`src/integrations/external-supabase/client.ts`) com anon key hardcoded (ver ADR-001).
- Upload real com compressão + rate-limit client-side (10/dia).
- Página de login admin (`/$slug/admin/login`) via `signInWithPassword`.
- Gate client-side (`$slug.admin.tsx`) redirecionando para `/admin/login` sem sessão.

## 🟡 Parcial / risco
- **RLS aberta demais** — `photos`, `hub_actions`, `events`, `restaurants` aceitam `update/delete` de qualquer `authenticated` (e `photos` até de `anon`). Ver `SECURITY.md`.
- **Sem `user_roles`** — qualquer conta criada no Supabase Auth externo vira admin efetivo. Ver ADR-004 (proposto).
- **Rate-limit só no client** — `localStorage.panela.uploads.daily`. Trivial de burlar.
- **Reactions sem idempotência** — `reactToPhoto` faz `select … update col+delta`. Race condition entre múltiplos cliques simultâneos.
- **Delete de foto** — remove linha e tenta remover arquivo do Storage, mas ignora falha (log warn). Storage pode acumular órfãos.
- **Analytics sem particionamento** — `analytics_events` cresce indefinidamente. Sem TTL / rollup.
- **Sem SEO/OG dinâmico** — `__root.tsx` define `og:image` fixa, sobrescreve leaves (dívida).

## 🔴 Pendente
- Tabela `user_roles` + função `has_role('admin')` + endurecer todas as policies de escrita.
- Migrar `/$slug/admin` para gate `_authenticated/` real (hoje o gate é `useEffect` client-side).
- Tabela `photo_reactions` (por dispositivo/user) com trigger para denormalizar contador — matar race condition.
- Fluxo de moderação real (status `pending` no default de novos uploads, opt-in por restaurante).
- Rate-limit server-side (edge function ou RLS com `count` recente).
- Tabelas `reservations` e `job_applications` — hoje o app abre WhatsApp; admin ainda não recebe leads estruturados.
- `og:image` dinâmico por foto (edge function/rota `/api/public/og/…`).
- Reconciliação dos dois projetos Supabase (gatilho: ADR-001 → "quando segundo tenant entrar").
- Testes E2E (Playwright) cobrindo upload real + moderação.

## Convenção para novas mudanças de schema
- **Não** rodar `supabase--migration` (aponta para o projeto errado — ADR-001).
- Criar `docs/database/NNNN_descricao.sql` idempotente.
- Aplicar manualmente no SQL Editor do projeto externo.
- Atualizar `TECH_DEBT.md` e `CHANGELOG.md`.
