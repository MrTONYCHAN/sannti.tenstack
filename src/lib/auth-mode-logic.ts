import type { AuthContext } from "@/integrations/supabase/auth-middleware";

export type ServerAuthEnv = {
  viteLocalAuth?: string;
  localAuth?: string;
  hasSupabaseConfig: boolean;
};

export function shouldUseServerLocalAuth(env: ServerAuthEnv) {
  return (
    env.viteLocalAuth === "true" ||
    env.localAuth === "true" ||
    !env.hasSupabaseConfig
  );
}

export function createLocalAuthContext(userId: string): AuthContext {
  return {
    localMode: true,
    userId,
    supabase: null,
    claims: { sub: userId },
  };
}
