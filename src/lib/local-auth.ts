import { hasSupabaseConfig } from "@/integrations/supabase/client";
import { DEMO_PASSWORD, DEMO_USERNAME, isDemoUsername } from "@/lib/demo-auth";
import { LOCAL_AUTH_TOKEN } from "@/lib/auth-mode";

const STORAGE_KEY = "saanti.local.session";

export type LocalSession = {
  username: string;
  displayName: string;
};

export function isLocalAuthMode() {
  if (import.meta.env.VITE_LOCAL_AUTH === "true") return true;
  return !hasSupabaseConfig();
}

export function getLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

export function getLocalAuthToken() {
  return getLocalSession() ? LOCAL_AUTH_TOKEN : null;
}

export function isLocalSessionActive() {
  return getLocalSession() !== null;
}

export function usesLocalAuth() {
  return isLocalAuthMode() || isLocalSessionActive();
}

export function signInLocal(identifier: string, password: string) {
  const username = identifier.trim();
  if (!username || !password) {
    throw new Error("Enter a username and password.");
  }

  if (isDemoUsername(username) && password !== DEMO_PASSWORD) {
    throw new Error("Invalid demo credentials.");
  }

  const session: LocalSession = {
    username: isDemoUsername(username) ? DEMO_USERNAME : username,
    displayName: isDemoUsername(username) ? DEMO_USERNAME : username,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("saanti-auth-changed"));
}

export function signOutLocal() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("saanti-auth-changed"));
}

export function localDemoPrefillEnabled() {
  return isLocalAuthMode();
}

export { DEMO_USERNAME, DEMO_PASSWORD };
