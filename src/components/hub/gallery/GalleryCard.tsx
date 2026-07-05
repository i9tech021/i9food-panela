import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { Photo } from "@/lib/hub/types";
import { cn } from "@/lib/utils";
import { getReactions, setReactions } from "@/lib/hub/utils";
import { reactToPhoto } from "@/lib/hub/api";

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
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(photo.likes);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const r = getReactions()[photo.id] ?? {};
    setLiked(!!r.like);
  }, [photo.id]);

  useEffect(() => {
    setLikes(photo.likes);
  }, [photo.likes]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const map = getReactions();
    const cur = map[photo.id] ?? {};
    const wasOn = !!cur.like;
    const delta = wasOn ? -1 : 1;
    // Optimistic UI
    map[photo.id] = { ...cur, like: !wasOn };
    setReactions(map);
    setLiked(!wasOn);
    setLikes((n) => Math.max(0, n + delta));
    if (!wasOn) setPulse((p) => p + 1);
    setPending(true);
    try {
      await reactToPhoto(photo.id, "like", delta as 1 | -1);
    } catch (err) {
      // Rollback on failure
      map[photo.id] = { ...cur, like: wasOn };
      setReactions(map);
      setLiked(wasOn);
      setLikes((n) => Math.max(0, n - delta));
      toast.error("Não foi possível registrar a curtida. Tente de novo.");
      console.warn("[GalleryCard] like failed", err);
    } finally {
      setPending(false);
    }
  };

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
        <div className="relative aspect-square w-full overflow-hidden">
          {!imgLoaded && (
            <div
              aria-hidden
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-muted"
            />
          )}
          <img
            src={photo.url}
            alt={photo.caption ?? "Momento no Panela"}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            className={cn(
              "h-full w-full object-cover object-center transition-[transform,opacity] duration-500 group-hover:scale-[1.03]",
              imgLoaded ? "opacity-100" : "opacity-0",
            )}
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
          <motion.button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? "Descurtir" : "Curtir"}
            aria-pressed={liked}
            disabled={pending}
            whileTap={{ scale: 0.88 }}
            className={cn(
              "absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-medium text-[color:var(--cream)] backdrop-blur transition-colors disabled:opacity-70",
              liked && "text-[color:var(--terracotta)]",
            )}
          >
            <motion.span
              key={pulse}
              initial={{ scale: 1 }}
              animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="inline-flex"
            >
              <Heart className={cn("size-3.5", liked && "fill-current")} />
            </motion.span>
            {likes > 0 && <span className="tabular-nums">{likes}</span>}
          </motion.button>
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
