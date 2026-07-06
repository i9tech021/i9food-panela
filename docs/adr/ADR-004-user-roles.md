# ADR-004 — Introduzir `user_roles` + `has_role('admin')`

- **Data:** 2026-07-06
- **Status:** **Proposto** (bloqueante para expor `/admin` ao público).

## Contexto

Hoje, no Supabase externo (ver ADR-001), as policies de escrita em
`restaurants`, `hub_actions`, `events` e `photos` estão abertas para
qualquer sessão `authenticated`. O painel `/$slug/admin` autentica via
`supabase.auth.signInWithPassword` e libera acesso à UI, mas **não há
distinção entre "usuário autenticado" e "admin"**. Qualquer signup no
projeto vira admin efetivo — inclusive um cliente curioso que descobrir
como criar conta no endpoint padrão do Supabase.

O gate atual do painel é `useEffect` client-side (`useAdminSession` em
`$slug.admin.tsx`), o que impede que o painel *renderize* para não-logados,
mas não protege as tabelas.

## Decisão (proposta)

Aplicar o padrão canônico de roles do Supabase no projeto externo:

1. `create type public.app_role as enum ('admin');`
2. Tabela `public.user_roles(user_id uuid references auth.users, role app_role, unique(user_id, role))`.
3. `function public.has_role(_user_id uuid, _role app_role) returns boolean` (`security definer`, `stable`, `search_path = public`).
4. Reescrever policies:
   - `restaurants` update → `to authenticated using (has_role(auth.uid(),'admin'))`.
   - `hub_actions` / `events` insert/update/delete → idem.
   - `photos` update/delete → idem. `insert` permanece aberta.
   - Storage `photos` delete → idem.
5. Semear a primeira linha em `user_roles` manualmente no SQL Editor
   (uma vez, para o admin atual).
6. Aplicar tudo como `docs/database/0001_user_roles.sql` (idempotente).

Complementarmente:

7. Migrar `/$slug/admin` para o padrão `_authenticated/` do TanStack (gate `beforeLoad`), lendo a sessão do client externo. Manter `useAdminSession` só como leitor de estado.
8. Bloquear signups no projeto externo (`supabase--configure_auth` só é útil se estivéssemos no projeto gerenciado — no externo, desligar signup pelo dashboard/API do Supabase manualmente).

## Consequências

- ✅ Escritas destrutivas exigem role admin.
- ✅ Fluxos públicos de upload/reação continuam funcionando (policies de INSERT em `photos` e `analytics_events` permanecem abertas; ver `SECURITY.md`).
- ❌ Signup público no Supabase externo continua tecnicamente possível até desligarmos pelo dashboard — enquanto isso, sem role, novos usuários só terão acesso a leitura pública. Precisa ser combinado com passo 8.
- ❌ Semear a primeira role admin exige acesso ao SQL Editor do projeto externo (não temos tool automatizada — ver ADR-001).

## Alternativas consideradas

- **Confiar apenas no gate client-side**: rejeitado. Não protege API.
- **Fazer role via claim JWT custom (Supabase hooks)**: mais complexo, mesmo efeito, sem vantagem para escala atual.
- **Migrar `/admin` inteiro para o projeto Lovable Cloud (com `requireSupabaseAuth`)**: melhor no médio prazo, mas exige reconciliar os dois projetos primeiro (ADR-001) — fora do escopo deste ADR.

## Gatilho para promover a "Aceito"
Antes de qualquer uma destas condições:
- Divulgar publicamente a existência de `/admin`.
- Aceitar signup público no projeto Supabase externo.
- Habilitar uma segunda conta admin.
