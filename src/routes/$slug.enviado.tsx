import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { getRestaurantBySlug } from "@/lib/hub/api";
import type { Restaurant } from "@/lib/hub/types";
import { NotFoundRestaurant } from "@/components/hub/NotFoundRestaurant";
import { BrandMark } from "@/components/hub/BrandMark";

export const Route = createFileRoute("/$slug/enviado")({
  loader: async ({ params }) => {
    const restaurant = await getRestaurantBySlug(params.slug);
    return { restaurant: restaurant as Restaurant | null };
  },
  head: () => ({ meta: [{ title: "Momento enviado · Panela da Roça" }] }),
  component: EnviadoPage,
});

function EnviadoPage() {
  const { restaurant } = Route.useLoaderData() as { restaurant: Restaurant | null };
  if (!restaurant) return <NotFoundRestaurant />;

  return (
    <main className="relative min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="grid size-20 place-items-center rounded-full bg-[color:var(--whatsapp)]/12 text-[color:var(--whatsapp)] ring-8 ring-[color:var(--whatsapp)]/6"
        >
          <CheckCircle2 className="size-10" strokeWidth={1.75} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8"
        >
          <div className="type-label text-[color:var(--copper)]">
            Momento recebido
          </div>
          <h1 className="type-heading mt-2 text-primary text-balance">
            Seu momento foi enviado com sucesso.
          </h1>
          <p className="type-body mt-4 text-muted-foreground text-balance">
            Sua foto já está publicada na galeria da casa. Obrigado por fazer parte
            da comunidade Panela da Roça.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-10 flex w-full flex-col items-center gap-3"
        >
          <Link
            to="/$slug/galeria"
            params={{ slug: restaurant.slug }}
            className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--copper)] px-6 py-3.5 type-button text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
          >
            Voltar para a galeria
          </Link>
          <Link
            to="/$slug"
            params={{ slug: restaurant.slug }}
            className="type-caption underline underline-offset-4"
          >
            Ir para o Hub
          </Link>
        </motion.div>

        <div className="mt-16">
          <BrandMark size={36} plate />
        </div>
      </div>
    </main>
  );
}
