import { Link } from "@tanstack/react-router";
import { Home, Camera, Sparkles, MapPin, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  slug: string;
  active?: "home" | "moments" | "events" | "directions" | "more";
  onMore?: () => void;
}

const ITEMS = [
  { key: "home", label: "Início", icon: Home, to: "/$slug" as const },
  { key: "moments", label: "Momentos", icon: Camera, to: "/$slug/galeria" as const },
  { key: "events", label: "Eventos", icon: Sparkles, to: "/$slug/eventos" as const },
] as const;

export function BottomNav({ slug, active, onMore }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-background/55 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),0.25rem)] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)]"
      aria-label="Navegação principal"
    >
      {/* fio de luz cobre no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/60 to-transparent"
      />
      {/* highlight interno superior — reflexo de vidro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/8 to-transparent"
      />
      <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 py-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              to={item.to}
              params={{ slug }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/50",
                isActive ? "text-[color:var(--copper)]" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon
                className={cn("size-5", isActive && "fill-[color:var(--copper)]/10")}
                strokeWidth={1.75}
              />
              <span className={cn(isActive && "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          aria-label="Abrir menu"
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/50",
            active === "more" ? "text-[color:var(--copper)]" : "text-muted-foreground hover:text-primary",
          )}
        >
          <MoreHorizontal className="size-5" strokeWidth={1.75} />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  );
}
