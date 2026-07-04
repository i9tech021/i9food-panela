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
  { iconWrap: string; icon: string; ring: string; glow: string; badge?: string }
> = {
  copper: {
    iconWrap: "bg-[color:var(--copper)]/12",
    icon: "text-[color:var(--copper)]",
    ring: "ring-[color:var(--copper)]/25",
    glow: "shadow-[0_0_0_1px_color-mix(in_oklab,var(--copper)_15%,transparent)]",
  },
  maps: {
    iconWrap: "bg-[color:var(--maps)]/10",
    icon: "text-[color:var(--maps)]",
    ring: "ring-[color:var(--maps)]/20",
    glow: "",
  },
  gold: {
    iconWrap: "bg-[color:var(--gold)]/25",
    icon: "text-[color:var(--wood)]",
    ring: "ring-[color:var(--gold)]/40",
    glow: "",
  },
  "google-yellow": {
    iconWrap: "bg-[color:var(--google-yellow)]/25",
    icon: "text-[color:var(--google-yellow)]",
    ring: "ring-[color:var(--google-yellow)]/30",
    glow: "",
  },
  instagram: {
    iconWrap:
      "bg-[linear-gradient(135deg,#feda75_0%,#fa7e1e_25%,#d62976_50%,#962fbf_75%,#4f5bd5_100%)]",
    icon: "text-white",
    ring: "ring-[color:var(--instagram)]/25",
    glow: "",
  },
  whatsapp: {
    iconWrap: "bg-[color:var(--whatsapp)]/12",
    icon: "text-[color:var(--whatsapp)]",
    ring: "ring-[color:var(--whatsapp)]/25",
    glow: "",
  },
  "jobs-blue": {
    iconWrap: "bg-[color:var(--jobs-blue)]/10",
    icon: "text-[color:var(--jobs-blue)]",
    ring: "ring-[color:var(--jobs-blue)]/20",
    glow: "",
  },
  "events-orange": {
    iconWrap: "bg-[color:var(--events-orange)]/12",
    icon: "text-[color:var(--events-orange)]",
    ring: "ring-[color:var(--events-orange)]/25",
    glow: "",
  },
  sage: {
    iconWrap: "bg-[color:var(--sage)]/12",
    icon: "text-[color:var(--sage)]",
    ring: "ring-[color:var(--sage)]/25",
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

  const inner = (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-3.5",
        "shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]",
        featured && "col-span-2 p-4",
      )}
    >
      {/* Halo sutil no accent */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-16 h-24 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          accent.iconWrap,
        )}
      />

      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded-xl ring-1",
          featured ? "size-14" : "size-10",
          accent.iconWrap,
          accent.ring,
        )}
      >
        <Icon
          className={cn(featured ? "size-6" : "size-[18px]", accent.icon)}
          strokeWidth={1.75}
        />
      </span>

      <div className="relative min-w-0 flex-1">
        <div
          className={cn(
            "font-medium leading-tight text-primary",
            featured ? "text-[15px]" : "text-[13.5px] line-clamp-2",
          )}
        >
          {action.label}
        </div>
        {action.description && (
          <div className={cn(
            "mt-0.5 text-[11px] leading-snug text-muted-foreground",
            featured ? "" : "line-clamp-1",
          )}>
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
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
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
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      {inner}
    </a>
  );
}
