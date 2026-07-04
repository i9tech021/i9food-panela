## Refinamento visual — Panela da Roça Hub (frontend only)

Sem backend, sem Supabase, sem novas integrações. Toda a camada de dados continua vindo de `src/lib/hub/*` (mock), mas a UI vira produto comercial.

### 1. Fundação de design
- **Nova capa**: usar `Capa_App_sem_slogan.webp` como asset via `lovable-assets`; remover overlay com o texto "Panela da Roça" na home. Aplicar apenas gradiente de leitura na parte inferior.
- **Logomarca**: extrair a marca (arte da capa) como asset dedicado (`brand-mark.png`, PNG transparente gerado) e usá-la discretamente em: menu drawer, footer, empty states (galeria, upload, eventos), loading.
- **Tokens de cor**: manter paleta atual (madeira/creme/cobre/gold/sage) e adicionar `--whatsapp`, `--instagram-a/b/c`, `--maps-red`, `--google-yellow`, `--jobs-blue`, `--events-orange` como tokens em `src/styles.css`. Nada será hardcoded em componentes.
- **Motion**: adicionar `framer-motion` para transições (fade/slide, hover elevado, ripple discreto, skeleton shimmer).

### 2. Modelo de dados mock (Action Cards)
Renomear `HubLink` → `HubAction` em `src/lib/hub/types.ts` (mantendo `HubLink` como alias de tipo para compatibilidade). Cada ação passa a ter `kind: "internal" | "external" | "whatsapp"`, `accent` (token de cor), `descriptionShort`, `descriptionLong` opcional. Mensagens de WhatsApp ficam em `src/lib/hub/whatsapp.ts` (`buildReservationMessage`, `buildJobsMessage`, `buildContactMessage`). Telefone oficial: `+55 22 99945-4932` → `wa.me/5522999454932`. Google review URL: `https://share.google/0lsv4JW8e2ltIj4U9` como placeholder.

Ordem final:
`momentos · como-chegar · reservas · avaliar-google · instagram · whatsapp · trabalhe-conosco · eventos`.

### 3. Home (`/$slug/`)
- Hero full-bleed com a nova capa, sem texto sobreposto. Apenas um chip flutuante inferior com status "Aberto agora / Fechado agora" (mock via `isOpenNow`).
- Sheet inferior com header discreto (marca pequena + selo "Hub").
- Grid 2 colunas de **Action Cards** premium: ícone colorido próprio, título, subtítulo. Sombra suave, hover elevando (framer-motion), pressed state, ripple discreto.
- Bloco "Momentos no Panela" (CTA maior) abaixo do grid — leva para `/momentos`.
- Card "Horário" separado, elegante (ponto pulsante + texto).
- Footer com marca + "Desde 1997 criando momentos ao redor da mesa" + "Powered by i9 Food OS".

### 4. Menu drawer (hamburguer)
- Novo componente `SideDrawer` (Radix Sheet + framer-motion) acionado por botão no `HubHeader`.
- Itens: Home, Momentos, Como Chegar, Reservas, Avaliar no Google, Instagram, WhatsApp, Trabalhe Conosco, Eventos, Sobre (placeholder), Configurações (placeholder — badge "em breve").
- Marca no topo, versão/rodapé "i9 Food OS" em baixo.

### 5. Galeria (`/$slug/galeria` + nova rota `/$slug/momentos` que aponta para o mesmo componente por enquanto)
- Remover todas as fotos mockadas do `SEED_PHOTOS` (array vazio). Manter estrutura de tipos e API para receber dados reais no futuro.
- Empty state ilustrado: marca + copy "Seja o primeiro a compartilhar um momento no Panela." + CTA "Enviar foto" → `/enviar`.
- Skeleton shimmer para estado de loading (mesmo que hoje seja instantâneo).

### 6. Eventos
- Nova rota simples `/$slug/eventos` com estado vazio elegante: "Em breve. Estamos preparando experiências especiais. Acompanhe nosso Instagram." + botão Instagram.
- Ligar Action Card "Eventos" a essa rota.

### 7. Rotas externas / WhatsApp
- Action Cards renderizam `<a target="_blank">` com URL construída no data layer:
  - Como Chegar → `mapsUrl` oficial (usar link do Maps do restaurante — mantemos o atual até receber o URL definitivo).
  - Reservas / Trabalhe Conosco / WhatsApp → cada um usa uma mensagem pré-preenchida distinta (mesmo número, textos diferentes).
  - Avaliar Google → `share.google/0lsv4JW8e2ltIj4U9`.
- Reservas fica visualmente distinto de WhatsApp (accent dourado vs verde).

### 8. Componentes reutilizáveis (`src/components/hub/`)
- `ActionCard.tsx` (substitui `HubCard`) com variantes por accent.
- `SectionHeader.tsx`, `SideDrawer.tsx`, `EmptyState.tsx`, `BrandMark.tsx`, `HoursCard.tsx`, `Ripple.tsx`.
- `PhotoTile` mantido, mas galeria começa vazia.
- Admin continua funcionando (mudanças apenas visuais mínimas onde necessário para não quebrar imports).

### 9. Tipografia
- Manter DM Serif Display + Fira Sans. Reforçar hierarquia (tracking, tamanhos, `text-balance`) e aumentar respiro nas seções principais.

### 10. Responsividade
- Trabalhar mobile-first (390px). Larguras `max-w-md` no shell principal, safe-area no fundo, sem overflow horizontal.

### Deliverable
Ao final: home, galeria (vazia), eventos (vazia), drawer, footer, empty states e action cards com identidade individual — tudo mockado, tudo pronto para receber Supabase depois sem refactor estrutural.

### Notas técnicas
- Instalar apenas `framer-motion`.
- Nenhuma migração de banco, nenhuma edge function, nenhum novo secret.
- `src/lib/hub/api.ts` continua devolvendo os mocks; ao trocar por Supabase depois basta reescrever esse arquivo.
