import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Loader2, Check } from "lucide-react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import { supabase } from "@/integrations/external-supabase/client";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { cn } from "@/lib/utils";

const TIMES = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];
const GUESTS = Array.from({ length: 20 }, (_, i) => i + 1);

export const Route = createFileRoute("/$slug/reservas")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Reservas · Panela da Roça" }] }),
  component: ReservasPage,
});

function ReservasPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[2]);
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!restaurant) return <NotFoundRestaurant />;

  const canSubmit =
    name.trim().length > 1 &&
    phone.trim().length >= 8 &&
    !!date &&
    !!time &&
    guests > 0 &&
    state === "idle";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const { error } = await supabase.from("reservations").insert({
        restaurant_id: restaurant.id,
        name: name.trim(),
        phone: phone.trim(),
        date,
        time,
        guests,
        message: message.trim() || null,
      });
      if (error) throw error;
      const [y, m, d] = date.split("-");
      const dateBR = y && m && d ? `${d}/${m}/${y}` : date;
      const text = `Olá! Gostaria de reservar uma mesa. Nome: ${name.trim()}. Data: ${dateBR} às ${time}. Pessoas: ${guests}.${
        message.trim() ? ` ${message.trim()}` : ""
      }`;
      const url = `https://wa.me/${restaurant.whatsappPhone}?text=${encodeURIComponent(text)}`;
      setState("done");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Falha ao enviar.");
      setState("idle");
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <main className="relative min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Link
            to="/$slug"
            params={{ slug: restaurant.slug }}
            aria-label="Voltar"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 truncate text-center">
            <div className="type-button truncate text-primary">Reservas</div>
          </div>
          <span className="size-9" />
        </div>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onSubmit={onSubmit}
        className="mx-auto max-w-xl px-5 pt-8 space-y-6"
      >
        <div>
          <div className="type-label text-[color:var(--copper)]">Garanta sua mesa</div>
          <h1 className="type-heading mt-1.5 text-primary text-balance">
            Reserve seu lugar na Panela.
          </h1>
          <p className="type-subtitle mt-2 max-w-md text-balance">
            Enviaremos os detalhes pelo WhatsApp para confirmação.
          </p>
        </div>

        <div className="space-y-3">
          <Field label="Nome completo" value={name} onChange={setName} placeholder="Como quer ser chamado?" maxLength={80} />
          <Field label="WhatsApp" value={phone} onChange={setPhone} placeholder="(22) 99999-9999" maxLength={20} inputMode="tel" />
          <label className="block">
            <span className="mb-2 flex items-baseline justify-between">
              <span className="type-label text-primary">Data desejada</span>
            </span>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 flex items-baseline justify-between">
                <span className="type-label text-primary">Horário</span>
              </span>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{t.replace(":00", "h").replace(":30", "h30")}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 flex items-baseline justify-between">
                <span className="type-label text-primary">Pessoas</span>
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
              >
                {GUESTS.map((n) => (
                  <option key={n} value={n}>{n === 20 ? "20+" : n}</option>
                ))}
              </select>
            </label>
          </div>
          <Field label="Observações" value={message} onChange={setMessage} placeholder="Aniversário, cadeira infantil, etc." maxLength={400} multiline optional />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-4 type-button transition-all",
            canSubmit
              ? "bg-[color:var(--copper)] text-[color:var(--cream)] shadow-[var(--shadow-lift)] hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground",
          )}
        >
          {state === "submitting" ? (
            <><Loader2 className="size-4 animate-spin" /> Enviando…</>
          ) : state === "done" ? (
            <><Check className="size-4" /> Enviado! Abrindo WhatsApp…</>
          ) : (
            <><CalendarCheck className="size-4" /> Solicitar reserva</>
          )}
        </button>

        {errorMsg && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center type-caption text-destructive">
            {errorMsg}
          </p>
        )}
      </motion.form>
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, maxLength, multiline, optional, inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  optional?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const shared =
    "w-full rounded-2xl border border-border bg-card px-4 py-3.5 type-body text-primary placeholder:text-muted-foreground/70 transition-colors focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20";
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="type-label text-primary">{label}</span>
        {optional && <span className="type-caption">opcional</span>}
      </span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3} className={shared} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} inputMode={inputMode} className={shared} />
      )}
    </label>
  );
}