import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  HeartHandshake,
  LineChart,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import logo from "@/assets/logo.jpg";

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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Saanti logo"
            className="h-9 w-9"
            width={36}
            height={36}
          />
          <span className="text-lg font-semibold tracking-tight">Saanti</span>
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

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-10 pb-20 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <HeartHandshake className="h-3.5 w-3.5" /> Built for NEET · JEE ·
              CUET · CAT · GATE · UPSC aspirants
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Calm mind. <span className="text-primary">Sharper prep.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Saanti is an empathetic AI companion that listens, decodes hidden
              stress triggers in your daily journal, and gently guides you with
              personalized coping strategies — so exam pressure stops running
              your life.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-[var(--shadow-soft)]">
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
          <div className="mb-10 text-center">
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
  );
}
