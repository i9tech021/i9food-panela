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
  const open = isOpenNow(restaurant);
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
        "flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color:var(--copper)]/12 text-[color:var(--copper)]">
        <Clock className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              open
                ? "bg-[color:var(--whatsapp)] animate-pulse"
                : "bg-muted-foreground/60",
            )}
            aria-hidden
          />
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {open ? "Aberto agora" : "Fechado agora"}
          </span>
        </div>
        <div className="mt-1 space-y-0.5">
          {groups.map((g, i) => {
            const label =
              g.days.length === 1
                ? WEEKDAY_LABELS[g.days[0]]
                : `${WEEKDAY_LABELS[g.days[0]]} a ${WEEKDAY_LABELS[g.days[g.days.length - 1]]}`;
            return (
              <div
                key={i}
                className="flex items-baseline justify-between gap-2 text-[13px] text-primary"
              >
                <span className="truncate">{label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {g.open} — {g.close}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Almoço caseiro</div>
      </div>
    </div>
  );
}
