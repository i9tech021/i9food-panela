# MULTITENANCY

## Estado atual
- **Rotas** já são multi-tenant por `$slug` (`/panela-da-roca/...`).
- **Camada de dados** filtra por `restaurant_id` em todas as queries.
- **UI** consome `Restaurant` sempre carregado via loader do `$slug.tsx`.
- **Um único tenant existe** hoje: `rest_panela` / `panela-da-roca`.

## Onde o tenant é resolvido
1. URL: `/:slug/...`.
2. `$slug.tsx` loader: `getRestaurantBySlug(params.slug)`.
3. Falhou? → `NotFoundRestaurant`.
4. Rotas filhas leem `restaurant` via `Route.useLoaderData()`.

## O que falta para "vender" um segundo tenant
- INSERT em `public.restaurants` (novo `id` + `slug`).
- Popular `hub_actions` desse `restaurant_id` (hoje UI cai no seed do Panela).
- Configurar assets (hero, logo) — sem admin de upload de asset ainda; injeção manual via SQL + URL de CDN.
- Redirecionar `/` para o slug default (hoje: hardcoded no `routes/index.tsx`).
- Repensar `RESTAURANT_CONFIG` (hoje single-source estático).

## Fonte da verdade (ambígua hoje)
Config do restaurante existe em **três lugares**:
1. `src/config/restaurant.config.ts` (estático, no bundle).
2. `src/lib/hub/seed.ts` — deriva do (1).
3. `public.restaurants` no Supabase externo — merge no `getRestaurantBySlug`.

O merge prefere o DB para campos colunados e cai no seed para
`openingHours`, `whatsapp` (URL), `features` (default). Isso funciona
enquanto for single-tenant; **quando o segundo tenant entrar**, colunar
os campos que faltam e apagar o fallback é obrigatório.

## RLS multi-tenant
Todas as queries usam `.eq('restaurant_id', ...)`. RLS não isola por
tenant (o filtro é aplicação-nível). Enquanto for single-tenant, aceitável;
com múltiplos, considerar policies com `restaurant_id` derivado do
usuário logado (ex.: `user_roles(user_id, role, restaurant_id)`).
