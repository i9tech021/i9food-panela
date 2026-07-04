import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, Camera, ImagePlus, Loader2, X } from "lucide-react";

import {
  createPhoto,
  getRestaurantBySlug,
  getUploadsRemaining,
  UPLOAD_DAILY_LIMIT,
  listPhotos,
  subscribe,
} from "@/lib/hub/api";
import type { Photo, Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { GalleryGrid } from "@/components/hub/gallery/GalleryGrid";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  t: z.string().optional(),
  src: z.enum(["qr", "nfc", "direct", "share"]).optional(),
});

export const Route = createFileRoute("/$slug/enviar")({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({
    meta: [{ title: "Publicar meu momento · Panela da Roça" }],
  }),
  component: EnviarPage,
});

/** Assina o store da API para renderizar a galeria em tempo real. */
function useLivePhotos(restaurantId: string | undefined): Photo[] {
  const [snapshot, setSnapshot] = useState<Photo[]>([]);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    const load = async () => {
      const list = await listPhotos({ restaurantId, status: "public" });
      if (!cancelled) setSnapshot(list);
    };
    load();
    const unsub = subscribe(load);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [restaurantId]);

  return snapshot;
}

function EnviarPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  const search = useSearch({ from: "/$slug/enviar" });
  const navigate = useNavigate();

  const photos = useLivePhotos(restaurant?.id);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [caption, setCaption] = useState("");
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(UPLOAD_DAILY_LIMIT);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRemaining(getUploadsRemaining());
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!restaurant) return <NotFoundRestaurant />;

  const canSubmit = !!file && state === "idle" && remaining > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !file) return;
    setState("submitting");
    setErrorMsg(null);
    try {
      await createPhoto({
        restaurantId: restaurant.id,
        file,
        authorName: author,
        caption,
        tableCode: search.t ?? null,
        source: search.src,
      });
        setRemaining(getUploadsRemaining());
        setFile(null);
        setCaption("");
        setState("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Falha ao publicar.");
      setState("idle");
      setRemaining(getUploadsRemaining());
    }
  };

  return (
    <main className="relative min-h-screen bg-background pb-24">
      {/* Header limpo */}
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
            <div className="type-button truncate text-primary">Publicar momento</div>
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
          <div className="type-label text-[color:var(--copper)]">Momentos no Panela</div>
          <h1 className="type-heading mt-1.5 text-primary text-balance">
            Publique seu momento agora.
          </h1>
          <p className="type-subtitle mt-2 max-w-md text-balance">
            Sua foto entra na galeria da casa na hora, junto com a dos outros clientes.
          </p>
        </div>

        {/* Dropzone / Preview */}
        {!preview ? (
          <label
            className="group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/60 text-center transition-colors hover:border-[color:var(--copper)] hover:bg-card"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--copper)]/12 text-[color:var(--copper)] transition-transform group-hover:-translate-y-0.5">
              <ImagePlus className="size-6" strokeWidth={1.75} />
            </span>
            <div className="mt-4 type-button text-primary">Adicionar foto</div>
            <div className="type-caption mt-1">Toque para escolher da galeria ou câmera</div>
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-soft)]">
            <img src={preview} alt="Prévia" className="aspect-[4/3] w-full object-cover" />
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remover foto"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/75"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Campos opcionais */}
        <div className="space-y-3">
          <Field
            label="Nome ou apelido"
            optional
            value={author}
            onChange={setAuthor}
            placeholder="Como quer aparecer na galeria?"
            maxLength={40}
          />
          <Field
            label="Legenda"
            optional
            value={caption}
            onChange={setCaption}
            placeholder="Um detalhe do prato, da mesa, do momento..."
            maxLength={140}
            multiline
          />
        </div>

        {/* CTA */}
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
            <>
              <Loader2 className="size-4 animate-spin" /> Publicando…
            </>
          ) : (
            <>
              <Camera className="size-4" /> Publicar na galeria
            </>
          )}
        </button>

        <p className="type-caption text-center">
          Ao publicar você concorda em exibir sua foto na galeria pública do Panela.
        </p>

        <p className="type-caption text-center">
          {remaining > 0
            ? `Você ainda pode publicar ${remaining} ${remaining === 1 ? "foto" : "fotos"} hoje.`
            : "Você atingiu o limite de 10 publicações hoje. Volte amanhã 🌱"}
        </p>

        {errorMsg && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center type-caption text-destructive">
            {errorMsg}
          </p>
        )}
      </motion.form>

      {/* Galeria ao vivo abaixo do formulário */}
      <section className="mx-auto max-w-3xl px-5 pt-14">
        <header className="mb-5">
          <div className="type-label text-[color:var(--copper)]">
            Momentos no Panela
          </div>
          <h2 className="type-title mt-1.5 text-primary">
            {photos.length > 0
              ? "Recém-publicados pela galera"
              : "Ainda sem publicações"}
          </h2>
        </header>

        {photos.length > 0 ? (
          <GalleryGrid photos={photos} slug={restaurant.slug} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-8 text-center">
            <p className="type-caption">
              Nenhuma foto por aqui ainda. A sua pode ser a primeira.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  optional?: boolean;
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
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={shared}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={shared}
        />
      )}
    </label>
  );
}
