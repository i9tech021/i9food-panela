import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, X } from "lucide-react";

import {
  getRestaurantBySlug,
  listPhotos,
  setPhotoStatus,
  subscribe,
} from "@/lib/hub/api";
import type { Photo, PhotoStatus, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/admin/moderacao")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Moderação" }] }),
  component: ModeracaoPage,
});

type Tab = "pending" | "approved" | "featured" | "rejected";

function ModeracaoPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [tab, setTab] = useState<Tab>("pending");
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!restaurant) return;
    const load = async () => setPhotos(await listPhotos({ restaurantId: restaurant.id }));
    load();
    return subscribe(load);
  }, [restaurant]);

  if (!restaurant) return <NotFoundRestaurant />;

  const list = photos.filter((p) => p.status === tab);
  const counts = {
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    featured: photos.filter((p) => p.status === "featured").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
  };

  const act = async (id: string, status: PhotoStatus) => {
    await setPhotoStatus(id, status);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pendentes" },
    { key: "approved", label: "Aprovadas" },
    { key: "featured", label: "Destaques" },
    { key: "rejected", label: "Rejeitadas" },
  ];

  return (
    <AdminShell restaurant={restaurant} title="Moderação">
      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
            <span className="ml-2 rounded-full bg-background/40 px-2 py-0.5 text-[10px] tabular-nums">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="font-display text-xl">Nada por aqui.</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Quando novas fotos chegarem, elas aparecem nesta fila.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((photo) => (
            <article key={photo.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={photo.url} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
              <div className="p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {photo.authorName ?? "Anônimo"} · Mesa {photo.tableCode ?? "—"} · {photo.source?.toUpperCase() ?? "—"}
                </div>
                {photo.caption && (
                  <div className="mt-1 line-clamp-2 text-sm">{photo.caption}</div>
                )}
                <div className="mt-3 flex gap-2">
                  <IconBtn onClick={() => act(photo.id, "approved")} label="Aprovar" tone="ok">
                    <Check className="size-4" />
                  </IconBtn>
                  <IconBtn onClick={() => act(photo.id, "featured")} label="Destacar" tone="accent">
                    <Sparkles className="size-4" />
                  </IconBtn>
                  <IconBtn onClick={() => act(photo.id, "rejected")} label="Rejeitar" tone="danger">
                    <X className="size-4" />
                  </IconBtn>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function IconBtn({
  onClick,
  label,
  tone,
  children,
}: {
  onClick: () => void;
  label: string;
  tone: "ok" | "accent" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1 rounded-full border py-2 text-xs transition-colors",
        tone === "ok" && "border-[color:var(--copper)]/40 text-[color:var(--copper)] hover:bg-[color:var(--copper)]/10",
        tone === "accent" && "border-[color:var(--gold)]/50 text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10",
        tone === "danger" && "border-destructive/40 text-destructive hover:bg-destructive/10",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}