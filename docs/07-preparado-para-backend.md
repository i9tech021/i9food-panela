# 7. Estrutura preparada para Backend

A camada de dados foi isolada em `src/lib/hub/` justamente para trocar a implementação sem refactor de UI. Cada função exportada em `api.ts` tem assinatura async, aceita `restaurantId`/`slug` e devolve tipos definidos em `types.ts` — exatamente o shape que a Supabase (via `@supabase/supabase-js`) deverá satisfazer.

## O que hoje é mock

| Área | Arquivo(s) | Como é mockado | Como conectar ao backend |
| --- | --- | --- | --- |
| Restaurante (tenant) | `api.ts#getRestaurantBySlug`, `updateRestaurant`; `seed.ts#SEED_RESTAURANTS`; `config/restaurant.config.ts` | Array em memória hidratado no seed | Tabela `restaurants` (slug único). SELECT por slug, RLS pública leitura, escrita admin. |
| Fotos (galeria + moderação) | `api.ts#listPhotos, createPhoto, setPhotoStatus, reactToPhoto`; `PhotoTile`, `GalleryGrid`, `$slug.enviar.tsx`, `$slug.foto.$photoId.tsx`, `$slug.admin.moderacao.tsx` | Array + `URL.createObjectURL` para o arquivo | Tabela `photos` + Storage bucket público. Signed uploads no client. RLS: read `approved|featured` público, write autor, update admin. |
| Likes / Quero | `reactToPhoto` (incrementa contador na foto) | Contadores in-place | Tabela `photo_reactions (photo_id, user_id/anon_id, kind)` com counters via view ou trigger. |
| Links / Action Cards | `api.ts#listLinks, updateLink`; `seed.ts#SEED_LINKS`; `ActionCard`, `$slug.index.tsx`, `$slug.admin.conteudo.tsx` | Array + persist localStorage | Tabela `hub_actions` (order, accent, kind, href, enabled). Leitura pública, escrita admin. |
| Eventos | `api.ts#listEvents`; `seed.ts#SEED_EVENTS`; `$slug.eventos.tsx` | Array vazio no seed | Tabela `events` (date, title, description, image). |
| Analytics | `api.ts#trackEvent, listAnalytics`; dashboard admin | Últimos 5000 eventos em localStorage | Tabela `analytics_events` append-only + edge function/RPC para dashboards. |
| Config restaurante (edição) | `$slug.admin.config.tsx` → `updateRestaurant` | Patch in-place | UPDATE na tabela `restaurants` com política admin. |
| Admin (auth) | Nenhuma proteção | Rota pública | Supabase Auth + tabela `user_roles` (`admin`) + gate `_authenticated`. |
| WhatsApp / mensagens | `lib/hub/whatsapp.ts` | Strings construídas no client | Manter no client — não requer backend. |
| Upload storage | `createPhoto` → `URL.createObjectURL` | Blob local (some ao dar refresh) | Supabase Storage bucket `hub-photos/{restaurantId}/{uuid}`. |

## Contratos que já existem e podem virar tabelas 1:1
`Restaurant`, `Photo`, `HubAction` (alias `HubLink`), `HubEvent`, `AnalyticsEvent` — todos em `src/lib/hub/types.ts`.

## Estratégia de swap
Reescrever apenas `src/lib/hub/api.ts` para usar `@supabase/supabase-js` (client browser público + edge functions/`requireSupabaseAuth` para escrita admin). UI, componentes, rotas e tipos permanecem intocados.