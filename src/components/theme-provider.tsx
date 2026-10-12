'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // attribute="class" matches Tailwind v4's @custom-variant dark (&:is(.dark *))
  // in globals.css; defaultTheme follows the OS with no flash thanks to
  // next-themes' blocking script.
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
