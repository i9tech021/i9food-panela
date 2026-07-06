# WHITE_LABEL

Como o produto foi pensado para ser rebrandeado para outros restaurantes.

## O que já é white-label
- Todo conteúdo institucional está em `src/config/restaurant.config.ts`
  (nome, tagline, endereço, contatos, links, horários, features).
- Rotas são multi-tenant por `slug`.
- Assets (hero, logo) referenciados por caminho (CDN Lovable).
- Design tokens em `src/styles.css` — trocar paleta = editar variáveis CSS.

## O que ainda não é
- **Editor de tema por tenant** — hoje tokens são globais.
- **Upload de hero/logo pelo admin** — hoje precisa ser trocado no repositório ou banco.
- **Onboarding self-service** — não existe rota para criar novo tenant.
- **Isolamento de dados por tenant** — RLS não filtra por tenant (aplicação-nível).

## Passos para rebrandear (hoje, manual)
1. Substituir os assets em `src/assets/` (`hub-cover.webp.asset.json`, `logo-panela.png.asset.json`) ou fazer novo upload no CDN Lovable e trocar a URL.
2. Editar `RESTAURANT_CONFIG` inteiro em `src/config/restaurant.config.ts`.
3. Ajustar paleta em `src/styles.css` (tokens `--wood`, `--cream`, `--copper`, etc.).
4. Atualizar `public/manifest.webmanifest` (nome, cor, ícones).
5. Atualizar linha em `public.restaurants` para bater com o slug novo.

## Alvo desejado (roadmap)
- Admin master (Lovable-side) cria tenants.
- Cada tenant tem paleta + assets no banco.
- Rota `/` faz redirect por domínio → slug (multi-domain).
- Editor de conteúdo por tenant (Action Cards por restaurante).
