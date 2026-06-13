import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createCompanionChatResponse } from "@/lib/companion-chat.server";
import {
  requireSupabaseServerEnv,
  hasSupabaseServerConfig,
} from "@/lib/supabase-env.server";
import { isLocalAuthToken, LOCAL_USER_ID } from "@/lib/auth-mode";
import {
  isServerLocalAuthMode,
  localAuthServerContext,
} from "@/lib/auth-mode.server";
import * as localData from "@/lib/local-data.server";

const MAX_CHAT_MESSAGE_CHARS = 4000;

const TextPartSchema = z
  .object({
    type: z.literal("text"),
    text: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_CHARS),
  })
  .passthrough();

const MessageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant"]),
    parts: z.array(TextPartSchema).min(1).max(12),
  })
  .passthrough();

const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(60),
  threadId: z.string().uuid(),
});

function textFromMessage(message: z.infer<typeof MessageSchema>): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization");
          const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";

          let userId = LOCAL_USER_ID;
          let localMode = isServerLocalAuthMode();

          if (token && isLocalAuthToken(token)) {
            localMode = true;
            userId = LOCAL_USER_ID;
          } else if (token && !localMode) {
            if (!hasSupabaseServerConfig()) {
              return new Response("Unauthorized", { status: 401 });
            }

            const {
              url: SUPABASE_URL,
              publishableKey: SUPABASE_PUBLISHABLE_KEY,
            } = requireSupabaseServerEnv();

            const supabase = createClient(
              SUPABASE_URL,
              SUPABASE_PUBLISHABLE_KEY,
              {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
              },
            );
            const { data: userData, error: userErr } =
              await supabase.auth.getUser(token);
            if (userErr || !userData.user) {
              if (isServerLocalAuthMode()) {
                localMode = true;
                userId = localAuthServerContext().userId;
              } else {
                return new Response("Unauthorized", { status: 401 });
              }
            } else {
              userId = userData.user.id;
              localMode = false;
            }
          } else if (!localMode) {
            return new Response("Unauthorized", { status: 401 });
          }

          let body: z.infer<typeof ChatBodySchema>;
          try {
            body = ChatBodySchema.parse(await request.json());
          } catch {
            return new Response("Bad request", { status: 400 });
          }

          const { threadId } = body;
          const messages = body.messages.map((message, index) => ({
            ...message,
            id: message.id ?? `${message.role}-${index}`,
            parts: message.parts.map((part) => ({
              type: "text" as const,
              text: part.text.slice(0, MAX_CHAT_MESSAGE_CHARS),
            })),
          }));
          const last = body.messages[body.messages.length - 1];
          const latestUserText =
            last?.role === "user" ? textFromMessage(last) : "";

          if (!latestUserText)
            return new Response("Bad request", { status: 400 });

          if (localMode) {
            try {
              localData.ensureThread(userId, threadId);
              localData.insertChatMessage(
                userId,
                threadId,
                "user",
                latestUserText,
              );
            } catch (error) {
              console.error("[chat] failed to persist user message", error);
              return Response.json(
                { error: "Could not save your message" },
                { status: 500 },
              );
            }
          } else {
            const {
              url: SUPABASE_URL,
              publishableKey: SUPABASE_PUBLISHABLE_KEY,
            } = requireSupabaseServerEnv();
            const supabase = createClient(
              SUPABASE_URL,
              SUPABASE_PUBLISHABLE_KEY,
              {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
              },
            );

            const { data: thread } = await supabase
              .from("chat_threads")
              .select("id")
              .eq("id", threadId)
              .eq("user_id", userId)
              .maybeSingle();
            if (!thread)
              return new Response("Thread not found", { status: 404 });

            await supabase.from("chat_messages").insert({
              thread_id: threadId,
              user_id: userId,
              role: "user",
              content: latestUserText,
            });
          }

          return createCompanionChatResponse({
            messages,
            latestUserText,
            onFinish: async ({ messages: finalMessages }) => {
              try {
                const assistant = finalMessages[finalMessages.length - 1];
                if (assistant?.role !== "assistant") return;

                const text = assistant.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                if (!text.trim()) return;

                if (localMode) {
                  localData.insertChatMessage(
                    userId,
                    threadId,
                    "assistant",
                    text,
                  );
                  return;
                }

                const {
                  url: SUPABASE_URL,
                  publishableKey: SUPABASE_PUBLISHABLE_KEY,
                } = requireSupabaseServerEnv();
                const supabase = createClient(
                  SUPABASE_URL,
                  SUPABASE_PUBLISHABLE_KEY,
                  {
                    global: { headers: { Authorization: `Bearer ${token}` } },
                    auth: { persistSession: false, autoRefreshToken: false },
                  },
                );
                await supabase.from("chat_messages").insert({
                  thread_id: threadId,
                  user_id: userId,
                  role: "assistant",
                  content: text,
                });
                await supabase
                  .from("chat_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", threadId);
              } catch (error) {
                console.error("[chat] failed to persist assistant message", error);
              }
            },
          });
        } catch (error) {
          console.error("[chat] unhandled error", error);
          const message =
            error instanceof Error ? error.message : "Chat failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
