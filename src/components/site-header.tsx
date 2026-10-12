'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/lib/use-hydrated';
import { Moon, Sun, PenLine, RotateCcw } from 'lucide-react';

/**
 * ThemeToggle — next-themes doesn't know the theme until the client runs,
 * so we gate on useHydrated() to render the correct icon only post-hydration
 * (no mismatch, and no setState-in-effect).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  if (!hydrated) return <Button variant="ghost" size="icon" disabled />;
  const isDark = resolvedTheme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function SiteHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Gradient logo mark — brand indigo → violet, the product's identity anchor */}
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/25 ring-1 ring-white/20">
            <PenLine className="size-4.5 text-white" strokeWidth={2.2} />
          </span>
          <div className="leading-tight">
            <span className="text-[15px] font-bold tracking-tight">SigFlow</span>
            <p className="hidden text-[11px] font-medium text-muted-foreground sm:block">
              HTML Email Signature Generator
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-1.5 rounded-full text-xs font-medium"
          >
            <RotateCcw className="size-3.5" />
            Reset draft
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
