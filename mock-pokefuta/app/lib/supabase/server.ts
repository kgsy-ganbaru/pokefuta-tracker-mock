import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

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

type CookieMode = "read-only" | "read-write";

type CreateClientOptions = {
  cookieMode?: CookieMode;
};

export async function createClient(
  options: CreateClientOptions = {}
): Promise<SupabaseServerClient | null> {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const cookieMode = options.cookieMode ?? "read-only";

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        if (cookieMode === "read-write") {
          cookieStore.set({ name, value, ...options });
        }
      },
      remove(name: string, options: CookieOptions) {
        if (cookieMode === "read-write") {
          cookieStore.set({ name, value: "", ...options });
        }
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
