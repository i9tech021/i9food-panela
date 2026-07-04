import { Link } from "@tanstack/react-router";
import { Heart, Flame, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/hub/types";
import { getReactions, setReactions, timeAgo } from "@/lib/hub/utils";
import { reactToPhoto } from "@/lib/hub/api";

interface Props {
  photo: Photo;
  restaurantSlug: string;
  priority?: boolean;
  /** aspect ratio class for the image */
  aspect?: string;
}

export function PhotoTile({ photo, restaurantSlug, priority = false, aspect = "aspect-[4/3]" }: Props) {
  const [state, setState] = useState({
    like: false,
    want: false,
    likes: photo.likes,
    wants: photo.wants,
  });

  useEffect(() => {
    const r = getReactions()[photo.id] ?? {};
    setState((s) => ({ ...s, like: !!r.like, want: !!r.want }));
  }, [photo.id]);

  const toggle = async (kind: "like" | "want") => {
    const map = getReactions();
    const cur = map[photo.id] ?? {};
    const wasOn = !!cur[kind];
    map[photo.id] = { ...cur, [kind]: !wasOn };
    setReactions(map);
    const delta = wasOn ? -1 : 1;
    setState((s) => ({
      ...s,
      [kind]: !wasOn,
      [kind === "like" ? "likes" : "wants"]:
        (kind === "like" ? s.likes : s.wants) + delta,
    }));
    await reactToPhoto(photo.id, kind, delta as 1 | -1);
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <Link
        to="/$slug/foto/$photoId"
        params={{ slug: restaurantSlug, photoId: photo.id }}
        className="relative block overflow-hidden"
      >
        <img
          src={photo.url}
          alt={photo.caption ?? "Momento no restaurante"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("w-full object-cover transition-transform duration-700 hover:scale-[1.03]", aspect)}
        />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-[color:var(--cream)] backdrop-blur">
          {timeAgo(photo.createdAt)}
        </span>
        {photo.status === "featured" && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)]/95 px-2 py-1 text-[10px] font-medium text-primary">
            <Sparkles className="size-3" /> Destaque
          </span>
        )}
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2 text-sm">
        <ReactionButton
          on={state.like}
          count={state.likes}
          onClick={() => toggle("like")}
          icon={<Heart className={cn("size-4", state.like && "fill-current")} />}
          label="Curtir"
        />
        <ReactionButton
          on={state.want}
          count={state.wants}
          onClick={() => toggle("want")}
          icon={<Flame className={cn("size-4", state.want && "fill-current")} />}
          label="Quero experimentar"
          tone="accent"
        />
      </div>
    </figure>
  );
}

function ReactionButton({
  on,
  count,
  onClick,
  icon,
  label,
  tone = "default",
}: {
  on: boolean;
  count: number;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: "default" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
        on
          ? tone === "accent"
            ? "text-[color:var(--copper)]"
            : "text-[color:var(--terracotta)]"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
  );
}
