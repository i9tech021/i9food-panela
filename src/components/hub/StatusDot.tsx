import { cn } from "@/lib/utils";

export function StatusDot({ open, className }: { open: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs uppercase tracking-widest", className)}>
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full shadow-sm",
          open ? "bg-[color:var(--copper)]" : "bg-muted-foreground/60",
          open && "animate-pulse",
        )}
      />
      {open ? "Aberto agora" : "Fechado"}
    </span>
  );
}