import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Sparkles } from "lucide-react";

import { getRestaurantBySlug, listEvents } from "@/lib/hub/api";
import type { HubEvent, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { HubHeader } from "@/components/hub/Header";
import { EmptyState } from "@/components/hub/EmptyState";
import { BottomNav } from "@/components/hub/BottomNav";
import { SideDrawer, useDrawer } from "@/components/hub/SideDrawer";

export const Route = createFileRoute("/$slug/eventos")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant)
      return { restaurant: null as Restaurant | null, events: [] as HubEvent[] };
    const events = await listEvents(restaurant.id);
    return { restaurant: restaurant as Restaurant | null, events };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Eventos · ${loaderData?.restaurant?.name ?? "Panela da Roça"}` },
      {
        name: "description",
        content: "Programação de eventos e experiências especiais do Panela da Roça.",
      },
    ],
  }),
  component: EventosPage,
});

function EventosPage() {
  const { restaurant, events } = Route.useLoaderData() as {
    restaurant: Restaurant | null;
    events: HubEvent[];
  };
  const { open, openDrawer, closeDrawer } = useDrawer();

  if (!restaurant) return <NotFoundRestaurant />;

  return (
    <main className="min-h-screen bg-background pb-32">
      <HubHeader restaurant={restaurant} title="Eventos" onOpenMenu={openDrawer} />

      <div className="mx-auto max-w-3xl px-4 pt-10">
        {events.length === 0 ? (
          <EmptyState
            icon={
              <span className="grid size-16 place-items-center rounded-2xl bg-[color:var(--events-orange)]/12 text-[color:var(--events-orange)]">
                <Sparkles className="size-8" strokeWidth={1.5} />
              </span>
            }
            title="Em breve."
            description="Estamos preparando experiências especiais na casa. Acompanhe pelo Instagram para não perder nada."
            action={
              <a
                href={restaurant.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--copper)] px-5 py-3 text-sm font-medium text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
              >
                <Instagram className="size-4" />
                Seguir {restaurant.instagramHandle}
              </a>
            }
          />
        ) : (
          <ul className="space-y-4">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--events-orange)]">
                  {new Date(ev.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                  })}
                </div>
                <h3 className="mt-1 font-display text-xl text-primary">{ev.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{ev.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SideDrawer open={open} onClose={closeDrawer} restaurant={restaurant} />
      <BottomNav slug={restaurant.slug} active="events" onMore={openDrawer} />
    </main>
  );
}
