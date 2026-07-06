# SECURITY

> Estado real das defesas em 2026-07-06. Complementa `docs/09-divida-tecnica.md`
> e o baseline `docs/database/0000_baseline.sql`.

## Modelo de ameaça (o que estamos protegendo)
- **Fotos aprovadas** (galeria pública) — devem sobreviver a spam/burla de rate-limit.
- **Config do restaurante** (endereço, WhatsApp, links) — só admin pode mudar.
- **Currículos e reservas** — quando persistidos (não estão hoje), PII sensível.
- **Chave anon do projeto externo** — publishable por design; a segurança REAL vem das policies.

## Chaves e segredos

| Chave | Onde vive | Sensibilidade | Regra |
| --- | --- | --- | --- |
| Anon key do Supabase externo | `src/integrations/external-supabase/client.ts` (hardcoded) | Baixa (publishable) | Segura **apenas se** todas as policies estiverem corretas. Ver ADR-004. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable Cloud) | `.env` gerenciado | Baixa (publishable) | Não usada no runtime hoje. |
| `SUPABASE_SERVICE_ROLE_KEY` (Lovable Cloud) | Secret Lovable | **Alta** | Nunca chega ao client. Nenhum código atual usa. |
| `LOVABLE_API_KEY` | Secret Lovable | Alta | Reservada para futuras `createServerFn` com AI Gateway. |
| Senha admin | Supabase Auth (externo) | Alta | Reset via SQL Editor do projeto externo. |

## RLS — estado atual e riscos

Referência viva: `docs/database/0000_baseline.sql`.

| Tabela | Read | Insert | Update | Delete | Risco |
| --- | --- | --- | --- | --- | --- |
| `restaurants` | `anon`, `authenticated` | ❌ | `authenticated` (aberta) | ❌ | Qualquer conta signada altera o restaurante. |
| `photos` | `anon`, `authenticated` (todas) | `anon`, `authenticated` | `anon`, `authenticated` | `anon`, `authenticated` | `anon` pode zerar likes, remover fotos, alterar `status`. |
| `hub_actions` | `anon`, `authenticated` | `authenticated` | `authenticated` | `authenticated` | Qualquer conta muda cards do hub. |
| `events` | `anon`, `authenticated` | `authenticated` | `authenticated` | `authenticated` | Idem. |
| `analytics_events` | `authenticated` | `anon`, `authenticated` | ❌ | ❌ | OK; append-only. |
| Storage bucket `photos` | `anon`, `authenticated` (SELECT/INSERT/DELETE) | — | — | — | `anon` pode deletar qualquer arquivo. |

**Ação pendente (ADR-004 proposto):** substituir todas as escritas por
`has_role(auth.uid(), 'admin')` para `restaurants`, `hub_actions`,
`events`, e para `update/delete` de `photos`. Manter `insert` de
`photos` aberta (upload público) mas trocar por rate-limit server-side.

## Rate-limiting

- **Upload de fotos**: hoje é `localStorage.panela.uploads.daily` (10/dia).
  Trivial de burlar (limpar storage, aba anônima, outro dispositivo).
  **Solução:** edge function `/api/public/upload` que verifica IP + count nas
  últimas 24h antes de retornar signed URL do Storage.
- **Reactions (like/quero)**: nenhum. `reactToPhoto` faz `select…update`
  incremental — sob concorrência perde updates. **Solução:** tabela
  `photo_reactions(photo_id, actor_id, kind)` unique + trigger AFTER
  INSERT/DELETE que recalcula contador.

## Sessão e autenticação
- Provider: Supabase Auth (email+senha).
- Persistência: `localStorage` (padrão do client Supabase, `persistSession: true`).
- Sign-out: `adminSignOut()` chama `supabase.auth.signOut()`. **Falta** limpar
  React Query cache + redirect via `router.navigate` (hoje o `useEffect`
  do gate resolve por reação — bom o suficiente enquanto não houver dados
  sensíveis cacheados).
- **Sem `user_roles`** — qualquer conta criada no Supabase Auth do projeto
  externo pode entrar no `/admin` e mutar todas as tabelas via RLS aberta.
  **Não crie contas nesse projeto exceto para admins reais** até ADR-004.

## Dados pessoais
- Uploader informa nome opcional (`author_name`). Sem e-mail, sem telefone.
- Currículos e reservas hoje **não** são persistidos (fluxo abre WhatsApp).
  Quando a tabela existir, aplicar LGPD: retenção, direito de apagar,
  criptografia at-rest (Supabase já entrega), acesso restrito ao admin.

## CSP / headers
Não configurados. Deploy no Lovable serve com defaults da plataforma.

## Reporte de vulnerabilidades
Enquanto não houver processo formal: abrir issue privada ou contatar o
mantenedor do repositório.
