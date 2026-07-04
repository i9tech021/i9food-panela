import { QueryClient } from "@tanstack/react-query";
import { createRouter, Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="type-label text-[color:var(--copper)]">Algo deu errado</div>
      <h1 className="font-display text-2xl text-primary">Não conseguimos carregar esta tela.</h1>
      <p className="text-sm text-muted-foreground">{error?.message ?? "Tente novamente em instantes."}</p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[color:var(--copper)] px-5 py-2.5 text-sm font-medium text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Tentar novamente
        </button>
        <Link
          to="/"
          className="rounded-full border border-border px-5 py-2.5 text-sm text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function DefaultNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="type-label text-[color:var(--copper)]">Página não encontrada</div>
      <h1 className="font-display text-2xl text-primary">Este endereço não existe.</h1>
      <Link
        to="/"
        className="rounded-full bg-[color:var(--copper)] px-5 py-2.5 text-sm font-medium text-[color:var(--cream)] shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

function DefaultPending() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="size-8 animate-spin rounded-full border-2 border-[color:var(--copper)]/25 border-t-[color:var(--copper)]" />
      <div className="type-label text-muted-foreground">Carregando…</div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultError,
    defaultNotFoundComponent: DefaultNotFound,
    defaultPendingComponent: DefaultPending,
    defaultPendingMs: 400,
    defaultPendingMinMs: 200,
  });

  return router;
};
