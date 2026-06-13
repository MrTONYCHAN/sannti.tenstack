import { createServerFn } from "@tanstack/react-start";
import {
  requireSupabaseAuth,
  type AuthContext,
} from "@/integrations/supabase/auth-middleware";
import * as localData from "@/lib/local-data.server";
import { z } from "zod";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.listThreads(ctx.userId);
    }

    const { data, error } = await ctx
      .supabase!.from("chat_threads")
      .select("id,title,updated_at,created_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ title: z.string().min(1).max(120).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.createThread(
        ctx.userId,
        data.title ?? "New conversation",
      );
    }

    const { data: row, error } = await ctx
      .supabase!.from("chat_threads")
      .insert({
        user_id: ctx.userId,
        title: data.title ?? "New conversation",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.deleteThread(ctx.userId, data.id);
    }

    const { error } = await ctx
      .supabase!.from("chat_threads")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({ id: z.string().uuid(), title: z.string().min(1).max(120) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.renameThread(ctx.userId, data.id, data.title);
    }

    const { error } = await ctx
      .supabase!.from("chat_threads")
      .update({ title: data.title })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.getThreadMessages(ctx.userId, data.threadId);
    }

    const { data: rows, error } = await ctx
      .supabase!.from("chat_messages")
      .select("id,role,content,created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
