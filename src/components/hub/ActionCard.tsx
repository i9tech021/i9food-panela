import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  CalendarCheck,
  Sparkles,
  Star,
  Instagram,
  Briefcase,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ActionAccent, HubAction } from "@/lib/hub/types";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  "map-pin": MapPin,
  "calendar-check": CalendarCheck,
  sparkles: Sparkles,
  star: Star,
  instagram: Instagram,
  briefcase: Briefcase,
  "message-circle": MessageCircle,
};

const ACCENTS: Record<
  ActionAccent,
  { iconWrap: string; icon: string; ring: string; hoverBg: string; glow: string; badge?: string }
> = {
  copper: {
    iconWrap: "bg-[color:var(--copper)]/12",
    icon: "text-[color:var(--copper)]",
    ring: "ring-[color:var(--copper)]/25",
    hoverBg: "group-hover:bg-[color:var(--copper)]/6 group-active:bg-[color:var(--copper)]/10",
    glow: "shadow-[0_0_0_1px_color-mix(in_oklab,var(--copper)_15%,transparent)]",
  },
  maps: {
    iconWrap: "bg-[color:var(--maps)]/10",
    icon: "text-[color:var(--maps)]",
    ring: "ring-[color:var(--maps)]/20",
    hoverBg: "group-hover:bg-[color:var(--maps)]/5 group-active:bg-[color:var(--maps)]/10",
    glow: "",
  },
  gold: {
    iconWrap: "bg-[color:var(--gold)]/25",
    icon: "text-[color:var(--wood)]",
    ring: "ring-[color:var(--gold)]/40",
    hoverBg: "group-hover:bg-[color:var(--gold)]/8 group-active:bg-[color:var(--gold)]/14",
    glow: "",
  },
  "google-yellow": {
    iconWrap: "bg-[color:var(--google-yellow)]/25",
    icon: "text-[color:var(--google-yellow)]",
    ring: "ring-[color:var(--google-yellow)]/30",
    hoverBg: "group-hover:bg-[color:var(--google-yellow)]/8 group-active:bg-[color:var(--google-yellow)]/14",
    glow: "",
  },
  instagram: {
    iconWrap:
      "bg-[linear-gradient(135deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)]",
    icon: "text-white",
    ring: "ring-[color:var(--instagram)]/25",
    hoverBg: "group-hover:bg-[color:var(--instagram)]/6 group-active:bg-[color:var(--instagram)]/12",
    glow: "",
  },
  whatsapp: {
    iconWrap: "bg-[color:var(--whatsapp)]/12",
    icon: "text-[color:var(--whatsapp)]",
    ring: "ring-[color:var(--whatsapp)]/25",
    hoverBg: "group-hover:bg-[color:var(--whatsapp)]/6 group-active:bg-[color:var(--whatsapp)]/12",
    glow: "",
  },
  "jobs-blue": {
    iconWrap: "bg-[color:var(--jobs-blue)]/10",
    icon: "text-[color:var(--jobs-blue)]",
    ring: "ring-[color:var(--jobs-blue)]/20",
    hoverBg: "group-hover:bg-[color:var(--jobs-blue)]/6 group-active:bg-[color:var(--jobs-blue)]/12",
    glow: "",
  },
  "events-orange": {
    iconWrap: "bg-[color:var(--events-orange)]/12",
    icon: "text-[color:var(--events-orange)]",
    ring: "ring-[color:var(--events-orange)]/25",
    hoverBg: "group-hover:bg-[color:var(--events-orange)]/6 group-active:bg-[color:var(--events-orange)]/12",
    glow: "",
  },
  sage: {
    iconWrap: "bg-[color:var(--sage)]/12",
    icon: "text-[color:var(--sage)]",
    ring: "ring-[color:var(--sage)]/25",
    hoverBg: "group-hover:bg-[color:var(--sage)]/6 group-active:bg-[color:var(--sage)]/12",
    glow: "",
  },
};

interface Props {
  action: HubAction;
  slug: string;
  onTrack?: (key: string) => void;
  /** Card grande em destaque (2 colunas em vez de 1). */
  featured?: boolean;
}

/**
 * ActionCard — cada item do Hub. No futuro cada card pode virar
 * um módulo do i9 Food OS.
 */
export function ActionCard({ action, slug, onTrack, featured }: Props) {
  const Icon = ICONS[action.icon] ?? Sparkles;
  const accent = ACCENTS[action.accent] ?? ACCENTS.copper;

  const inner = featured ? (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative col-span-2 flex min-h-[128px] items-center gap-4 overflow-hidden rounded-2xl border border-[color:var(--copper)]/25 p-4",
        "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--copper)_16%,var(--card))_0%,var(--card)_65%)]",
        "shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-lift)]",
      )}
    >
      {/* Halo animado */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[color:var(--copper)]/20 blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklab,var(--copper)_18%,transparent),transparent_60%)]"
      />

      <span
        className={cn(
          "relative grid size-16 shrink-0 place-items-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105",
          "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--copper)_28%,var(--card)),color-mix(in_oklab,var(--copper)_10%,var(--card)))]",
          "ring-[color:var(--copper)]/35 shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--copper)_60%,transparent)]",
        )}
      >
        <Icon className="size-7 text-[color:var(--copper)]" strokeWidth={1.6} />
      </span>

      <div className="relative min-w-0 flex-1">
        <div className="type-label text-[color:var(--copper)]">Em destaque</div>
        <div className="mt-1 font-display text-[17px] leading-tight text-primary">
          {action.label}
        </div>
        {action.description && (
          <div className="mt-1 text-[12px] leading-snug text-muted-foreground">
            {action.description}
          </div>
        )}
      </div>
    </motion.div>
  ) : (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative flex h-full min-h-[116px] flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-3.5",
        "shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-lift)] hover:border-border",
        accent.hoverBg,
      )}
    >
      {/* halo accent no hover */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70",
          accent.iconWrap,
        )}
      />

      <span
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
          accent.iconWrap,
          accent.ring,
        )}
      >
        <Icon className={cn("size-[20px]", accent.icon)} strokeWidth={1.7} />
      </span>

      <div className="relative mt-3 min-w-0">
        <div className="font-medium leading-tight text-primary text-[13.5px] line-clamp-2">
          {action.label}
        </div>
        {action.description && (
          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-1">
            {action.description}
          </div>
        )}
      </div>
    </motion.div>
  );

  const handleClick = () => onTrack?.(action.key);

  if (action.kind === "internal" && action.internalTo) {
    return (
      <Link
        to={action.internalTo}
        params={{ slug }}
        onClick={handleClick}
        className={cn(
          "block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl",
          featured && "col-span-2",
        )}
      >
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl",
        featured && "col-span-2",
      )}
    >
      {inner}
    </a>
  );
}
