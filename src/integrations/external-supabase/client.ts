import { createClient } from "@supabase/supabase-js";

// Projeto Supabase EXTERNO (nqdaxllqjnxwxmglbghl) — valores hardcoded de
// propósito: o .env deste projeto é gerenciado pelo Lovable Cloud e seria
// sobrescrito. URL + anon key são públicas por design (protegidas por RLS).
const SUPABASE_URL = "https://nqdaxllqjnxwxmglbghl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZGF4bGxxam54d3htZ2xiZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTM0MTUsImV4cCI6MjA5ODc2OTQxNX0.HRFtZWElV0fAOctfDpWGZkAvMwWIN0k_XORTnCQCIB0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // Persistência ligada para permitir login admin (Supabase Auth) sem
  // afetar leituras anon protegidas por RLS.
  auth: { persistSession: true, autoRefreshToken: true },
});