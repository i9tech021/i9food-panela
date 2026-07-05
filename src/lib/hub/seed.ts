import type {
  AnalyticsEvent,
  HubAction,
  HubEvent,
  Photo,
  Restaurant,
} from "./types";
import { waUrl, WA_MESSAGES } from "./whatsapp";
import { RESTAURANT_CONFIG } from "@/config/restaurant.config";

export const HERO_IMAGE = RESTAURANT_CONFIG.assets.hero;

const WHATSAPP_DIGITS = RESTAURANT_CONFIG.whatsappPhone;
const GOOGLE_REVIEW_URL = RESTAURANT_CONFIG.urls.googleReview;
const MAPS_URL = RESTAURANT_CONFIG.urls.maps;
const INSTAGRAM_HANDLE = RESTAURANT_CONFIG.instagramHandle;
const INSTAGRAM_URL = RESTAURANT_CONFIG.urls.instagram;

export const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: RESTAURANT_CONFIG.id,
    slug: RESTAURANT_CONFIG.slug,
    name: RESTAURANT_CONFIG.name,
    tagline: RESTAURANT_CONFIG.tagline,
    since: RESTAURANT_CONFIG.since,
    heroImage: RESTAURANT_CONFIG.assets.hero,
    address: `${RESTAURANT_CONFIG.city} · ${RESTAURANT_CONFIG.address}`,
    city: RESTAURANT_CONFIG.city,
    mapsUrl: MAPS_URL,
    whatsapp: waUrl(WHATSAPP_DIGITS, WA_MESSAGES.contact),
    whatsappPhone: WHATSAPP_DIGITS,
    instagram: INSTAGRAM_URL,
    instagramHandle: `@${INSTAGRAM_HANDLE}`,
    googleReviewUrl: GOOGLE_REVIEW_URL,
    openingHours: RESTAURANT_CONFIG.openingHours,
    features: RESTAURANT_CONFIG.features,
  },
];


/**
 * Galeria começa vazia. Backend (Supabase) irá popular no futuro
 * sem qualquer mudança estrutural.
 */
export const SEED_PHOTOS: Photo[] = [];

export const SEED_ACTIONS: HubAction[] = [
  {
    id: "a_momentos",
    restaurantId: "rest_panela",
    key: "momentos",
    label: "Momentos no Panela",
    description: "Fotos da comunidade",
    icon: "camera",
    accent: "copper",
    kind: "internal",
    href: "",
    internalTo: "/$slug/galeria",
    enabled: true,
    order: 1,
  },
  {
    id: "a_directions",
    restaurantId: "rest_panela",
    key: "directions",
    label: "Como Chegar",
    description: "Abrir rota no Maps",
    icon: "map-pin",
    accent: "maps",
    kind: "external",
    href: MAPS_URL,
    enabled: true,
    order: 2,
  },
  {
    id: "a_reservations",
    restaurantId: "rest_panela",
    key: "reservations",
    label: "Reservas",
    description: "Garanta sua mesa",
    icon: "calendar-check",
    accent: "gold",
    kind: "internal",
    href: "",
    internalTo: "/$slug/reservas",
    enabled: true,
    order: 3,
  },
  {
    id: "a_google",
    restaurantId: "rest_panela",
    key: "google",
    label: "Avaliar no Google",
    description: "Sua opinião fortalece a casa",
    icon: "star",
    accent: "google-yellow",
    kind: "external",
    href: GOOGLE_REVIEW_URL,
    enabled: true,
    order: 4,
  },
  {
    id: "a_instagram",
    restaurantId: "rest_panela",
    key: "instagram",
    label: "Instagram",
    description: `@${INSTAGRAM_HANDLE}`,
    icon: "instagram",
    accent: "instagram",
    kind: "external",
    href: INSTAGRAM_URL,
    enabled: true,
    order: 5,
  },
  {
    id: "a_whatsapp",
    restaurantId: "rest_panela",
    key: "whatsapp",
    label: "WhatsApp",
    description: "Fale com a equipe",
    icon: "message-circle",
    accent: "whatsapp",
    kind: "whatsapp",
    href: waUrl(WHATSAPP_DIGITS, WA_MESSAGES.contact),
    enabled: true,
    order: 6,
  },
  {
    id: "a_jobs",
    restaurantId: "rest_panela",
    key: "jobs",
    label: "Trabalhe Conosco",
    description: "Envie seu currículo",
    icon: "briefcase",
    accent: "jobs-blue",
    kind: "internal",
    href: "",
    internalTo: "/$slug/trabalhe-conosco",
    enabled: true,
    order: 7,
  },
  {
    id: "a_events",
    restaurantId: "rest_panela",
    key: "events",
    label: "Eventos",
    description: "Programação especial",
    icon: "sparkles",
    accent: "events-orange",
    kind: "internal",
    href: "",
    internalTo: "/$slug/eventos",
    enabled: true,
    order: 8,
  },
];

/** Legado — alguns arquivos ainda importam SEED_LINKS. */
export const SEED_LINKS = SEED_ACTIONS;

export const SEED_EVENTS: HubEvent[] = [];

export const SEED_ANALYTICS: AnalyticsEvent[] = [];
