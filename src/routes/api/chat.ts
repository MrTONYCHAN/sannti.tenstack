import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  buildCompanionSystemPrompt,
  createCompanionModel,
  getGoogleAiApiKey,
} from "@/lib/ai-gateway.server";
import { containsCrisisLanguage } from "@/lib/wellness-safety";

const MAX_CHAT_CONTEXT_MESSAGES = 24;
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

function toSafeUiMessages(
  messages: z.infer<typeof MessageSchema>[],
): UIMessage[] {
  return messages.slice(-MAX_CHAT_CONTEXT_MESSAGES).map((message, index) => ({
    ...message,
    id: message.id ?? `${message.role}-${index}`,
    role: message.role,
    parts: message.parts.map((part) => ({
      type: "text" as const,
      text: part.text.slice(0, MAX_CHAT_MESSAGE_CHARS),
    })),
  }));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer "))
          return new Response("Unauthorized", { status: 401 });
        const token = auth.slice(7);

        const SUPABASE_URL =
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY =
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server is not configured", { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsErr } =
          await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub)
          return new Response("Unauthorized", { status: 401 });
        const userId = claims.claims.sub;

        let body: z.infer<typeof ChatBodySchema>;
        try {
          body = ChatBodySchema.parse(await request.json());
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const { threadId } = body;
        const messages = toSafeUiMessages(body.messages);
        const last = body.messages[body.messages.length - 1];
        const latestUserText =
          last?.role === "user" ? textFromMessage(last) : "";

        if (!latestUserText)
          return new Response("Bad request", { status: 400 });

        // Verify thread belongs to user
        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        await supabase.from("chat_messages").insert({
          thread_id: threadId,
          user_id: userId,
          role: "user",
          content: latestUserText,
        });

        const key = getGoogleAiApiKey();
        if (!key) return new Response("AI not configured", { status: 500 });
        const crisisDetected = containsCrisisLanguage(latestUserText);

        const result = streamText({
          model: createCompanionModel(key),
          system: buildCompanionSystemPrompt({ crisisDetected }),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistant = finalMessages[finalMessages.length - 1];
            if (assistant?.role === "assistant") {
              const text = assistant.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (text.trim()) {
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
              }
            }
          },
        });
      },
    },
  },
});
