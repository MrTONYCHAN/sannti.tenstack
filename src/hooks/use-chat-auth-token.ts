import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { LOCAL_AUTH_TOKEN } from "@/lib/auth-mode";
import { getLocalAuthToken, isLocalAuthMode } from "@/lib/local-auth";

export function useChatAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLocalAuthMode()) {
      setToken(getLocalAuthToken() ?? LOCAL_AUTH_TOKEN);
      return;
    }

    const localToken = getLocalAuthToken();
    if (localToken) {
      setToken(localToken);
      return;
    }

    if (!hasSupabaseConfig()) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  return token;
}
