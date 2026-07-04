import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  getRestaurantBySlug,
  listEvents,
  listLinks,
  subscribe,
  updateLink,
} from "@/lib/hub/api";
import type { HubEvent, HubLink, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/$slug/admin/conteudo")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Conteúdo" }] }),
  component: ConteudoPage,
});

function ConteudoPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [links, setLinks] = useState<HubLink[]>([]);
  const [events, setEvents] = useState<HubEvent[]>([]);

  useEffect(() => {
    if (!restaurant) return;
    const load = async () => {
      setLinks(await listLinks(restaurant.id));
      setEvents(await listEvents(restaurant.id));
    };
    load();
    return subscribe(load);
  }, [restaurant]);

  if (!restaurant) return <NotFoundRestaurant />;

  return (
    <AdminShell restaurant={restaurant} title="Conteúdo">
      <section className="rounded-2xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg">Cartões do Hub</h2>
          <p className="text-sm text-muted-foreground">
            Atualize os textos e links exibidos na home.
          </p>
        </header>
        <ul className="divide-y divide-border">
          {links.map((link) => (
            <li key={link.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <Input
                label="Título"
                value={link.label}
                onChange={(v) => updateLink(link.id, { label: v })}
              />
              <Input
                label="Descrição"
                value={link.description ?? ""}
                onChange={(v) => updateLink(link.id, { description: v })}
              />
              <Input
                label="URL"
                value={link.href}
                onChange={(v) => updateLink(link.id, { href: v })}
                placeholder="https://…"
              />
              <label className="flex items-end gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => updateLink(link.id, { enabled: e.target.checked })}
                  className="size-4 accent-[color:var(--copper)]"
                />
                Ativo
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg">Eventos</h2>
          <p className="text-sm text-muted-foreground">
            Programação mostrada no cartão de eventos.
          </p>
        </header>
        <ul className="divide-y divide-border">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-display text-base">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleString("pt-BR")}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{e.description}</div>
              </div>
            </li>
          ))}
          {events.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum evento cadastrado.
            </li>
          )}
        </ul>
      </section>
    </AdminShell>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
      />
    </label>
  );
}