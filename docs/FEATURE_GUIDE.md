# FEATURE_GUIDE

Receita para adicionar features novas sem quebrar o padrão.

## Nova rota pública
1. Criar `src/routes/$slug.nova-rota.tsx` (dot-notation).
2. `createFileRoute("/$slug/nova-rota")` — sem trailing slash.
3. Se precisar de dados do restaurante, ler via `Route.useRouteContext()` (via loader do pai `$slug.tsx`).
4. Adicionar entrada em `SEED_ACTIONS` (`kind: "internal"`, `internalTo: "/$slug/nova-rota"`) — vai aparecer no hub.
5. Atualizar `docs/05-rotas.md`.

## Nova rota admin
Mesma receita, prefixo `$slug.admin.foo.tsx`. O gate do `$slug.admin.tsx` cobre. Atualizar `docs/05-rotas.md`.

## Nova tabela
1. Escrever migration idempotente em `docs/database/NNNN_descricao.sql`.
   - `CREATE TABLE IF NOT EXISTS public.<name>(...)`.
   - `GRANT` explícito (ver baseline).
   - `ENABLE ROW LEVEL SECURITY`.
   - `CREATE POLICY`. Escritas admin → `has_role(auth.uid(),'admin')` (assumindo ADR-004 aplicado).
2. Aplicar manualmente no SQL Editor do projeto externo.
3. Estender tipo em `src/lib/hub/types.ts`.
4. Estender `src/lib/hub/api.ts` com `list*/create*/update*/delete*`.
5. Atualizar `docs/07-preparado-para-backend.md` e `docs/DATABASE.md`.

## Novo campo em tabela existente
1. Migration `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
2. Se o campo é opcional, dar `DEFAULT` sensato.
3. Atualizar `PhotoRow`/`HubActionRow`/etc. em `api.ts`.
4. Atualizar `mapPhoto` (se aplicável).

## Novo Action Card
- Curto: adicionar em `SEED_ACTIONS` até `hub_actions` ser populada por tenant.
- Longo: usar admin `/conteudo`.

## Nova mensagem WhatsApp
- Editar `src/lib/hub/whatsapp.ts` (`WA_MESSAGES`).

## Novo asset
- Upload no CDN Lovable → gerar `*.asset.json` correspondente em `src/assets/`.
- Importar como módulo, nunca hardcodar URL.
