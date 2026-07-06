import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Check } from "lucide-react";

import { getRestaurantBySlug, updateRestaurant } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { AdminShell } from "@/components/admin/AdminShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/admin/config")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Admin · Configurações" }] }),
  component: ConfigPage,
});

type FormState = {
  name: string;
  tagline: string;
  since: string;
  address: string;
  city: string;
  whatsappPhone: string;
  instagramHandle: string;
  instagram: string;
  mapsUrl: string;
  googleReviewUrl: string;
};

function toForm(r: Restaurant): FormState {
  return {
    name: r.name ?? "",
    tagline: r.tagline ?? "",
    since: String(r.since ?? ""),
    address: r.address ?? "",
    city: r.city ?? "",
    whatsappPhone: r.whatsappPhone ?? "",
    instagramHandle: (r.instagramHandle ?? "").replace(/^@/, ""),
    instagram: r.instagram ?? "",
    mapsUrl: r.mapsUrl ?? "",
    googleReviewUrl: r.googleReviewUrl ?? "",
  };
}

function ConfigPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [form, setForm] = useState<FormState>(() =>
    restaurant ? toForm(restaurant) : ({} as FormState),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!restaurant) return <NotFoundRestaurant />;

  const bind = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false);
      setForm((f) => ({ ...f, [k]: e.target.value }));
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateRestaurant(restaurant.id, {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        since: Number(form.since) || restaurant.since,
        address: form.address.trim(),
        city: form.city.trim(),
        whatsappPhone: form.whatsappPhone.trim(),
        instagramHandle: form.instagramHandle.trim(),
        instagram: form.instagram.trim(),
        mapsUrl: form.mapsUrl.trim(),
        googleReviewUrl: form.googleReviewUrl.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell restaurant={restaurant} title="Configurações">
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Identidade</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome"><Input {...bind("name")} /></Field>
            <Field label="Slug (URL)"><Input value={restaurant.slug} disabled /></Field>
            <Field label="Desde (ano)"><Input type="number" {...bind("since")} /></Field>
            <Field label="Tagline" full><Input {...bind("tagline")} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Contato & Localização</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Endereço" full><Input {...bind("address")} /></Field>
            <Field label="Cidade"><Input {...bind("city")} /></Field>
            <Field label="WhatsApp (com DDD)"><Input placeholder="21998351729" {...bind("whatsappPhone")} /></Field>
            <Field label="Link do Google Maps" full><Input {...bind("mapsUrl")} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Redes & Avaliações</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Instagram (@)"><Input placeholder="paneladaroca" {...bind("instagramHandle")} /></Field>
            <Field label="URL do Instagram"><Input placeholder="https://instagram.com/…" {...bind("instagram")} /></Field>
            <Field label="Link de avaliação Google" full><Input placeholder="https://g.page/r/…/review" {...bind("googleReviewUrl")} /></Field>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium",
              saving
                ? "bg-muted text-muted-foreground"
                : "bg-[color:var(--copper)] text-[color:var(--cream)] shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-transform",
            )}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Salvar alterações
          </button>
          {saved && <span className="text-sm text-[color:var(--copper)]">Salvo com sucesso.</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </form>
    </AdminShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-primary",
        "focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    />
  );
}