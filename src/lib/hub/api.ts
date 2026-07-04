/**
 * Hub API — mock/local implementation.
 *
 * Contract is intentionally shaped like the future Supabase-backed service so
 * we can swap the impl (repo layer) without touching UI. Every read/write is
 * async and multi-tenant (restaurantId or restaurantSlug).
 */
import {
  SEED_ANALYTICS,
  SEED_EVENTS,
  SEED_LINKS,
  SEED_PHOTOS,
  SEED_RESTAURANTS,
} from "./seed";
import type {
  AnalyticsEvent,
  HubEvent,
  HubLink,
  Photo,
  PhotoStatus,
  Restaurant,
  TrafficSource,
} from "./types";

const STORAGE_KEY = "i9food_hub_state_v1";
const isBrowser = typeof window !== "undefined";

interface DBState {
  restaurants: Restaurant[];
  photos: Photo[];
  links: HubLink[];
  events: HubEvent[];
  analytics: AnalyticsEvent[];
}

function seedState(): DBState {
  return {
    restaurants: SEED_RESTAURANTS,
    photos: SEED_PHOTOS,
    links: SEED_LINKS,
    events: SEED_EVENTS,
    analytics: SEED_ANALYTICS,
  };
}

let memory: DBState = seedState();
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (!isBrowser || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DBState>;
      memory = {
        ...seedState(),
        ...parsed,
        // Always trust code seeds for restaurants/links/events (author editable in admin persists though)
        restaurants: parsed.restaurants?.length ? parsed.restaurants : SEED_RESTAURANTS,
      };
    }
  } catch {
    // ignore
  }
}

function persist() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const rid = () =>
  (isBrowser && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

/* ---------------- Restaurants ---------------- */

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  load();
  return memory.restaurants.find((r) => r.slug === slug) ?? null;
}

export async function updateRestaurant(id: string, patch: Partial<Restaurant>) {
  load();
  memory.restaurants = memory.restaurants.map((r) => (r.id === id ? { ...r, ...patch } : r));
  persist();
}

/* ---------------- Photos ---------------- */

export interface PhotosQuery {
  restaurantId: string;
  status?: PhotoStatus | "public"; // "public" = approved + featured
  sort?: "recent" | "liked" | "featured";
}

export async function listPhotos(q: PhotosQuery): Promise<Photo[]> {
  load();
  let out = memory.photos.filter((p) => p.restaurantId === q.restaurantId);
  if (q.status === "public") {
    out = out.filter((p) => p.status === "approved" || p.status === "featured");
  } else if (q.status) {
    out = out.filter((p) => p.status === q.status);
  }
  if (q.sort === "liked") out = out.sort((a, b) => b.likes - a.likes);
  else if (q.sort === "featured")
    out = out.sort((a, b) => Number(b.status === "featured") - Number(a.status === "featured"));
  else out = out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

export interface CreatePhotoInput {
  restaurantId: string;
  file: File;
  authorName?: string | null;
  caption?: string | null;
  tableCode?: string | null;
  source?: TrafficSource;
}

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  load();
  const url = URL.createObjectURL(input.file);
  const photo: Photo = {
    id: rid(),
    restaurantId: input.restaurantId,
    url,
    authorName: input.authorName?.trim() || null,
    caption: input.caption?.trim() || null,
    // Publicação instantânea — sem revisão. Backend futuro pode mudar o default.
    status: "approved",
    createdAt: new Date().toISOString(),
    likes: 0,
    wants: 0,
    tableCode: input.tableCode ?? null,
    source: input.source,
  };
  memory.photos = [photo, ...memory.photos];
  persist();
  return photo;
}

export async function setPhotoStatus(id: string, status: PhotoStatus) {
  load();
  memory.photos = memory.photos.map((p) => (p.id === id ? { ...p, status } : p));
  persist();
}

export async function reactToPhoto(id: string, kind: "like" | "want", delta: 1 | -1) {
  load();
  memory.photos = memory.photos.map((p) => {
    if (p.id !== id) return p;
    if (kind === "like") return { ...p, likes: Math.max(0, p.likes + delta) };
    return { ...p, wants: Math.max(0, p.wants + delta) };
  });
  persist();
}

/* ---------------- Links ---------------- */

export async function listLinks(restaurantId: string): Promise<HubLink[]> {
  load();
  return memory.links
    .filter((l) => l.restaurantId === restaurantId)
    .sort((a, b) => a.order - b.order);
}

export async function updateLink(id: string, patch: Partial<HubLink>) {
  load();
  memory.links = memory.links.map((l) => (l.id === id ? { ...l, ...patch } : l));
  persist();
}

/* ---------------- Events ---------------- */

export async function listEvents(restaurantId: string): Promise<HubEvent[]> {
  load();
  return memory.events
    .filter((e) => e.restaurantId === restaurantId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------------- Analytics ---------------- */

export async function trackEvent(e: Omit<AnalyticsEvent, "id" | "at">) {
  load();
  memory.analytics = [
    { ...e, id: rid(), at: new Date().toISOString() },
    ...memory.analytics,
  ].slice(0, 5000);
  persist();
}

export async function listAnalytics(restaurantId: string): Promise<AnalyticsEvent[]> {
  load();
  return memory.analytics.filter((e) => e.restaurantId === restaurantId);
}

/* ---------------- Dev utils ---------------- */

export function resetLocalState() {
  memory = seedState();
  hydrated = true;
  if (isBrowser) window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}