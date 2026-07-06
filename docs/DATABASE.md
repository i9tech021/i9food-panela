# DATABASE

Visão narrada. **Referência canônica** de colunas/policies:
`docs/database/0000_baseline.sql`.

## Tabelas

### `public.restaurants`
Um restaurante = um tenant. `id` é `text` (`rest_panela`) porque foi
seedado antes de virarmos multi-tenant real; novos tenants podem manter
`text` (`rest_<slug>`) para consistência.

Colunas colunadas: `slug`, `name`, `tagline`, `since`, `address`,
`city`, `whatsapp_phone`, `instagram_handle`, `url_maps`,
`url_google_review`, `url_instagram`, `asset_hero`, `asset_logo`,
`features` (jsonb), `created_at`.

Campos ainda **não** persistidos (vêm do seed):
- `openingHours` — array; considerar coluna `jsonb` no próximo schema.
- URL formatada do WhatsApp (o app monta em runtime).

### `public.photos`
Galeria pública. Uploads nascem `status='approved'` (sem moderação
ativa hoje). `featured=true` promove ao filtro "Destaques".
`likes`/`wants` são contadores denormalizados; sem tabela de reações
por usuário (dívida — ver ADR-004/SECURITY).

Fluxo de escrita: `Storage.upload → getPublicUrl → insert row`.

Realtime: sim, publication `supabase_realtime`.

### `public.hub_actions`
Cards do hub por tenant. **Vazia hoje**; UI cai em `SEED_ACTIONS` (`src/lib/hub/seed.ts`) quando não há linhas.

### `public.events`
Programação do restaurante. Vazia hoje.

### `public.analytics_events`
Append-only. `event_type`: `visit | photo_upload | photo_like | photo_want | link_click | share`. `payload` (jsonb) carrega `source` (`qr|nfc|direct|share`) e `tableCode`.

## Storage

### bucket `photos` (público)
Path: `<restaurant_id>/<timestamp>-<rand>.jpg`. Servido via
`getPublicUrl`. Uploads permitidos para `anon` (RLS de storage).
Delete permitido para `anon` (dívida).

## Índices (baseline)
- `photos_restaurant_created_idx (restaurant_id, created_at desc)`
- `photos_restaurant_status_idx (restaurant_id, status)`
- `hub_actions_restaurant_order_idx (restaurant_id, sort_order)`
- `events_restaurant_date_idx (restaurant_id, event_date desc)`
- `analytics_restaurant_created_idx (restaurant_id, created_at desc)`

## Roles (planejado — ADR-004)
- `public.app_role` enum: `'admin'`.
- `public.user_roles(user_id, role)`.
- `public.has_role(_user_id uuid, _role app_role) returns boolean` — `security definer`.

Sem isso, nenhuma escrita destrutiva é realmente restrita. Ver `SECURITY.md`.
