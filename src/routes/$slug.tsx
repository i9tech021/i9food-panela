import { useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { getRestaurantBySlug, trackEvent } from "@/lib/hub/api";
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
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!restaurant) return;
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    // Não trackear área admin.
    if (location.pathname.includes("/admin")) return;
    trackEvent({
      restaurantId: restaurant.id,
      type: "visit",
      meta: { page: location.pathname },
    });
  }, [restaurant, location.pathname]);

  if (!restaurant) return <NotFoundRestaurant />;
  return <Outlet />;
}