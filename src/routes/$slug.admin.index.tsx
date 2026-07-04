import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Flame, Heart, Users2, TrendingUp, Star } from "lucide-react";

import {
  getRestaurantBySlug,
  listAnalytics,
  listPhotos,
  subscribe,
} from "@/lib/hub/api";
import type { AnalyticsEvent, Photo, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/$slug/admin/")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Visão geral" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (!restaurant) return;
    const load = async () => {
      setPhotos(await listPhotos({ restaurantId: restaurant.id }));
      setEvents(await listAnalytics(restaurant.id));
    };
    load();
    return subscribe(load);
  }, [restaurant]);

  if (!restaurant) return <NotFoundRestaurant />;

  const approved = photos.filter((p) => p.status === "approved" || p.status === "featured");
  const pending = photos.filter((p) => p.status === "pending");
  const totalLikes = photos.reduce((s, p) => s + p.likes, 0);
  const totalWants = photos.reduce((s, p) => s + p.wants, 0);
  const visits = events.filter((e) => e.type === "visit").length;
  const linkClicks = events.filter((e) => e.type === "link_click").length;

  const bySource = {
    qr: events.filter((e) => e.source === "qr").length,
    nfc: events.filter((e) => e.source === "nfc").length,
    direct: events.filter((e) => e.source === "direct" || !e.source).length,
  };

  const topLinks = Object.entries(
    events
      .filter((e) => e.type === "link_click")
      .reduce<Record<string, number>>((acc, e) => {
        const k = String(e.meta?.key ?? "unknown");
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <AdminShell restaurant={restaurant} title="Visão geral">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Users2} label="Visitas" value={visits} hint="Total desde o início" />
        <Metric icon={Camera} label="Momentos aprovados" value={approved.length} hint={`${pending.length} pendentes`} />
        <Metric icon={Heart} label="Curtidas" value={totalLikes} />
        <Metric icon={Flame} label="Quero experimentar" value={totalWants} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Origem do tráfego" icon={TrendingUp}>
          <SourceBar label="QR Code" value={bySource.qr} total={events.length || 1} />
          <SourceBar label="NFC" value={bySource.nfc} total={events.length || 1} />
          <SourceBar label="Direto / outros" value={bySource.direct} total={events.length || 1} />
          <div className="mt-4 text-xs text-muted-foreground">
            {linkClicks} cliques em cartões · {events.length} eventos totais
          </div>
        </Panel>

        <Panel title="Cartões mais clicados">
          {topLinks.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem dados ainda.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {topLinks.map(([k, n]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="capitalize">{k}</span>
                  <span className="tabular-nums text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Últimos momentos">
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt=""
                loading="lazy"
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-full bg-secondary text-[color:var(--copper)]">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg">{title}</h2>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </header>
      {children}
    </section>
  );
}

function SourceBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[color:var(--copper)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}