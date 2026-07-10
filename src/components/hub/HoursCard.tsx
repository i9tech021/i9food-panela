import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import type { Restaurant } from "@/lib/hub/types";
import { isOpenNow } from "@/lib/hub/utils";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface Props {
  restaurant: Restaurant;
  className?: string;
}

/**
 * Card elegante de horário — no futuro calculará "abre amanhã às Xh"
 * a partir dos dados do backend sem mudança de UI.
 */
export function HoursCard({ restaurant, className }: Props) {
  // Avalia sempre no cliente (evita mismatch com o horário do servidor / SSR em UTC)
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tick = () => setOpen(isOpenNow(restaurant));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [restaurant]);
  const hours = restaurant.openingHours;

  // agrupa dias com mesmo horário
  const groups: Array<{ days: number[]; open: string; close: string }> = [];
  // ordena começando pela segunda-feira (1..6, depois 0 = domingo)
  const ordered = [...hours].sort((a, b) => {
    const oa = a.day === 0 ? 7 : a.day;
    const ob = b.day === 0 ? 7 : b.day;
    return oa - ob;
  });
  for (const h of ordered) {
    const last = groups[groups.length - 1];
    const prev = last?.days[last.days.length - 1];
    const isConsecutive =
      prev !== undefined &&
      ((h.day === prev + 1) || (prev === 6 && h.day === 0));
    if (last && last.open === h.open && last.close === h.close && isConsecutive) {
      last.days.push(h.day);
    } else {
      groups.push({ days: [h.day], open: h.open, close: h.close });
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/50 bg-card/60 backdrop-blur-xl px-4 py-3 shadow-[0_1px_0_oklch(1_0_0/0.6)_inset,0_8px_24px_-12px_oklch(0.22_0.02_55/0.25)]",
        className,
      )}
    >
      <Clock
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            open
              ? "bg-[color:var(--whatsapp)] animate-pulse"
              : "bg-muted-foreground/60",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "text-[11px] uppercase tracking-[0.22em]",
            open ? "text-primary" : "text-muted-foreground",
          )}
        >
          {open ? "Aberto" : "Fechado"}
        </span>
        <span className="truncate text-[12px] text-muted-foreground">
          {groups
            .map((g) => {
              const label =
                g.days.length === 1
                  ? WEEKDAY_LABELS[g.days[0]]
                  : `${WEEKDAY_LABELS[g.days[0]]}–${WEEKDAY_LABELS[g.days[g.days.length - 1]]}`;
              return `${label} · ${g.open}–${g.close}`;
            })
            .join(" · ")}
        </span>
      </div>
    </div>
  );
}
