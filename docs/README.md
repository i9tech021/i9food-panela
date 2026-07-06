# Documentação — Panela da Roça

Estado auditado em **2026-07-06**. Fonte da verdade da arquitetura,
dados e decisões. `HANDOFF.md` (na raiz) é o resumo prático de onboarding.

## Referência canônica
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — camadas e fronteiras.
- [`DATABASE.md`](./DATABASE.md) — tabelas, storage, índices (visão narrada).
- [`database/0000_baseline.sql`](./database/0000_baseline.sql) — schema real, idempotente.
- [`SECURITY.md`](./SECURITY.md) — RLS, sessão, rate-limit, riscos vivos.
- [`ENVIRONMENT.md`](./ENVIRONMENT.md) — variáveis, secrets, rodar local.
- [`DEPLOY.md`](./DEPLOY.md) — ambientes e fluxo de publish.
- [`RUNBOOK.md`](./RUNBOOK.md) — o que fazer quando algo quebra.
- [`MULTITENANCY.md`](./MULTITENANCY.md) — como o `slug` propaga.
- [`WHITE_LABEL.md`](./WHITE_LABEL.md) — rebrand manual e alvo desejado.
- [`FEATURE_GUIDE.md`](./FEATURE_GUIDE.md) — receita para adicionar features.
- [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) — regras específicas do projeto.
- [`CHANGELOG.md`](./CHANGELOG.md) — histórico.

## ADRs
- [`adr/ADR-001-dual-supabase-client.md`](./adr/ADR-001-dual-supabase-client.md) — dois projetos Supabase.
- [`adr/ADR-004-user-roles.md`](./adr/ADR-004-user-roles.md) — proposta de roles admin.

## Reescrito (auditoria)
- [`05-rotas.md`](./05-rotas.md), [`07-preparado-para-backend.md`](./07-preparado-para-backend.md),
  [`08-checklist-backend.md`](./08-checklist-backend.md), [`09-divida-tecnica.md`](./09-divida-tecnica.md),
  [`10-roadmap.md`](./10-roadmap.md).

## Descritivo (ainda válido)
- [`01-visao-geral.md`](./01-visao-geral.md), [`02-arquitetura-frontend.md`](./02-arquitetura-frontend.md),
  [`03-design-system.md`](./03-design-system.md), [`04-componentes.md`](./04-componentes.md),
  [`06-fluxos.md`](./06-fluxos.md).
