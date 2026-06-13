import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import {
  DEMO_PASSWORD,
  DEMO_USERNAME,
  isLocalAuthMode,
  isLocalSessionActive,
  signInLocal,
  signOutLocal,
  usesLocalAuth,
} from "@/lib/local-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  MessageCircleHeart,
  NotebookPen,
  LineChart,
} from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isLocalAuthMode()) {
      if (!isLocalSessionActive()) {
        signInLocal(DEMO_USERNAME, DEMO_PASSWORD);
      }
      return { user: { id: "local", email: "superadmin@saanti.local" } };
    }

    if (usesLocalAuth()) {
      if (!isLocalSessionActive()) throw redirect({ to: "/auth" });
      return { user: { id: "local", email: "local@saanti.dev" } };
    }

    if (!hasSupabaseConfig()) throw redirect({ to: "/auth" });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/chat", label: "Companion", icon: MessageCircleHeart },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/insights", label: "Insights", icon: LineChart },
] as const;

function AuthedLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    if (usesLocalAuth()) {
      signOutLocal();
    } else {
      await supabase.auth.signOut();
    }
    navigate({ to: "/", replace: true });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/" className="flex items-center gap-2 px-2 py-2">
              <img
                src={logo}
                alt=""
                className="h-7 w-7"
                width={28}
                height={28}
              />
              <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                Saanti
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <img
                src={logo}
                alt=""
                width={240}
                height={240}
                className="w-[min(90%,12rem)] max-w-none opacity-[0.08] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
              />
            </div>
            <SidebarGroup className="relative z-10">
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.to ||
                      pathname.startsWith(item.to + "/");
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link
                            to={item.to}
                            className="flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign out
              </span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-border/60 bg-background px-3">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">
              {NAV.find((n) => pathname.startsWith(n.to))?.label ?? "Saanti"}
            </span>
          </header>
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-hidden"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
