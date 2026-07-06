# CODING_STANDARDS

Regras não óbvias específicas **deste** projeto. Não repete o que está
em ESLint/Prettier/AGENTS.

## Cores e tokens
- **Nunca** `text-white`, `bg-black`, `bg-[#...]`. Sempre token semântico via variável CSS (`src/styles.css`).
- Cores de marca só em `--wood`, `--cream`, `--copper`, `--gold`, `--sage`.

## Rotas
- File-based (`src/routes/`), dot-notation (`$slug.admin.moderacao.tsx`).
- **Nunca** editar `src/routeTree.gen.ts`.
- Toda rota nova de área autenticada deve, no médio prazo, migrar para `src/routes/_authenticated/`. Enquanto não migrarmos, aceitar gate client-side com `useAdminSession`.

## Camada de dados
- Toda leitura/escrita passa por `src/lib/hub/api.ts`. Componente não importa client Supabase direto.
- Client Supabase = **sempre** `@/integrations/external-supabase/client` até ADR-001 ser reconciliada.
- `notify()` deve ser chamado depois de qualquer mutation (invalida listeners in-memory).

## Assets
- Imagens via `*.asset.json` (CDN Lovable). Não hardcodar URL de CDN em componente.

## Backend
- Migrations vão em `docs/database/NNNN_*.sql` (idempotentes). **Não** rodar `supabase--migration` (ADR-001).
- Novos campos no `Restaurant` sem coluna no DB → adicionar coluna no baseline **e** merge em `getRestaurantBySlug`.

## Segredos
- Anon key hardcoded só em `external-supabase/client.ts`. Nada mais.
- Nunca commitar service role key.

## Commits
- Referenciar ADR / tabela / rota afetada no corpo.
- Mudança de schema exige atualizar `docs/database/*.sql` **e** `docs/CHANGELOG.md`.
