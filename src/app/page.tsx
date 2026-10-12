'use client';

import { useCallback } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SignatureForm } from '@/components/signature-form';
import { SignaturePreview } from '@/components/signature-preview';
import { useLocalDraft } from '@/lib/use-local-draft';
import { SignatureData } from '@/lib/signature-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, PenLine, ShieldCheck, Sparkles, Zap } from 'lucide-react';

/**
 * Home — the split-screen editor.
 *
 * State ownership: one `data` object lives here (via useLocalDraft), flows
 * down to the form (edit) and the preview (render). The HTML generator is a
 * pure function, so "real-time preview" = one memoized string rebuild per
 * keystroke — cheap enough that it needs no virtualization or debounce.
 *
 * Responsive layout: CSS grid that collapses to a single column under `lg`
 * (form first, preview below), with the preview card sticky on desktop so it
 * stays visible while you scroll the long form.
 */
export default function Home() {
  const { data, setData, resetDraft } = useLocalDraft();

  // Stable updater: clone → mutate → return, so components get new references
  // only when data actually changed, and the form never sees a new closure.
  const update = useCallback(
    (mutate: (draft: SignatureData) => void) => {
      setData((prev) => {
        const draft = structuredClone(prev);
        mutate(draft);
        return draft;
      });
    },
    [setData],
  );

  return (
    <>
      <SiteHeader onReset={resetDraft} />

      {/* Ambient brand glow behind the whole page — one absolutely-positioned
          gradient, pointer-events-none so it never eats clicks. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.62_0.19_276/0.10),transparent_70%)]" />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        {/* ---------- Hero band ---------- */}
        <section className="py-10 text-center sm:py-14">
          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            <Sparkles className="size-3 text-indigo-500" />
            Paste-perfect in Gmail, Outlook &amp; Apple Mail
          </Badge>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
            Email signatures that{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400">
              survive every inbox
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Design live, copy once. Inline styles and table layout — the exact
            rules that keep a signature intact through Gmail&apos;s and
            Outlook&apos;s sanitizers.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-indigo-500" />Live preview</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" />No sign-up</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-indigo-500" />100% in-browser — nothing uploaded</span>
          </div>
        </section>

        {/* ---------- Editor grid ---------- */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Card className="overflow-hidden border-border/70 shadow-lg shadow-indigo-950/5 dark:shadow-black/30">
            <CardHeader className="border-b border-border/60 bg-muted/40 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="size-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
                Details &amp; Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <SignatureForm data={data} onChange={update} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 shadow-lg shadow-indigo-950/5 dark:shadow-black/30 lg:sticky lg:top-24">
            <CardHeader className="border-b border-border/60 bg-muted/40 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                Live Preview &amp; Output
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <SignaturePreview data={data} />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
            <PenLine className="size-3.5 text-white" />
          </span>
          <p className="text-xs text-muted-foreground">
            SigFlow · Next.js App Router + Tailwind v4 + shadcn/ui · a portfolio build by{' '}
            <span className="font-semibold text-foreground/80">Omar</span>
          </p>
        </div>
      </footer>
    </>
  );
}
