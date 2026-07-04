# 8. Checklist do Backend

> Nada abaixo está implementado. Lista canônica do que falta para tirar o produto do estado mock.

## Infra & tenant
- [ ] Tabela `restaurants` (+ seed do Panela da Roça) com RLS pública leitura.
- [ ] Multi-tenant real por `slug` (hoje só existe um).
- [ ] Bucket `hub-photos` (Storage) com política pública leitura, upload autenticado/anon com rate-limit.

## Autenticação
- [ ] Supabase Auth: e-mail/senha + Google OAuth para admin.
- [ ] Tabela `user_roles` (`admin`, `editor`) + função `has_role`.
- [ ] Migrar `/$slug/admin/*` para `_authenticated/` gate.
- [ ] Bearer attacher já preparado em `src/integrations/supabase/auth-attacher.ts` (não registrado ainda em `start.ts`).

## Fotos / Galeria
- [ ] Tabela `photos` (status, likes, wants, tableCode, source, author, caption).
- [ ] Upload direto do client para Storage (signed URL) — substituir `URL.createObjectURL`.
- [ ] Trigger para thumbnails / compressão (opcional).
- [ ] Regra de moderação: novo upload nasce `pending`? (decisão de produto).

## Reações
- [ ] Tabela `photo_reactions (photo_id, actor_id, kind)`.
- [ ] View/trigger para contadores denormalizados em `photos.likes` / `photos.wants`.
- [ ] Anti-spam (rate-limit / device fingerprint / captcha).

## Ações do Hub
- [ ] Tabela `hub_actions` (order, key, label, description, icon, accent, kind, href, enabled).
- [ ] CRUD via `/$slug/admin/conteudo`.

## Eventos
- [ ] Tabela `events` + CRUD admin.
- [ ] Página pública popular.

## Analytics
- [ ] Tabela `analytics_events` (append-only, particionada).
- [ ] Ingestão via edge function (evitar RLS spam pelo client).
- [ ] Dashboard admin com queries reais (visits, uploads, likes, top links, tráfego por QR/NFC).

## QR / NFC
- [ ] URLs com `?src=qr|nfc&table=NN` já suportadas em `TrafficSource`/`tableCode` — falta gerador de QR + persistência dos códigos por mesa.

## Configurações do restaurante
- [ ] UPDATE seguro (`user_roles = admin`).
- [ ] Upload de hero/logo para Storage.

## Moderação
- [ ] Fila de moderação real (subscription realtime opcional).
- [ ] Ações: aprovar, rejeitar, destacar, excluir + audit log.

## Observabilidade
- [ ] Log de erros (já existe `lovable-error-reporting`, ligar a Sentry ou similar).
- [ ] Métricas de performance PWA.

## Compartilhamento social
- [ ] `og:image` dinâmico por foto (edge function que renderiza cover).

## E-mail transacional (futuro)
- [ ] Confirmação de reserva / candidatura via Resend/etc.