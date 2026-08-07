import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

/** Supabase client for Server Components / Route Handlers — reads the
 * signed-in user's session from cookies so row-level security scopes every
 * query to their own family/data automatically. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component (not a Route Handler / Server Action) —
            // cookies() is read-only there. Harmless as long as middleware also
            // refreshes the session (see middleware.ts).
          }
        },
      },
    }
  );
}
