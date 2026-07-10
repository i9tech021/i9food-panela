import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, X } from "lucide-react";

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

        {/* Dropzone / Carousel de previews */}
        {previews.length === 0 ? (
          <label
            className="group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/60 text-center transition-colors hover:border-[color:var(--copper)] hover:bg-card"
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
            <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--copper)]/12 text-[color:var(--copper)] transition-transform group-hover:-translate-y-0.5">
              <ImagePlus className="size-6" strokeWidth={1.75} />
            </span>
            <div className="mt-4 type-button text-primary">Adicionar fotos</div>
            <div className="type-caption mt-1">
              Escolha uma ou várias da galeria (ou tire na hora)
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
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previews.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    i === activeIdx
                      ? "border-[color:var(--copper)]"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={url} alt="" className="size-full object-cover" />
                </button>
              ))}
              {files.length < remaining && (
                <label
                  className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
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
              <Loader2 className="size-4 animate-spin" />
              {progress
                ? `Publicando ${progress.done + 1}/${progress.total}…`
                : "Publicando…"}
            </>
          ) : (
            <>
              <Camera className="size-4" />
              {files.length > 1
                ? `Publicar ${files.length} fotos na galeria`
                : "Publicar na galeria"}
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
