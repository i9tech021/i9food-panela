# DEPLOY

## Ambientes
| Ambiente | URL | Origem |
| --- | --- | --- |
| Preview | `id-preview--cc471df5-e515-40c9-a067-7ae9c0f46a89.lovable.app` | Branch atual do Lovable (auto-deploy a cada mudança). |
| Preview estável | `project--cc471df5-e515-40c9-a067-7ae9c0f46a89-dev.lovable.app` | Mesma origem, URL fixa. |
| Produção | `i9food-panela.lovable.app` | Publicado via Lovable. |
| Produção estável | `project--cc471df5-e515-40c9-a067-7ae9c0f46a89.lovable.app` | URL alternativa fixa. |

## Fluxo
1. Mudança no editor Lovable → preview atualizado (segundos).
2. **Publicar** via UI Lovable → produção.
3. Rollback: publicar versão anterior via UI Lovable.

## Backend
- Supabase externo (`nqdaxllqjnxwxmglbghl`) — **projeto separado**, deploy independente do frontend.
- Mudanças de schema: `docs/database/NNNN_*.sql`, aplicadas manualmente no SQL Editor do projeto externo. Ver ADR-001.
- Supabase Lovable Cloud (`xbqskqnznbjhabymdobh`) — provisionado, sem uso ativo hoje.

## Custom domain
Nenhum configurado. Publicar em domínio próprio: UI Lovable → publish settings.

## Runbook resumido de incidentes
Ver `docs/RUNBOOK.md`.
