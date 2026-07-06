# RUNBOOK

Situações reais que já podem ocorrer + o que fazer.

## Upload de foto falha em produção
Sintoma: usuário clica "Enviar", vê toast de erro.

1. Console do browser → erro do Supabase Storage?
2. Verificar policies do bucket `photos` (baseline `0000_baseline.sql`):
   - INSERT em `storage.objects` liberado para `anon`.
3. Verificar RLS de `public.photos` — INSERT liberado para `anon`.
4. Verificar quota do bucket no Supabase externo.

## Foto some da galeria
1. Ver `photos.status` no DB — foi para `rejected`?
2. Ver `photos.featured` — se `false` e o filtro é `featured`, é esperado.
3. Ver a URL persistida em `photos.url` — bucket ainda tem o arquivo? (`storage.objects` no SQL Editor).

## Admin não consegue entrar
1. `useAdminSession` retorna `isAuthenticated=false`?
2. Testar `supabase.auth.signInWithPassword` no console — erro?
3. Reset de senha: SQL Editor do projeto externo → `auth.users` → coluna `encrypted_password` **NÃO** editar direto; usar Auth → Users → "send password recovery".

## Realtime não atualiza
1. `photos` está na publication `supabase_realtime`? (`0000_baseline.sql` garante).
2. `subscribeRealtimePhotos` foi chamado dentro de `useEffect` com cleanup? Sem cleanup, canal duplica e a UI pode piscar (ver `cloud-realtime`).

## Preview quebra ao abrir
1. Console do editor Lovable → erro de build?
2. `curl http://localhost:8080/` responde 200?
3. Recarregar (Ctrl+R). Se persistir, olhar Vite logs.

## Rate-limit falso positivo
Usuário reclama que não conseguiu enviar 3 fotos, mas tem 10/dia.
- `localStorage.getItem('panela.uploads.daily')` — o contador está errado?
- Limpar essa chave no browser dele resolve. Rate-limit é client-side (dívida — ver `SECURITY.md`).

## Perda de sessão admin ao trocar de aba
Esperado: sessão vive em `localStorage` do domínio, `onAuthStateChange`
reage. Se perdeu, provavelmente foi expiração de token (`autoRefreshToken`
está ligado, mas depende da aba estar aberta).
