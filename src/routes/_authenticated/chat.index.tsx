import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleHeart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: EmptyChat,
});

function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="rounded-3xl border border-primary/20 bg-secondary p-6">
        <MessageCircleHeart className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        Hi, I'm Saanti.
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Start a new conversation on the left whenever exam stress, self-doubt,
        or burnout feel heavy. I'll listen first, then help you breathe through
        it.
      </p>
    </div>
  );
}
