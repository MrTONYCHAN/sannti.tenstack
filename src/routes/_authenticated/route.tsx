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
import { LogoWatermark } from "@/components/brand/LogoWatermark";
import { SaantiLogo } from "@/components/brand/SaantiLogo";
import { ChatThreadList } from "@/components/chat/ChatThreadList";

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
  const isChatRoute = pathname.startsWith("/chat");

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
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2"
              >
                <SaantiLogo size="sm" alt="" blended={false} />
                <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                  Saanti
                </span>
              </Link>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className="relative overflow-hidden">
            <LogoWatermark size="sidebar" />
            <SidebarGroup className="relative z-10 shrink-0">
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
            {isChatRoute && (
              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <ChatThreadList />
              </div>
            )}
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
