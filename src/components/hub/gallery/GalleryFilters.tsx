import { useState } from "react";
import { cn } from "@/lib/utils";

export type FilterKey = "recentes" | "curtidas" | "destaques" | "colecoes";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "recentes", label: "Recentes" },
  { key: "curtidas", label: "Mais curtidas" },
  { key: "destaques", label: "Destaques" },
  { key: "colecoes", label: "Coleções" },
];

interface Props {
  value?: FilterKey;
  onChange?: (key: FilterKey) => void;
  className?: string;
}

/**
 * Filtros da galeria. Puramente visual nesta etapa — quando o backend
 * chegar, basta ligar `value` ao estado externo.
 */
export function GalleryFilters({ value, onChange, className }: Props) {
  const [internal, setInternal] = useState<FilterKey>("recentes");
  const active = value ?? internal;
  const handle = (k: FilterKey) => {
    if (onChange) onChange(k);
    else setInternal(k);
  };

  return (
    <div
      role="tablist"
      aria-label="Filtros da galeria"
      className={cn(
        "no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4",
        className,
      )}
    >
      {FILTERS.map((f) => {
        const isActive = f.key === active;
        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => handle(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 type-button transition-all",
              isActive
                ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                : "border-border bg-card text-muted-foreground hover:border-[color:var(--copper)]/40 hover:text-primary",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
