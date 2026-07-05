import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { useAdminSession } from "@/lib/hub/admin-auth";

export const Route = createFileRoute("/$slug/admin")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAdminSession();

  const isLoginRoute = pathname.endsWith("/admin/login");

  useEffect(() => {
    if (loading || isLoginRoute || !restaurant) return;
    if (!isAuthenticated) {
      navigate({ to: "/$slug/admin/login", params: { slug: restaurant.slug }, replace: true });
    }
  }, [loading, isAuthenticated, isLoginRoute, restaurant, navigate]);

  if (!restaurant) return <NotFoundRestaurant />;
  if (isLoginRoute) return <Outlet />;

  if (loading || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}