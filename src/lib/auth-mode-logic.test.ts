import { describe, expect, it } from "vitest";
import { LOCAL_USER_ID } from "./auth-mode";
import {
  createLocalAuthContext,
  shouldUseServerLocalAuth,
} from "./auth-mode-logic";

describe("server auth mode logic", () => {
  it("enables local mode when VITE_LOCAL_AUTH is true", () => {
    expect(
      shouldUseServerLocalAuth({
        viteLocalAuth: "true",
        localAuth: "",
        hasSupabaseConfig: true,
      }),
    ).toBe(true);
  });

  it("enables local mode when Supabase is not configured", () => {
    expect(
      shouldUseServerLocalAuth({
        viteLocalAuth: "",
        localAuth: "",
        hasSupabaseConfig: false,
      }),
    ).toBe(true);
  });

  it("returns a stable local auth context", () => {
    const ctx = createLocalAuthContext(LOCAL_USER_ID);
    expect(ctx.localMode).toBe(true);
    expect(ctx.userId).toBe(LOCAL_USER_ID);
    expect(ctx.claims?.sub).toBe(LOCAL_USER_ID);
    expect(ctx.supabase).toBeNull();
  });
});
