'use client';

import { useMemo, useState } from 'react';
import { generateSignatureHtml, wrapForCodeDisplay } from '@/lib/signature-generator';
import { copyPlainText, copyRichText, signatureToPlainText } from '@/lib/clipboard';
import { SignatureData } from '@/lib/signature-types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, ClipboardCheck, Code2, Copy, Eye, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type CopyState = 'idle' | 'copied' | 'error';

interface Props {
  data: SignatureData;
}

/**
 * Right-hand panel: the signature shown inside a mock "compose" window —
 * because that's literally where users will paste it, and the framing sells
 * the output far better than a bare white box. The mock is intentionally
 * light-themed: email signatures are consumed on light mail backgrounds.
 */
export function SignaturePreview({ data }: Props) {
  const [copyRich, setCopyRich] = useState<CopyState>('idle');
  const [copyCode, setCopyCode] = useState<CopyState>('idle');
  const [tab, setTab] = useState<'preview' | 'code'>('preview');

  // useMemo keyed on the whole data object: the generator is pure + cheap,
  // and re-running it on every keystroke is what makes the preview "live".
  const html = useMemo(() => generateSignatureHtml(data), [data]);
  const code = useMemo(() => wrapForCodeDisplay(html), [html]);

  const flash = (setter: (s: CopyState) => void) => {
    setter('copied');
    setTimeout(() => setter('idle'), 2000);
  };

  const handleCopyRich = async () => {
    try {
      await copyRichText(html, signatureToPlainText(data));
      flash(setCopyRich);
    } catch {
      setCopyRich('error');
      setTimeout(() => setCopyRich('idle'), 2500);
    }
  };

  const handleCopyCode = async () => {
    try {
      await copyPlainText(code);
      flash(setCopyCode);
    } catch {
      setCopyCode('error');
      setTimeout(() => setCopyCode('idle'), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'preview' | 'code')} className="w-auto">
          <TabsList>
            <TabsTrigger value="preview" className="gap-1.5"><Eye className="size-3.5" />Preview</TabsTrigger>
            <TabsTrigger value="code" className="gap-1.5"><Code2 className="size-3.5" />HTML</TabsTrigger>
          </TabsList>
        </Tabs>
        <Badge variant="secondary" className="font-mono text-[11px]">{html.length.toLocaleString('en-US')} chars</Badge>
      </div>

      {tab === 'preview' ? (
        /* ---------- Email-client mockup ---------- */
        <div className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-xl shadow-zinc-900/10">
          {/* Window chrome: traffic lights + "New message" */}
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="ml-1 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Inbox className="size-3.5" /> New message
            </span>
          </div>
          {/* To / Subject field rows */}
          <div className="divide-y divide-zinc-100 border-b border-zinc-200 bg-white text-xs text-zinc-400">
            <div className="flex items-center gap-3 px-4 py-2"><span className="w-12 text-zinc-500">To:</span><span className="text-zinc-300">client@acme.com</span></div>
            <div className="flex items-center gap-3 px-4 py-2"><span className="w-12 text-zinc-500">Subject:</span><span className="text-zinc-300">Re: Project update</span></div>
          </div>
          {/* Body with the signature pasted at the bottom */}
          <div className="bg-white px-4 py-5">
            <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">
              Hi Sarah,<br />Thanks for the quick turnaround — the new draft looks great. Best,
            </p>
            <div className="border-t border-dashed border-zinc-200 pt-4">
              {/*
                dangerouslySetInnerHTML is safe here: `html` never contains user
                strings unescaped — the generator escapes every input and emits
                only its own table markup. This is also exactly the payload the
                user pastes into their mail client.
              */}
              <div className="w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 shadow-xl shadow-zinc-900/10">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="font-mono text-[11px] text-zinc-400">signature.html</span>
            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">inline-styled</span>
          </div>
          <pre className="max-h-[420px] overflow-auto bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
            <code>{/* Minimal in-house highlighter: tags teal, attr names sky, strings amber. */}
              {highlight(code)}
            </code>
          </pre>
        </div>
      )}

      {/* ---------- One-click output ---------- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          onClick={handleCopyRich}
          className={cn(
            'w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/35',
            copyRich === 'error' && 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-600/25',
          )}
        >
          {copyRich === 'copied' ? <ClipboardCheck className="size-4" /> : copyRich === 'error' ? <Copy className="size-4" /> : <Copy className="size-4" />}
          <span className="ml-2">
            {copyRich === 'copied' ? 'Copied — paste into Gmail!' : copyRich === 'error' ? 'Copy failed — use HTTPS' : 'Copy Rendered Signature'}
          </span>
        </Button>
        <Button size="lg" variant="outline" onClick={handleCopyCode} className="w-full rounded-xl font-semibold">
          {copyCode === 'copied' ? <Check className="size-4" /> : <Code2 className="size-4" />}
          <span className="ml-2">{copyCode === 'copied' ? 'HTML Copied' : copyCode === 'error' ? 'Copy failed — use HTTPS' : 'Copy HTML Code'}</span>
        </Button>
      </div>

      <details className="group rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
        <summary className="cursor-pointer list-none text-xs font-semibold text-foreground/80 transition-colors group-open:text-indigo-600 dark:group-open:text-indigo-400">
          How to paste into Gmail / Outlook / Apple Mail
          <span className="float-right text-muted-foreground group-open:rotate-180 inline-block transition-transform">▾</span>
        </summary>
        <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
          <li><strong className="text-foreground/80">Gmail:</strong> Settings → See all settings → General → Signature → click the box → Ctrl/Cmd+V.</li>
          <li><strong className="text-foreground/80">Outlook (classic):</strong> File → Options → Mail → Signatures → New → Ctrl/Cmd+V.</li>
          <li><strong className="text-foreground/80">Outlook (web):</strong> Settings → Mail → Compose and reply → Signature → paste.</li>
          <li><strong className="text-foreground/80">Apple Mail:</strong> Settings → Accounts → Mail Username & Address → Signature → Edit → Paste.</li>
        </ul>
      </details>
    </div>
  );
}

/** Tokenize-and-color small HTML highlighter; returns React nodes, not HTML. */
function highlight(code: string) {
  // Split into tokens: tags (<...>) vs everything else (text + comments).
  const parts = code.split(/(<\/?[a-zA-Z][^>]*>|<!--[\s\S]*?-->)/g).filter(Boolean);
  return parts.map((token, i) => {
    if (token.startsWith('<!--')) {
      return <span key={i} className="text-zinc-500 italic">{token}</span>;
    }
    if (!token.startsWith('<')) {
      return <span key={i} className="text-zinc-300">{token}</span>;
    }
    // Inside a tag: <tagname attrs...> — paint name teal, attr names sky, values amber.
    const nameMatch = token.match(/^<\/?[a-zA-Z][\w-]*/);
    const name = nameMatch ? nameMatch[0] : '';
    const rest = token.slice(name.length);
    const segments: React.ReactNode[] = [];
    const attrRe = /([\w-]+)(=)("[^"]*")/g;
    let m: RegExpExecArray | null;
    let cursor = 0;
    while ((m = attrRe.exec(rest))) {
      if (m.index > cursor) segments.push(<span key={`t${cursor}`} className="text-zinc-400">{rest.slice(cursor, m.index)}</span>);
      segments.push(<span key={`a${m.index}`} className="text-sky-400">{m[1]}</span>);
      segments.push(<span key={`e${m.index}`} className="text-zinc-400">{m[2]}</span>);
      segments.push(<span key={`s${m.index}`} className="text-amber-300">{m[3]}</span>);
      cursor = m.index + m[0].length;
    }
    if (cursor < rest.length) segments.push(<span key="tail" className="text-zinc-400">{rest.slice(cursor)}</span>);
    return (
      <span key={i}>
        <span className="text-teal-400">{name}</span>
        {segments}
      </span>
    );
  });
}
