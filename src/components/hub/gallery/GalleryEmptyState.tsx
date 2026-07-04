import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { BrandMark } from "../BrandMark";

interface Props {
  slug: string;
  /** true → variação com CTA principal (welcome); false → variação compacta pós-grid */
  variant?: "welcome" | "compact";
}

/**
 * Empty state da galeria — sempre convidativo, nunca "site esperando dados".
 * Duas variações: welcome (grande, com CTA) e compact (fita menor no fim da lista).
 */
export function GalleryEmptyState({ slug, variant = "welcome" }: Props) {
  if (variant === "compact") {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-border bg-card/50 px-5 py-6 text-center">
        <p className="type-caption">
          Nenhum momento publicado ainda. O primeiro registro pode ser o seu ❤
        </p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto max-w-md overflow-hidden rounded-[28px] border border-border/70 bg-card px-7 py-10 text-center shadow-[var(--shadow-soft)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -top-20 h-40 rounded-full bg-[color:var(--copper)]/10 blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <BrandMark size={44} plate />
        <div className="type-label mt-5 text-[color:var(--copper)]">
          Galeria da comunidade
        </div>
        <h2 className="type-heading mt-2 text-primary text-balance">
          Ainda sem momentos por aqui.
        </h2>
        <p className="type-body mt-3 max-w-xs text-muted-foreground text-balance">
          Publique a primeira foto e ajude a construir a galeria do Panela.
        </p>

        <Link
          to="/$slug/enviar"
          params={{ slug }}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[color:var(--copper)] px-6 py-3.5 text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 type-button"
        >
          <Camera className="size-4" strokeWidth={1.75} />
          Publicar meu momento
        </Link>
      </div>
    </motion.section>
  );
}
