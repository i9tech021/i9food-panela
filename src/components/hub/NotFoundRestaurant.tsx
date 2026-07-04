import { Link } from "@tanstack/react-router";

import { BrandMark } from "./BrandMark";

export function NotFoundRestaurant() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <BrandMark size={56} plate className="mx-auto" />
        <div className="mt-4 font-display text-3xl text-primary">
          Restaurante não encontrado
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          O link que você acessou não existe ou foi desativado.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
