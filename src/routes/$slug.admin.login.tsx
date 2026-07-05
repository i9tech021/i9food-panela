import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";

import { supabase } from "@/integrations/external-supabase/client";
import { useAdminSession } from "@/lib/hub/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/admin/login")({
  head: () => ({ meta: [{ title: "Admin · Login" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/$slug/admin", params: { slug }, replace: true });
    }
  }, [loading, isAuthenticated, navigate, slug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/$slug/admin", params: { slug }, replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
      >
        <div>
          <div className="type-label text-[color:var(--copper)]">i9 Food OS</div>
          <h1 className="type-heading mt-1 text-primary">Acesso do administrador</h1>
          <p className="type-caption mt-1">Entre com seu e-mail e senha.</p>
        </div>

        <label className="block">
          <span className="type-label mb-2 block text-primary">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
          />
        </label>
        <label className="block">
          <span className="type-label mb-2 block text-primary">Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 type-body text-primary focus:border-[color:var(--copper)] focus:outline-none focus:ring-2 focus:ring-[color:var(--copper)]/20"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center type-caption text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-3 type-button",
            submitting
              ? "bg-muted text-muted-foreground"
              : "bg-[color:var(--copper)] text-[color:var(--cream)] shadow-[var(--shadow-lift)] hover:-translate-y-0.5",
          )}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Entrar
        </button>
      </form>
    </main>
  );
}