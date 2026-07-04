import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

import {
  getRestaurantBySlug,
  listPhotos,
  subscribeRealtimePhotos,
} from "@/lib/hub/api";
import type { Photo, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { BottomNav } from "@/components/hub/BottomNav";
import { HubHeader } from "@/components/hub/Header";
import { SideDrawer, useDrawer } from "@/components/hub/SideDrawer";
import { GalleryEmptyState } from "@/components/hub/gallery/GalleryEmptyState";
import { GalleryFilters, type FilterKey } from "@/components/hub/gallery/GalleryFilters";
import { GalleryGrid } from "@/components/hub/gallery/GalleryGrid";

export const Route = createFileRoute("/$slug/galeria")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    if (!restaurant)
      return { restaurant: null as Restaurant | null, photos: [] as Photo[] };
    const photos = await listPhotos({ restaurantId: restaurant.id, status: "public" });
    return { restaurant: restaurant as Restaurant | null, photos };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Momentos no Panela · ${loaderData?.restaurant?.name ?? "Hub"}` },
      {
        name: "description",
        content:
          "Compartilhe seu almoço e faça parte da comunidade Panela da Roça.",
      },
    ],
  }),
  component: GaleriaPage,
});

function GaleriaPage() {
  const { restaurant, photos } = Route.useLoaderData() as {
    restaurant: Restaurant | null;
    photos: Photo[];
  };
  const { open, openDrawer, closeDrawer } = useDrawer();
  const [filter, setFilter] = useState<FilterKey>("recentes");
  const router = useRouter();

  // Tempo real: qualquer foto nova/apagada/atualizada recarrega a galeria.
  useEffect(() => {
    if (!restaurant) return;
    const unsub = subscribeRealtimePhotos(restaurant.id, () => {
      router.invalidate();
    });
    return unsub;
  }, [restaurant?.id]);

  const visible = useMemo(() => {
    if (!photos.length) return [] as Photo[];
    switch (filter) {
      case "curtidas":
        return [...photos].sort((a, b) => b.likes - a.likes);
      case "destaques":
        return photos.filter((p) => p.status === "featured");
      case "colecoes":
        return photos; // futuro: agrupar por tag
      case "recentes":
      default:
        return [...photos].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [photos, filter]);

  if (!restaurant) return <NotFoundRestaurant />;

  const hasPhotos = visible.length > 0;

  return (
    <main className="min-h-screen bg-background pb-32">
      <HubHeader
        restaurant={restaurant}
        title="Momentos no Panela"
        onOpenMenu={openDrawer}
      />

      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* Boas-vindas — sempre presente, some visualmente quando galeria enche */}
        <motion.header
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="type-label text-[color:var(--copper)]">
            Comunidade da casa
          </div>
          <h1 className="type-heading mt-1.5 text-primary text-balance">
            Momentos no Panela
          </h1>
          <p className="type-subtitle mt-1.5 max-w-md text-balance">
            Compartilhe seu almoço e faça parte da nossa comunidade.
          </p>
        </motion.header>

        {/* Filtros — visual, ligar backend depois */}
        <GalleryFilters value={filter} onChange={setFilter} className="mb-6" />

        {hasPhotos ? (
          <>
            <GalleryGrid photos={visible} slug={restaurant.slug} />
            <Link
              to="/$slug/enviar"
              params={{ slug: restaurant.slug }}
              className="fixed bottom-20 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[color:var(--copper)] px-5 py-3 type-button text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 hover:-translate-x-1/2"
            >
              <Camera className="size-4" />
              Publicar meu momento
            </Link>
          </>
        ) : (
          <GalleryEmptyState slug={restaurant.slug} />
        )}
      </div>

      <SideDrawer open={open} onClose={closeDrawer} restaurant={restaurant} />
      <BottomNav slug={restaurant.slug} active="moments" onMore={openDrawer} />
    </main>
  );
}
