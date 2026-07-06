# HANDOFF — Panela da Roça Experience

> Onboarding prático. Detalhe técnico em [`docs/`](./docs/README.md).

## TL;DR
- **Produto:** hub digital mobile-first do restaurante Panela da Roça.
  Arquitetura multi-tenant por `slug`, um tenant ativo hoje.
- **Stack:** TanStack Start (React 19, Vite 8), Tailwind v4, shadcn/ui,
  framer-motion, Radix, lucide-react, react-hook-form + zod, sonner,
  TanStack Query.
- **Backend:** **Supabase real** (`nqdaxllqjnxwxmglbghl`, projeto
  externo) via `src/integrations/external-supabase/client.ts`.
  Tabelas: `restaurants`, `photos`, `hub_actions`, `events`,
  `analytics_events`. Storage bucket público `photos`. Realtime em `photos`.
- **Auth admin:** Supabase Auth email+senha. **Sem `user_roles`** (dívida
  bloqueante — ver `docs/adr/ADR-004-user-roles.md`).

## Rodar
```bash
bun install
bun run dev       # http://localhost:8080
bun run build     # produção (edge)
```

## Onde as coisas moram
| Camada | Onde |
| --- | --- |
| Rotas | `src/routes/` (file-based, dot-notation) |
| Componentes públicos | `src/components/hub/` |
| Componentes admin | `src/components/admin/` |
| UI base | `src/components/ui/` (shadcn) |
| Camada de dados | `src/lib/hub/` (`api.ts`, `types.ts`, `seed.ts`, `utils.ts`, `whatsapp.ts`, `admin-auth.ts`) |
| Client Supabase (uso real) | `src/integrations/external-supabase/client.ts` |
| Client Supabase (Lovable Cloud) | `src/integrations/supabase/*` — auto-gerado, sem uso |
| Config do restaurante | `src/config/restaurant.config.ts` |
| Estilos/tokens | `src/styles.css` |
| Assets | `src/assets/*.asset.json` (CDN Lovable) + `public/` (PWA) |
| Schema real | `docs/database/0000_baseline.sql` |
| ADRs | `docs/adr/` |

## Regras não óbvias
- **Não** editar `src/routeTree.gen.ts`.
- **Não** editar `src/integrations/supabase/*` (auto-gerado).
- **Não** rodar `supabase--migration` — cai no projeto Supabase errado (ADR-001).
  Nova mudança de schema: `docs/database/NNNN_*.sql` idempotente + aplicar no SQL Editor do projeto externo.
- Cores só via tokens CSS (`src/styles.css`). Sem `text-white`/`bg-black`/`bg-[#...]`.
- Assets via `*.asset.json`, sem hardcode de URL de CDN.
- Uploads: `createPhoto` faz `Storage.upload → getPublicUrl → insert row`.
  Rate-limit de 10/dia por dispositivo (`localStorage`) — **client-side**,
  burlável (dívida).

## Riscos ativos (bloqueantes antes de divulgar `/admin`)
1. RLS de escrita aberta para `authenticated` em `photos`, `hub_actions`, `events`, `restaurants`.
2. Sem `user_roles` — qualquer signup no Supabase externo vira admin efetivo.
3. Gate admin é `useEffect` client-side (não bloqueia API).
4. Rate-limit de upload só em `localStorage`.
5. Delete de foto pode deixar órfão no Storage.
6. `og:image` fixa no `__root.tsx` sobrescreve leaves.

Detalhamento: `docs/SECURITY.md`, `docs/09-divida-tecnica.md`.

## Divergências que precisam decisão do dono
- **Telefone WhatsApp:** `config` diz `5522999454932`, banco diz `5522998454932`. Escolher e alinhar.
- **Config duplicada em três lugares** (`restaurant.config.ts` + `seed.ts` + row no DB) — consolidar quando ADR-001 for reconciliada.

## Próximos commits recomendados
1. **ADR-004**: implementar `user_roles` + `has_role` + fechar RLS de escrita.
2. Migrar admin para `_authenticated/` real.
3. `photo_reactions` + trigger — matar race condition em like/quero.
4. Rate-limit server-side de upload.
5. Tabelas `reservations` e `job_applications` — capturar leads reais.
6. `og:image` por rota.
