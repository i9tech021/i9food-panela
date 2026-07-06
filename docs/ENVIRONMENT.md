# ENVIRONMENT

## Variáveis
| Nome | Escopo | Onde | Uso hoje |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | build (client) | `.env` gerenciado pelo Lovable Cloud | Client auto-gerado (não usado no produto). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build (client) | `.env` gerenciado | Idem. |
| `VITE_SUPABASE_PROJECT_ID` | build | `.env` gerenciado | — |
| `SUPABASE_URL` | server | secret Lovable | Reservado para `createServerFn` futuras. |
| `SUPABASE_PUBLISHABLE_KEY` | server | secret Lovable | Idem. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | secret Lovable | Nunca no client. Reservado. |
| `SUPABASE_DB_URL` | server | secret Lovable | Reservado. |
| `LOVABLE_API_KEY` | server | secret Lovable | Reservado (AI Gateway). |

**Anon key do Supabase externo** vive **hardcoded** em
`src/integrations/external-supabase/client.ts` — decisão em ADR-001.
Publishable por design.

## Rodar localmente
```bash
bun install
bun run dev       # http://localhost:8080
bun run build     # build produção (edge)
```

O `.env` é montado pelo Lovable Cloud automaticamente ao clonar via
Lovable. Fora do Lovable, criar `.env.local` com `VITE_SUPABASE_URL`
e `VITE_SUPABASE_PUBLISHABLE_KEY` do projeto Lovable Cloud (opcional
enquanto o client auto-gerado não for usado).

## Node / Bun
- Runtime: Bun (desenvolvimento) + Cloudflare Workers (produção).
- Não introduzir deps Node-only. Ver AGENTS/instruções do template.
