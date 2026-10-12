# SigFlow — HTML Email Signature Generator

A lightweight, fully client-side SaaS-style tool: a live split-screen editor that
generates **paste-safe HTML email signatures** for Gmail, Outlook and Apple Mail.
Built as a portfolio project.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui
(Base UI primitives) · Lucide React · next-themes · localStorage drafts.
No backend required — the whole app prerenders as static HTML, so Vercel deploys
are instant and free-tier friendly.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static prerender of / — zero API routes
```

> The Clipboard API requires a **secure context**. `localhost` counts as secure,
> so copy works in dev; production on Vercel is HTTPS automatically.

## Folder structure

```
sigflow/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, metadata, ThemeProvider
│   │   ├── page.tsx                # Split-screen editor (client component)
│   │   └── globals.css             # Tailwind v4 + shadcn theme tokens (.dark)
│   ├── components/
│   │   ├── signature-form.tsx      # Left panel: Info / Media / Social / Style tabs
│   │   ├── signature-preview.tsx   # Right panel: live preview + HTML tab + copy buttons
│   │   ├── site-header.tsx         # Logo, Reset, dark-mode toggle
│   │   ├── theme-provider.tsx      # next-themes wrapper (SSR-safe)
│   │   └── ui/                     # shadcn primitives (button, tabs, select, slider…)
│   └── lib/
│       ├── signature-types.ts      # Data model, defaults, social provider metadata
│       ├── signature-generator.ts  # ★ Pure HTML-string generator (4 templates)
│       ├── clipboard.ts            # ★ Rich-text + plain-text clipboard APIs
│       ├── use-local-draft.ts      # Debounced localStorage persistence hook
│       ├── use-hydrated.ts         # useSyncExternalStore-based hydration gate
│       └── utils.ts                # cn() helper
├── next.config.ts
└── package.json
```

## Architecture in one paragraph

State lives in one `SignatureData` object (`useLocalDraft`). The form mutates it
immutably; the preview calls the **pure** `generateSignatureHtml(data)` inside a
`useMemo`, so every keystroke re-renders the signature for free. The generator
enforces the three rules of email-client survival: inline styles only, nested
`<table>` layout (Outlook's Word engine ignores flex/grid), and width/height
attributes on images. User text is HTML-escaped before insertion, so the
`dangerouslySetInnerHTML` preview can never execute injected markup.

## Optional next step: Supabase

To save named templates per user, add a `templates` table
(`id, user_id, name, data jsonb, created_at`) and reuse `SignatureData` as the
`jsonb` shape verbatim — the model is already serializable. Clerk or Supabase
Auth both fit; the app needs no schema changes until then.

## 2-day build & deploy plan (how this repo was made)

### Day 1 — Core editor
- **Morning:** scaffold `create-next-app` (TS + Tailwind + App Router), `shadcn init`,
  add primitives. Define `SignatureData` + defaults.
- **Afternoon:** write `signature-generator.ts` first (pure functions are testable
  without a UI), then the form tabs, then the preview panel.
- **Evening:** localStorage draft hook, dark mode, responsive grid, XSS-escaping
  pass.

### Day 2 — Polish & ship
- **Morning:** clipboard (rich `text/html` + fallback), HTML code tab with
  highlighting, per-client paste instructions.
- **Afternoon:** a11y (labels, focus rings, keyboard nav), favicon/OG metadata,
  `npm run build` clean.
- **Evening:** push to GitHub → import in Vercel → deploy (framework preset
  auto-detected; no env vars needed). Verify clipboard on the HTTPS domain.

### Stretch (Day 3+)
Supabase auth + saved templates, signature QR code, .eml download, analytics.

## License

MIT — portfolio use.
