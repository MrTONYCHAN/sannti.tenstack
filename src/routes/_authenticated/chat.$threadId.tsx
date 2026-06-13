import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages, renameThread } from "@/lib/threads.functions";
import { useChatAuthToken } from "@/hooks/use-chat-auth-token";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LogoWatermark } from "@/components/brand/LogoWatermark";
import { SaantiLogo } from "@/components/brand/SaantiLogo";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

const SUGGESTIONS = [
  "I'm anxious about my next mock test",
  "I can't focus today — my mind keeps wandering",
  "I feel behind compared to my friends",
  "Help me wind down before bed",
];

function ChatThread() {
  const { threadId } = Route.useParams();
  const qc = useQueryClient();
  const fetchMessages = useServerFn(getThreadMessages);
  const rename = useServerFn(renameThread);

  const initialQ = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => fetchMessages({ data: { threadId } }),
  });

  const initialMessages: UIMessage[] = useMemo(
    () =>
      (initialQ.data ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text", text: m.content }],
      })),
    [initialQ.data],
  );

  if (initialQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <ChatInner
      key={threadId}
      threadId={threadId}
      initialMessages={initialMessages}
      onFirstUserMessage={async (text) => {
        const title = text.slice(0, 60);
        try {
          await rename({ data: { id: threadId, title } });
          qc.invalidateQueries({ queryKey: ["threads"] });
        } catch {
          /* noop */
        }
      }}
    />
  );
}

function ChatInner({
  threadId,
  initialMessages,
  onFirstUserMessage,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  onFirstUserMessage: (text: string) => void;
}) {
  const token = useChatAuthToken();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { threadId },
      }),
    [token, threadId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isBusy || !token) return;
    const isFirst = initialMessages.length === 0 && messages.length === 0;
    setInput("");
    await sendMessage({ text: value });
    if (isFirst) onFirstUserMessage(value);
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <LogoWatermark size="panel" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 py-8">
          {messages.length === 0 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-secondary">
                <SaantiLogo size="md" alt="" blended={false} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  How are you feeling right now?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Talk to Saanti. Anything you share stays private.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-border/60 bg-card p-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id}>
                <div className="prose prose-sm max-w-none text-foreground prose-p:my-2 prose-headings:my-3 prose-li:my-0">
                  <ReactMarkdown>{text || "…"}</ReactMarkdown>
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <p className="animate-pulse text-sm text-muted-foreground">
              Saanti is thinking…
            </p>
          )}

          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message?.trim() && error.message !== "An error occurred."
                ? error.message
                : "Saanti couldn't reply right now. Please try again — offline support should still work once the server redeploys."}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 backdrop-blur">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind…"
            className="min-h-[52px] max-h-40 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            disabled={!token}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isBusy || !input.trim() || !token}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
