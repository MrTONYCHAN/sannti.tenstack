import { describe, expect, it } from "vitest";
import { renameThreadSchema, threadIdSchema } from "./thread-schema";

describe("thread schemas", () => {
  it("validates thread ids as uuids", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(threadIdSchema.parse({ id }).id).toBe(id);
  });

  it("rejects empty rename titles", () => {
    expect(() =>
      renameThreadSchema.parse({
        id: "00000000-0000-4000-8000-000000000001",
        title: "",
      }),
    ).toThrow();
  });
});
