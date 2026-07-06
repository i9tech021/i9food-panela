# Database — Panela da Roça

> **Onde os dados vivem.** Este projeto usa **dois projetos Supabase
> distintos** (ver `docs/adr/ADR-001-dual-supabase-client.md`):
>
> - **`nqdaxllqjnxwxmglbghl`** — projeto **externo**, onde o app
>   grava/lê tudo em runtime (restaurants, photos, storage `photos`,
>   hub_actions, events, analytics_events).
> - **`xbqskqnznbjhabymdobh`** — projeto **Lovable Cloud** provisionado
>   automaticamente. **Vazio hoje**, mas é o que responde às tools
>   `supabase--migration` / `supabase--insert` do Lovable.
>
> Consequência prática: as migrations abaixo **não podem ser aplicadas
> via tools do Lovable** — rodariam no projeto errado. Elas são a
> **fonte de verdade versionada do schema em produção**, aplicadas
> manualmente no SQL Editor do projeto externo.

## Arquivos

| Arquivo | Descrição |
| --- | --- |
| `0000_baseline.sql` | Snapshot do schema atual (reconstruído por engenharia reversa em 2026-07-06 a partir do PostgREST público + `src/lib/hub/api.ts`). |

## Como aplicar uma mudança nova

1. Crie `NNNN_descricao.sql` numerado em sequência.
2. Escreva SQL **idempotente** (`IF NOT EXISTS`, `OR REPLACE`, `DROP POLICY IF EXISTS ... ; CREATE POLICY ...`).
3. Aplique manualmente no SQL Editor do Supabase externo.
4. Commite o arquivo. **Não** rode `supabase--migration` — cai no projeto errado.

## Reconciliação futura

Quando o projeto migrar para um único Supabase (ver ADR-001), este
diretório passa a ser importado 1:1 para `supabase/migrations/` e volta
a ser gerenciado pelas tools do Lovable.
