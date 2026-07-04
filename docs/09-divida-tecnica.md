# 9. Dívida Técnica

## Problemas encontrados
1. **Admin sem autenticação** — `/$slug/admin/*` é acessível por qualquer visitante. Crítico antes de qualquer dado real.
2. **`HubCard.tsx` legado** — coexiste com `ActionCard`. Consolidar.
3. **`config/restaurant.config.ts` vs `seed.ts`** — dois lugares descrevem o restaurante (config estática + seed). Fonte da verdade deve ser única quando o backend chegar.
4. **`URL.createObjectURL` no upload** — a foto some ao dar refresh (blob temporário). Aceitável no mock, mas confunde em demo.
5. **`api.ts` mistura leitura hidratada + persistência** — hydration só ocorre em browser; SSR sempre serve o seed. Comportamento intencional, mas precisa desaparecer com Supabase.
6. **`WhatsApp phone` divergente** — `config/restaurant.config.ts` usa `5522998454932`; comentário do plano cita `5522999454932`. Confirmar número oficial.
7. **Divergências de tokens** — a paleta em `styles.css` inclui accents novos; verificar se todos os componentes consomem apenas via CSS vars (auditar hard-codes de cor).
8. **`components/ui/` inflado** — vários componentes shadcn não usados (accordion, breadcrumb, calendar, carousel, chart, command, menubar, pagination, resizable, sidebar…). Não é crítico, mas pesa em bundle inicial se algum for tree-shakeable falho.
9. **`SEED_PHOTOS` vazio** — galeria demo perde impacto. Considerar 3–5 fotos seed reais para vitrine.
10. **`analytics.trackEvent` sem debounce** — pode inflar localStorage em navegação intensa.
11. **PWA sem service worker próprio** — instalável, mas sem offline/cache real. Somente manifest + ícones.
12. **SEO/OG por rota** — hoje `og:image` está no `__root.tsx` (não recomendado — override em todas as rotas). Mover para leaves relevantes.
13. **`__root.tsx` define og:image fixa** — quebra a diretriz do template (og:image só em leaves).

## Melhorias sugeridas
- Extrair um `useHub()` (React Query) que encapsule `listPhotos`, `listLinks`, `listEvents` e resolva loading/erro consistentemente.
- Padronizar todos os reads via `useSuspenseQuery` (loader + `ensureQueryData`) para preparar SSR.
- Criar `src/config/routes.ts` com constantes de rotas (evitar strings soltas em `Link`).
- Extrair mensagens do WhatsApp para i18n (`src/i18n/pt-BR.ts`).
- Testes de smoke com Playwright (home, upload, galeria, admin).
- Storybook (ou Ladle) para o design system.

## Oportunidades de refatoração
- Remover `HubCard.tsx` após verificar imports.
- Enxugar `components/ui/` (remover não usados quando o produto estabilizar).
- Substituir `localStorage` mock por uma implementação IndexedDB (mais realista quanto ao upload).
- Consolidar `restaurant.config.ts` + `SEED_RESTAURANTS` num único módulo até o backend chegar.
- Migrar `og:image` do `__root.tsx` para as leaves e derivar por foto no detalhe.