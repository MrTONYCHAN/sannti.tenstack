import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatLayout,
});

function ChatLayout() {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <Outlet />
    </div>
  );
}
