import { Link } from "@tanstack/react-router";
import {
  Camera,
  MapPin,
  CalendarCheck,
  PartyPopper,
  Star,
  Instagram,
  Briefcase,
  MessageCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { HubLink } from "@/lib/hub/types";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  "map-pin": MapPin,
  "calendar-check": CalendarCheck,
  sparkles: PartyPopper,
  star: Star,
  instagram: Instagram,
  briefcase: Briefcase,
  "message-circle": MessageCircle,
  clock: Clock,
};

interface Props {
  link: HubLink;
  internalTo?: string;
  onTrack?: (key: string) => void;
  emphasize?: boolean;
}

export function HubCard({ link, internalTo, onTrack, emphasize }: Props) {
  const Icon = ICONS[link.icon] ?? PartyPopper;

  const base = cn(
    "group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border p-3 text-center transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    emphasize
      ? "border-[color:var(--copper)] bg-[color:var(--copper)]/10 shadow-[var(--shadow-soft)]"
      : "border-border bg-card hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]",
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-8 transition-transform group-hover:scale-110",
          emphasize ? "text-[color:var(--copper)]" : "text-primary",
        )}
        strokeWidth={1.75}
      />
      <span
        className={cn(
          "font-sans text-[13px] leading-tight",
          emphasize ? "text-primary font-medium" : "text-primary",
        )}
      >
        {link.label}
      </span>
    </>
  );

  if (internalTo) {
    return (
      <Link to={internalTo} onClick={() => onTrack?.(link.key)} className={base}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onTrack?.(link.key)}
      className={base}
    >
      {content}
    </a>
  );
}
