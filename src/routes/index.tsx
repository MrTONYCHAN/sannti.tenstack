import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  HeartHandshake,
  KeyRound,
  LineChart,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import { LogoWatermark } from "@/components/brand/LogoWatermark";
import { SaantiLogo } from "@/components/brand/SaantiLogo";
import { SplashScreen } from "@/components/SplashScreen";
import { markSplashSeen, shouldShowSplash } from "@/lib/splash-screen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saanti — Calm mind, sharper prep" },
      {
        name: "description",
        content:
          "Saanti is an empathetic AI companion that helps students preparing for NEET, JEE, CUET, CAT, GATE & UPSC beat burnout with smart journaling, mood tracking, and personalized coping strategies.",
      },
      { property: "og:title", content: "Saanti — Calm mind, sharper prep" },
      {
        property: "og:description",
        content: "AI wellness companion for India's exam aspirants.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setShowSplash(shouldShowSplash());
  }, []);

  const dismissSplash = useCallback(() => {
    markSplashSeen();
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={dismissSplash} />}
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <LogoWatermark size="hero" className="overflow-hidden" />

        <div className="relative z-10">
          <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2">
              <SaantiLogo size="md" />
              <span className="text-lg font-semibold tracking-tight">
                Saanti
              </span>
            </div>
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get started — free</Link>
              </Button>
            </nav>
          </header>

          <main id="main-content" tabIndex={-1}>
            <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-10 pb-20 md:grid-cols-2 md:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <HeartHandshake className="h-3.5 w-3.5" /> Built for NEET ·
                  JEE · CUET · CAT · GATE · UPSC aspirants
                </span>
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  Calm mind. <span className="text-primary">Sharper prep.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Saanti is an empathetic AI companion that listens, decodes
                  hidden stress triggers in your daily journal, and gently
                  guides you with personalized coping strategies — so exam
                  pressure stops running your life.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="shadow-[var(--shadow-soft)]"
                  >
                    <Link to="/auth">Start your wellness journey</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="#features">See what's inside</a>
                  </Button>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> Private by default · Your
                  journal stays yours
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Coming soon:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1">
                    <GoogleIcon />
                    Google login
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1">
                    <KeyRound className="h-3.5 w-3.5 text-primary" aria-hidden />
                    SSO login
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl border border-primary/20 bg-secondary" />
                <img
                  src={hero}
                  alt="Calm student meditating under a starry sky"
                  width={1024}
                  height={1024}
                  className="relative rounded-3xl shadow-[var(--shadow-soft)]"
                />
              </div>
            </section>

            <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
              <div className="relative mb-10 text-center">
                <div className="mb-8 flex justify-center">
                  <Button
                    asChild
                    className="shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link to="/auth">Get started — free</Link>
                  </Button>
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Wellness that fits between mock tests
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Five quiet minutes a day. Real insight in return.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    icon: MessageCircleHeart,
                    title: "Always-on AI companion",
                    body: "Vent at 2 AM, before a tough paper, or after a rough mock. Saanti listens without judgment and replies with warmth.",
                  },
                  {
                    icon: NotebookPen,
                    title: "Smart journaling",
                    body: "Free-write how your day went. AI detects hidden stress triggers — comparison, sleep loss, perfectionism — that simple mood trackers miss.",
                  },
                  {
                    icon: Brain,
                    title: "Personalized coping",
                    body: "Get tiny CBT-grounded next steps, grounding exercises, and mindset reframes tailored to your exam, mood, and schedule.",
                  },
                  {
                    icon: LineChart,
                    title: "Mood + energy logs",
                    body: "Track mood, stress, energy, sleep, and study hours in seconds. See patterns over weeks of prep.",
                  },
                  {
                    icon: HeartHandshake,
                    title: "Crisis-aware",
                    body: "When things feel heavy, Saanti gently surfaces verified India helplines — iCall, Vandrevala, AASRA.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Yours alone",
                    body: "Every entry is encrypted at rest and only ever visible to you. No data sold. No ads. Ever.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <Card
                    key={title}
                    className="border-border/60 transition hover:shadow-[var(--shadow-soft)]"
                  >
                    <CardContent className="space-y-3 p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-16 rounded-3xl border border-primary/20 bg-secondary p-8 text-center md:p-12">
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Your prep deserves a calm mind behind it.
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                  Join thousands of aspirants building gentler study days with
                  Saanti.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-6 shadow-[var(--shadow-soft)]"
                >
                  <Link to="/auth">Create your free account</Link>
                </Button>
              </div>
            </section>
          </main>

          <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
            Saanti · Made with care for India's exam aspirants.
          </footer>
        </div>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      aria-hidden
      role="img"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
