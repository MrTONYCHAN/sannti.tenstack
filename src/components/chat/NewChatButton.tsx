import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateChatThread } from "@/hooks/use-create-chat-thread";
import { cn } from "@/lib/utils";

type NewChatButtonProps = {
  className?: string;
};

export function NewChatButton({ className }: NewChatButtonProps) {
  const createMut = useCreateChatThread();

  return (
    <Button
      size="lg"
      className={cn(
        "gap-2 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      onClick={() => createMut.mutate()}
      disabled={createMut.isPending}
      aria-busy={createMut.isPending}
    >
      <Plus className="h-4 w-4" />
      New Chat
    </Button>
  );
}
