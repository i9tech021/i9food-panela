# 10. Roadmap

> Reescrito em 2026-07-06.

## ✅ Concluído
- Fundação visual (paleta, tipografia, tokens semânticos, motion).
- Home do Hub com Action Cards + HoursCard.
- SideDrawer + navegação completa.
- Galeria + detalhe da foto (like/quero/share).
- Upload real com compressão + rate-limit client.
- Página de confirmação pós-upload.
- Rotas Reservas / Trabalhe conosco / Eventos.
- Admin: dashboard, moderação, conteúdo, config, currículos, reservas.
- **Login admin (Supabase Auth email+senha)** com gate client-side.
- **Integração real com Supabase externo** (photos + storage + realtime + analytics).
- PWA instalável.
- Documentação reescrita (auditoria 2026-07-06).

## 🟡 Em andamento
- Reescrita dos docs (SECURITY, ARCHITECTURE, RUNBOOK, ADRs — este pacote).
- Reconciliação de tokens de cor (auditar hard-codes de `text-white`/`bg-black`).

## 🔴 Próximos passos (segurança & fundação — bloqueantes)
1. **ADR-004**: implementar `user_roles` + `has_role('admin')`, restringir RLS de escrita em `photos`/`hub_actions`/`events`/`restaurants` a `has_role('admin')`.
2. **Gate `_authenticated/` real** para admin (não só `useEffect`).
3. **`photo_reactions` + trigger** para matar race condition de like/quero.
4. **Rate-limit server-side** de upload (edge function ou policy com `count(*)` recente).
5. **Tabelas `reservations` e `job_applications`** — capturar leads que hoje só vão para WhatsApp.
6. **`og:image` por rota** (dinâmico em `/foto/:id`).

## 🚀 Produto (após base sólida)
- QR/NFC por mesa + tracking real (`tableCode`, `source`).
- Cardápio digital (rota `/menu`).
- Programa de recompensas (curtidas → benefício).
- Realtime já ligado — expor "novas fotos ao vivo" na galeria.
- White-label real: onboarding de novos tenants via admin master.
- Editor de tema por tenant (paleta, hero, logo).
- Reservas com calendário nativo.
- Notificações push (web-push).
- Integração com PDV / i9 Food OS.
- Multi-idioma (pt-BR / en).

## Reconciliação técnica
- Consolidar em **um único** projeto Supabase (ADR-001) quando o segundo tenant entrar OU quando surgir a primeira `createServerFn` com `requireSupabaseAuth` acessando dados do app.
