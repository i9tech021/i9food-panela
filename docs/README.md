# Documentação — Panela da Roça Experience

Auditoria congelada do estado atual do projeto. Nada aqui inventa funcionalidade — descreve exclusivamente o que existe no código hoje.

1. [Visão Geral do Produto](./01-visao-geral.md)
2. [Arquitetura Frontend](./02-arquitetura-frontend.md)
3. [Design System](./03-design-system.md)
4. [Componentes](./04-componentes.md)
5. [Rotas](./05-rotas.md)
6. [Fluxos](./06-fluxos.md)
7. [Estrutura preparada para Backend](./07-preparado-para-backend.md)
8. [Checklist do Backend](./08-checklist-backend.md)
9. [Dívida Técnica](./09-divida-tecnica.md)
10. [Roadmap](./10-roadmap.md)

Handoff resumido: [`../HANDOFF.md`](../HANDOFF.md).

---

## Novos (auditoria 2026-07-06)

Reescrita em andamento (ver mensagem de auditoria). Já commitado:

- [`database/`](./database/README.md) — schema real versionado do
  projeto Supabase externo (`0000_baseline.sql`).
- [`adr/`](./adr/README.md) — Architecture Decision Records.
  - [ADR-001 — Dois projetos Supabase](./adr/ADR-001-dual-supabase-client.md)

> Os arquivos numerados `01-…10` refletem a auditoria original e estão
> **parcialmente desatualizados** (ver mensagem prévia). Serão
> substituídos pela nova estrutura (`ARCHITECTURE.md`, `DATABASE.md`,
> `SECURITY.md`, etc.) nos próximos passos.