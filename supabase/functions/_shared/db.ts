// Supabase-Client mit Service-Role-Key (umgeht RLS – nur serverseitig verwenden!).
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { env } from "./http.ts";

let client: SupabaseClient | null = null;

export function admin(): SupabaseClient {
  if (!client) {
    client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Prüft ein Benutzer-Token (Magic-Link-Login) und gibt den Benutzer zurück. */
export async function userFromRequest(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
