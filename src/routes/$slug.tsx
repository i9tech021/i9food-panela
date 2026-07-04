import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getRestaurantBySlug } from "@/lib/hub/api";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant };
  },
  component: TenantLayout,
  errorComponent: () => <NotFoundRestaurant />,
  notFoundComponent: () => <NotFoundRestaurant />,
});

function TenantLayout() {
  const { restaurant } = Route.useLoaderData();
  if (!restaurant) return <NotFoundRestaurant />;
  return <Outlet />;
}