import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Camera,
  MapPin,
  CalendarCheck,
  Sparkles,
  Star,
  Instagram,
  MessageCircle,
  Briefcase,
  Info,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";

import { BrandMark } from "./BrandMark";
import type { Restaurant } from "@/lib/hub/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

interface Item {
  key: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
  soon?: boolean;
}

export function SideDrawer({ open, onClose, restaurant }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // foco inicial no botão fechar — a11y de teclado
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const items: Item[] = [
    { key: "home", label: "Início", icon: Home, to: "/$slug" },
    { key: "momentos", label: "Momentos no Panela", icon: Camera, to: "/$slug/galeria" },
    { key: "eventos", label: "Eventos", icon: Sparkles, to: "/$slug/eventos" },
    { key: "directions", label: "Como Chegar", icon: MapPin, href: restaurant.mapsUrl },
    { key: "reservations", label: "Reservas", icon: CalendarCheck, href: restaurant.whatsapp },
    { key: "google", label: "Avaliar no Google", icon: Star, href: restaurant.googleReviewUrl },
    { key: "instagram", label: "Instagram", icon: Instagram, href: restaurant.instagram },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, href: restaurant.whatsapp },
    { key: "jobs", label: "Trabalhe Conosco", icon: Briefcase, href: restaurant.whatsapp },
    { key: "about", label: "Sobre", icon: Info, soon: true },
    { key: "settings", label: "Configurações", icon: Settings, soon: true },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            id="site-menu-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            role="dialog"
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-sm flex-col overflow-hidden text-[color:var(--cream)] shadow-[var(--shadow-hero)]"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.24 0.03 45 / 0.94) 0%, oklch(0.18 0.025 45 / 0.94) 100%)",
              backdropFilter: "blur(28px) saturate(140%)",
            }}
          >
            {/* textura sutil */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-24 h-64 rounded-full bg-[color:var(--copper)]/20 blur-3xl"
            />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/8 px-5 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <BrandMark size={40} />
                <div className="leading-tight">
                  <div className="font-display text-lg">Panela da Roça</div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                    Experience
                  </div>
                </div>
              </div>
              <button
                aria-label="Fechar menu"
                ref={closeBtnRef}
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Items */}
            <nav className="relative flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <span
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                        item.soon
                          ? "text-white/40"
                          : "text-white/90 hover:bg-white/10 group-focus-visible:bg-white/10 group-active:bg-white/15",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          item.soon ? "opacity-50" : "text-[color:var(--gold)]",
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.soon && (
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/55">
                          em breve
                        </span>
                      )}
                    </span>
                  );

                  if (item.soon) {
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          className="w-full text-left focus-visible:outline-none"
                          disabled
                        >
                          {content}
                        </button>
                      </li>
                    );
                  }

                  if (item.to) {
                    return (
                      <li key={item.key}>
                        <Link
                          to={item.to}
                          params={{ slug: restaurant.slug }}
                          onClick={onClose}
                          className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60"
                        >
                          {content}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60"
                      >
                        {content}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="relative border-t border-white/8 px-5 py-4">
              <div className="text-[11px] text-white/60">
                Desde 1997 criando momentos ao redor da mesa.
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/45">
                Powered by <span className="text-[color:var(--gold)] normal-case tracking-normal font-medium">i9 Food OS</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Hook trivial para controle do drawer. */
export function useDrawer() {
  const [open, setOpen] = useState(false);
  return { open, openDrawer: () => setOpen(true), closeDrawer: () => setOpen(false) };
}
