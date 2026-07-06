# 9. Dívida Técnica

> Atualizado em 2026-07-06. Substitui a versão antiga (mock-era).
> Cross-ref: `SECURITY.md`, ADR-001, ADR-004 (proposto).

## Bloqueantes (segurança)
1. **RLS de escrita aberta** — `photos`, `hub_actions`, `events`, `restaurants` aceitam mutations de qualquer sessão. Precisa `user_roles` + `has_role('admin')`.
2. **Sem `user_roles`** — qualquer signup no projeto Supabase externo vira admin.
3. **Gate admin é `useEffect`** — não bloqueia SSR nem impede que o bundle admin seja baixado. Migrar para `_authenticated/`.
4. **Rate-limit de upload apenas em `localStorage`** — burlável trivialmente. Precisa server-side.
5. **`anon` key hardcoded** no source (`external-supabase/client.ts`) — aceitável porque a chave é publishable, **desde que** as policies estejam corretas (ver #1).
6. **Delete de foto ignora falha do Storage** — pode acumular arquivos órfãos.

## Alto impacto
7. **Race condition em `reactToPhoto`** — `select…update col+delta` sem transação. Perde likes sob concorrência.
8. **`og:image` no `__root.tsx`** — sobrescreve todas as leaves. Mover para leaves + gerar dinâmico por foto.
9. **Sem tabelas de leads** — reservas e currículos hoje só disparam WhatsApp. Admin mostra lista placeholder.
10. **Divergência do WhatsApp** — `RESTAURANT_CONFIG.whatsappPhone = 5522999454932`, banco tem `5522998454932`. Fonte única precisa ser confirmada e escolhida.
11. **Config duplicada** — `config/restaurant.config.ts` **+** `seed.ts` **+** linha no DB. Três lugares descrevem o mesmo restaurante.

## Média
12. **`HubCard.tsx` legado** — conviver com `ActionCard`. Consolidar.
13. **`analytics_events` sem TTL** — cresce indefinidamente.
14. **`components/ui/` inflado** — muitos shadcn não usados (accordion, calendar, carousel, chart, command, menubar, resizable, sidebar…).
15. **PWA sem service worker** — apenas manifest+ícones. Sem offline.
16. **Dois projetos Supabase** — ADR-001. Custo de reconciliar sobe com o tempo.
17. **SEED_PHOTOS vazio** — galeria demo perde impacto.
18. **`trackEvent` sem debounce** — pode inflar `analytics_events` em navegação intensa.
19. **`_authenticated/` inexistente** — pasta convencional ausente. Sem ela, gates client-side espalham.

## Baixa
20. **Divergência de tokens** — auditar hard-codes de `text-white`/`bg-black`/`bg-[#…]`.
21. **`SEED_EVENTS` vazio** — depende de povoar a tabela `events`.
22. **`img/asset.json`** — verificar CDN Lovable não expira.
23. **Testes ausentes** (Playwright/unit).

## Oportunidades de refatoração
- Extrair `useHub()` (React Query) que encapsule `listPhotos/listLinks/listEvents` + loading/erro.
- Padronizar reads via `useSuspenseQuery` + `ensureQueryData` nos loaders.
- Consolidar `restaurant.config.ts` + `SEED_RESTAURANTS` + row do DB (fonte única quando ADR-001 for reconciliada).
- Extrair mensagens WhatsApp para i18n.
- Storybook (ou Ladle) para o design system.
