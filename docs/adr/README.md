# Architecture Decision Records

Registro curto e datado de decisões arquiteturais **não óbvias** — o
que foi escolhido, o que foi descartado, e por quê. Cada ADR é
imutável: novas decisões substituem antigas por meio de um novo ADR
que referencia a anterior (`Supersedes: ADR-XXX`).

| ADR | Título | Status |
| --- | --- | --- |
| [001](./ADR-001-dual-supabase-client.md) | Dois projetos Supabase (Lovable Cloud + externo) | Aceito — dívida ativa |

## Template

```
# ADR-NNN — Título curto

- **Data:** YYYY-MM-DD
- **Status:** Proposto | Aceito | Substituído por ADR-XXX | Descontinuado
- **Contexto:** o problema real.
- **Decisão:** o que foi feito.
- **Consequências:** trade-offs, dívida gerada, o que muda no dia a dia.
- **Alternativas consideradas:** e por que não.
```
