"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/** Supabase client for Client Components — reads the public URL/anon key,
 * safe to expose to the browser (row-level security enforces access). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
