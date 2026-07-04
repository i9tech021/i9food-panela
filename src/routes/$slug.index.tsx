import { useEffect, useMemo, useState } from "react";
import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";

import { getRestaurantBySlug, listLinks, trackEvent } from "@/lib/hub/api";
import type { HubAction, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { ActionCard } from "@/components/hub/ActionCard";
import { BrandMark } from "@/components/hub/BrandMark";
import { HoursCard } from "@/components/hub/HoursCard";
import { SideDrawer, useDrawer } from "@/components/hub/SideDrawer";
import { BottomNav } from "@/components/hub/BottomNav";

const searchSchema = z.object({
  t: z.string().optional(),
  src: z.enum(["qr", "nfc", "direct", "share"]).optional(),
});

export const Route = createFileRoute("/$slug/")({
  validateSearch: searchSchema,
  beforeLoad: ({ params, search }) => {
    // QR / NFC na mesa → abre direto a tela de publicar momento.
    if (search.src === "qr" || search.src === "nfc") {
      throw redirect({
        to: "/$slug/enviar",
        params: { slug: params.slug },
        search: { t: search.t, src: search.src },
      });
    }
  },
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant)
      return { restaurant: null as Restaurant | null, actions: [] as HubAction[] };
    const actions = (await listLinks(restaurant.id)) as HubAction[];
    return { restaurant: restaurant as Restaurant | null, actions };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.restaurant?.name ?? "Panela da Roça";
    const desc =
      loaderData?.restaurant?.tagline ??
      "Comida de verdade, feita com tradição desde 1997.";
    return {
      meta: [
        { title: `${name} · Experience` },
        { name: "description", content: desc },
        { property: "og:title", content: name },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { restaurant, actions } = Route.useLoaderData() as {
    restaurant: Restaurant | null;
    actions: HubAction[];
  };
  const search = useSearch({ from: "/$slug/" });
  const { open, openDrawer, closeDrawer } = useDrawer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!restaurant) return;
    trackEvent({
      restaurantId: restaurant.id,
      type: "visit",
      source: search.src ?? "direct",
      tableCode: search.t ?? null,
    });
  }, [restaurant, search.src, search.t]);

  const enabled = useMemo(
    () => actions.filter((a) => a.enabled).sort((a, b) => a.order - b.order),
    [actions],
  );

  if (!restaurant) return <NotFoundRestaurant />;

  const track = (key: string) =>
    trackEvent({
      restaurantId: restaurant.id,
      type: "link_click",
      meta: { key },
      source: search.src,
      tableCode: search.t ?? null,
    });

  const [featured, ...rest] = enabled;

  return (
    <main className="relative min-h-screen bg-background pb-24">
      {/* Menu flutuante */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Abrir menu"
        className="fixed left-4 top-4 z-30 inline-flex size-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md ring-1 ring-white/10 transition-colors hover:bg-black/65"
      >
        <MenuBars />
      </button>

      {/* HERO editorial — mobile mostra a fachada inteira, desktop preenche a tela */}
      <section className="relative w-full overflow-hidden bg-[oklch(0.16_0.02_55)] aspect-[16/10] sm:aspect-auto sm:h-[78vh] sm:min-h-[560px]">
        <img
          src={restaurant.heroImage}
          alt={`Fachada do ${restaurant.name}`}
          className="absolute inset-0 h-full w-full object-contain object-center sm:object-cover"
          fetchPriority="high"
        />
        {/* Overlay superior — só para dar contraste ao botão de menu */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"
        />

        {/* Chip editorial — apenas desktop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
          className="absolute inset-x-0 bottom-16 hidden justify-center px-6 sm:flex"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.32em] text-white/90 ring-1 ring-white/15 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[color:var(--gold)]" />
            Desde {restaurant.since}
            <span className="text-white/40">·</span>
            {restaurant.city ?? "Panela da Roça"}
          </div>
        </motion.div>
      </section>

      {/* Fade editorial — transição orgânica entre a capa e o hub */}
      <div
        aria-hidden
        className="pointer-events-none relative -mt-16 h-16 bg-gradient-to-b from-transparent via-[oklch(0.16_0.02_55)]/40 to-background"
      />

      {/* Sheet inferior — Hub (sem barras nem contornos duros) */}
      <section className="relative z-10 px-6 pt-2 pb-2">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="type-label text-[color:var(--copper)]">Hub Principal</div>
          <p className="mt-2 type-heading text-primary text-balance">
            Tudo do Panela em um só lugar.
          </p>
        </motion.header>


        {/* Horário */}
        <HoursCard restaurant={restaurant} className="mb-6" />

        {/* Action grid */}
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
          }}
          className="grid grid-cols-2 gap-3"
        >
          {featured && (
            <ActionCardWrap>
              <ActionCard action={featured} slug={restaurant.slug} onTrack={track} featured />
            </ActionCardWrap>
          )}
          {rest.map((a) => (
            <ActionCardWrap key={a.id}>
              <ActionCard action={a} slug={restaurant.slug} onTrack={track} />
            </ActionCardWrap>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-3 border-t border-border/60 pt-8 pb-2 text-center">
          <BrandMark size={36} plate />
          <div className="type-caption mt-1 max-w-xs">
            Panela da Roça · Desde {restaurant.since}
          </div>
          <div className="mt-2 type-label text-muted-foreground">
            Powered by{" "}
            <span className="type-button text-[color:var(--copper)] normal-case tracking-normal">
              i9 Food OS
            </span>
          </div>
        </footer>
      </section>

      <SideDrawer open={open} onClose={closeDrawer} restaurant={restaurant} />
      <BottomNav slug={restaurant.slug} active="home" onMore={openDrawer} />
    </main>
  );
}

function ActionCardWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}

function MenuBars() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M1 1H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1 7H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1 13H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
