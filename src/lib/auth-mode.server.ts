import type { AuthContext } from "@/integrations/supabase/auth-middleware";
import { LOCAL_USER_ID } from "@/lib/auth-mode";
import { hasSupabaseServerConfig } from "@/lib/supabase-env.server";
import {
  createLocalAuthContext,
  shouldUseServerLocalAuth,
} from "./auth-mode-logic";

export function isServerLocalAuthMode() {
  return shouldUseServerLocalAuth({
    viteLocalAuth: process.env.VITE_LOCAL_AUTH,
    localAuth: process.env.LOCAL_AUTH,
    hasSupabaseConfig: hasSupabaseServerConfig(),
  });
}

export function localAuthServerContext(): AuthContext {
  return createLocalAuthContext(LOCAL_USER_ID);
}
