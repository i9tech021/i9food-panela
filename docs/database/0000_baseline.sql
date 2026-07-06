-- =============================================================================
-- Baseline schema — Panela da Roça (projeto Supabase externo nqdaxllqjnxwxmglbghl)
-- Reconstruído em 2026-07-06 por engenharia reversa (PostgREST + src/lib/hub/api.ts).
--
-- IDEMPOTENTE. Pode ser rodado várias vezes sem erro no SQL Editor
-- do projeto externo. NÃO rodar via supabase--migration do Lovable
-- (aponta para outro projeto). Ver docs/database/README.md.
-- =============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- =============================================================================
-- restaurants (multi-tenant por slug — hoje só existe 'panela-da-roca')
-- =============================================================================
create table if not exists public.restaurants (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  tagline           text,
  since             integer,
  address           text,
  city              text,
  whatsapp_phone    text,
  instagram_handle  text,
  url_maps          text,
  url_google_review text,
  url_instagram     text,
  asset_hero        text,
  asset_logo        text,
  features          jsonb not null default '{"jobs":false,"events":false,"reservations":false}'::jsonb,
  created_at        timestamptz not null default now()
);

grant select on public.restaurants to anon, authenticated;
grant update on public.restaurants to authenticated;
grant all on public.restaurants to service_role;

alter table public.restaurants enable row level security;

drop policy if exists "restaurants read public" on public.restaurants;
create policy "restaurants read public" on public.restaurants
  for select to anon, authenticated using (true);

-- Escrita: hoje qualquer usuário autenticado pode atualizar (não há user_roles).
-- Ver ADR-004 (pendente): reforçar com has_role('admin') quando implementado.
drop policy if exists "restaurants update authenticated" on public.restaurants;
create policy "restaurants update authenticated" on public.restaurants
  for update to authenticated using (true) with check (true);

-- =============================================================================
-- photos (galeria — fluxo público de upload)
-- =============================================================================
create table if not exists public.photos (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  text not null references public.restaurants(id) on delete cascade,
  author_name    text,
  caption        text,
  url            text not null,
  status         text not null default 'approved',   -- 'pending' | 'approved' | 'rejected'
  featured       boolean not null default false,
  likes          integer not null default 0,
  wants          integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists photos_restaurant_created_idx
  on public.photos (restaurant_id, created_at desc);
create index if not exists photos_restaurant_status_idx
  on public.photos (restaurant_id, status);

grant select, insert, update, delete on public.photos to anon, authenticated;
grant all on public.photos to service_role;

alter table public.photos enable row level security;

-- Público lê apenas aprovadas/destacadas.
drop policy if exists "photos read public" on public.photos;
create policy "photos read public" on public.photos
  for select to anon, authenticated
  using (status in ('approved','rejected') or featured = true);
-- NOTE: hoje o app grava direto como 'approved'. Se moderação for reativada,
-- trocar a policy para (status in ('approved') or featured).

-- Upload anônimo é permitido (rate-limit é client-side; ver SECURITY.md — dívida).
drop policy if exists "photos insert public" on public.photos;
create policy "photos insert public" on public.photos
  for insert to anon, authenticated with check (true);

-- Update/delete abertos hoje (usados por reactToPhoto e admin sem role).
-- Ver ADR-004: restringir a has_role('admin') quando existir.
drop policy if exists "photos update public" on public.photos;
create policy "photos update public" on public.photos
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "photos delete public" on public.photos;
create policy "photos delete public" on public.photos
  for delete to anon, authenticated using (true);

-- Realtime.
do $$ begin
  perform 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'photos';
  if not found then
    execute 'alter publication supabase_realtime add table public.photos';
  end if;
end $$;

-- =============================================================================
-- hub_actions (cards do hub — hoje vazio; UI cai no seed de src/lib/hub/seed.ts)
-- =============================================================================
create table if not exists public.hub_actions (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  text not null references public.restaurants(id) on delete cascade,
  label          text not null,
  icon           text,
  href           text,
  accent         text,
  kind           text,           -- 'internal' | 'external' | 'whatsapp'
  enabled        boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists hub_actions_restaurant_order_idx
  on public.hub_actions (restaurant_id, sort_order);

grant select on public.hub_actions to anon, authenticated;
grant insert, update, delete on public.hub_actions to authenticated;
grant all on public.hub_actions to service_role;

alter table public.hub_actions enable row level security;

drop policy if exists "hub_actions read public" on public.hub_actions;
create policy "hub_actions read public" on public.hub_actions
  for select to anon, authenticated using (true);

drop policy if exists "hub_actions write authenticated" on public.hub_actions;
create policy "hub_actions write authenticated" on public.hub_actions
  for all to authenticated using (true) with check (true);

-- =============================================================================
-- events
-- =============================================================================
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  text not null references public.restaurants(id) on delete cascade,
  title          text not null,
  description    text,
  image_url      text,
  event_date     date,
  created_at     timestamptz not null default now()
);

create index if not exists events_restaurant_date_idx
  on public.events (restaurant_id, event_date desc);

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;

alter table public.events enable row level security;

drop policy if exists "events read public" on public.events;
create policy "events read public" on public.events
  for select to anon, authenticated using (true);

drop policy if exists "events write authenticated" on public.events;
create policy "events write authenticated" on public.events
  for all to authenticated using (true) with check (true);

-- =============================================================================
-- analytics_events (append-only)
-- =============================================================================
create table if not exists public.analytics_events (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  text not null,
  event_type     text not null,
  payload        jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists analytics_restaurant_created_idx
  on public.analytics_events (restaurant_id, created_at desc);

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events
  for insert to anon, authenticated with check (true);

drop policy if exists "analytics read authenticated" on public.analytics_events;
create policy "analytics read authenticated" on public.analytics_events
  for select to authenticated using (true);

-- =============================================================================
-- Storage: bucket 'photos'
-- =============================================================================
-- Bucket público (URLs servidas via getPublicUrl).
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Policies (schema storage). Idempotentes.
drop policy if exists "photos storage read" on storage.objects;
create policy "photos storage read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "photos storage insert" on storage.objects;
create policy "photos storage insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'photos');

drop policy if exists "photos storage delete" on storage.objects;
create policy "photos storage delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'photos');
