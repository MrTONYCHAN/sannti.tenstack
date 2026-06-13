import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { deleteThread, listThreads } from "@/lib/threads.functions";

export function ChatThreadList() {
  const list = useServerFn(listThreads);
  const del = useServerFn(deleteThread);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const threads = useQuery({ queryKey: ["threads"], queryFn: () => list() });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (pathname.includes(id)) navigate({ to: "/chat" });
    },
  });

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <SidebarGroupContent className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-0.5 pr-2">
            {threads.isLoading && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Loading…
              </p>
            )}
            {threads.data?.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No conversations yet. Tap + New Chat to begin.
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
                    type="button"
                    aria-label={`Delete ${t.title}`}
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
