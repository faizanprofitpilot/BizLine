import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/server/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(env.supabase.url(), env.supabase.anonKey());
}

