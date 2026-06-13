import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ensureDemoAccount } from "@/lib/demo-auth.functions";
import {
  DEMO_PASSWORD,
  DEMO_USERNAME,
  isDemoUsername,
  resolveAuthEmail,
} from "@/lib/demo-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Saanti" },
      {
        name: "description",
        content: "Sign in or create your free Saanti account.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const ensureDemo = useServerFn(ensureDemoAccount);
  const [loading, setLoading] = useState(false);
  const supabaseConfigured = hasSupabaseConfig();

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat" });
    });
  }, [navigate, supabaseConfigured]);

  async function signInWithGoogle() {
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured for local development");
      return;
    }

    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/chat",
    });
    if (result.error) {
      toast.error("Could not sign in with Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/chat" });
  }

  async function handleEmailAuth(
    mode: "signin" | "signup",
    identifier: string,
    password: string,
  ) {
    if (!supabaseConfigured) {
      toast.error("Supabase is not configured for local development");
      return;
    }

    setLoading(true);
    try {
      const isDemo = isDemoUsername(identifier);
      if (isDemo) {
        await ensureDemo({
          data: {
            username: identifier,
            password,
          },
        });
      }

      const email = resolveAuthEmail(identifier);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/chat` },
        });
        if (error) throw error;
        toast.success("Welcome! Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      navigate({ to: "/chat" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-12">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <img
            src={logo}
            alt="Saanti"
            className="h-10 w-10"
            width={40}
            height={40}
          />
          <span className="text-xl font-semibold tracking-tight">Saanti</span>
        </Link>
        <Card className="w-full border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-center">Welcome back</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Your calm space to journal, vent, and breathe.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading || !supabaseConfigured}
              onClick={signInWithGoogle}
            >
              Continue with Google
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or use credentials{" "}
              <div className="h-px flex-1 bg-border" />
            </div>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <EmailForm
                  mode="signin"
                  loading={loading || !supabaseConfigured}
                  onSubmit={handleEmailAuth}
                />
              </TabsContent>
              <TabsContent value="signup">
                <EmailForm
                  mode="signup"
                  loading={loading || !supabaseConfigured}
                  onSubmit={handleEmailAuth}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmailForm({
  mode,
  loading,
  onSubmit,
}: {
  mode: "signin" | "signup";
  loading: boolean;
  onSubmit: (m: "signin" | "signup", e: string, p: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const demoLoginEnabled = import.meta.env.VITE_DEMO_LOGIN_ENABLED === "true";
  return (
    <form
      className="space-y-3 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(mode, email, password);
      }}
    >
      <div className="space-y-1">
        <Label htmlFor={`${mode}-email`}>Email or username</Label>
        <Input
          id={`${mode}-email`}
          type="text"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${mode}-pw`}>Password</Label>
        <Input
          id={`${mode}-pw`}
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      {mode === "signin" && demoLoginEnabled && (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={loading}
          onClick={() => {
            setEmail(DEMO_USERNAME);
            setPassword(DEMO_PASSWORD);
          }}
        >
          Use demo login
        </Button>
      )}
    </form>
  );
}
