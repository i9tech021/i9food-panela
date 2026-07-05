import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Loader2, Check } from "lucide-react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import { supabase } from "@/integrations/external-supabase/client";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { cn } from "@/lib/utils";

const ROLES = [
  "Garçom",
  "Cozinheiro",
  "Churrasqueiro",
  "Auxiliar de cozinha",
  "Caixa",
  "Outro",
];

export const Route = createFileRoute("/$slug/trabalhe-conosco")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Trabalhe Conosco · Panela da Roça" }] }),
  component: TrabalheConoscoPage,
});

function TrabalheConoscoPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!restaurant) return <NotFoundRestaurant />;

  const canSubmit =
    name.trim().length > 1 && phone.trim().length >= 8 && state === "idle";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const { error } = await supabase.from("job_applications").insert({
        restaurant_id: restaurant.id,
        name: name.trim(),
        phone: phone.trim(),
        role,
        message: message.trim() || null,
      });
      if (error) throw error;
      const text = `Olá! Me chamo ${name.trim()}, tenho interesse na vaga de ${role}. Meu contato: ${phone.trim()}.${
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
            <div className="type-button truncate text-primary">Trabalhe Conosco</div>
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
          <div className="type-label text-[color:var(--copper)]">Faça parte do time</div>
          <h1 className="type-heading mt-1.5 text-primary text-balance">
            Envie seu currículo.
          </h1>
          <p className="type-subtitle mt-2 max-w-md text-balance">
            Preencha os campos abaixo. Vamos direcionar sua candidatura pelo WhatsApp.
          </p>
        </div>

        <div className="space-y-3">
          <Field label="Nome completo" value={name} onChange={setName} placeholder="Como você se chama?" maxLength={80} />
          <Field label="WhatsApp" value={phone} onChange={setPhone} placeholder="(22) 99999-9999" maxLength={20} inputMode="tel" />
          <label className="block">
            <span className="mb-2 flex items-baseline justify-between">
              <span className="type-label text-primary">Cargo desejado</span>
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <Field label="Mensagem" value={message} onChange={setMessage} placeholder="Experiência, disponibilidade, etc." maxLength={400} multiline optional />
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
            <><Briefcase className="size-4" /> Enviar candidatura</>
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