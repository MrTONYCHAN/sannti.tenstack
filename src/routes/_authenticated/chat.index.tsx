import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleHeart } from "lucide-react";
import { LogoWatermark } from "@/components/brand/LogoWatermark";
import { NewChatButton } from "@/components/chat/NewChatButton";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: EmptyChat,
});

function EmptyChat() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <LogoWatermark size="panel" />

      <div className="relative z-10">
        <div className="rounded-3xl border border-primary/20 bg-secondary p-6">
          <MessageCircleHeart className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            Hi, I'm Saanti.
          </h2>
        </div>
        <p className="mt-2 max-w-md text-muted-foreground">
          Whenever exam stress, self-doubt, or burnout feel heavy, start a new
          chat. I'll listen first, then help you breathe through it.
        </p>
      </div>

      <NewChatButton className="absolute bottom-6 right-6 z-10" />
    </div>
  );
}
