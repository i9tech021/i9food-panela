import type { Photo, Restaurant } from "./types";

export function isOpenNow(r: Restaurant, at = new Date()): boolean {
  const day = at.getDay();
  const slot = r.openingHours.find((h) => h.day === day);
  if (!slot) return false;
  const [oh, om] = slot.open.split(":").map(Number);
  const [ch, cm] = slot.close.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  const nowMin = at.getHours() * 60 + at.getMinutes();
  return nowMin >= openMin && nowMin < closeMin;
}

const WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export function groupByDay(photos: Photo[]): Array<{ label: string; iso: string; items: Photo[] }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups = new Map<number, Photo[]>();
  for (const p of photos) {
    const d = new Date(p.createdAt);
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const entries = Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  return entries.map(([key, items]) => {
    const diffDays = Math.round((today - key) / 86_400_000);
    let label: string;
    if (diffDays === 0) label = "Hoje";
    else if (diffDays === 1) label = "Ontem";
    else if (diffDays < 7) label = WEEKDAYS[new Date(key).getDay()];
    else
      label = new Date(key).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
      });
    return { label, iso: new Date(key).toISOString(), items };
  });
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "i9food_device_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

const REACT_KEY = "i9food_reactions_v1";
type ReactMap = Record<string, { like?: boolean; want?: boolean }>;

export function getReactions(): ReactMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(REACT_KEY) || "{}") as ReactMap;
  } catch {
    return {};
  }
}

export function setReactions(map: ReactMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REACT_KEY, JSON.stringify(map));
}

export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now.getTime() - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}