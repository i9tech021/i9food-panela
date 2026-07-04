# 5. Rotas

File-based routing (TanStack). Todas as rotas do produto são multi-tenant por `$slug`.

| Arquivo | URL | Objetivo |
| --- | --- | --- |
| `routes/index.tsx` | `/` | Redirect / landing raiz (aponta para o tenant default). |
| `routes/$slug.tsx` | `/:slug` | Layout do tenant — carrega o restaurante via `getRestaurantBySlug`, renderiza `<Outlet/>` ou `NotFoundRestaurant`. |
| `routes/$slug.index.tsx` | `/:slug/` | **Home do Hub** — hero, grid de Action Cards, HoursCard, footer. |
| `routes/$slug.galeria.tsx` | `/:slug/galeria` | Galeria de momentos (filtros + grid + empty state). |
| `routes/$slug.foto.$photoId.tsx` | `/:slug/foto/:photoId` | Detalhe da foto: like, quero, compartilhar. |
| `routes/$slug.enviar.tsx` | `/:slug/enviar` | Upload de foto (form, preview, envio ao mock). |
| `routes/$slug.enviado.tsx` | `/:slug/enviado` | Confirmação pós-upload + CTA para galeria. |
| `routes/$slug.eventos.tsx` | `/:slug/eventos` | Lista de eventos (empty state por enquanto). |
| `routes/$slug.admin.tsx` | `/:slug/admin` | Layout admin (tabs) via `AdminShell`. |
| `routes/$slug.admin.index.tsx` | `/:slug/admin` | Dashboard admin (KPIs mockados a partir de `analytics`). |
| `routes/$slug.admin.moderacao.tsx` | `/:slug/admin/moderacao` | Aprovar/rejeitar/destacar fotos. |
| `routes/$slug.admin.conteudo.tsx` | `/:slug/admin/conteudo` | Editar Action Cards / links do hub. |
| `routes/$slug.admin.config.tsx` | `/:slug/admin/config` | Editar dados do restaurante (nome, contatos, horários). |
| `routes/__root.tsx` | — | Shell HTML, providers (QueryClient), metadata, PWA links, error/notfound boundaries. |

**Notas**
- Nenhuma rota é autenticada. Admin é acessível por qualquer visitante que conheça a URL.
- Todas as rotas de tenant renderizam **sem SSR de dados privados** — leitura via `lib/hub/api` (mock `localStorage`, browser-only). Loader do `$slug.tsx` funciona em SSR pois lê do seed em memória.