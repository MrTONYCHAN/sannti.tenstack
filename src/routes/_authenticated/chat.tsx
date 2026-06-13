import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MessageCircle } from "lucide-react";
import {
  createThread,
  deleteThread,
  listThreads,
} from "@/lib/threads.functions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatLayout,
});

function ChatLayout() {
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const threads = useQuery({ queryKey: ["threads"], queryFn: () => list() });

  const createMut = useMutation({
    mutationFn: () => create({ data: {} }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (row)
        navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
    onError: () => toast.error("Could not start a new conversation"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (pathname.includes(id)) navigate({ to: "/chat" });
    },
  });

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="flex h-full flex-col border-r border-border/60 bg-sidebar/50">
        <div className="border-b border-border/60 p-3">
          <Button
            className="w-full justify-start gap-2"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
          >
            <Plus className="h-4 w-4" /> New conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {threads.isLoading && (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                Loading…
              </p>
            )}
            {threads.data?.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground">
                No conversations yet. Start one above.
              </p>
            )}
            {threads.data?.map((t) => {
              const active = pathname.endsWith(t.id);
              return (
                <div
                  key={t.id}
                  className={`group flex items-center gap-1 rounded-md px-1 ${
                    active ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className="flex flex-1 items-center gap-2 rounded px-2 py-2 text-sm hover:bg-sidebar-accent"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{t.title}</span>
                  </Link>
                  <button
                    aria-label="Delete"
                    className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    onClick={() => deleteMut.mutate(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
      <section className="flex h-full min-w-0 flex-col">
        <Outlet />
      </section>
    </div>
  );
}
