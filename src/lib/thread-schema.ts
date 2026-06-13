import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().min(1).max(120).optional(),
});

export const threadIdSchema = z.object({ id: z.string().uuid() });

export const renameThreadSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
});

export const threadMessagesSchema = z.object({
  threadId: z.string().uuid(),
});
