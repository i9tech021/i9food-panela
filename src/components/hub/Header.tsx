import { Link } from "@tanstack/react-router";
import { ArrowLeft, Menu } from "lucide-react";

import type { Restaurant } from "@/lib/hub/types";
import { BrandMark } from "./BrandMark";

interface Props {
  restaurant: Restaurant;
  backTo?: string;
  title?: string;
  onOpenMenu?: () => void;
  showBrand?: boolean;
}

export function HubHeader({
  restaurant,
  backTo,
  title,
  onOpenMenu,
  showBrand = true,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        {backTo ? (
          <Link
            to={backTo}
            params={{ slug: restaurant.slug }}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={onOpenMenu}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Menu className="size-4" />
          </button>
        )}
        <div className="flex flex-1 items-center justify-center gap-2 min-w-0">
          {showBrand && <BrandMark size={22} plate />}
          <div className="truncate text-center">
            <div className="truncate font-display text-[15px] leading-none">
              {title ?? restaurant.name}
            </div>
            {!title && (
              <div className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground mt-1">
                Experience
              </div>
            )}
          </div>
        </div>
        <span className="size-9" />
      </div>
    </header>
  );
}
