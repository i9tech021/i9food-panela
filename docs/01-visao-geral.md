# 1. Visão Geral do Produto

## Objetivo
O **Panela da Roça Experience** é o hub digital do restaurante Panela da Roça (desde 1997). Ele centraliza, em uma URL única (mobile-first), todas as ações que um cliente precisa executar antes, durante e depois da visita: reservar, chegar, avaliar, ver momentos, entrar em contato, candidatar-se a vagas e acompanhar eventos.

## Conceito do Hub Digital
Uma landing page enxuta no formato "linktree premium", com identidade própria (madeira/creme/cobre), acessada via QR/NFC nas mesas e materiais impressos. Cada botão é um **Action Card** com cor e ícone próprios, roteando o usuário para uma rota interna (galeria, upload, eventos) ou externa (WhatsApp, Google Maps, Instagram, Google Reviews).

A arquitetura já nasceu **white label / multi-tenant** por convenção (`/$slug/…`), embora o produto atenda hoje apenas um restaurante.

## Funcionalidades implementadas (estado atual)
- Hub home com hero, grid de Action Cards, card de horário (aberto/fechado agora) e footer.
- Menu lateral (SideDrawer) com navegação completa.
- Galeria de momentos (atualmente com seed vazio — empty state ilustrado).
- Página de detalhe de foto (`/foto/:id`) com like/quero.
- Upload de foto do cliente (form + preview + persistência local).
- Página de confirmação pós-upload.
- Página de eventos (empty state).
- Área administrativa (`/$slug/admin`) com: dashboard, moderação de fotos, edição de conteúdo (links/config) e configuração do restaurante — tudo em cima do mock local.
- PWA instalável (manifest + ícones próprios, apple-touch-icon, theme-color).
- Deep links / rotas SSR-friendly (TanStack Start).

## Fluxo principal do usuário
1. Cliente escaneia QR na mesa → abre `/$slug/`.
2. Vê o hero + status "Aberto agora" e o grid de ações.
3. Escolhe uma ação:
   - **Momentos** → galeria → detalhe da foto → curtir/querer → compartilhar.
   - **Enviar foto** → upload → confirmação.
   - **Como chegar / Reservas / WhatsApp / Trabalhe conosco / Instagram / Avaliar no Google** → abre destino externo com mensagem/URL pré-formatada.
   - **Eventos** → agenda (hoje vazia).
4. Admin acessa `/$slug/admin` para moderar fotos, editar links e ajustar configurações — persistido em `localStorage`.
