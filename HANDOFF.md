# HANDOFF — Panela da Roça Experience

> Documento de transferência. Estado atual congelado em `docs/` (auditoria completa). Este arquivo é o ponto de partida para qualquer engenheiro dar continuidade.

## TL;DR
- **Produto**: hub digital mobile-first do restaurante Panela da Roça. Arquitetura já pensada como white-label multi-tenant (`/:slug/…`), embora atenda um único tenant hoje.
- **Stack**: TanStack Start (React 19 + Vite 8), Tailwind v4, shadcn/ui, framer-motion, Radix, lucide-react, react-hook-form + zod, sonner, TanStack Query. Backend planejado: Supabase (client já instalado, não usado).
- **Estado**: 100% funcional em cima de mocks (`src/lib/hub/api.ts` + `localStorage`). UI, fluxos, admin, PWA, empty states — tudo pronto. Falta ligar backend.

## Onde está tudo
```
docs/
  01-visao-geral.md
  02-arquitetura-frontend.md
  03-design-system.md
  04-componentes.md
  05-rotas.md
  06-fluxos.md
  07-preparado-para-backend.md
  08-checklist-backend.md
  09-divida-tecnica.md
  10-roadmap.md
HANDOFF.md  ← você está aqui
```

## Como rodar
```bash
bun install
bun run dev       # http://localhost:8080
bun run build     # build produção
```

## Camada de dados (única a ser reescrita para backend)
- `src/lib/hub/api.ts` — todas as funções assíncronas de leitura/escrita (photos, links, events, analytics, restaurant).
- `src/lib/hub/types.ts` — contratos (viram tabelas 1:1 no Supabase).
- `src/lib/hub/seed.ts` — dados iniciais.
- `src/lib/hub/utils.ts` — helpers (isOpenNow, formatação).
- `src/lib/hub/whatsapp.ts` — construtores de mensagem (permanece no client).
- `src/config/restaurant.config.ts` — config única (whitelabel). Fonte de verdade estática enquanto o backend não existe.

**Estratégia de swap**: reescrever `api.ts` usando `@supabase/supabase-js` e `requireSupabaseAuth` para admin. Nenhum componente precisa mudar.

## Autenticação
- Nada implementado.
- Clients Supabase auto-gerados existem em `src/integrations/supabase/` (client, client.server, auth-middleware, auth-attacher, types) — usar quando ligar auth.
- Admin deve migrar para `src/routes/_authenticated/` gate após integrar.

## PWA
- Manifest em `public/manifest.webmanifest`.
- Ícones: `favicon.png`, `apple-touch-icon.png`, `pwa-icon-192.png`, `pwa-icon-512.png`, `pwa-icon-512-maskable.png`.
- Meta / theme-color / links em `src/routes/__root.tsx`.
- Sem service worker próprio ainda (offline não suportado).

## O que NÃO existe ainda
Ver `docs/08-checklist-backend.md`. Prioridade absoluta antes de qualquer dado real: **autenticar `/admin`**.

## Convenções importantes
- **Rotas**: file-based em `src/routes/`, dot-notation (`$slug.admin.moderacao.tsx`). Nunca editar `routeTree.gen.ts`.
- **Assets**: imagens via `*.asset.json` em `src/assets/` (CDN Lovable). Nunca hardcodar URLs.
- **Cores**: sempre via tokens CSS em `src/styles.css`. Nunca `text-white`, `bg-black`, `bg-[#…]`.
- **Backend futuro**: `createServerFn` (TanStack) para lógica interna; `src/routes/api/public/*` só para webhooks. **Não usar** Supabase Edge Functions para lógica app-internal.
- **Secrets**: já configurados (`LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`). Não expor service role no client.

## Contatos oficiais (config atual)
- WhatsApp: `+55 22 99845-4932` (`5522998454932`) — confirmar se é 998 ou 999.
- Instagram: `@paneladaroca`.
- Google Maps: `share.google/FSXuEZVrQ0aFkgA5y`.
- Google Reviews: `share.google/DXVlJd8pw0RKANcLR`.

## Riscos conhecidos
1. Admin público (crítico).
2. `og:image` global em `__root.tsx` sobrescreve leaves — mover.
3. Upload é blob temporário (some no refresh).
4. Divergência do telefone WhatsApp entre config e plano.
5. `HubCard` legado convive com `ActionCard`.

Ver `docs/09-divida-tecnica.md` para o inventário completo.

## Próximo commit recomendado
1. Confirmar telefone oficial + atualizar `restaurant.config.ts`.
2. Provisionar Supabase (schema em `docs/08-checklist-backend.md`).
3. Implementar Auth + role admin.
4. Reescrever `src/lib/hub/api.ts` sobre Supabase.
5. Migrar rotas admin para `_authenticated/`.
6. Trocar upload mock por Storage real.