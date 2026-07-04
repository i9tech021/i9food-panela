import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ImageIcon,
  Sparkles,
  Settings,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Restaurant } from "@/lib/hub/types";

const NAV: { label: string; to: "/$slug/admin" | "/$slug/admin/moderacao" | "/$slug/admin/conteudo" | "/$slug/admin/config"; icon: LucideIcon; keyMatch: string }[] = [
  { label: "Visão geral", to: "/$slug/admin", icon: LayoutDashboard, keyMatch: "admin-home" },
  { label: "Moderação", to: "/$slug/admin/moderacao", icon: ImageIcon, keyMatch: "/moderacao" },
  { label: "Conteúdo", to: "/$slug/admin/conteudo", icon: Sparkles, keyMatch: "/conteudo" },
  { label: "Configurações", to: "/$slug/admin/config", icon: Settings, keyMatch: "/config" },
];

export function AdminShell({
  restaurant,
  children,
  title,
  action,
}: {
  restaurant: Restaurant;
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (match: string) => {
    if (match === "admin-home") return pathname === `/${restaurant.slug}/admin`;
    return pathname.includes(match);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b md:border-b-0 md:border-r border-border bg-sidebar px-3 py-6">
          <div className="px-2 pb-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--copper)]">
              i9 Food OS
            </div>
            <div className="font-display text-lg leading-tight">{restaurant.name}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              Restaurante & Churrascaria
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.keyMatch);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  params={{ slug: restaurant.slug }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden md:block border-t border-border pt-4 px-2">
            <Link
              to="/$slug"
              params={{ slug: restaurant.slug }}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver Hub <ExternalLink className="size-3" />
            </Link>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex items-center justify-between border-b border-border px-6 md:px-8 py-5">
            <h1 className="font-display text-2xl leading-none">{title}</h1>
            <div>{action}</div>
          </header>
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}