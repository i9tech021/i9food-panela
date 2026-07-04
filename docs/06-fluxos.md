# 6. Fluxos

Todos os fluxos abaixo já estão implementados na UI, operando sobre a camada mock (`src/lib/hub/api.ts`, persistência em `localStorage`).

## Fluxo 1 — Descoberta e ação rápida
```
QR/NFC → /:slug/ (Home)
         ├─→ Reservas       → wa.me (mensagem pré-preenchida)
         ├─→ Como chegar    → Google Maps
         ├─→ WhatsApp       → wa.me (contato geral)
         ├─→ Avaliar Google → share.google/...
         ├─→ Instagram      → instagram.com/...
         ├─→ Trabalhe conosco → wa.me (mensagem de vaga)
         ├─→ Eventos        → /:slug/eventos
         └─→ Momentos       → /:slug/galeria
```

## Fluxo 2 — Momentos (galeria social)
```
Home → Galeria → [foto] → Detalhe
                              ├─→ Like       (mock: reactToPhoto)
                              ├─→ Quero      (mock: reactToPhoto)
                              └─→ Compartilhar (Web Share API / clipboard)
```

## Fluxo 3 — Upload de foto do cliente
```
Home / Galeria → /:slug/enviar
   → Form (nome opcional, legenda, arquivo)
   → createPhoto (mock: URL.createObjectURL + localStorage)
   → /:slug/enviado (confirmação)
   → CTA "Ver na galeria" → /:slug/galeria
```
> Publicação atualmente **instantânea** (status `approved`). Moderação existe no admin, mas nenhum item nasce `pending` no fluxo mock.

## Fluxo 4 — Admin
```
/:slug/admin
   ├─ Dashboard    (KPIs derivados de analytics mock)
   ├─ Moderação    (aprovar / rejeitar / destacar / excluir)
   ├─ Conteúdo     (editar Action Cards / links)
   └─ Config       (nome, tagline, contatos, horários)
```
> Sem login. Sem persistência remota. Estado vive em `localStorage` (`i9food_hub_state_v1`).

## Fluxo 5 — Estado vazio
```
Galeria sem fotos → GalleryEmptyState → CTA "Enviar foto" → /:slug/enviar
Eventos sem itens → EmptyState (Instagram CTA)
```

## Analytics (mock)
`trackEvent()` é chamado em pontos-chave (visit, link_click, photo_upload, photo_like, photo_want, share) e persistido junto ao estado local. Consumido apenas pelo Dashboard admin.