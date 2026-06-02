import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@/lib/server/env";

export function updateSupabaseSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabase.url(), env.supabase.anonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cookieOptions) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(cookieOptions).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // Per Supabase SSR docs: validate user with getClaims() (refreshes if needed).
  const getClaims = supabase.auth.getClaims();

  return { response, supabase, getClaims };
}

