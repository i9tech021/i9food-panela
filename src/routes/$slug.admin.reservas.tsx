import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Phone, RotateCcw, Users2, X } from "lucide-react";
import { toast } from "sonner";

import { getRestaurantBySlug } from "@/lib/hub/api";
import { supabase } from "@/integrations/external-supabase/client";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";

type ReservationStatus = "pending" | "confirmado" | "recusado";

interface ReservationRow {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string | null;
  status: ReservationStatus | string | null;
  created_at: string;
}

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-secondary text-primary",
  confirmado: "bg-emerald-500/15 text-emerald-400",
  recusado: "bg-red-500/15 text-red-400",
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pendente",
  confirmado: "Confirmada",
  recusado: "Recusada",
};

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
  const [busy, setBusy] = useState<string | null>(null);

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

  async function updateStatus(id: string, status: ReservationStatus) {
    setBusy(id);
    const prev = rows;
    setRows((cur) => cur?.map((r) => (r.id === id ? { ...r, status } : r)) ?? cur);
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);
    setBusy(null);
    if (error) {
      setRows(prev ?? null);
      toast.error(`Não foi possível atualizar: ${error.message}`);
    } else {
      toast.success(`Reserva ${STATUS_LABEL[status].toLowerCase()}.`);
    }
  }

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
          {rows.map((r) => {
            const status = ((r.status ?? "pending") as ReservationStatus) in STATUS_STYLES
              ? ((r.status ?? "pending") as ReservationStatus)
              : ("pending" as ReservationStatus);
            return (
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
                  <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide ${STATUS_STYLES[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
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
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === r.id || status === "confirmado"}
                  onClick={() => updateStatus(r.id, "confirmado")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40"
                >
                  <Check className="size-3.5" /> Confirmar
                </button>
                <button
                  type="button"
                  disabled={busy === r.id || status === "recusado"}
                  onClick={() => updateStatus(r.id, "recusado")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/25 disabled:opacity-40"
                >
                  <X className="size-3.5" /> Recusar
                </button>
                {status !== "pending" && (
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => updateStatus(r.id, "pending")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-primary hover:bg-secondary/70 disabled:opacity-40"
                  >
                    <RotateCcw className="size-3.5" /> Reabrir
                  </button>
                )}
                {busy === r.id && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}