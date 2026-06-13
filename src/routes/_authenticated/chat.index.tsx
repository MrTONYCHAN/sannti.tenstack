import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleHeart } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: EmptyChat,
});

function EmptyChat() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <img
          src={logo}
          alt=""
          width={480}
          height={480}
          className="w-[min(80vw,28rem)] max-w-none opacity-[0.08] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        />
      </div>

      <div className="relative z-10">
        <div className="rounded-3xl border border-primary/20 bg-secondary p-6">
          <MessageCircleHeart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">
          Hi, I'm Saanti.
        </h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Start a new conversation on the left whenever exam stress, self-doubt,
          or burnout feel heavy. I'll listen first, then help you breathe
          through it.
        </p>
      </div>
    </div>
  );
}
