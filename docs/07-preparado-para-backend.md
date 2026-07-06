# 7. Camada de Dados (estado atual)

> Reescrito em 2026-07-06. **A camada não é mais mock** — está sobre
> Supabase real. O documento antigo descrevia o estado pré-integração;
> ficou obsoleto quando `src/lib/hub/api.ts` migrou para o projeto
> externo `nqdaxllqjnxwxmglbghl`.
>
> Contexto arquitetural: `docs/adr/ADR-001-dual-supabase-client.md`.
> Schema completo: `docs/database/0000_baseline.sql`.

## Onde os dados vivem hoje

| Área | Arquivo(s) | Persistência real |
| --- | --- | --- |
| Restaurante | `api.ts#getRestaurantBySlug`, `updateRestaurant` | Tabela `public.restaurants` (Supabase externo). Merge com `SEED_RESTAURANTS`/`RESTAURANT_CONFIG` para preencher campos não colunados (openingHours, whatsapp URL, features default). |
| Fotos (galeria) | `api.ts#listPhotos, createPhoto, deletePhoto, setPhotoStatus, reactToPhoto`; `subscribeRealtimePhotos` | Tabela `public.photos` + bucket `photos` (Storage público). Upload real via `supabase.storage.from('photos').upload(...)`. Realtime via publication `supabase_realtime`. |
| Likes / Quero | `reactToPhoto` | UPDATE direto em `photos.likes`/`photos.wants` (contador único; sem tabela de reações por usuário — dívida, ver `SECURITY.md`). |
| Rate-limit upload | `getUploadsRemaining, createPhoto` | `localStorage` (`panela.uploads.daily`, 10 uploads/dia por dispositivo). Client-side only — não bloqueia burla. |
| Action Cards | `api.ts#listLinks, updateLink` | Tabela `public.hub_actions` (**vazia hoje** — fallback para `SEED_ACTIONS`). |
| Eventos | `api.ts#listEvents` | Tabela `public.events` (**vazia hoje**). |
| Analytics | `api.ts#trackEvent, listAnalytics` | Tabela `public.analytics_events` append-only. Consumo real no dashboard admin. |
| Config restaurante (edição) | `$slug.admin.config.tsx` → `updateRestaurant` | UPDATE em `public.restaurants` (RLS aberta para authenticated — ver ADR-004 pendente). |
| Admin auth | `useAdminSession`, `$slug.admin.login.tsx` | **Supabase Auth (email+senha) no projeto externo**. Sem `user_roles`: qualquer usuário autenticado tem acesso ao painel. |
| WhatsApp / mensagens | `lib/hub/whatsapp.ts` | Client-only, sem backend. |
| Curriculos / Reservas | `$slug.admin.curriculos.tsx`, `$slug.admin.reservas.tsx`, rotas públicas | **Sem persistência de leads hoje** — as rotas públicas só disparam WhatsApp. Admin lista consome placeholder. Ver `docs/TECH_DEBT.md`. |

## Contratos ↔ tabelas
Arquivo | Tabela
--- | ---
`Restaurant` (`types.ts`) | `public.restaurants` (merge parcial — vários campos vêm do seed)
`Photo` | `public.photos`
`HubAction`/`HubLink` | `public.hub_actions`
`HubEvent` | `public.events`
`AnalyticsEvent` | `public.analytics_events`

Snapshot canônico de colunas / defaults / RLS: `docs/database/0000_baseline.sql`.

## Dois clients Supabase — regra
- `@/integrations/external-supabase/client` → **usado por tudo em `src/lib/hub/`**. Aponta para `nqdaxllqjnxwxmglbghl` (hardcoded).
- `@/integrations/supabase/client` (auto-gerado) → aponta para o projeto Lovable Cloud, **vazio**. Não usar em código de produto até reconciliação (ADR-001).

## Fluxo de escrita crítico (upload)
1. `compressImage` (canvas, ≤ 2400px lado maior, JPEG 0.92) se `>3MB`.
2. `supabase.storage.from('photos').upload(path, blob, { contentType, upsert:false })`.
3. `getPublicUrl(path)` → URL persistida em `photos.url`.
4. `insert photos ({ restaurant_id, url, author_name, caption, status:'approved' })`.
5. `bumpRate()` local.
6. `notify()` dispara subscribers in-memory. Realtime notifica outros clientes.

## O que ainda é fallback local
- `SEED_ACTIONS` (enquanto `hub_actions` estiver vazia).
- Campos ricos do restaurante ausentes no schema (`openingHours`, `whatsapp` completo, `features` default).
- `whatsapp.ts` messages.
- `SEED_EVENTS`, `SEED_ANALYTICS` (arrays vazios, cosméticos).
