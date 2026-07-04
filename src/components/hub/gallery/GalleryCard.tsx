import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import type { Photo } from "@/lib/hub/types";
import { cn } from "@/lib/utils";

interface Props {
  photo: Photo;
  slug: string;
  priority?: boolean;
  className?: string;
}

/**
 * Card individual da galeria. Componentizado para o dia em que o backend
 * chegar — nenhum consumidor sabe como o card monta a URL de detalhe.
 */
export function GalleryCard({ photo, slug, priority, className }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className={cn("group relative", className)}
    >
      <Link
        to="/$slug/foto/$photoId"
        params={{ slug, photoId: photo.id }}
        className="block overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-soft)] ring-1 ring-border/60 transition-shadow hover:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={photo.url}
            alt={photo.caption ?? "Momento no Panela"}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {photo.status === "featured" && (
            <span className="absolute left-2 top-2 rounded-full bg-[color:var(--gold)]/95 px-2 py-0.5 type-label text-[color:var(--wood)]">
              Destaque
            </span>
          )}
        </div>
        {(photo.authorName || photo.caption) && (
          <div className="px-3 py-2.5">
            {photo.authorName && (
              <div className="type-caption truncate text-primary">
                {photo.authorName}
              </div>
            )}
            {photo.caption && (
              <div className="type-caption truncate">{photo.caption}</div>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
