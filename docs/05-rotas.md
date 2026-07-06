# 5. Rotas

File-based routing (TanStack). Multi-tenant por `$slug`.

| Arquivo | URL | Objetivo |
| --- | --- | --- |
| `routes/index.tsx` | `/` | Redirect / landing raiz (aponta para o tenant default). |
| `routes/$slug.tsx` | `/:slug` | Layout do tenant — `getRestaurantBySlug`, `<Outlet/>` ou `NotFoundRestaurant`. |
| `routes/$slug.index.tsx` | `/:slug/` | Home do Hub. |
| `routes/$slug.galeria.tsx` | `/:slug/galeria` | Galeria de momentos. |
| `routes/$slug.foto.$photoId.tsx` | `/:slug/foto/:photoId` | Detalhe da foto (like, quero, share, delete com senha). |
| `routes/$slug.enviar.tsx` | `/:slug/enviar` | Upload real (Supabase Storage). |
| `routes/$slug.enviado.tsx` | `/:slug/enviado` | Confirmação pós-upload. |
| `routes/$slug.eventos.tsx` | `/:slug/eventos` | Lista de eventos (vazia hoje). |
| `routes/$slug.reservas.tsx` | `/:slug/reservas` | CTA WhatsApp de reserva. |
| `routes/$slug.trabalhe-conosco.tsx` | `/:slug/trabalhe-conosco` | CTA WhatsApp de vaga. |
| `routes/$slug.admin.tsx` | `/:slug/admin` | Layout admin + **gate `useAdminSession`** (redireciona para `/admin/login`). |
| `routes/$slug.admin.login.tsx` | `/:slug/admin/login` | Login Supabase (email+senha). |
| `routes/$slug.admin.index.tsx` | `/:slug/admin` | Dashboard admin (KPIs de `analytics_events`). |
| `routes/$slug.admin.moderacao.tsx` | `/:slug/admin/moderacao` | Aprovar / rejeitar / destacar / excluir. |
| `routes/$slug.admin.conteudo.tsx` | `/:slug/admin/conteudo` | Editar Action Cards. |
| `routes/$slug.admin.config.tsx` | `/:slug/admin/config` | Editar dados do restaurante. |
| `routes/$slug.admin.reservas.tsx` | `/:slug/admin/reservas` | Lista de reservas (placeholder — sem tabela ainda). |
| `routes/$slug.admin.curriculos.tsx` | `/:slug/admin/curriculos` | Lista de currículos (placeholder — sem tabela ainda). |
| `routes/__root.tsx` | — | HTML shell, providers, metadata, PWA links, error/notfound boundaries. |

**Notas**
- Admin protegida por gate **client-side** (`useAdminSession` + `useEffect` → redirect). Ainda não é o padrão `_authenticated/` do template (dívida — ver `docs/08-checklist-backend.md`).
- Rotas de tenant fazem SSR do restaurante (loader do `$slug.tsx`); resto dos dados é fetch client-side.
- `og:image` global mora em `__root.tsx` e sobrescreve leaves — dívida em `TECH_DEBT.md`.
