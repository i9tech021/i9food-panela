import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Phone, Users2 } from "lucide-react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import { supabase } from "@/integrations/external-supabase/client";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";

interface ReservationRow {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string | null;
  status: string | null;
  created_at: string;
}

export const Route = createFileRoute("/$slug/admin/reservas")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Reservas" }] }),
  component: ReservasAdminPage,
});

function ReservasAdminPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [rows, setRows] = useState<ReservationRow[] | null>(null);

  useEffect(() => {
    if (!restaurant) return;
    (async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });
      if (error) console.warn(error.message);
      setRows((data as ReservationRow[] | null) ?? []);
    })();
  }, [restaurant]);

  if (!restaurant) return <NotFoundRestaurant />;

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return y && m && day ? `${day}/${m}/${y}` : d;
  };

  return (
    <AdminShell restaurant={restaurant} title="Reservas recebidas">
      {rows === null ? (
        <div className="grid place-items-center py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center type-caption">
          Nenhuma reserva recebida ainda.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="font-display text-lg text-primary">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(r.date)} · {r.time} · recebida{" "}
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-primary">
                    <Users2 className="size-3.5" /> {r.guests}
                  </span>
                  <a
                    href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--whatsapp)]/12 px-3 py-1.5 text-xs text-[color:var(--whatsapp)] hover:bg-[color:var(--whatsapp)]/18"
                  >
                    <Phone className="size-3.5" /> {r.phone}
                  </a>
                </div>
              </div>
              {r.message && (
                <p className="mt-3 rounded-xl bg-secondary/40 px-3 py-2 text-sm text-primary">
                  {r.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}