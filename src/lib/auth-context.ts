import type { AuthContext } from "@/integrations/supabase/auth-middleware";

export function resolveAuthContext(context: unknown): AuthContext {
  if (!context || typeof context !== "object") {
    throw new Error("Unauthorized: missing auth context");
  }

  const candidate = context as Partial<AuthContext>;
  if (typeof candidate.userId !== "string" || !candidate.userId) {
    throw new Error("Unauthorized: invalid auth context");
  }
  if (typeof candidate.localMode !== "boolean") {
    throw new Error("Unauthorized: invalid auth context");
  }
  if (!candidate.claims?.sub) {
    throw new Error("Unauthorized: invalid auth context");
  }

  return candidate as AuthContext;
}
