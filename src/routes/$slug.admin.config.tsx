import { createFileRoute } from "@tanstack/react-router";

import { getRestaurantBySlug, resetLocalState } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/$slug/admin/config")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Configurações" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  if (!restaurant) return <NotFoundRestaurant />;

  return (
    <AdminShell restaurant={restaurant} title="Configurações">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Restaurante</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Nome" value={restaurant.name} />
            <Row label="Slug" value={restaurant.slug} />
            <Row label="Desde" value={String(restaurant.since)} />
            <Row label="Endereço" value={restaurant.address} />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Estes campos ficarão editáveis quando o banco de dados for conectado.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Dados de teste</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enquanto operamos com estado local (sem backend), você pode limpar os dados de demonstração.
          </p>
          <button
            onClick={() => {
              resetLocalState();
              window.location.reload();
            }}
            className="mt-4 rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            Redefinir dados locais
          </button>
        </section>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="font-display text-base">{value}</dd>
    </div>
  );
}