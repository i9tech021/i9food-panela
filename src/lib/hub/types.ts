export type PhotoStatus = "pending" | "approved" | "rejected" | "featured";
export type TrafficSource = "qr" | "nfc" | "direct" | "share";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  since: number;
  heroImage: string;
  address: string;
  city?: string;
  mapsUrl: string;
  whatsapp: string; // full wa.me url (contato geral)
  whatsappPhone: string; // digits only, ex: 5522999454932
  instagram: string;
  instagramHandle: string;
  googleReviewUrl: string;
  openingHours: Array<{ day: number; open: string; close: string }>;
  features: {
    reservations: boolean;
    events: boolean;
    jobs: boolean;
  };
}

export interface Photo {
  id: string;
  restaurantId: string;
  url: string;
  authorName: string | null;
  caption: string | null;
  status: PhotoStatus;
  createdAt: string;
  likes: number;
  wants: number;
  tableCode?: string | null;
  source?: TrafficSource;
}

/** Cor de destaque de um Action Card (token semântico do design system). */
export type ActionAccent =
  | "copper"
  | "maps"
  | "gold"
  | "google-yellow"
  | "instagram"
  | "whatsapp"
  | "jobs-blue"
  | "events-orange"
  | "sage";

export type ActionKind = "internal" | "external" | "whatsapp";

export interface HubAction {
  id: string;
  restaurantId: string;
  key: string;
  label: string;
  description?: string;
  icon: string;
  accent: ActionAccent;
  kind: ActionKind;
  /** URL externa (kind=external|whatsapp) — para whatsapp é montada em runtime. */
  href: string;
  /** Rota interna sem params (kind=internal). Ex: "/$slug/galeria" */
  internalTo?: string;
  enabled: boolean;
  order: number;
}

/** Alias legado para compat com admin/api atual. */
export type HubLink = HubAction;

export interface HubEvent {
  id: string;
  restaurantId: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export interface AnalyticsEvent {
  id: string;
  restaurantId: string;
  type:
    | "visit"
    | "photo_upload"
    | "photo_like"
    | "photo_want"
    | "link_click"
    | "share";
  meta?: Record<string, string | number | undefined>;
  source?: TrafficSource;
  tableCode?: string | null;
  at: string;
}
