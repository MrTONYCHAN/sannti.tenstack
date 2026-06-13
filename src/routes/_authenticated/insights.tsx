import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listJournalEntries } from "@/lib/journal.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HeartHandshake, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const fetcher = useServerFn(listJournalEntries);
  const q = useQuery({ queryKey: ["insights"], queryFn: () => fetcher() });
  const entries = q.data ?? [];

  const chartData = [...entries].reverse().map((e) => ({
    day: format(new Date(e.created_at as string), "dd MMM"),
    Mood: e.mood,
    Stress: e.stress,
    Energy: e.energy,
  }));

  const triggerCounts = new Map<string, number>();
  entries.forEach((e) => {
    (e.ai_triggers ?? []).forEach((t: string) => {
      const key = t.toLowerCase();
      triggerCounts.set(key, (triggerCounts.get(key) ?? 0) + 1);
    });
  });
  const topTriggers = [...triggerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const avg = (k: "mood" | "stress" | "energy") =>
    entries.length === 0
      ? 0
      : Math.round(
          (entries.reduce((s, e) => s + (e[k] as number), 0) / entries.length) *
            10,
        ) / 10;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your patterns</h1>
          <p className="text-muted-foreground">
            What Saanti has noticed across {entries.length} entr
            {entries.length === 1 ? "y" : "ies"}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Avg mood" value={avg("mood")} />
          <StatCard label="Avg stress" value={avg("stress")} />
          <StatCard label="Avg energy" value={avg("energy")} />
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Last {chartData.length} days</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                Add a few journal entries to see your trend lines.
              </p>
            ) : (
              <TrendChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recurring triggers</CardTitle>
          </CardHeader>
          <CardContent>
            {topTriggers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No triggers detected yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTriggers.map(([t, n]) => (
                  <Badge key={t} variant="secondary" className="text-sm">
                    {t} · {n}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-primary" /> If today feels
              too heavy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              You are not alone. Reaching out is brave. India helplines, free &
              confidential:
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> <strong>iCall</strong> —
                9152987821
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />{" "}
                <strong>Vandrevala Foundation</strong> — 1860-2662-345
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> <strong>AASRA</strong> —
                9820466726
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-bold">{value || "—"}</p>
      </CardContent>
    </Card>
  );
}

type TrendPoint = {
  day: string;
  Mood: number;
  Stress: number;
  Energy: number;
};

const SERIES = [
  { key: "Mood", label: "Mood", color: "oklch(0.58 0.11 195)" },
  { key: "Stress", label: "Stress", color: "oklch(0.6 0.2 25)" },
  { key: "Energy", label: "Energy", color: "oklch(0.72 0.13 130)" },
] as const;

function TrendChart({ data }: { data: TrendPoint[] }) {
  const width = 760;
  const height = 280;
  const padding = { top: 18, right: 24, bottom: 42, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const xFor = (index: number) =>
    padding.left +
    (data.length === 1
      ? innerWidth / 2
      : (index / (data.length - 1)) * innerWidth);
  const yFor = (value: number) =>
    padding.top + ((10 - value) / 9) * innerHeight;
  const labelIndexes = new Set(
    data
      .map((_, index) => index)
      .filter((index) =>
        data.length <= 7 ? true : index % Math.ceil(data.length / 6) === 0,
      ),
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label="Mood, stress, and energy trend over recent journal entries"
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[620px]"
        >
          {[1, 5, 10].map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="4 6"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {SERIES.map((series) => {
            const points = data
              .map(
                (point, index) => `${xFor(index)},${yFor(point[series.key])}`,
              )
              .join(" ");

            return (
              <g key={series.key}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {data.map((point, index) => (
                  <circle
                    key={`${series.key}-${point.day}-${index}`}
                    cx={xFor(index)}
                    cy={yFor(point[series.key])}
                    r="3.5"
                    fill="white"
                    stroke={series.color}
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}

          {data.map((point, index) =>
            labelIndexes.has(index) ? (
              <text
                key={`${point.day}-${index}`}
                x={xFor(index)}
                y={height - 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {point.day}
              </text>
            ) : null,
          )}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>
    </div>
  );
}
