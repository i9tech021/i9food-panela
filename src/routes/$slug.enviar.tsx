import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, X } from "lucide-react";

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

  const photos = useLivePhotos(restaurant?.id);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [author, setAuthor] = useState("");
  const [caption, setCaption] = useState("");
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(UPLOAD_DAILY_LIMIT);
  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRemaining(getUploadsRemaining());
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      setActiveIdx(0);
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setActiveIdx((i) => Math.min(i, urls.length - 1));
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  if (!restaurant) return <NotFoundRestaurant />;

  const canSubmit = files.length > 0 && state === "idle" && remaining > 0;

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const room = Math.max(0, remaining - prev.length);
      const merged = [...prev, ...incoming].slice(0, prev.length + room);
      return merged;
    });
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || files.length === 0) return;
    setState("submitting");
    setErrorMsg(null);
    const total = files.length;
    setProgress({ done: 0, total });
    try {
      for (let i = 0; i < files.length; i++) {
        await createPhoto({
          restaurantId: restaurant.id,
          file: files[i],
          authorName: author,
          caption,
          tableCode: search.t ?? null,
          source: search.src,
        });
        setProgress({ done: i + 1, total });
      }
      setRemaining(getUploadsRemaining());
      setFiles([]);
      setCaption("");
      setProgress(null);
      setState("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Falha ao publicar.");
      setState("idle");
      setProgress(null);
      setRemaining(getUploadsRemaining());
    }
  };

  return (
    <main className="relative min-h-screen bg-background pb-24">
      {/* Header limpo */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--copper)]/10 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-5">
          <Link
            to="/$slug"
            params={{ slug: restaurant.slug }}
            aria-label="Voltar"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 truncate text-center">
            <div className="font-display text-lg tracking-tight text-primary truncate">Panela da Roça</div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--copper)]">Publicar</span>
        </div>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onSubmit={onSubmit}
        className="mx-auto max-w-xl px-6 pt-10 space-y-9"
      >
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--copper)]">
            Momentos no Panela
          </div>
          <h1 className="font-display text-[2.6rem] leading-[1.02] text-primary text-balance">
            Compartilhe a sua <span className="text-[color:var(--copper)]">experiência</span>.
          </h1>
          <p className="max-w-[300px] text-sm leading-relaxed text-muted-foreground">
            Sua foto entra na galeria da casa na hora, junto com a dos outros clientes.
          </p>
        </div>

        {/* Dropzone / Carousel de previews */}
        {previews.length === 0 ? (
          <label
            className="group relative flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[color:var(--sage)]/30 bg-[color:var(--sage)]/5 text-center transition-all hover:border-[color:var(--copper)]/60 hover:bg-[color:var(--copper)]/[0.04] active:scale-[0.995] sm:aspect-[2/1]"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
            <span className="grid size-12 place-items-center rounded-full bg-background text-[color:var(--copper)] shadow-[var(--shadow-soft)] transition-transform group-hover:-translate-y-1">
              <ImagePlus className="size-5" strokeWidth={1.6} />
            </span>
            <div className="space-y-1">
              <div className="font-display text-lg text-primary">Adicionar fotos</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Da galeria · ou tire na hora
              </div>
            </div>
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-black/5 shadow-[var(--shadow-soft)]">
              <img
                src={previews[activeIdx]}
                alt={`Prévia ${activeIdx + 1} de ${previews.length}`}
                className="mx-auto block max-h-[60vh] w-auto max-w-full object-contain"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                {activeIdx + 1} / {previews.length}
              </span>
              <button
                type="button"
                onClick={() => removeAt(activeIdx)}
                aria-label="Remover esta foto"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/75"
              >
                <X className="size-4" />
              </button>
              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((i) => (i - 1 + previews.length) % previews.length)}
                    aria-label="Anterior"
                    className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/75"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((i) => (i + 1) % previews.length)}
                    aria-label="Próxima"
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/75"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas + botão adicionar mais */}
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {previews.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                    i === activeIdx
                      ? "border-[color:var(--copper)] shadow-[var(--shadow-soft)]"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={url} alt="" className="size-full object-cover" />
                </button>
              ))}
              {files.length < remaining && (
                <label
                  className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[color:var(--sage)]/40 bg-[color:var(--sage)]/5 text-[color:var(--copper)] transition-colors hover:border-[color:var(--copper)] hover:bg-[color:var(--copper)]/5"
                  aria-label="Adicionar mais fotos"
                >
                  <input
                    ref={addMoreRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Plus className="size-5" />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Campos opcionais */}
        <div className="space-y-5">
          <Field
            label="Quem publicou"
            optional
            value={author}
            onChange={setAuthor}
            placeholder="Como quer aparecer na galeria?"
            maxLength={40}
          />
          <Field
            label="Legenda do momento"
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
            "flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-sm font-semibold tracking-wide transition-all",
            canSubmit
              ? "bg-[color:var(--copper)] text-[color:var(--cream)] shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--copper)_65%,transparent)] hover:-translate-y-0.5 active:scale-[0.98]"
              : "bg-muted text-muted-foreground",
          )}
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {progress
                ? `Publicando ${progress.done + 1}/${progress.total}…`
                : "Publicando…"}
            </>
          ) : (
            <>
              <Camera className="size-4" />
              <span>
                {files.length > 1
                  ? `Publicar ${files.length} fotos na galeria`
                  : "Publicar na galeria"}
              </span>
              <ArrowRight className="size-4 opacity-80" />
            </>
          )}
        </button>

        <div className="space-y-1.5 text-center">
          <p className="text-xs text-muted-foreground/80">
            Ao publicar você concorda em exibir sua foto na galeria pública do Panela.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--sage)]">
            {remaining > 0
              ? `Restam ${remaining} ${remaining === 1 ? "foto" : "fotos"} hoje`
              : "Limite diário atingido · volte amanhã 🌱"}
          </p>
        </div>

        {errorMsg && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center type-caption text-destructive">
            {errorMsg}
          </p>
        )}
      </motion.form>

      {/* Galeria ao vivo abaixo do formulário */}
      <section className="mx-auto max-w-3xl px-6 pt-16">
        <header className="mb-6 flex items-end justify-between gap-4 border-b border-[color:var(--copper)]/15 pb-4">
          <h2 className="font-display text-2xl leading-tight text-primary">
            {photos.length > 0 ? "Recém-publicados" : "Ainda sem publicações"}
          </h2>
          <span className="pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--copper)]">
            Pela galera
          </span>
        </header>

        {photos.length > 0 ? (
          <GalleryGrid photos={photos} slug={restaurant.slug} />
        ) : (
          <div className="rounded-3xl border border-dashed border-[color:var(--sage)]/30 bg-[color:var(--sage)]/5 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
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
    "w-full rounded-2xl border border-[color:var(--copper)]/15 bg-card px-5 py-3.5 text-sm text-primary shadow-[inset_0_2px_4px_rgba(60,42,33,0.04)] placeholder:text-muted-foreground/60 transition-colors focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20";
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--sage)]">
          {label}
        </span>
        {optional && (
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
            opcional
          </span>
        )}
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
