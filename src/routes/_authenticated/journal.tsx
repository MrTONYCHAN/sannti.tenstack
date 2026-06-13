import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createJournalEntry,
  listJournalEntries,
} from "@/lib/journal.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { moodEmoji } from "@/lib/journal-mood";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

const sentimentColor: Record<string, string> = {
  positive: "bg-emerald-100 text-emerald-800",
  neutral: "bg-slate-100 text-slate-800",
  mixed: "bg-amber-100 text-amber-800",
  negative: "bg-orange-100 text-orange-800",
  distressed: "bg-rose-100 text-rose-800",
};

function JournalPage() {
  const list = useServerFn(listJournalEntries);
  const create = useServerFn(createJournalEntry);
  const qc = useQueryClient();

  const entries = useQuery({ queryKey: ["journal"], queryFn: () => list() });

  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(6);
  const [sleep, setSleep] = useState("");
  const [study, setStudy] = useState("");
  const [content, setContent] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      create({
        data: {
          mood,
          stress,
          energy,
          sleep_hours: sleep ? parseFloat(sleep) : undefined,
          study_hours: study ? parseFloat(study) : undefined,
          content,
        },
      }),
    onSuccess: () => {
      toast.success("Journal saved · Saanti is reflecting with you");
      setContent("");
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily journal</h1>
          <p className="text-muted-foreground">
            Write freely. Saanti gently surfaces hidden triggers and tailored
            next steps.
          </p>
        </div>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>How was today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <SliderField
                label="Mood"
                value={mood}
                onChange={setMood}
                hint={moodEmoji("mood", mood)}
              />
              <SliderField
                label="Stress"
                value={stress}
                onChange={setStress}
                hint={moodEmoji("stress", stress)}
              />
              <SliderField
                label="Energy"
                value={energy}
                onChange={setEnergy}
                hint={moodEmoji("energy", energy)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="sleep">Sleep (hours)</Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  placeholder="e.g. 7"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="study">Study (hours)</Label>
                <Input
                  id="study"
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={study}
                  onChange={(e) => setStudy(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="content">Today, in your own words</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="What happened? What weighed on you? Anything you felt proud of?"
                maxLength={8000}
              />
            </div>
            <Button
              disabled={mut.isPending || content.trim().length < 5}
              aria-busy={mut.isPending}
              onClick={() => mut.mutate()}
              className="w-full sm:w-auto"
            >
              {mut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reflecting…
                </>
              ) : (
                <>Save & analyze</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent reflections</h2>
          {entries.isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {entries.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No entries yet. Your first reflection lives here.
            </p>
          )}
          <div className="space-y-3">
            {entries.data?.map((e) => (
              <Card key={e.id} className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {format(
                        new Date(e.created_at as string),
                        "EEE, dd MMM · h:mm a",
                      )}
                    </span>
                    <span>·</span>
                    <span>Mood {e.mood}/10</span>
                    <span>·</span>
                    <span>Stress {e.stress}/10</span>
                    <span>·</span>
                    <span>Energy {e.energy}/10</span>
                    {e.ai_sentiment && (
                      <Badge
                        className={sentimentColor[e.ai_sentiment] ?? ""}
                        variant="secondary"
                      >
                        {e.ai_sentiment}
                      </Badge>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{e.content}</p>
                  {e.ai_summary && (
                    <div className="rounded-xl border border-primary/20 bg-secondary p-4 text-sm">
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        <Sparkles className="h-3 w-3" /> Saanti's reflection
                      </div>
                      <p>{e.ai_summary}</p>
                      {e.ai_triggers && e.ai_triggers.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Possible triggers
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.ai_triggers.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="bg-background/60"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {e.ai_suggestions && e.ai_suggestions.length > 0 && (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                          {e.ai_suggestions.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint: string;
}) {
  const id = label.toLowerCase();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {hint} {value}/10
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        min={1}
        max={10}
        step={1}
        aria-label={`${label}, ${value} out of 10`}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
