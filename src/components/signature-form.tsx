'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { SignatureData, FontFamily, AvatarShape, LayoutTemplate, SOCIAL_PROVIDERS } from '@/lib/signature-types';
import { User, Palette, Link2, ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: SignatureData;
  onChange: (updater: (draft: SignatureData) => void) => void;
}

/** Left-hand form. Every field drives the live preview through `onChange`. */
export function SignatureForm({ data, onChange }: Props) {
  // Patch helpers keep nested state updates immutable + terse at every input.
  const set = <K extends keyof SignatureData>(key: K, value: Partial<SignatureData[K]>) =>
    onChange((d) => Object.assign(d[key] as object, value));

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal" className="gap-1.5 text-xs font-medium sm:text-sm">
          <User className="size-3.5" />Info
        </TabsTrigger>
        <TabsTrigger value="media" className="gap-1.5 text-xs font-medium sm:text-sm">
          <ImageIcon className="size-3.5" />Media
        </TabsTrigger>
        <TabsTrigger value="social" className="gap-1.5 text-xs font-medium sm:text-sm">
          <Link2 className="size-3.5" />Social
        </TabsTrigger>
        <TabsTrigger value="style" className="gap-1.5 text-xs font-medium sm:text-sm">
          <Palette className="size-3.5" />Style
        </TabsTrigger>
      </TabsList>

      {/* ---------- PERSONAL ---------- */}
      <TabsContent value="personal" className="mt-5 space-y-4">
        <Field label="Full Name"><Input value={data.personal.fullName} onChange={(e) => set('personal', { fullName: e.target.value })} /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Job Title"><Input value={data.personal.jobTitle} onChange={(e) => set('personal', { jobTitle: e.target.value })} /></Field>
          <Field label="Company"><Input value={data.personal.company} onChange={(e) => set('personal', { company: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Phone"><Input value={data.personal.phone} onChange={(e) => set('personal', { phone: e.target.value })} placeholder="+1555 000 0000" /></Field>
          <Field label="Email"><Input type="email" value={data.personal.email} onChange={(e) => set('personal', { email: e.target.value })} /></Field>
        </div>
        <Field label="Location"><Input value={data.personal.location} onChange={(e) => set('personal', { location: e.target.value })} /></Field>
      </TabsContent>

      {/* ---------- MEDIA (avatar + crop/roundness) ---------- */}
      <TabsContent value="media" className="mt-5 space-y-4">
        <Field label="Avatar / Logo URL">
          <Input value={data.avatar.url} onChange={(e) => set('avatar', { url: e.target.value })} placeholder="https://...jpg" />
        </Field>
        <ToggleRow label="Show avatar" hint="Profile photo or company logo"
          checked={data.style.showAvatar} onChange={(v) => set('style', { showAvatar: v })} />
        <Field label="Shape">
          <Select value={data.avatar.shape} onValueChange={(v) => set('avatar', { shape: v as AvatarShape })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <SliderField label="Size" value={data.avatar.size} min={56} max={160} step={4}
          onChange={(v) => set('avatar', { size: v })} suffix="px" />
        <Separator />
        <SliderField label="Crop zoom" value={Math.round(data.avatar.zoom * 10)} min={10} max={25} step={1}
          onChange={(v) => set('avatar', { zoom: v / 10 })} suffix="×" />
        <SliderField label="Vertical offset" value={data.avatar.offsetY} min={-50} max={50} step={5}
          onChange={(v) => set('avatar', { offsetY: v })} suffix="%" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Zoom + offset emulate cropping inside the fixed square, using table-safe CSS only.
       </p>
      </TabsContent>

      {/* ---------- SOCIAL ---------- */}
      <TabsContent value="social" className="mt-5 space-y-4">
        <ToggleRow label="Show social icons" hint="Inline SVG icons, no CDN required"
          checked={data.style.showSocialIcons} onChange={(v) => set('style', { showSocialIcons: v })} />
        {SOCIAL_PROVIDERS.map((p) => (
          <Field key={p.key} label={p.label}>
            <Input value={data.social[p.key]} onChange={(e) => set('social', { [p.key]: e.target.value })} placeholder={p.key === 'website' ? 'yoursite.com' : `https://${p.key}.com/...`} />
          </Field>
        ))}
      </TabsContent>

      {/* ---------- STYLE ---------- */}
      <TabsContent value="style" className="mt-5 space-y-5">
        {/* Visual template picker:2×2 cards with mini wireframes beats a dropdown
            because users choose layouts by *shape*, not by name. */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Layout template</Label>
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(LAYOUT_META) as LayoutTemplate[]).map((lt) => {
              const active = data.style.layout === lt;
              return (
                <button
                  key={lt}
                  type="button"
                  onClick={() => set('style', { layout: lt })}
                  aria-pressed={active}
                  className={cn(
                    'group relative rounded-xl border p-3 text-left transition-all',
                    active
                      ? 'border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/25'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50',
                  )}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <LayoutWireframe layout={lt} accent={data.style.accentColor} />
                  <p className="mt-2 text-xs font-semibold">{LAYOUT_META[lt].name}</p>
                  <p className="text-[11px] leading-snug text-muted-foreground">{LAYOUT_META[lt].desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Font">
          <Select value={data.style.fontFamily} onValueChange={(v) => set('style', { fontFamily: v as FontFamily })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value } as React.CSSProperties}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <SliderField label="Font size" value={data.style.fontSize} min={11} max={20} step={1}
          onChange={(v) => set('style', { fontSize: v })} suffix="px" />
        <ColorField label="Accent color" value={data.style.accentColor} presetSwatches={ACCENTS}
          onChange={(v) => set('style', { accentColor: v })} />
        <ColorField label="Text color" value={data.style.textColor} presetSwatches={TEXT_COLORS}
          onChange={(v) => set('style', { textColor: v })} />
        <ToggleRow label="Show divider" hint="Accent rule in Minimal / Executive layouts"
          checked={data.style.showDivider} onChange={(v) => set('style', { showDivider: v })} />
      </TabsContent>
    </Tabs>
  );
}

// ---------- template picker data + mini wireframes ----------

const LAYOUT_META: Record<LayoutTemplate, { name: string; desc: string }> = {
  modern: { name: 'Modern', desc: 'Avatar beside details, accent bar' },
  compact: { name: 'Compact', desc: 'One tight block, inline contacts' },
  minimal: { name: 'Minimal', desc: 'Text-only stack, quiet rule' },
  executive: { name: 'Executive', desc: 'Centered, uppercase, formal' },
};

/** CSS-only wireframe of each layout — no images, scales with the card. */
function LayoutWireframe({ layout, accent }: { layout: LayoutTemplate; accent: string }) {
  const bar = (w: string, cls = '') =><div className={cn('h-1 rounded-full bg-zinc-300 dark:bg-zinc-600', w, cls)} />;
  const avatar = (cls = '') => <div className={cn('size-6 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600', cls)} />;
  return (
    <div className="flex h-14 items-center overflow-hidden rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/60">
      {layout === 'modern' && (
        <div className="flex w-full items-center gap-2">
          <div className="h-full w-0.5 rounded-full" style={{ backgroundColor: accent }} />
          {avatar()}
          <div className="flex-1 space-y-1">{bar('60%', '!h-1.5')} {bar('85%')} {bar('70%')}</div>
        </div>
      )}
      {layout === 'compact' && (
        <div className="flex w-full items-center gap-2">
          {avatar('!size-5')}
          <div className="flex-1 space-y-1">{bar('50%', '!h-1.5')} {bar('95%')} {bar('40%')}</div>
        </div>
      )}
      {layout === 'minimal' && (
        <div className="w-full space-y-1 pl-1">
          {bar('45%', '!h-1.5')} {bar('65%')}
          <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: accent }} />
          {bar('80%')}
        </div>
      )}
      {layout === 'executive' && (
        <div className="flex w-full flex-col items-center gap-1">
          {avatar('!size-4')}
          {bar('55%', '!h-1.5')}
          <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: accent }} />
          {bar('70%')}
        </div>
      )}
    </div>
  );
}

// ---------- small presentational field wrappers ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SliderField(props: {
  label: string; value: number; min: number; max: number; step: number; suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{props.label}</Label>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">{props.value}{props.suffix}</span>
      </div>
      {/* Base UI passes the raw value (number | number[]) unlike Radix's array-only callback. */}
      <Slider value={[props.value]} min={props.min} max={props.max} step={props.step}
        onValueChange={(v) => props.onChange(Number(Array.isArray(v) ? v[0] : v))} />
    </div>
  );
}

function ColorField(props: {
  label: string; value: string; presetSwatches: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{props.label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1 transition-shadow hover:ring-2 hover:ring-ring/30" />
        <Input value={props.value} onChange={(e) => props.onChange(e.target.value)} className="font-mono text-xs" />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {props.presetSwatches.map((c) => (
          <button key={c} type="button" title={c}
            onClick={() => props.onChange(c)}
            style={{ backgroundColor: c }}
            className={`size-6 rounded-full border transition-transform hover:scale-110 ${props.value.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''}`} />
        ))}
      </div>
    </div>
  );
}

const FONTS: { label: string; value: FontFamily }[] = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Trebuchet', value: "'Trebuchet MS', Verdana, sans-serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier', value: "'Courier New', monospace" },
];

const ACCENTS = ['#2563eb', '#0f766e', '#dc2626', '#7c3aed', '#ea580c', '#0284c7', '#be185d', '#16a34a'];
const TEXT_COLORS = ['#1f2937', '#111827', '#374151', '#0f172a', '#4b5563', '#292524'];
