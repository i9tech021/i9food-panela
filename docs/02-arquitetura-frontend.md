# 2. Arquitetura Frontend

## Tecnologias
- **Framework**: TanStack Start v1 (React 19 + Vite 8), SSR habilitado, file-based routing.
- **Roteamento**: `@tanstack/react-router` (`routeTree.gen.ts` gerado).
- **Data fetching**: `@tanstack/react-query` v5 (QueryClient no router context — uso pontual; maior parte dos reads é feita direto pela API mock).
- **UI**: Tailwind CSS v4 (config via `src/styles.css`, tokens semânticos), shadcn/ui (new-york), Radix Primitives.
- **Animação**: `framer-motion` v12.
- **Ícones**: `lucide-react`.
- **Forms**: `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Notificações**: `sonner`.
- **Backend client (preparado, não usado)**: `@supabase/supabase-js` v2.
- **Build/host**: Vite 8, target edge (Cloudflare Workers via `@lovable.dev/vite-tanstack-config`).

## Estrutura de pastas
```
src/
  assets/                # asset.json (URLs CDN) — hero e logo
  components/
    admin/AdminShell.tsx
    hub/                 # componentes do hub público
      gallery/           # subgrupo da galeria
    ui/                  # shadcn/ui completo
  config/
    restaurant.config.ts # config única do restaurante (white-label)
  hooks/use-mobile.tsx
  integrations/supabase/ # clients auto-gerados (não usados)
  lib/
    hub/                 # camada de dados mock (api, seed, types, utils, whatsapp)
    utils.ts, error-capture.ts, error-page.ts, lovable-error-reporting.ts
  routes/                # file-based routing TanStack
  router.tsx, server.ts, start.ts, styles.css
public/
  manifest.webmanifest, favicon.png, apple-touch-icon.png, pwa-icon-*.png
```

## Organização de componentes
- **`components/hub/`**: Header, ActionCard, HubCard (legado), SideDrawer, BrandMark, EmptyState, HoursCard, StatusDot, PhotoTile, BottomNav, NotFoundRestaurant.
- **`components/hub/gallery/`**: GalleryCard, GalleryGrid, GalleryFilters, GalleryEmptyState.
- **`components/admin/AdminShell.tsx`**: layout do painel admin.
- **`components/ui/`**: biblioteca shadcn completa.

## Organização de páginas
Ver `docs/05-rotas.md`. Padrão: `$slug` = tenant; sub-rotas por dot-notation.

## Organização de assets
- Imagens em CDN Lovable via `*.asset.json` em `src/assets/`.
- Ícones PWA / favicons em `public/`.
- Manifest em `public/manifest.webmanifest`.

## Dependências
44 deps runtime, 15 dev. Nenhuma Node-only detectada. Maiores: `framer-motion`, `date-fns`, `recharts`, `embla-carousel-react`.