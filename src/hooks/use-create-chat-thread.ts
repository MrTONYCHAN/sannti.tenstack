import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createThread } from "@/lib/threads.functions";

export function useCreateChatThread() {
  const create = useServerFn(createThread);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => create({ data: {} }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (row) {
        navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
      }
    },
    onError: () => toast.error("Could not start a new conversation"),
  });
}
