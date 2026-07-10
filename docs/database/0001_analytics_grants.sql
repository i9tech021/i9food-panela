-- =============================================================================
-- 0001 — Reforço de GRANTs / policies para analytics + leitura no admin
--
-- Motivo: em produção observamos 403 (`permission denied for table ...`) em
-- requests do role `authenticated` para `analytics_events`, `photos` e
-- `restaurants`. O baseline já contém os grants corretos, mas o schema em
-- runtime divergiu (grants nunca foram reaplicados). Este arquivo é
-- idempotente e pode ser rodado no SQL Editor do projeto externo
-- (nqdaxllqjnxwxmglbghl) quantas vezes for preciso.
-- =============================================================================

-- analytics_events — insert público (anon+auth) + leitura pelo admin
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all    on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

drop policy if exists "analytics insert public" on public.analytics_events;
create policy "analytics insert public" on public.analytics_events
  for insert to anon, authenticated with check (true);

drop policy if exists "analytics read authenticated" on public.analytics_events;
create policy "analytics read authenticated" on public.analytics_events
  for select to authenticated using (true);

-- restaurants — leitura pública (anon+auth); update fica só para authenticated
grant select on public.restaurants to anon, authenticated;
grant update on public.restaurants to authenticated;
grant all    on public.restaurants to service_role;

-- photos — leitura/escrita conforme baseline (anon+auth)
grant select, insert, update, delete on public.photos to anon, authenticated;
grant all on public.photos to service_role;

-- hub_actions
grant select on public.hub_actions to anon, authenticated;
grant insert, update, delete on public.hub_actions to authenticated;
grant all on public.hub_actions to service_role;

-- events
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;

-- Recarrega o schema cache do PostgREST para os grants entrarem em vigor.
notify pgrst, 'reload schema';