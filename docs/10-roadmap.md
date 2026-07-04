# 10. Roadmap

## ✅ Concluído
- Fundação visual (paleta, tipografia, tokens semânticos).
- Home do Hub com Action Cards, HoursCard, footer.
- SideDrawer com navegação completa.
- Galeria (com empty state ilustrado).
- Página de detalhe da foto (like, quero, share).
- Upload de foto (mock, publicação instantânea).
- Página de confirmação pós-upload.
- Página de eventos (empty state).
- Admin: dashboard, moderação, conteúdo, config — todos operando sobre mock.
- Multi-tenant por `slug` (rota) — pronto para escalar.
- PWA instalável (manifest + ícones dedicados, apple-touch-icon, theme-color).
- Camada de dados isolada (`src/lib/hub/`) pronta para swap Supabase.

## 🟡 Em andamento
- Auditoria e documentação (este pacote em `docs/`).
- Consolidação de assets (hero webp, logo).

## 🔜 Próximos passos (backend fase 1)
1. Provisionar Supabase (tabelas `restaurants`, `photos`, `hub_actions`, `events`, `photo_reactions`, `analytics_events`, `user_roles`).
2. Migrar `src/lib/hub/api.ts` para Supabase (leitura pública + admin gate).
3. Storage bucket para fotos + upload real.
4. Supabase Auth + role `admin`, mover `/admin/*` para `_authenticated/`.
5. Analytics reais no dashboard.

## 🚀 Futuras versões
- QR/NFC por mesa (geração + tracking `tableCode`/`source`).
- Reservas via formulário nativo (opcional, hoje 100% WhatsApp).
- Página de menu/cardápio digital.
- Sistema de recompensas (curtidas → benefício).
- Multi-idioma (pt-BR / en).
- Notificações push (PWA + web-push).
- Realtime na galeria (novas fotos aparecem sem refresh).
- White-label real: onboarding de novos restaurantes via admin master.
- Integração com sistemas de PDV/estoque (i9 Food OS).
- Editor de temas por tenant (paleta, hero, logo).