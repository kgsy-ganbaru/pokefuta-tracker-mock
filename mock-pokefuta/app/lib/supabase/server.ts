import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

export type SupabaseServerClient = ReturnType<typeof createServerClient>;

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createClient(): Promise<SupabaseServerClient | null> {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

export function createAdminClient(): SupabaseServerClient | null {
  const config = getSupabaseConfig();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE;

  if (!config || !serviceRoleKey) {
    return null;
  }

  return createServerClient(config.supabaseUrl, serviceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        return undefined;
      },
      remove() {
        return undefined;
      },
    },
  });
}
