# 4. Componentes

> Estado atual = `estável` (funcional, integrado às páginas) salvo indicação contrária.

## Hub público (`src/components/hub/`)

### `Header.tsx`
- **Responsabilidade**: barra superior do hub (logo/marca + botão menu que abre o `SideDrawer`).
- **Props**: `slug: string`, `onOpenMenu?: () => void`.
- **Dependências**: `BrandMark`, `lucide-react` (Menu), TanStack `Link`.
- **Estado**: estável.

### `SideDrawer.tsx`
- **Responsabilidade**: menu lateral (Radix Sheet + framer-motion) com todas as rotas do hub.
- **Props**: `open: boolean`, `onOpenChange(open)`, `slug: string`.
- **Dependências**: `components/ui/sheet`, `BrandMark`, `Link`, `lucide-react`.
- **Estado**: estável. Itens "Sobre" e "Configurações" marcados como "em breve".

### `ActionCard.tsx`
- **Responsabilidade**: card premium de ação (interna, externa ou WhatsApp) com accent color, ícone, título, subtítulo, ripple e motion.
- **Props**: `action: HubAction`, `slug: string`, `onClick?()`.
- **Dependências**: framer-motion, lucide-react, tokens de accent CSS.
- **Estado**: estável — substituto do antigo `HubCard`.

### `HubCard.tsx`
- **Responsabilidade**: card legado (mantido para não quebrar imports antigos).
- **Estado**: **legado** — remover quando admin migrar totalmente para `ActionCard`.

### `HoursCard.tsx`
- **Responsabilidade**: exibe status "Aberto/Fechado agora" com ponto pulsante e próxima abertura.
- **Props**: `hours: OpeningHour[]`.
- **Dependências**: `StatusDot`, `date-fns`, `lib/hub/utils#isOpenNow`.
- **Estado**: estável.

### `StatusDot.tsx`
- **Responsabilidade**: bolinha pulsante colorida (aberto/fechado).
- **Props**: `open: boolean`.
- **Estado**: estável.

### `BrandMark.tsx`
- **Responsabilidade**: renderiza a logomarca em tamanho configurável.
- **Props**: `size?: "sm" | "md" | "lg"`, `className?`.
- **Estado**: estável.

### `EmptyState.tsx`
- **Responsabilidade**: bloco de vazio (marca + título + descrição + CTA opcional).
- **Props**: `title`, `description`, `action?: { label, to } | { label, onClick }`.
- **Estado**: estável.

### `PhotoTile.tsx`
- **Responsabilidade**: card individual de foto com autor, likes/quer, share.
- **Props**: `photo: Photo`, `slug: string`.
- **Dependências**: `lib/hub/api#reactToPhoto`, `sonner`, `Link`.
- **Estado**: estável — leitura/escrita via mock (`api.ts`).

### `BottomNav.tsx`
- **Responsabilidade**: navegação inferior (uso pontual em algumas rotas).
- **Estado**: estável.

### `NotFoundRestaurant.tsx`
- **Responsabilidade**: fallback quando `slug` não resolve para um tenant.
- **Estado**: estável.

## Galeria (`src/components/hub/gallery/`)

### `GalleryGrid.tsx`
- **Props**: `photos: Photo[]`, `slug: string`.
- **Renderiza**: `grid-cols-2 sm:grid-cols-3` de `GalleryCard`.
- **Estado**: estável.

### `GalleryCard.tsx`
- **Props**: `photo: Photo`, `slug: string`, `priority?: boolean`.
- **Estado**: estável.

### `GalleryFilters.tsx`
- **Responsabilidade**: filtros `recent | liked | featured`.
- **Props**: `value`, `onChange(value)`.
- **Estado**: estável.

### `GalleryEmptyState.tsx`
- **Responsabilidade**: empty state ilustrado da galeria.
- **Estado**: estável.

## Admin (`src/components/admin/`)

### `AdminShell.tsx`
- **Responsabilidade**: layout do painel admin (header, tabs, container).
- **Props**: `slug`, `title`, `children`.
- **Estado**: estável, sem autenticação — acesso via URL.

## UI base (`src/components/ui/`)
Biblioteca shadcn/ui completa — componentes usados hoje: `button`, `input`, `textarea`, `label`, `select`, `sheet`, `dialog`, `alert-dialog`, `card`, `skeleton`, `sonner`, `tabs`, `switch`, `form`, `toast`, `separator`, `badge`. Demais componentes disponíveis mas não consumidos.