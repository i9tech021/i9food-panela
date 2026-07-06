# CHANGELOG

Reconstruído a partir do estado atual do repositório em 2026-07-06.
Não retro-datamos entradas específicas — só o histórico daqui pra frente
é canônico.

## [Unreleased]
### Docs
- Reescrita completa da documentação (auditoria 2026-07-06).
- `docs/database/0000_baseline.sql` — schema real versionado.
- `docs/adr/ADR-001-dual-supabase-client.md` — decisão do client duplo.
- `docs/adr/ADR-004-user-roles.md` — proposta de `user_roles` / `has_role`.
- Novos: `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`,
  `MULTITENANCY.md`, `WHITE_LABEL.md`, `ENVIRONMENT.md`, `DEPLOY.md`,
  `RUNBOOK.md`, `CODING_STANDARDS.md`, `FEATURE_GUIDE.md`.
- Reescrita: `docs/05-rotas.md`, `docs/07-preparado-para-backend.md`,
  `docs/08-checklist-backend.md`, `docs/09-divida-tecnica.md`,
  `docs/10-roadmap.md`.

## Baseline — estado no momento da auditoria
- Camada de dados 100% em Supabase externo (`nqdaxllqjnxwxmglbghl`).
- Auth admin: email+senha (sem `user_roles`).
- Storage `photos` público, upload real.
- Realtime `photos` habilitado.
- Rotas: home, galeria, foto, enviar/enviado, eventos, reservas,
  trabalhe-conosco, admin (index, login, moderação, conteúdo, config,
  reservas, currículos).
- Client Lovable Cloud auto-gerado, sem uso ativo.
