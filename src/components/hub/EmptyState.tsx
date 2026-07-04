import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Empty state elegante com marca do restaurante. Reutilizável em
 * galeria, eventos, upload, etc.
 */
export function EmptyState({ title, description, action, icon, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative mx-auto flex max-w-md flex-col items-center overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-10 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {/* soft radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -top-16 h-32 rounded-full bg-[color:var(--copper)]/10 blur-3xl"
      />
      <div className="relative">
        {icon ?? <BrandMark size={48} plate />}
      </div>
      <h3 className="relative mt-5 font-display text-2xl leading-tight text-primary text-balance">
        {title}
      </h3>
      {description && (
        <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-balance">
          {description}
        </p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </motion.div>
  );
}
