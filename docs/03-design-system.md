# 3. Design System

## Tipografia
- **Display / Serif**: `DM Serif Display` (títulos, hero).
- **Sans**: `Fira Sans` (400/500/600/700) — corpo/UI.
- Ambas via Google Fonts em `__root.tsx`.
- Utilitário: `font-display` para serif; sans é o default.
- Padrão: `text-balance` em títulos, tracking apertado, respiro amplo.

## Paleta de cores
Tokens semânticos em `src/styles.css` (variáveis CSS + `@theme`).

**Base (shadcn)**: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`.

**Marca**: `--wood`, `--cream`, `--copper`, `--gold`, `--sage`.

**Accents dos Action Cards**: `--whatsapp`, `--instagram-a/b/c`, `--maps-red`, `--google-yellow`, `--jobs-blue`, `--events-orange`.

Dark mode: variáveis presentes, produto opera em tema claro dominante.

## Espaçamentos
- Escala Tailwind default (4px base).
- Shell principal: `max-w-md mx-auto` + `pb-[env(safe-area-inset-bottom)]`.
- Grid de Action Cards: `grid-cols-2 gap-3`.
- Raios: `rounded-2xl`/`rounded-3xl`, sombras suaves.

## Componentes reutilizáveis
- **Botões**: `components/ui/button.tsx` (default, secondary, outline, ghost, destructive; sizes sm/default/lg/icon).
- **Cards**: `ActionCard`, `HoursCard`, `HubCard` (legado), `PhotoTile`, shadcn `Card`.
- **Inputs**: shadcn `Input`, `Textarea`, `Select`, `Label`, `Form` (RHF).
- **Feedback**: `sonner` toasts, `Skeleton`, `EmptyState`.
- **Overlays**: `Sheet` (usado por `SideDrawer`), `Dialog`, `AlertDialog`.

## Estados
- **Hover**: elevação sutil + framer-motion `whileHover`.
- **Active**: `whileTap` scale-down + ripple em `ActionCard`.
- **Loading**: skeleton shimmer (shadcn `Skeleton`).
- **Empty**: `EmptyState` com BrandMark + CTA (galeria e eventos).
- **Erro**: `ErrorComponent` global + `NotFoundRestaurant` para tenant inválido.

## Responsividade
- Mobile-first (390px baseline).
- Shell `max-w-md`, safe-area iOS.
- Grid da galeria: `grid-cols-2 sm:grid-cols-3`.

## Motion
- Fade/slide-up no mount.
- Hover elevado + tap scale nos cards.
- Drawer com spring.
- Ripple discreto nos Action Cards.
- Ponto pulsante em `StatusDot`.

## Ícones (lucide-react)
Utensils, MapPin, Calendar, Star, Instagram, MessageCircle, Briefcase, Camera, Heart, Share2, ChevronRight, ArrowLeft, Menu, X, Clock, Plus, Upload, Check, Settings, Users, Image, Trash, Edit, Filter, Search.