import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Share2, Heart, Flame } from "lucide-react";

import { getRestaurantBySlug, listPhotos, reactToPhoto } from "@/lib/hub/api";
import type { Photo, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { getReactions, setReactions } from "@/lib/hub/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/foto/$photoId")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant) return { restaurant: null as Restaurant | null, photo: null as Photo | null };
    const photos = await listPhotos({ restaurantId: restaurant.id, status: "public" });
    const photo = photos.find((p) => p.id === params.photoId) ?? null;
    return { restaurant, photo };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.photo?.caption
          ? `${loaderData.photo.caption} · ${loaderData.restaurant?.name ?? ""}`
          : "Momento",
      },
    ],
  }),
  component: FotoPage,
  notFoundComponent: () => <NotFoundRestaurant />,
  errorComponent: () => <NotFoundRestaurant />,
});

function FotoPage() {
  const { restaurant, photo } = Route.useLoaderData() as {
    restaurant: Restaurant | null;
    photo: Photo | null;
  };
  const router = useRouter();
  const [state, setState] = useState({ like: false, want: false, likes: 0, wants: 0 });

  useEffect(() => {
    if (!photo) return;
    const r = getReactions()[photo.id] ?? {};
    setState({ like: !!r.like, want: !!r.want, likes: photo.likes, wants: photo.wants });
  }, [photo]);

  if (!restaurant || !photo) return <NotFoundRestaurant />;

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
      [kind === "like" ? "likes" : "wants"]: (kind === "like" ? s.likes : s.wants) + delta,
    }));
    await reactToPhoto(photo.id, kind, delta as 1 | -1);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.caption ?? restaurant.name, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-10">
      {/* Photo */}
      <section className="relative">
        <img
          src={photo.url}
          alt={photo.caption ?? "Momento"}
          className="aspect-square w-full object-cover sm:aspect-[4/3]"
        />
        <button
          onClick={() => router.history.back()}
          aria-label="Voltar"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-[color:var(--cream)] backdrop-blur"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={share}
          aria-label="Compartilhar"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-[color:var(--cream)] backdrop-blur"
        >
          <Share2 className="size-5" />
        </button>
      </section>

      {/* Sheet */}
      <section className="relative z-10 -mt-6 rounded-t-3xl bg-card px-6 pt-6 pb-8">
        {photo.status === "featured" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--sage)]/20 px-3 py-1 text-xs text-[color:var(--sage)]">
            🌿 Festival da Casa
          </span>
        )}
        {photo.caption && (
          <h1 className="mt-4 font-display text-3xl leading-tight text-primary">
            {photo.caption}
          </h1>
        )}
        {photo.authorName && (
          <p className="mt-3 text-sm text-muted-foreground">
            Compartilhado por <span className="font-medium text-primary">{photo.authorName}</span>
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ActionButton
            on={state.like}
            onClick={() => toggle("like")}
            icon={<Heart className={cn("size-5", state.like && "fill-current")} />}
            label="Curtir"
            count={state.likes}
          />
          <ActionButton
            on={state.want}
            onClick={() => toggle("want")}
            icon={<Flame className={cn("size-5", state.want && "fill-current")} />}
            label="Quero experimentar"
            count={state.wants}
            tone="accent"
          />
        </div>

        <Link
          to="/$slug/galeria"
          params={{ slug: restaurant.slug }}
          className="mt-6 block text-center text-sm text-[color:var(--copper)] hover:underline"
        >
          Ver mais momentos
        </Link>
      </section>
    </main>
  );
}

function ActionButton({
  on,
  onClick,
  icon,
  label,
  count,
  tone = "default",
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  tone?: "default" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all",
        on
          ? tone === "accent"
            ? "border-[color:var(--copper)] bg-[color:var(--copper)]/10 text-[color:var(--copper)]"
            : "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)]"
          : "border-border bg-secondary text-primary hover:border-[color:var(--copper)]/40",
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {count > 0 && <span className="text-xs opacity-70 tabular-nums">{count}</span>}
    </button>
  );
}
