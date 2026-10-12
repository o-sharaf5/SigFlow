/**
 * Clipboard utilities for the one-click output buttons.
 *
 * Two distinct jobs:
 *  1. copyRichText() — puts BOTH `text/html` and `text/plain` on the clipboard
 *     via ClipboardItem, so pasting into Gmail/Outlook/Apple Mail yields the
 *     rendered signature (not markup). `ClipboardItem` needs *resolved* blobs,
 *     which is why every entry is a `Promise<Blob>`.
 *  2. copyPlainText() — for the "Copy HTML Code" button. Falls back to the
 *     legacy `document.execCommand('copy')` path on non-secure contexts,
 *     where `navigator.clipboard` is undefined.
 */

export async function copyRichText(html: string, plainFallback: string): Promise<void> {
  // Feature-detect first: Safari < 13.4 and Firefox pre-127 lack async writes.
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainFallback], { type: 'text/plain' });
    // Chrome historically rejects clipboard.write() on Safari/Firefox —
    // try each client's preferred API and degrade gracefully.
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob }),
      ]);
      return;
    } catch {
      // Older Safari: ClipboardItem only accepted the text/html type and only
      // synchronously inside a user gesture, so we hand it Promises up front.
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': Promise.resolve(htmlBlob),
          'text/plain': Promise.resolve(textBlob),
        }),
      ]);
      return;
    }
  }
  // Last resort for non-secure origins (http:// on a LAN demo box):
  // a contenteditable off-screen node + execCommand still copies formatting.
  copyRichTextFallback(html, plainFallback);
}

function copyRichTextFallback(html: string, plain: string): void {
  const container = document.createElement('div');
  container.contentEditable = 'true';
  container.style.position = 'fixed';
  container.style.left = '-9999px'; // keep on-screen: display:none breaks selection in Safari
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  const ok = document.execCommand('copy');
  selection?.removeAllRanges();
  container.remove();
  if (!ok) throw new Error('Clipboard copy failed');
  void plain; // kept in signature for API symmetry with copyRichText
}

export async function copyPlainText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('Clipboard copy failed');
}

/** Plain-text rendering of the signature for email clients that ignore HTML. */
export function signatureToPlainText(data: {
  personal: { fullName: string; jobTitle: string; company: string; phone: string; email: string; location: string };
}): string {
  const p = data.personal;
  return [
    p.fullName,
    [p.jobTitle, p.company].filter(Boolean).join(' · '),
    p.phone,
    p.email,
    p.location,
  ]
    .filter(Boolean)
    .join('\n');
}
