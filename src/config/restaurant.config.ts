/**
 * Configuração única do restaurante — pensada para White Label.
 * Trocar de restaurante = editar apenas este arquivo.
 *
 * Nada de conteúdo institucional deve viver fora daqui.
 */

const heroCover = "/hub-cover.webp";
const logo = "/logo-panela.png";

export interface OpeningHour {
  /** 0 = domingo, 1 = segunda, ... 6 = sábado */
  day: number;
  open: string;
  close: string;
}

export interface RestaurantConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  since: number;
  address: string;
  city: string;

  /** Contatos */
  whatsappPhone: string; // apenas dígitos, formato E.164 sem "+"
  instagramHandle: string;

  /** URLs externas — nunca hardcoded fora daqui */
  urls: {
    maps: string;
    googleReview: string;
    instagram: string; // derivado do handle, mas pode ser sobrescrito
  };

  /** Assets */
  assets: {
    hero: string;
    logo: string;
  };

  openingHours: OpeningHour[];

  features: {
    reservations: boolean;
    events: boolean;
    jobs: boolean;
  };
}

/** Único restaurante ativo hoje. Multi-tenant real virá do backend. */
export const RESTAURANT_CONFIG: RestaurantConfig = {
  id: "rest_panela",
  slug: "panela-da-roca",
  name: "Panela da Roça",
  tagline: "Comida de verdade, feita com tradição desde 1997.",
  since: 1997,
  address: "Panela da Roça · Restaurante & Churrascaria",
  city: "Centro",

  whatsappPhone: "5522998454932",
  instagramHandle: "paneladaroca",

  urls: {
    maps: "https://share.google/FSXuEZVrQ0aFkgA5y",
    googleReview: "https://share.google/DXVlJd8pw0RKANcLR",
    instagram: "https://instagram.com/paneladaroca",
  },

  assets: {
    hero: heroCover,
    logo: logo,
  },

  openingHours: [
    { day: 0, open: "11:00", close: "15:00" },
    { day: 1, open: "11:00", close: "15:00" },
    { day: 2, open: "11:00", close: "15:00" },
    { day: 3, open: "11:00", close: "15:00" },
    { day: 4, open: "11:00", close: "15:00" },
    { day: 5, open: "11:00", close: "15:00" },
    { day: 6, open: "11:00", close: "15:00" },
  ],

  features: {
    reservations: true,
    events: true,
    jobs: true,
  },
};
