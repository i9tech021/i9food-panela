import { useEffect, useState } from "react";
import { supabase } from "@/integrations/external-supabase/client";

export interface AdminSession {
  loading: boolean;
  email: string | null;
  isAuthenticated: boolean;
}

export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({
    loading: true,
    email: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const email = data.session?.user?.email ?? null;
      setState({ loading: false, email, isAuthenticated: !!email });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const email = session?.user?.email ?? null;
      setState({ loading: false, email, isAuthenticated: !!email });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}