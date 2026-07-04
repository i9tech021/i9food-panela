import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getRestaurantBySlug } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";

export const Route = createFileRoute("/$slug/admin")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  if (!restaurant) return <NotFoundRestaurant />;
  return <Outlet />;
}