import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLocalSession,
  isLocalSessionActive,
  signInLocal,
  signOutLocal,
} from "./local-auth";
import { DEMO_PASSWORD, DEMO_USERNAME } from "./demo-auth";

describe("local auth session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it("stores a demo session after successful sign-in", () => {
    signInLocal(DEMO_USERNAME, DEMO_PASSWORD);
    expect(isLocalSessionActive()).toBe(true);
    expect(getLocalSession()?.username).toBe(DEMO_USERNAME);
  });

  it("rejects invalid demo credentials", () => {
    expect(() => signInLocal(DEMO_USERNAME, "wrong-password")).toThrow(
      "Invalid demo credentials.",
    );
  });

  it("clears the session on sign out", () => {
    signInLocal(DEMO_USERNAME, DEMO_PASSWORD);
    signOutLocal();
    expect(isLocalSessionActive()).toBe(false);
  });
});
