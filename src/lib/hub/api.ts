/**
 * Hub API — Supabase-backed implementation (external Supabase project).
 *
 * Mantém a mesma assinatura do mock anterior para não quebrar UI, rotas
 * ou tipos. Onde o schema atual do banco não cobre um campo (ex.: detalhes
 * ricos do restaurante ou hub_actions com internalTo/description), caímos
 * de volta nos seeds locais como fonte de verdade estática.
 */
import { supabase } from "@/integrations/external-supabase/client";
import { SEED_ACTIONS, SEED_RESTAURANTS } from "./seed";
import type {
  AnalyticsEvent,
  HubEvent,
  HubLink,
  Photo,
  PhotoStatus,
  Restaurant,
  TrafficSource,
} from "./types";

const listeners = new Set<() => void>();

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

/**
 * Realtime: escuta INSERT/UPDATE/DELETE em `photos` no Supabase e chama o
 * callback. Requer a tabela na publication `supabase_realtime`.
 */
export function subscribeRealtimePhotos(
  restaurantId: string,
  cb: () => void,
): () => void {
  const channel = supabase
    .channel(`photos-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "photos",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => cb(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/* ---------------- Restaurants ---------------- */

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("[api] getRestaurantBySlug", error.message);
  }

  const seed = SEED_RESTAURANTS.find((r) => r.slug === slug) ?? null;
  if (!data) return seed;

  // Merge: DB manda no que existe, seed cobre o resto (openingHours, features, etc.)
  return {
    ...(seed ?? ({} as Restaurant)),
    id: data.id ?? seed?.id ?? "",
    slug: data.slug ?? slug,
    name: data.name ?? seed?.name ?? "",
    tagline: data.tagline ?? seed?.tagline ?? "",
    since: data.since ?? seed?.since ?? 0,
    heroImage: data.asset_hero ?? seed?.heroImage ?? "",
    address: data.address ?? seed?.address ?? "",
    city: data.city ?? seed?.city,
    mapsUrl: data.url_maps ?? seed?.mapsUrl ?? "",
    whatsapp: seed?.whatsapp ?? "",
    whatsappPhone: data.whatsapp_phone ?? seed?.whatsappPhone ?? "",
    instagram: data.url_instagram ?? seed?.instagram ?? "",
    instagramHandle: data.instagram_handle
      ? `@${String(data.instagram_handle).replace(/^@/, "")}`
      : seed?.instagramHandle ?? "",
    googleReviewUrl: data.url_google_review ?? seed?.googleReviewUrl ?? "",
    openingHours: seed?.openingHours ?? [],
    features: (data.features as Restaurant["features"]) ?? seed?.features ?? {
      reservations: false,
      events: false,
      jobs: false,
    },
  };
}

export async function updateRestaurant(id: string, patch: Partial<Restaurant>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.tagline !== undefined) row.tagline = patch.tagline;
  if (patch.since !== undefined) row.since = patch.since;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.whatsappPhone !== undefined) row.whatsapp_phone = patch.whatsappPhone;
  if (patch.instagramHandle !== undefined)
    row.instagram_handle = String(patch.instagramHandle).replace(/^@/, "");
  if (patch.mapsUrl !== undefined) row.url_maps = patch.mapsUrl;
  if (patch.googleReviewUrl !== undefined) row.url_google_review = patch.googleReviewUrl;
  if (patch.instagram !== undefined) row.url_instagram = patch.instagram;
  if (patch.heroImage !== undefined) row.asset_hero = patch.heroImage;
  if (patch.features !== undefined) row.features = patch.features;

  const { error } = await supabase.from("restaurants").update(row).eq("id", id);
  if (error) console.warn("[api] updateRestaurant", error.message);
  notify();
}

/* ---------------- Photos ---------------- */

export interface PhotosQuery {
  restaurantId: string;
  status?: PhotoStatus | "public";
  sort?: "recent" | "liked" | "featured";
}

interface PhotoRow {
  id: string;
  restaurant_id: string;
  author_name: string | null;
  caption: string | null;
  url: string;
  status: PhotoStatus;
  featured: boolean | null;
  likes: number | null;
  wants: number | null;
  created_at: string;
}

function mapPhoto(row: PhotoRow): Photo {
  const status: PhotoStatus = row.featured ? "featured" : row.status;
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    url: row.url,
    authorName: row.author_name,
    caption: row.caption,
    status,
    createdAt: row.created_at,
    likes: row.likes ?? 0,
    wants: row.wants ?? 0,
  };
}

export async function listPhotos(q: PhotosQuery): Promise<Photo[]> {
  let query = supabase.from("photos").select("*").eq("restaurant_id", q.restaurantId);

  if (q.status === "public") {
    query = query.in("status", ["approved", "featured"]);
  } else if (q.status === "featured") {
    query = query.eq("featured", true);
  } else if (q.status) {
    query = query.eq("status", q.status);
  }

  if (q.sort === "liked") query = query.order("likes", { ascending: false });
  else if (q.sort === "featured") query = query.order("featured", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.warn("[api] listPhotos", error.message);
    return [];
  }
  return ((data as PhotoRow[] | null) ?? []).map(mapPhoto);
}

export interface CreatePhotoInput {
  restaurantId: string;
  file: File;
  authorName?: string | null;
  caption?: string | null;
  tableCode?: string | null;
  source?: TrafficSource;
}

const PHOTOS_BUCKET = "photos";

/* ---------------- Rate limit (client-side, por dispositivo) ---------------- */

export const UPLOAD_DAILY_LIMIT = 10;
const RATE_KEY = "panela.uploads.daily";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readRate(): { day: string; count: number } {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { day: string; count: number };
      if (parsed.day === todayKey()) return parsed;
    }
  } catch {}
  return { day: todayKey(), count: 0 };
}

export function getUploadsRemaining(): number {
  if (typeof window === "undefined") return UPLOAD_DAILY_LIMIT;
  return Math.max(0, UPLOAD_DAILY_LIMIT - readRate().count);
}

function bumpRate() {
  const cur = readRate();
  const next = { day: cur.day, count: cur.count + 1 };
  try {
    localStorage.setItem(RATE_KEY, JSON.stringify(next));
  } catch {}
}

/** Comprime a imagem no client (máx. 1600px, JPEG ~82%) para poupar Storage. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  // Rate-limit por dispositivo: 10 uploads/dia.
  if (typeof window !== "undefined") {
    const rate = readRate();
    if (rate.count >= UPLOAD_DAILY_LIMIT) {
      throw new Error(
        `Limite diário atingido (${UPLOAD_DAILY_LIMIT} fotos por dia). Tente novamente amanhã.`,
      );
    }
  }

  // 1) Upload real para o Supabase Storage (bucket público `photos`).
  const blob = await compressImage(input.file);
  const path = `${input.restaurantId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.jpg`;

  const { error: upErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });

  if (upErr) {
    console.warn("[api] createPhoto upload", upErr.message);
    throw new Error(
      `Falha no upload da foto: ${upErr.message}. Verifique o bucket "${PHOTOS_BUCKET}" e as policies de Storage.`,
    );
  }

  const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  const url = pub.publicUrl;

  // 2) Registro no banco.
  const { data, error } = await supabase
    .from("photos")
    .insert({
      restaurant_id: input.restaurantId,
      url,
      author_name: input.authorName?.trim() || null,
      caption: input.caption?.trim() || null,
      status: "approved",
    })
    .select("*")
    .single();

  if (error || !data) {
    console.warn("[api] createPhoto", error?.message);
    throw error ?? new Error("createPhoto failed");
  }
  notify();
  bumpRate();
  return mapPhoto(data as PhotoRow);
}

/** Senhas simples aceitas para apagar uma foto (case-insensitive). */
const DELETE_PASSWORDS = ["clear", "ok"];

export function isDeletePasswordValid(input: string): boolean {
  return DELETE_PASSWORDS.includes(input.trim().toLowerCase());
}

export async function deletePhoto(id: string): Promise<void> {
  // Busca a URL para tentar remover também o arquivo do Storage.
  const { data } = await supabase
    .from("photos")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) {
    console.warn("[api] deletePhoto", error.message);
    throw new Error(`Não foi possível apagar: ${error.message}`);
  }

  const url = (data as { url?: string } | null)?.url;
  const marker = `/object/public/${PHOTOS_BUCKET}/`;
  if (url && url.includes(marker)) {
    const path = decodeURIComponent(url.split(marker)[1] ?? "");
    if (path) {
      const { error: rmErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([path]);
      if (rmErr) console.warn("[api] deletePhoto storage", rmErr.message);
    }
  }
  notify();
}

export async function setPhotoStatus(id: string, status: PhotoStatus) {
  const patch =
    status === "featured"
      ? { status: "approved", featured: true }
      : { status, featured: false };
  const { error } = await supabase.from("photos").update(patch).eq("id", id);
  if (error) console.warn("[api] setPhotoStatus", error.message);
  notify();
}

export async function reactToPhoto(id: string, kind: "like" | "want", delta: 1 | -1) {
  const col = kind === "like" ? "likes" : "wants";
  const { data, error } = await supabase
    .from("photos")
    .select(col)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    console.warn("[api] reactToPhoto read", error?.message);
    return;
  }
  const current = ((data as Record<string, number | null>)[col] ?? 0) as number;
  const next = Math.max(0, current + delta);
  const { error: updErr } = await supabase
    .from("photos")
    .update({ [col]: next })
    .eq("id", id);
  if (updErr) console.warn("[api] reactToPhoto write", updErr.message);
  notify();
}

/* ---------------- Links / Hub Actions ---------------- */

interface HubActionRow {
  id: string;
  restaurant_id: string;
  label: string;
  icon: string | null;
  href: string | null;
  accent: string | null;
  kind: string | null;
  enabled: boolean | null;
  sort_order: number | null;
}

export async function listLinks(restaurantId: string): Promise<HubLink[]> {
  const { data, error } = await supabase
    .from("hub_actions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: true });

  if (error) console.warn("[api] listLinks", error.message);

  const rows = (data as HubActionRow[] | null) ?? [];
  if (rows.length === 0) {
    // Fallback para seed enquanto tabela não estiver populada.
    return SEED_ACTIONS.filter((a) => a.restaurantId === restaurantId).sort(
      (a, b) => a.order - b.order,
    );
  }

  const seedByKey = new Map(SEED_ACTIONS.map((a) => [a.label, a]));
  return rows.map((r, i) => {
    const seed = seedByKey.get(r.label);
    return {
      id: r.id,
      restaurantId: r.restaurant_id,
      key: seed?.key ?? r.label.toLowerCase(),
      label: r.label,
      description: seed?.description,
      icon: r.icon ?? seed?.icon ?? "link",
      accent: (r.accent as HubLink["accent"]) ?? seed?.accent ?? "copper",
      kind: (r.kind as HubLink["kind"]) ?? seed?.kind ?? "external",
      href: r.href ?? seed?.href ?? "",
      internalTo: seed?.internalTo,
      enabled: r.enabled ?? true,
      order: r.sort_order ?? i,
    } satisfies HubLink;
  });
}

export async function updateLink(id: string, patch: Partial<HubLink>) {
  const row: Record<string, unknown> = {};
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.href !== undefined) row.href = patch.href;
  if (patch.accent !== undefined) row.accent = patch.accent;
  if (patch.kind !== undefined) row.kind = patch.kind;
  if (patch.enabled !== undefined) row.enabled = patch.enabled;
  if (patch.order !== undefined) row.sort_order = patch.order;

  const { error } = await supabase.from("hub_actions").update(row).eq("id", id);
  if (error) console.warn("[api] updateLink", error.message);
  notify();
}

/* ---------------- Events ---------------- */

interface EventRow {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string | null;
}

export async function listEvents(restaurantId: string): Promise<HubEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("event_date", { ascending: false });

  if (error) {
    console.warn("[api] listEvents", error.message);
    return [];
  }
  return ((data as EventRow[] | null) ?? []).map((r) => ({
    id: r.id,
    restaurantId: r.restaurant_id,
    title: r.title,
    date: r.event_date ?? "",
    description: r.description ?? "",
    image: r.image_url ?? undefined,
  }));
}

/* ---------------- Analytics ---------------- */

interface AnalyticsRow {
  id: string;
  restaurant_id: string;
  event_type: AnalyticsEvent["type"];
  payload: Record<string, string | number | undefined> | null;
  created_at: string;
}

export async function trackEvent(e: Omit<AnalyticsEvent, "id" | "at">) {
  const { error } = await supabase.from("analytics_events").insert({
    restaurant_id: e.restaurantId,
    event_type: e.type,
    payload: { ...(e.meta ?? {}), source: e.source, tableCode: e.tableCode ?? undefined },
  });
  if (error) console.warn("[api] trackEvent", error.message);
}

export async function listAnalytics(restaurantId: string): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.warn("[api] listAnalytics", error.message);
    return [];
  }
  return ((data as AnalyticsRow[] | null) ?? []).map((r) => ({
    id: r.id,
    restaurantId: r.restaurant_id,
    type: r.event_type,
    meta: r.payload ?? undefined,
    source: r.payload?.source as TrafficSource | undefined,
    tableCode: (r.payload?.tableCode as string | undefined) ?? null,
    at: r.created_at,
  }));
}

/* ---------------- Dev utils ---------------- */

export function resetLocalState() {
  notify();
}