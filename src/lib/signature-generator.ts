import {
  AvatarSettings,
  FontWeight,
  PersonalInfo,
  SignatureData,
  SOCIAL_PROVIDERS,
  SocialLinks,
  StyleSettings,
} from './signature-types';

/**
 * Generates the final email signature as a self-contained HTML string.
 *
 * HARD RULES enforced here (this is what most "generator" tutorials get wrong):
 *  1. EVERY style is inline. Gmail strips <style> blocks in replies, Outlook
 *     strips <link>/external CSS entirely — inline `style=""` is the only
 * contract that survives every client.
 *  2. Layout is built with nested <table> + <td>. Flexbox/grid/CSS-columns
 *     are unsupported by Outlook's Word rendering engine and by Gmail on iOS.
 *  3. No `position:absolute`, no `float` tricks, no custom webfonts.
 *  4. Images carry width/height attributes (not just CSS) so Outlook reserves
 *     the space before the image loads.
 *  5. Avatar cropping is done with a fixed table cell + an absolutely-safe
 * technique: we request a square-cropped rendition from the image host
 *     when possible and fall back to CSS `object-fit` for modern clients.
 */

// ---------- tiny helpers ----------

/** Escape user text before it enters the HTML string — never trust form input. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize URLs typed without a scheme (e.g. "sigflow.dev" -> "https://sigflow.dev"). */
export function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/** Best-guess tel: href from a free-form phone string. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/**
 * Inline a 24x24 SVG icon as an email-safe image.
 * We URL-encode the SVG into a data-URI <img> because:
 *  - raw inline <svg> is stripped by Gmail's sanitizer in some clients,
 *  - base64 payloads require btoa/Buffer and break under SSR — percent
 *    encoding is identical on server (preview-on-load) and client,
 *  - a non-empty `alt` keeps the link usable if a client blocks images.
 */
function iconImg(path: string, brandColor: string, label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">` +
    `<path fill="${brandColor}" d="${path}"/></svg>`;
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `<img src="${dataUri}" width="20" height="20" alt="${escapeHtml(label)}" ` +
    `style="display:block;border:0;outline:none;text-decoration:none;" />`;
}

/**
 * Build the avatar cell.
 * `size` px square, radius per shape. For the "crop + zoom" feel without JS,
 * we lean on the image host: pravatar/unsplash-style URLs accept sizing, but
 * generically we render a fixed square <td> with overflow:hidden and scale the
 * <img> by `zoom`, offset by `offsetY` using margin — table-compatible.
 */
function avatarCell(avatar: AvatarSettings, style: StyleSettings): string {
  if (!style.showAvatar || !avatar.url.trim()) return '';
  const r =
    avatar.shape === 'circle' ? '50%' : avatar.shape === 'rounded' ? `${Math.round(avatar.size * 0.18)}px` : '0px';
  // zoom>1 enlarges the image inside the fixed square; the square clips it.
  const inner = avatar.zoom > 1
    ? `<img src="${escapeHtml(normalizeUrl(avatar.url))}" width="${avatar.size}" height="${avatar.size}" ` +
      `style="display:block;border-radius:${r};transform:scale(${avatar.zoom});` +
      `transform-origin:center calc(50% + ${avatar.offsetY}%);" />`
    : `<img src="${escapeHtml(normalizeUrl(avatar.url))}" width="${avatar.size}" height="${avatar.size}" ` +
      `style="display:block;border-radius:${r};object-fit:cover;` +
      `object-position:center ${50 + avatar.offsetY}%;" />`;
  return `
   <td width="${avatar.size}" valign="middle" style="padding:0 16px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${avatar.size}" height="${avatar.size}"
             style="overflow:hidden;border-radius:${r};">
        <tr><td valign="middle" align="center">${inner}</td></tr>
      </table>
    </td>`;
}

/** Contact rows: only render lines the user actually filled in. */
function contactLines(personal: PersonalInfo, style: StyleSettings): string {
  const rows: string[] = [];
  const gap = style.fontSize + 2;
  const link = (href: string, text: string) =>
    `<a href="${escapeHtml(href)}" style="color:${style.accentColor};text-decoration:none;">${escapeHtml(text)}</a>`;

  if (personal.phone.trim())
    rows.push(`<div style="line-height:${gap}px;">${link(telHref(personal.phone), personal.phone)}</div>`);
  if (personal.email.trim())
    rows.push(`<div style="line-height:${gap}px;">${link(`mailto:${personal.email.trim()}`, personal.email)}</div>`);
  if (personal.location.trim())
    rows.push(`<div style="line-height:${gap}px;color:${style.textColor};">${escapeHtml(personal.location)}</div>`);

  return rows.join('');
}

/** Social icon row — a table of 24px cells so icons never reflow oddly. */
function socialRow(social: SocialLinks, style: StyleSettings): string {
  if (!style.showSocialIcons) return '';
  const cells = SOCIAL_PROVIDERS.map((p) => {
    const url = social[p.key].trim();
    if (!url) return '';
    return `<td style="padding:0 6px 0 0;">
        <a href="${escapeHtml(normalizeUrl(url))}" style="text-decoration:none;" target="_blank">${iconImg(p.iconPath, p.brandColor, p.label)}</a>
      </td>`;
  }).join('');
  if (!cells) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr>${cells}</tr></table>`;
}

// ---------- the four layout templates ----------

/** Identity block shared by modern/compact/executive, with per-layout tweaks. */
function identityBlock(personal: PersonalInfo, style: StyleSettings, nameSize: number, nameWeight: FontWeight): string {
  const w = nameWeight === 'bold' ? 'bold' : 'normal';
  const name = `<div style="font-size:${nameSize}px;font-weight:${w};color:${style.textColor};line-height:${nameSize + 4}px;">${escapeHtml(personal.fullName)}</div>`;
  const title = personal.jobTitle.trim()
    ? `<div style="font-size:${style.fontSize}px;color:${style.accentColor};line-height:${style.fontSize + 4}px;margin-top:2px;">${escapeHtml(personal.jobTitle)}${personal.company.trim() ? ` · <span style="color:${style.textColor};opacity:0.75;">${escapeHtml(personal.company)}</span>` : ''}</div>`
    : '';
  return name + title;
}

export function generateSignatureHtml(data: SignatureData): string {
  const { personal, social, avatar, style } = data;
  const font = `font-family:${style.fontFamily};font-size:${style.fontSize}px;color:${style.textColor};`;
  const contacts = contactLines(personal, style);
  const socials = socialRow(social, style);

  switch (style.layout) {
    // MODERN: avatar | (name, title, contacts, socials) side by side, accent left bar.
    case 'modern':
      return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td style="width:4px;background:${style.accentColor};font-size:0;line-height:0;">&nbsp;</td>
    <td style="padding:12px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${avatarCell(avatar, style)}
          <td valign="middle" style="${font}">
            ${identityBlock(personal, style, style.fontSize + 5, 'bold')}
            ${contacts ? `<div style="margin-top:8px;${font}">${contacts}</div>` : ''}
            ${socials}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    // COMPACT: everything on fewer lines, small avatar inline, no avatar cell padding.
    case 'compact':
      return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    ${avatarCell({ ...avatar, size: Math.max(56, avatar.size - 32) }, style)}
    <td valign="middle" style="${font}">
      ${identityBlock(personal, style, style.fontSize + 2, 'bold')}
      <div style="margin-top:6px;font-size:${style.fontSize - 1}px;color:${style.textColor};">
        ${[
          personal.phone ? `<a href="${escapeHtml(telHref(personal.phone))}" style="color:${style.accentColor};text-decoration:none;">${escapeHtml(personal.phone)}</a>` : '',
          personal.email ? `<a href="mailto:${escapeHtml(personal.email)}" style="color:${style.accentColor};text-decoration:none;">${escapeHtml(personal.email)}</a>` : '',
          personal.location ? escapeHtml(personal.location) : '',
        ].filter(Boolean).join(' &nbsp;|&nbsp; ')}
      </div>
      ${socials}
    </td>
  </tr>
</table>`;

    // MINIMAL: text-only stack, thin accent divider above the contact line. No avatar.
    case 'minimal':
      return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td style="${font}">
    <div style="font-size:${style.fontSize + 3}px;font-weight:bold;color:${style.textColor};">${escapeHtml(personal.fullName)}</div>
    ${personal.jobTitle ? `<div style="color:${style.accentColor};margin-top:1px;">${escapeHtml(personal.jobTitle)}${personal.company ? `, ${escapeHtml(personal.company)}` : ''}</div>` : ''}
    ${style.showDivider ? `<div style="margin:8px 0;height:2px;width:48px;background:${style.accentColor};font-size:0;line-height:0;">&nbsp;</div>` : ''}
    <div>${contacts}</div>
    ${socials}
  </td></tr>
</table>`;

    // EXECUTIVE: centered stack, serif-friendly, name large with letter spacing.
    case 'executive':
      return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;text-align:center;">
  <tr><td align="center" style="${font}padding:4px 0;">
    ${avatarCell(avatar, style) ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 10px;"><tr><td>${avatarCell(avatar, style).replace('padding:0 16px 0 0;', 'padding:0;')}</td></tr></table>` : ''}
    <div style="font-size:${style.fontSize + 7}px;font-weight:bold;color:${style.textColor};letter-spacing:1px;">${escapeHtml(personal.fullName.toUpperCase())}</div>
    <div style="font-size:${style.fontSize}px;color:${style.accentColor};margin-top:2px;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(personal.jobTitle)}${personal.company ? ` — ${escapeHtml(personal.company)}` : ''}</div>
    ${style.showDivider ? `<div style="margin:10px auto;width:56px;height:1px;background:${style.accentColor};font-size:0;line-height:0;">&nbsp;</div>` : ''}
    <div style="color:${style.textColor};">${contacts}</div>
    ${socials ? socials.replace('margin-top:10px;', 'margin:10px auto 0;') : ''}
  </td></tr>
</table>`;
  }
}

/** Wrap the raw signature in a full HTML document — used for "Copy HTML Code". */
export function wrapForCodeDisplay(html: string): string {
  return `<!-- SigFlow email signature — paste-safe: inline styles only -->\n${html.trim()}\n`;
}
