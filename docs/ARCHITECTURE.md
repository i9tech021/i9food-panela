# ARCHITECTURE

Visão de alto nível — como as peças conversam **hoje**.

## Stack
- **Framework**: TanStack Start v1 (React 19, Vite 8, SSR) — target edge (Cloudflare Workers) via `@lovable.dev/vite-tanstack-config`.
- **Roteamento**: `@tanstack/react-router` (file-based, `routeTree.gen.ts`).
- **Data fetching**: leitura direta via `src/lib/hub/api.ts` (Supabase JS). React Query instalado, uso pontual.
- **UI**: Tailwind v4 (tokens em `src/styles.css`) + shadcn/ui + Radix + framer-motion + lucide-react.
- **Forms**: `react-hook-form` + `zod`.
- **Notificações**: `sonner`.
- **Backend**: **Supabase externo** (`nqdaxllqjnxwxmglbghl`) + Storage. Ver ADR-001.

## Camadas
```
┌────────────────────────────────────────────────┐
│  Rotas (src/routes/, file-based, TanStack)     │
│  → Loader do $slug.tsx: getRestaurantBySlug    │
├────────────────────────────────────────────────┤
│  Componentes (src/components/hub, admin, ui)   │
│  → Consomem lib/hub/api                        │
├────────────────────────────────────────────────┤
│  Camada de dados (src/lib/hub/*)               │
│  → api.ts, types.ts, seed.ts, utils.ts,        │
│     whatsapp.ts, admin-auth.ts                 │
├────────────────────────────────────────────────┤
│  Cliente Supabase externo                      │
│  → src/integrations/external-supabase/client   │
├────────────────────────────────────────────────┤
│  Supabase (nqdaxllqjnxwxmglbghl)               │
│  → tabelas, RLS, storage, realtime, auth       │
└────────────────────────────────────────────────┘
```

## Fronteiras
- **SSR vs client:** loader do `$slug.tsx` roda no server; o resto (`listPhotos`, `listLinks`, admin) é client-first. Não há `createServerFn` em uso hoje.
- **Público vs admin:** admin protegido por `useAdminSession` (client-side) — ver `SECURITY.md`.
- **Assets:** `src/assets/*.asset.json` (CDN Lovable) + `public/` (PWA icons).

## Fora do escopo hoje
- Server functions (`createServerFn`) — nenhum consumo.
- Edge functions (`supabase/functions/`) — nenhuma criada.
- CI/CD custom — deploy é 100% Lovable.
