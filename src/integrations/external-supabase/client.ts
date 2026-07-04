import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn(
    "[external-supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados.",
  );
}

export const supabase = createClient(url ?? "http://localhost", anon ?? "anon", {
  auth: { persistSession: false, autoRefreshToken: false },
});