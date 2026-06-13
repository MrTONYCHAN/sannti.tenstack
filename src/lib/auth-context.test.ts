import { describe, expect, it } from "vitest";
import { resolveAuthContext } from "@/lib/auth-context";
import { LOCAL_USER_ID } from "@/lib/auth-mode";

describe("resolveAuthContext", () => {
  it("returns a validated auth context", () => {
    const ctx = resolveAuthContext({
      localMode: true,
      userId: LOCAL_USER_ID,
      supabase: null,
      claims: { sub: LOCAL_USER_ID },
    });
    expect(ctx.localMode).toBe(true);
    expect(ctx.userId).toBe(LOCAL_USER_ID);
  });

  it("rejects missing context", () => {
    expect(() => resolveAuthContext(null)).toThrow(
      "Unauthorized: missing auth context",
    );
  });

  it("rejects invalid user id", () => {
    expect(() =>
      resolveAuthContext({
        localMode: true,
        userId: "",
        supabase: null,
        claims: { sub: LOCAL_USER_ID },
      }),
    ).toThrow("Unauthorized: invalid auth context");
  });
});
