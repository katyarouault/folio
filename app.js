/* =========================================================
   Folio — turn your handwritten world into a digital home
   Vanilla JS single-page app. All data lives on this device
   (IndexedDB), nothing is sent to a server.
   ========================================================= */
'use strict';

/* ---------------- tiny helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TAG_COLORS = ['#bed7bb', '#e5c9d2', '#dbc67f', '#d0ccde', '#abb9ec', '#d7c8ba'];
const FOLDER_COLORS = ['#bed7bb', '#e5c9d2', '#dbc67f', '#d0ccde', '#abb9ec', '#d7c8ba', '#96b093'];
const ACCENTS = {
  sage: { name: 'Sage', deep: '#4b5e49', mid: '#96b093', soft: '#bed7bb' },
  rose: { name: 'Rose', deep: '#7a4f5c', mid: '#c99aa9', soft: '#e5c9d2' },
  honey: { name: 'Honey', deep: '#6b5a1e', mid: '#c4ad5e', soft: '#dbc67f' },
  lavender: { name: 'Lavender', deep: '#565075', mid: '#a69fc4', soft: '#d0ccde' },
  periwinkle: { name: 'Periwinkle', deep: '#3f4f8a', mid: '#8c9de0', soft: '#abb9ec' },
};
const USES = [
  ['School', 'School', 'book', '#bed7bb'],
  ['Work', 'Work', 'briefcase', '#abb9ec'],
  ['Journaling', 'Journal', 'pen', '#e5c9d2'],
  ['Drawing', 'Sketches', 'brush', '#dbc67f'],
  ['To-dos', 'To-do', 'list', '#d0ccde'],
  ['Recipes', 'Recipes', 'leaf', '#bed7bb'],
  ['Planning', 'Plans', 'calendar', '#d7c8ba'],
  ['Ideas', 'Ideas', 'bulb', '#e5c9d2'],
];
const PAPER = '#fffdf7';
const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

/* ---------------- icons ---------------- */
const IC = {
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="6.8"/><path d="m20 20-4.2-4.2"/>',
  books: '<rect x="3.5" y="4" width="4.5" height="16" rx="1"/><rect x="9.5" y="4" width="4.5" height="16" rx="1"/><path d="m15.6 5.6 3.6-1 3 14.6-3.6 1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  more: '<circle cx="12" cy="5.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5-5-9 9"/>',
  pages: '<rect x="8" y="3" width="12" height="15" rx="2"/><path d="M5 7v12a2 2 0 0 0 2 2h9"/>',
  blank: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
  folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  sort: '<path d="M7 4v16M3.5 7.5 7 4l3.5 3.5M17 20V4M13.5 16.5 17 20l3.5-3.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  rotate: '<path d="M20 11.5A8 8 0 1 1 17.6 6"/><path d="M20 4v5h-5"/>',
  crop: '<path d="M6 2.5V18h15.5"/><path d="M2.5 6H18v15.5"/>',
  auto: '<path d="M11 3.5l1.7 4.4 4.4 1.7-4.4 1.7L11 15.7l-1.7-4.4L4.9 9.6l4.4-1.7z"/><path d="M18 14l.8 2.1 2.2.9-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.9z"/>',
  retake: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
  erase: '<path d="M8 20.5h12"/><path d="M3.8 14.2 13.2 4.8a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L10.5 19.5H7.6z"/><path d="m9 9 6 6"/>',
  adjust: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  filter: '<circle cx="9" cy="9.5" r="5.5"/><circle cx="15" cy="9.5" r="5.5"/><circle cx="12" cy="15" r="5.5"/>',
  enhance: '<path d="M5 19 19 5"/><path d="m15 5 4 4"/><path d="M5.5 4v3M4 5.5h3M18.5 15v3M17 16.5h3M9 3v1.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  move: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M9 13.5h6.5M13 11l2.5 2.5L13 16"/>',
  share: '<path d="M12 3.5v12M8 7.5l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/><path d="M12 8v4l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.2-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="10" cy="7" r="1.1" fill="currentColor"/><circle cx="15" cy="7" r="1.1" fill="currentColor"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8.5z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".8" fill="currentColor"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  pen: '<path d="M3.5 20.5 5 15 16 4a2.1 2.1 0 0 1 3 3L8 18z"/><path d="m14 6 3 3"/>',
  brush: '<path d="M9.5 14.5 19 5a1.4 1.4 0 0 0-2-2l-9.5 9.5"/><path d="M7.5 12.5c-2 0-3.5 1.5-3.5 3.5 0 1.5-.5 2.5-1.5 3 3.5 1 7.5 0 7.5-4.5z"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  list: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="m3.5 6.5 1.2 1.2 2.3-2.4M3.5 12l1.2 1.2 2.3-2.4M3.5 17.5l1.2 1.2 2.3-2.4"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 15.5V4M7 9l5-5 5 5M5 20h14"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  tag: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8a1.4 1.4 0 0 1 0 2l-7 7a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 13h18"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  eye: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  zoom: '<circle cx="11" cy="11" r="6.8"/><path d="m20 20-4.2-4.2M11 8v6M8 11h6"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------------- illustrations (brand palette) ---------------- */
const ART = {
  hero: `<svg viewBox="0 0 340 236" role="img" aria-label="A handwritten page being scanned into a notebook">
    <ellipse cx="170" cy="222" rx="132" ry="10" fill="var(--surface-2)"/>
    <g transform="rotate(-9 110 128)"><rect x="40" y="44" width="140" height="170" rx="14" fill="var(--c-lav)"/></g>
    <g transform="rotate(7 230 120)"><rect x="160" y="38" width="140" height="170" rx="14" fill="var(--c-pink)"/>
      <path d="M182 74h70M182 92h86M182 110h60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>
    <g transform="rotate(-1.5 170 120)">
      <rect x="92" y="22" width="156" height="196" rx="14" fill="${PAPER}" stroke="#e3dccb"/>
      <path d="M114 62c8-7 14 6 22-1s14 6 22-1 14 6 22-1 13 5 20 0" stroke="#4b5e49" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M114 86c8-7 14 6 22-1s14 6 22-1 14 6 22-1" stroke="#4b5e49" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M114 110c8-7 14 6 22-1s14 6 22-1 14 6 22-1 13 5 20 0" stroke="#4b5e49" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M114 134c8-7 14 6 22-1s14 6 22-1" stroke="#4b5e49" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="206" cy="168" r="20" fill="var(--c-gold)" opacity=".85"/>
      <path d="M118 160l14 14M132 160l-14 14" stroke="#96b093" stroke-width="3" stroke-linecap="round"/>
      <path d="M102 50V34h16M238 50V34h-16M102 190v16h16M238 190v16h-16" stroke="#96b093" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>
    <g transform="translate(270 150)"><circle r="30" fill="var(--c-mint)"/><path d="M-10 0l7 7 14-15" stroke="#4b5e49" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  </svg>`,
  folders: `<svg viewBox="0 0 390 150" aria-hidden="true">
    <rect x="0" y="0" width="390" height="150" fill="var(--surface-2)"/>
    <g transform="translate(40 40) rotate(-6)"><rect width="120" height="90" rx="12" fill="var(--c-peri)"/><rect y="-12" width="52" height="24" rx="8" fill="var(--c-peri)"/></g>
    <g transform="translate(140 30) rotate(3)"><rect width="120" height="100" rx="12" fill="var(--c-mint)"/><rect y="-12" width="52" height="24" rx="8" fill="var(--c-mint)"/><rect x="14" y="20" width="92" height="64" rx="6" fill="${PAPER}"/><path d="M26 38h60M26 52h44M26 66h52" stroke="#96b093" stroke-width="4" stroke-linecap="round"/></g>
    <g transform="translate(250 48) rotate(8)"><rect width="110" height="86" rx="12" fill="var(--c-gold)"/><rect y="-12" width="48" height="24" rx="8" fill="var(--c-gold)"/></g>
  </svg>`,
  allset: `<svg viewBox="0 0 300 260" aria-hidden="true">
    <circle cx="150" cy="130" r="118" fill="var(--surface-2)"/>
    <g transform="rotate(-10 120 140)"><rect x="70" y="60" width="110" height="140" rx="12" fill="var(--c-pink)"/></g>
    <g transform="rotate(8 180 140)"><rect x="120" y="56" width="110" height="140" rx="12" fill="var(--c-lav)"/></g>
    <rect x="95" y="50" width="112" height="150" rx="12" fill="${PAPER}" stroke="#e3dccb"/>
    <path d="M112 84h60M112 102h76M112 120h52" stroke="#96b093" stroke-width="5" stroke-linecap="round"/>
    <circle cx="200" cy="186" r="34" fill="#4b5e49"/><path d="M186 186l10 10 18-20" stroke="#fafcf2" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M60 60l6 6M240 52l-6 8M248 120h10M44 140h10" stroke="var(--c-gold)" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  emptyLib: `<svg viewBox="0 0 140 110" class="art" aria-hidden="true">
    <rect x="18" y="20" width="62" height="80" rx="9" fill="var(--c-lav)" transform="rotate(-8 49 60)"/>
    <rect x="44" y="12" width="66" height="86" rx="9" fill="${PAPER}" stroke="#e3dccb"/>
    <path d="M56 34h40M56 48h30M56 62h36" stroke="#96b093" stroke-width="4" stroke-linecap="round"/>
    <circle cx="108" cy="84" r="18" fill="var(--c-mint)"/><path d="M108 76v16M100 84h16" stroke="#4b5e49" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  emptyFolder: `<svg viewBox="0 0 140 100" class="art" aria-hidden="true">
    <rect x="22" y="30" width="96" height="62" rx="10" fill="var(--c-gold)" opacity=".8"/><rect x="22" y="20" width="42" height="20" rx="7" fill="var(--c-gold)" opacity=".8"/>
    <rect x="30" y="38" width="96" height="58" rx="10" fill="var(--c-mint)"/>
  </svg>`,
};

/* Action handlers, looked up by data-act / data-submit. */
const A = {};

/* ---------------- Supabase (App Store build) ----------------
   index.html loads vendor/supabase.js; the claude.ai page (folio.html)
   does not. When the library is present and we're not on claude.ai, Folio
   keeps accounts, notes and page images in Supabase instead. */
const SB = {
  url: 'https://ukpaibohfmydaygtvwmc.supabase.co',
  key: 'sb_publishable_tYQauIOO5i3jBaks3dTj1g_3R68NuoD',
  bucket: 'folio-images',
  // Google Cloud Console -> Credentials -> OAuth client IDs (fill in once created).
  googleIOSClientId: '',
  googleWebClientId: '',
  on: false, client: null, uid: null,
};
const isNative = () => !!window.Capacitor?.isNativePlatform?.();
try {
  if (window.supabase?.createClient && !window.claude?.use) {
    SB.client = window.supabase.createClient(SB.url, SB.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: !isNative() } });
    SB.on = true;
  }
} catch (e) { console.warn('Supabase unavailable', e); }

/* ---------------- AI (Claude, via the page's `sample` capability) ----------------
   Calls run on the viewer's own Claude account and only on an explicit tap.
   Claude can look at images and answer with text/JSON, so edits come back as
   settings and pen strokes that Folio applies itself. */
const ai = { fn: null, maxImages: 0, ctl: null, blocked: false };
const aiOn = () => !!ai.fn && !ai.blocked;
function aiErrText(e) {
  const c = e?.code;
  if (c === 'cancelled') return null;
  if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) ai.blocked = true;
  return ({
    not_granted: 'AI is turned off for this page. You can allow it from the page’s Permissions menu.',
    sampling_disabled: 'AI isn’t available on this claude.ai account.',
    rate_limited: 'You’ve reached your AI limit for now. Try again in a little while.',
    session_expired: 'Sign in to claude.ai again to use AI.',
    refused: 'The AI couldn’t help with that one. Try asking differently.',
    image_rejected: 'The AI couldn’t read that image.',
    invalid_json: 'The AI’s answer came back garbled. Try again.',
    empty_completion: 'The AI didn’t come back with anything. Try asking a bit differently.',
  })[c] || 'The AI had trouble with that. Try again.';
}
async function aiJSON(prompt, { images, tier = 'default' } = {}) {
  ai.ctl?.abort(); ai.ctl = new AbortController();
  const opts = { signal: ai.ctl.signal, modelTier: tier, cache: false };
  if (images?.length) opts.images = images;
  try { return await ai.fn.json(prompt, opts); } finally { ai.ctl = null; }
}
async function toJpegBlob(source, max = 1024) {
  const img = typeof source === 'string' ? await loadImg(source) : source;
  const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
  const k = Math.min(1, max / Math.max(w0, h0));
  const c = mkCanvas(Math.max(1, Math.round(w0 * k)), Math.max(1, Math.round(h0 * k)));
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
}
const num = (v, lo, hi, d = 0) => { const n = Number(v); return Number.isFinite(n) ? clamp(n, lo, hi) : d; };
const COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
/* Turn Claude's [{color,width,points}] into Folio strokes {color,size,pts}. */
function aiStrokes(list, widthToSize, fallbackColor) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const st of list.slice(0, 220)) {
    const pts = (Array.isArray(st?.points) ? st.points : []).slice(0, 400)
      .filter((q) => Array.isArray(q) && q.length >= 2).map(([x, y]) => [num(x, 0, 1), num(y, 0, 1)]);
    if (!pts.length) continue;
    out.push({ color: COLOR_RE.test(String(st.color || '')) ? st.color : fallbackColor, size: widthToSize(num(st.width, 0.5, 60, 4)), pts });
  }
  return out;
}

/* The shared "Ask AI" sheet: a prompt box, suggestion chips, Thinking…/Stop. */
function aiSheet({ title, intro, suggestions = [], placeholder, run }) {
  if (!aiOn()) { toast(ai.blocked ? 'AI is turned off for this page' : 'AI works when Folio is opened on claude.ai'); return; }
  openSheet(`<h2 class="t-h3 sheet-title">${icon('sparkle')} ${esc(title)}</h2>
    <form data-submit="ai" class="stack gap-12" id="ai-form">
      <p class="t-small muted">${esc(intro)}</p>
      <textarea class="input ai-text" name="p" rows="3" maxlength="600" placeholder="${esc(placeholder)}" enterkeyhint="send"></textarea>
      ${suggestions.length ? `<div class="ai-chips">${suggestions.map((t) => `<button type="button" class="chip" data-act="ai-chip" data-s="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      <p class="ai-status t-small" id="ai-status" role="status" hidden></p>
      <div class="row gap-12"><button type="button" class="btn btn-soft" data-act="ai-cancel">Cancel</button><button class="btn btn-primary" id="ai-go">${icon('sparkle')} Go</button></div>
    </form>`, () => ai.ctl?.abort());
  S.aiRun = run;
  setTimeout(() => $('#ai-form textarea')?.focus(), 80);
}
/* ---------------- storage (IndexedDB w/ in-memory fallback) ---------------- */
const mem = { kv: new Map(), images: new Map() };
let dbPromise = null;
function idb() {
  if (!dbPromise) {
    dbPromise = new Promise((res, rej) => {
      try {
        const r = indexedDB.open('folio-app', 1);
        r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('images'); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
        r.onblocked = () => rej(new Error('blocked'));
        setTimeout(() => rej(new Error('idb timeout')), 3000);
      } catch (e) { rej(e); }
    }).catch(() => null);
  }
  return dbPromise;
}
const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const txP = (d, st, fn) => new Promise((res, rej) => {
  const t = d.transaction(st, 'readwrite'); fn(t.objectStore(st));
  t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('Storage aborted'));
});
/* Device storage never throws: if IndexedDB refuses a call (private mode,
   a sandboxed frame), keep the value in memory for this visit instead. */
const local = {
  async get(st, k) { try { const d = await idb(); if (d) return await reqP(d.transaction(st).objectStore(st).get(k)); } catch (e) { console.warn('idb get', e); } return mem[st].get(k); },
  async set(st, k, v) { mem[st].set(k, v); try { const d = await idb(); if (d) await txP(d, st, (s) => s.put(v, k)); } catch (e) { console.warn('idb set', e); } },
  async del(st, k) { mem[st].delete(k); try { const d = await idb(); if (d) await txP(d, st, (s) => s.delete(k)); } catch (e) { console.warn('idb del', e); } },
};
/* When published on claude.ai, keep data in the viewer's private db subtree
   and page images in the artifact's asset store, so notes follow the person
   across devices. Running locally (no viewer), fall back to IndexedDB. */
const cloud = { db: null, uid: null, assets: null, downloads: null, email: null };
const embedded = (() => { try { return window.top !== window; } catch { return true; } })();
async function initCloud() {
  if (!window.claude?.use) return;
  try {
    const [db, usr, assets, downloads, sample] = await Promise.all(['db', 'user', 'assets', 'downloads', 'sample'].map((n) => window.claude.use(n).catch(() => null)));
    cloud.downloads = downloads;
    if (sample) {
      ai.fn = sample;
      const lim = await sample.limits().catch(() => null);
      ai.maxImages = lim?.images ? Math.min(lim.images.maxCount || 1, 10) : 0;
    }
    const me = usr ? await usr.me().catch(() => null) : null;
    const uid = me?.id || null;
    cloud.email = me?.email ? String(me.email).toLowerCase() : null;
    if (db && uid) { cloud.db = db; cloud.uid = uid; cloud.assets = assets; }
  } catch { /* stay local */ }
}
const cdoc = (k) => cloud.db.doc(`data/users/${cloud.uid}/${String(k).replace(/[^A-Za-z0-9_.~:@+-]/g, '_')}`);
async function srcToBlob(src) { return (await fetch(src)).blob(); }
const withTimeout = (p, ms = 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
let cloudWarned = false;
function cloudFail(e) {
  console.warn('Cloud storage unavailable, using this device', e);
  cloud.db = null; cloud.assets = null;
  if (!cloudWarned) { cloudWarned = true; setTimeout(() => toast('Couldn’t reach your claude.ai storage — saving on this device for now'), 50); }
}
const cloudStore = {
  async get(st, k) {
    const snap = await cdoc(st + '~' + k).get();
    if (!snap.exists) return st === 'images' ? local.get(st, k) : undefined;
    const d = snap.data();
    // Snapshots from the store are frozen; hand the app its own editable copy.
    return st === 'images' ? (d.asset ? '/_blob/' + d.asset : d.v) : (d.v == null ? d.v : JSON.parse(JSON.stringify(d.v)));
  },
  async set(st, k, v) {
    if (st === 'images') {
      if (cloud.assets) {
        const blob = await srcToBlob(v);
        const r = await cloud.assets.upload(blob, { type: blob.type || 'image/jpeg' });
        await cdoc(st + '~' + k).set({ asset: r.id });
        S.img.set(k, r.url);
        return;
      }
      return local.set(st, k, v);
    }
    return cdoc(st + '~' + k).set({ v: JSON.parse(JSON.stringify(v ?? null)) });
  },
  async del(st, k) {
    if (st === 'images') {
      const snap = await cdoc(st + '~' + k).get().catch(() => null);
      const id = snap?.exists && snap.data().asset;
      if (id && cloud.assets) await cloud.assets.delete(id).catch(() => {});
      local.del(st, k).catch(() => {});
    }
    return cdoc(st + '~' + k).delete();
  },
};
/* Supabase storage: everything is also cached on the phone, so the app opens
   fast and keeps working offline; changes are sent up as they happen. */
const sbPending = new Set();
let sbWarned = false;
function sbFail(e) {
  console.warn('Supabase', e);
  if (!sbWarned) { sbWarned = true; setTimeout(() => toast('You seem to be offline — saving on this phone for now'), 50); }
}
function dataUrlToBlob(u) {
  const [head, b64] = String(u).split(','); const type = (head.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const bin = atob(b64); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type });
}
const blobToDataUrl = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
const sbPath = (k) => `${SB.uid}/${String(k).replace(/[^A-Za-z0-9_.-]/g, '_')}`;
async function sbPushData(v) {
  const { error } = await SB.client.from('folio_data').upsert({ user_id: SB.uid, data: v ?? {}, updated_at: new Date().toISOString() });
  if (error) throw error;
}
const sbStore = {
  async get(st, k) {
    if (st === 'kv') {
      if (!String(k).startsWith('data:')) return local.get(st, k);
      const { data, error } = await SB.client.from('folio_data').select('data').eq('user_id', SB.uid).maybeSingle();
      if (error) throw error;
      if (data?.data && Object.keys(data.data).length) { local.set(st, k, data.data); return data.data; }
      return local.get(st, k);
    }
    const cached = await local.get(st, k); if (cached) return cached;
    const { data, error } = await SB.client.storage.from(SB.bucket).download(sbPath(k));
    if (error || !data) return undefined;
    const url = await blobToDataUrl(data); local.set(st, k, url); return url;
  },
  async set(st, k, v) {
    await local.set(st, k, v);
    if (st === 'kv') {
      if (!String(k).startsWith('data:')) return;
      try { await sbPushData(v); sbPending.delete('data'); } catch (e) { sbPending.add('data'); throw e; }
      return;
    }
    if (!v) return;
    const blob = String(v).startsWith('data:') ? dataUrlToBlob(v) : await srcToBlob(v);
    const { error } = await SB.client.storage.from(SB.bucket).upload(sbPath(k), blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
    if (error) { sbPending.add('img:' + k); throw error; }
  },
  async del(st, k) {
    await local.del(st, k);
    if (st === 'images') await SB.client.storage.from(SB.bucket).remove([sbPath(k)]);
  },
};
async function sbRetryPending() {
  if (!SB.on || !SB.uid || !sbPending.size) return;
  for (const item of [...sbPending]) {
    try {
      if (item === 'data') { if (S.data) await sbPushData(S.data); }
      else { const k = item.slice(4); const v = await local.get('images', k); if (v) await SB.client.storage.from(SB.bucket).upload(sbPath(k), dataUrlToBlob(v), { upsert: true }); }
      sbPending.delete(item);
    } catch { return; }
  }
  sbWarned = false;
}
window.addEventListener('online', sbRetryPending);
const store = {};
for (const op of ['get', 'set', 'del']) {
  store[op] = async (...a) => {
    if (SB.on && SB.uid) { try { return await withTimeout(sbStore[op](...a), 20000); } catch (e) { sbFail(e); return local[op](...a); } }
    if (!cloud.db) return local[op](...a);
    try { return await withTimeout(cloudStore[op](...a)); }
    catch (e) { cloudFail(e); return local[op](...a); }
  };
}
function ssGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } }

async function hashPw(email, pw) {
  const txt = `folio:${email}:${pw}`;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 5381; for (const c of txt) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'x' + (h >>> 0).toString(16);
  }
}

/* ---------------- app state ---------------- */
const S = {
  users: {}, session: null, data: null,
  route: null, stack: [],
  img: new Map(),
  draft: null,
  homeTag: null, libQ: '', q: '', qTypes: new Set(), usesSel: new Set(),
  editTab: 'enhance', adjKey: 'brightness',
};
const user = () => S.users[S.session?.email] || { name: 'Friend', email: '' };
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'there';

let saveTimer = null;
function saveData() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await store.set('kv', 'data:' + S.session.email, S.data); } catch (e) { toast('Could not save — storage may be full'); }
  }, 150);
}
async function flushData() { clearTimeout(saveTimer); if (S.session && S.data) await store.set('kv', 'data:' + S.session.email, S.data); }
const saveUsers = () => store.set('kv', 'users', S.users);
const saveSession = () => store.set('kv', 'session', S.session);

function tagsFromUses(uses) {
  const names = [];
  for (const [label, tag] of USES) if (uses.includes(label)) names.push(tag);
  for (const d of ['School', 'Work', 'Personal', 'Ideas']) if (names.length < 4 && !names.includes(d)) names.push(d);
  return names.map((name, i) => ({ name, color: TAG_COLORS[i % TAG_COLORS.length] }));
}
function newData() {
  return {
    notes: [], folders: [], tags: tagsFromUses([]), recent: [], uses: [],
    sort: 'new', avatar: null, tipDismissed: false,
    settings: { theme: 'system', accent: 'sage', size: 'standard', tips: true },
  };
}
const tagColor = (name) => S.data.tags.find((t) => t.name === name)?.color || '#d7c8ba';
const folderById = (id) => S.data.folders.find((f) => f.id === id);
const noteById = (id) => S.data.notes.find((n) => n.id === id);

/* ---------------- dates ---------------- */
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const parseISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const fmtLong = (iso) => { const d = parseISO(iso); return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
const fmtShort = (iso) => { const d = parseISO(iso); return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${String(d.getFullYear()).slice(-2)}`; };
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

/* ---------------- images ---------------- */
async function getImg(k) {
  if (!k) return null;
  if (S.img.has(k)) return S.img.get(k);
  const v = await store.get('images', k); if (v) S.img.set(k, v); return v;
}
function hydrate(root) {
  $$('img[data-img]', root).forEach(async (el) => { const v = await getImg(el.dataset.img); if (v) el.src = v; });
}
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that image')); i.src = src; });
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ctx2d = (c) => c.getContext('2d', { willReadFrequently: true });

async function fileToPage(file, max = 2200) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImg(url);
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = mkCanvas(Math.round(img.naturalWidth * s), Math.round(img.naturalHeight * s));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return newPage(c.toDataURL('image/jpeg', 0.92), c.width, c.height);
  } finally { URL.revokeObjectURL(url); }
}
function newPage(src, w, h) {
  return { id: uid(), src, w, h, crop: { x: 0, y: 0, w: 1, h: 1 }, edit: defaultEdit() };
}
const defaultEdit = () => ({ cleaned: false, auto: false, filter: 'none', strokes: [], adj: { brightness: 0, contrast: 0, saturation: 0, highlights: 0, shadows: 0 } });

async function rotateSrc(src) {
  const img = await loadImg(src);
  const c = mkCanvas(img.naturalHeight, img.naturalWidth);
  const x = c.getContext('2d'); x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(img, 0, 0);
  return { src: c.toDataURL('image/jpeg', 0.92), w: c.width, h: c.height };
}
async function cropSrc(p) {
  const { x, y, w, h } = p.crop;
  if (x < 0.002 && y < 0.002 && w > 0.996 && h > 0.996) return { src: p.src, w: p.w, h: p.h };
  const img = await loadImg(p.src);
  const sx = Math.round(x * p.w), sy = Math.round(y * p.h), sw = Math.max(8, Math.round(w * p.w)), sh = Math.max(8, Math.round(h * p.h));
  const c = mkCanvas(sw, sh); c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return { src: c.toDataURL('image/jpeg', 0.92), w: sw, h: sh };
}
async function makeThumb(src, max = 360) {
  const img = await loadImg(src);
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = mkCanvas(Math.round(img.naturalWidth * s), Math.round(img.naturalHeight * s));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
function otsu(hist, total) {
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, t = 127;
  for (let i = 0; i < 256; i++) {
    wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break;
    sumB += i * hist[i]; const mB = sumB / wB, mF = (sum - sumB) / wF; const between = wB * wF * (mB - mF) ** 2;
    if (between > best) { best = between; t = i; }
  }
  return t;
}
/* Find the bright sheet of paper in a photo and return a normalized crop box. */
async function autoCrop(src) {
  const img = await loadImg(src);
  const s = 180 / Math.max(img.naturalWidth, img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = mkCanvas(w, h); const x = ctx2d(c); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data; const L = new Uint8Array(w * h); const hist = new Array(256).fill(0);
  for (let i = 0; i < w * h; i++) { const l = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) | 0; L[i] = l; hist[l]++; }
  const t = otsu(hist, w * h);
  const rowF = (yy) => { let n = 0; for (let xx = 0; xx < w; xx++) if (L[yy * w + xx] > t) n++; return n / w; };
  let top = -1, bottom = -1;
  for (let yy = 0; yy < h; yy++) if (rowF(yy) > 0.4) { if (top < 0) top = yy; bottom = yy; }
  if (top < 0) return null;
  let left = -1, right = -1; const rh = bottom - top + 1;
  for (let xx = 0; xx < w; xx++) { let n = 0; for (let yy = top; yy <= bottom; yy++) if (L[yy * w + xx] > t) n++; if (n / rh > 0.4) { if (left < 0) left = xx; right = xx; } }
  if (left < 0) return null;
  const m = 0.008;
  const box = { x: clamp(left / w - m, 0, 1), y: clamp(top / h - m, 0, 1) };
  box.w = clamp((right + 1) / w + m, 0, 1) - box.x; box.h = clamp((bottom + 1) / h + m, 0, 1) - box.y;
  const area = box.w * box.h;
  if (area < 0.12 || area > 0.985) return null;
  return box;
}

/* --- Clean & edit pixel pipeline --- */
function computeStats(img) {
  const s = 220 / Math.max(img.naturalWidth, img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = mkCanvas(w, h); const x = ctx2d(c); x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data; const hist = new Array(256).fill(0); const n = w * h;
  for (let i = 0; i < d.length; i += 4) hist[(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0]++;
  const pct = (q) => { let a = 0; for (let i = 0; i < 256; i++) { a += hist[i]; if (a >= n * q) return i; } return 255; };
  return { p1: pct(0.01), p3: pct(0.03), p70: pct(0.7), p98: pct(0.985) };
}
function processImageData(id, e, st) {
  const d = id.data;
  let lo = 0, hi = 255;
  if (e.cleaned) { lo = st.p3; hi = Math.max(lo + 40, st.p70); } else if (e.auto) { lo = st.p1; hi = Math.max(lo + 40, st.p98); }
  const a = e.adj;
  const ct = a.contrast >= 0 ? 1 + a.contrast / 60 : 1 + a.contrast / 130;
  const br = a.brightness * 0.9, sat = 1 + a.saturation / 100, hl = a.highlights / 100, sh = a.shadows / 100;
  const lut = new Float32Array(256);
  for (let v = 0; v < 256; v++) { let c = ((v - lo) * 255) / (hi - lo); c = (c - 128) * ct + 128 + br; lut[v] = c; }
  const f = e.filter, cleaned = e.cleaned;
  for (let i = 0; i < d.length; i += 4) {
    let r = lut[d[i]], g = lut[d[i + 1]], b = lut[d[i + 2]];
    let l = 0.299 * r + 0.587 * g + 0.114 * b;
    if (cleaned) {
      if (l > 175) { const k = Math.min(1, (l - 175) / 50); r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
      else { const k = 0.18; r -= r * k * (1 - l / 175); g -= g * k * (1 - l / 175); b -= b * k * (1 - l / 175); }
      l = 0.299 * r + 0.587 * g + 0.114 * b; r = r * 0.7 + l * 0.3; g = g * 0.7 + l * 0.3; b = b * 0.7 + l * 0.3;
    }
    if (hl && l > 128) { const k = hl * ((l - 128) / 127) * 70; r += k; g += k; b += k; }
    if (sh && l < 128) { const k = sh * ((128 - l) / 128) * 70; r += k; g += k; b += k; }
    if (sat !== 1) { l = 0.299 * r + 0.587 * g + 0.114 * b; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; }
    switch (f) {
      case 'mono': l = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = l; break;
      case 'ink': { l = 0.299 * r + 0.587 * g + 0.114 * b; const v = l > 170 ? 255 : l < 95 ? l * 0.3 : ((l - 95) / 75) * 255; r = g = b = v; break; }
      case 'warm': r = r * 1.06 + 6; g = g * 1.01 + 2; b = b * 0.86; break;
      case 'sage': r = r * 0.9 + 14; g = g * 0.96 + 16; b = b * 0.86 + 10; break;
      case 'soft': r = r * 0.86 + 32; g = g * 0.86 + 32; b = b * 0.86 + 28; break;
      case 'night': { l = 0.299 * r + 0.587 * g + 0.114 * b; const v = 255 - l; r = v * 0.85 + 10; g = v * 0.95 + 14; b = v * 0.85 + 10; break; }
      default: break;
    }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
}
function paperColor(id) {
  const d = id.data; const samples = [];
  const step = Math.max(4, Math.floor(d.length / 4 / 3000)) * 4;
  for (let i = 0; i < d.length; i += step) samples.push([0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2], d[i], d[i + 1], d[i + 2]]);
  samples.sort((p, q) => q[0] - p[0]);
  const top = samples.slice(0, Math.max(1, Math.floor(samples.length * 0.12)));
  const avg = [1, 2, 3].map((k) => Math.round(top.reduce((s, v) => s + v[k], 0) / top.length));
  return `rgb(${avg.join(',')})`;
}
function drawStrokes(x, strokes, w, h, color) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
  for (const s of strokes) {
    x.strokeStyle = s.color || color; x.lineWidth = s.size * w; x.beginPath();
    s.pts.forEach(([px, py], i) => (i ? x.lineTo(px * w, py * h) : x.moveTo(px * w, py * h)));
    if (s.pts.length === 1) x.lineTo(s.pts[0][0] * w + 0.1, s.pts[0][1] * h);
    x.stroke();
  }
  x.restore();
}
async function ensureBase(p) {
  if (!p._img || p._imgSrc !== p.base) { p._img = await loadImg(p.base); p._imgSrc = p.base; p._stats = computeStats(p._img); }
}
function drawEdited(p, c, editOverride) {
  const e = editOverride || p.edit;
  const x = ctx2d(c);
  x.drawImage(p._img, 0, 0, c.width, c.height);
  const id = x.getImageData(0, 0, c.width, c.height);
  processImageData(id, e, p._stats);
  x.putImageData(id, 0, 0);
  if (!editOverride) { p._paper = paperColor(id); drawStrokes(x, e.strokes, c.width, c.height, p._paper); }
}
async function exportPage(p) {
  await ensureBase(p);
  const c = mkCanvas(p.bw, p.bh); drawEdited(p, c);
  return c.toDataURL('image/jpeg', 0.88);
}
const asDataURL = async (src) => (!src || src.startsWith('data:') ? src : blobToDataURL(await srcToBlob(src)));
const blobToDataURL = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
async function downloadBlob(blob, name) {
  if (cloud.downloads) {
    try { await cloud.downloads.save({ filename: name, data: blob }); return true; }
    catch (e) { if (e?.code !== 'declined') toast('Couldn’t save that file here'); return false; }
  }
  if (embedded) { toast('Saving files isn’t available here'); return false; }
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
const slug = (s) => String(s || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'note';

/* ---------------- UI primitives ---------------- */
function topbar({ title = '', back = true, right = '', backAct = 'back' } = {}) {
  return `<header class="topbar">
    ${back ? `<button class="icon-btn" data-act="${backAct}" aria-label="Back">${icon('back')}</button>` : '<span></span>'}
    <div class="title t-h3">${title}</div>
    <div>${right}</div>
  </header>`;
}
function footer(active) {
  const t = (id, ic, label) => `<button class="tab ${active === id ? 'on' : ''}" data-act="tab" data-to="${id}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></button>`;
  return `<nav class="footer" aria-label="Main">${t('home', 'home', 'Home')}${t('search', 'search', 'Search')}
    <button class="fab" data-act="add" aria-label="Add a note">${icon('plus')}</button>
    ${t('library', 'books', 'Library')}${t('profile', 'user', 'Profile')}</nav>`;
}
function field(label, name, type, ph, ac, val = '') {
  return `<label class="field"><span class="field-label t-h3">${label}</span>
    <input class="input" name="${name}" type="${type}" placeholder="${esc(ph)}" autocomplete="${ac}" value="${esc(val)}">
    <span class="field-err t-cap" data-err="${name}"></span></label>`;
}
function thumbHTML(n) {
  if (n.type === 'todo') {
    const items = (n.items || []).slice(0, 6);
    return `<div class="thumb-todo">${items.map((i) => `<div class="tl"><span class="tb ${i.done ? 'done' : ''}"></span>${esc(i.text)}</div>`).join('') || '<div class="tl muted">Empty list</div>'}</div>`;
  }
  return n.pages?.[0] ? `<img data-img="${n.pages[0]}_t" alt="">` : icon('blank');
}
function noteCard(n) {
  return `<button class="note-card" data-act="open-note" data-id="${n.id}"><div class="thumb">${thumbHTML(n)}</div>
    <div class="nt">${esc(n.title)}</div><div class="nd">${fmtShort(n.date)}</div></button>`;
}
function noteSub(n) {
  const f = folderById(n.folderId);
  return `${fmtLong(n.date)}${n.tags[0] ? ' - ' + esc(n.tags[0]) : f ? ' - ' + esc(f.name) : ''}`;
}
function noteRow(n, hl = '') {
  const title = hl ? highlight(n.title, hl) : esc(n.title);
  const typeLabel = n.type === 'todo' ? `${(n.items || []).filter((i) => i.done).length}/${(n.items || []).length} done` : n.type === 'drawing' ? 'Drawing' : `${n.pages.length} page${n.pages.length === 1 ? '' : 's'}`;
  return `<button class="note-row" data-act="open-note" data-id="${n.id}">
    <div class="thumb">${thumbHTML(n)}</div>
    <div class="meta"><div class="nt">${title}</div><div class="nd">${noteSub(n)}</div>
      <div class="pages-badge"><span>${typeLabel}</span>${n.tags.slice(0, 2).map((t) => `<span class="tag-mini" style="--dot:${tagColor(t)}"><i class="dot"></i>${esc(t)}</span>`).join('')}</div></div>
  </button>`;
}
function highlight(text, q) {
  const t = esc(text); if (!q) return t;
  const words = q.trim().split(/\s+/).filter(Boolean).map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return t;
  return t.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>');
}
function tagChips(active, act) {
  return `<div class="chips" role="group" aria-label="Filter by tag">
    <button class="chip ${!active ? 'on' : ''}" data-act="${act}" data-tag="">All</button>
    ${S.data.tags.map((t) => `<button class="chip ${active === t.name ? 'on' : ''}" data-act="${act}" data-tag="${esc(t.name)}" style="--dot:${t.color}"><i class="dot"></i>${esc(t.name)}</button>`).join('')}
  </div>`;
}
function sortNotes(list, mode = S.data.sort) {
  const a = [...list];
  const by = {
    new: (p, q) => (q.date.localeCompare(p.date)) || (q.updated - p.updated),
    old: (p, q) => (p.date.localeCompare(q.date)) || (p.updated - q.updated),
    az: (p, q) => p.title.localeCompare(q.title, undefined, { sensitivity: 'base' }),
    za: (p, q) => q.title.localeCompare(p.title, undefined, { sensitivity: 'base' }),
    edited: (p, q) => q.updated - p.updated,
  };
  return a.sort(by[mode] || by.new);
}
const SORT_LABELS = { new: 'Newest', old: 'Oldest', edited: 'Recently edited', az: 'A–Z', za: 'Z–A' };

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function busy(on, text = 'Working…') { $('#busy').hidden = !on; $('#busy-text').textContent = text; }

/* ---------------- sheets & dialogs ---------------- */
function openSheet(html, onClose) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  root.classList.add('open'); S.sheetClose = onClose || null;
}
function closeSheet() {
  const root = $('#sheet-root'); if (!root.classList.contains('open')) return false;
  root.classList.remove('open'); root.innerHTML = '';
  const f = S.sheetClose; S.sheetClose = null; if (f) f(); return true;
}
function askText({ title, value = '', placeholder = '', ok = 'Save', type = 'text' }) {
  return new Promise((res) => {
    openSheet(`<h2 class="t-h3 sheet-title">${esc(title)}</h2>
      <form data-submit="ask" class="stack gap-16">
        <input class="input" name="v" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off" maxlength="80">
        <div class="row gap-12"><button type="button" class="btn btn-soft" data-act="close-sheet">Cancel</button><button class="btn btn-primary">${esc(ok)}</button></div>
      </form>`, () => res(null));
    S.askResolve = (v) => { S.sheetClose = null; closeSheet(); res(v); };
    setTimeout(() => { const i = $('#sheet-root input'); if (i) { i.focus(); i.select(); } }, 60);
  });
}
function confirmSheet({ title, body = '', ok = 'Confirm', danger = false }) {
  return new Promise((res) => {
    openSheet(`<h2 class="t-h3 sheet-title">${esc(title)}</h2>${body ? `<p class="t-body center muted" style="margin:-6px 0 20px">${esc(body)}</p>` : ''}
      <div class="row gap-12"><button class="btn btn-soft" data-act="close-sheet">Cancel</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="confirm-ok">${esc(ok)}</button></div>`, () => res(false));
    S.confirmResolve = () => { S.sheetClose = null; closeSheet(); res(true); };
  });
}
function pickOption({ title, options }) {
  return new Promise((res) => {
    openSheet(`<h2 class="t-h3 sheet-title">${esc(title)}</h2>
      ${options.map((o, i) => `<button class="opt ${o.on ? 'on' : ''} ${o.danger ? 'danger' : ''}" data-act="pick" data-i="${i}">
        ${o.icon ? `<span class="oi" style="background:${o.bg || 'var(--surface-2)'}">${icon(o.icon)}</span>` : o.swatch ? `<span class="oi" style="background:${o.swatch}"></span>` : ''}
        <span class="grow">${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>${o.on ? icon('check', 'check-ic') : ''}</button>`).join('')}`, () => res(null));
    S.pickResolve = (i) => { S.sheetClose = null; closeSheet(); res(options[i].value); };
  });
}

/* ---------------- router ---------------- */
const app = $('#app');
const screens = {};
const after = {};
function render() {
  const r = S.route; const fn = screens[r.name] || screens.home;
  app.innerHTML = fn(r.params || {});
  app.dataset.screen = r.name;
  hydrate(app);
  const a = after[r.name]; if (a) requestAnimationFrame(() => a(r.params || {}));
}
function rerender() {
  const sc = $('.scroll', app); const top = sc ? sc.scrollTop : 0;
  const ae = document.activeElement; const focusId = ae && ae.id;
  render();
  const sc2 = $('.scroll', app); if (sc2) sc2.scrollTop = top;
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (el.setSelectionRange && el.value != null) { try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* */ } } } }
}
function go(name, params = {}, opt = {}) {
  closeSheet();
  if (opt.stack) S.stack = opt.stack;
  else if (opt.reset) S.stack = [];
  else if (!opt.replace && S.route) { S.stack.push(S.route); try { history.pushState({ f: 1 }, ''); } catch { /* */ } }
  S.route = { name, params };
  render();
}
function back() {
  if (closeSheet()) return;
  if (S.stack.length) { S.route = S.stack.pop(); render(); }
  else if (S.session) go('home', {}, { reset: true });
}
window.addEventListener('popstate', () => { if (closeSheet()) return; if (S.stack.length) { S.route = S.stack.pop(); render(); } });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!closeSheet() && S.route?.name === 'full') back(); } });
window.addEventListener('resize', () => { clearTimeout(window._rz); window._rz = setTimeout(() => { if (['crop', 'edit', 'draw'].includes(S.route?.name)) render(); }, 150); });

/* =========================================================
   SCREENS
   ========================================================= */

/* ---------- Welcome ---------- */
screens.welcome = () => `<div class="screen welcome"><div class="scroll pad">
  <div class="welcome-head"><h1 class="brand">Folio</h1>
    <p class="tagline">Turn your handwritten<br>world into a digital home</p></div>
  <div class="hero">${ART.hero}</div>
  <div class="features">${[['camera', 'Scan'], ['folder', 'Organize'], ['cloud', 'Keep forever']].map(([i, t]) => `<div class="feature"><span class="feature-ic">${icon(i)}</span><span class="t-small">${t}</span></div>`).join('')}</div>
  <div class="spacer"></div>
  <div class="stack gap-12">
    <button class="btn btn-primary" data-act="go" data-to="signup">Create an account</button>
    <button class="btn btn-outline" data-act="go" data-to="login">Log in</button>
  </div></div></div>`;

/* ---------- Create account ---------- */
screens.signup = () => `<div class="screen">${topbar({})}<div class="scroll pad">
  <h1 class="t-h2 center mb-24">Create account</h1>
  ${socialButtons()}
  <form class="stack gap-16" novalidate data-submit="signup">
    <div class="signup-avatar"><button type="button" class="avatar" data-act="signup-avatar" aria-label="Add a profile photo">${S.signupAvatar ? `<img src="${S.signupAvatar}" alt="">` : icon('user')}<span class="avatar-edit">${icon(S.signupAvatar ? 'camera' : 'plus')}</span></button>
      <span class="t-small muted">${S.signupAvatar ? 'Tap to change photo' : 'Add a profile photo (optional)'}</span></div>
    ${field('Name', 'name', 'text', 'Your name', 'name')}
    ${field('Email', 'email', 'email', 'you@example.com', 'email')}
    ${field('Password', 'password', 'password', 'At least 6 characters', 'new-password')}
    <label class="check"><input type="checkbox" name="keep" checked><span class="box">${icon('check')}</span><span class="t-small">Keep me logged in</span></label>
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Create an account</button>
    <p class="t-cap muted">By creating an account, you agree to our <a href="#" data-act="terms">Terms and Conditions</a> and <a href="#" data-act="terms">Privacy Policy</a></p>
    <p class="t-small center">Already have an account? <a href="#" class="link" data-act="go" data-to="login" data-replace="1">Log in</a></p>
  </form>
  <div class="art-bottom">${ART.folders}</div></div></div>`;

/* ---------- Log in ---------- */
screens.login = () => `<div class="screen">${topbar({})}<div class="scroll pad">
  <h1 class="t-h2 center mb-24">Log in</h1>
  ${socialButtons()}
  <form class="stack gap-16" novalidate data-submit="login">
    ${SB.on ? field('Email', 'id', 'email', 'you@example.com', 'email') : field('Username / email', 'id', 'text', 'you@example.com', 'username')}
    ${field('Password', 'password', 'password', 'Your password', 'current-password')}
    <div class="row-between"><label class="check"><input type="checkbox" name="keep" checked><span class="box">${icon('check')}</span><span class="t-small">Keep me logged in</span></label>
      <a href="#" class="link t-small" data-act="go" data-to="forgot">Forgot password?</a></div>
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Log in</button>
    <p class="t-cap muted">By logging in, you agree to our <a href="#" data-act="terms">Terms and Conditions</a> and <a href="#" data-act="terms">Privacy Policy</a></p>
    <p class="t-small center">New to Folio? <a href="#" class="link" data-act="go" data-to="signup" data-replace="1">Create an account</a></p>
  </form>
  <div class="art-bottom">${ART.folders}</div></div></div>`;

/* ---------- Forgot password ---------- */
screens.forgot = (p) => {
  const u = p.email && S.users[p.email];
  return `<div class="screen">${topbar({})}<div class="scroll pad">
  <h1 class="t-h2 center mb-24">Reset password</h1>
  ${u ? `<form class="stack gap-16" novalidate data-submit="reset">
    <p class="t-body muted">Choose a new password for <strong>${esc(u.email)}</strong>. Your notes stay just as they are.</p>
    <input type="hidden" name="email" value="${esc(u.email)}">
    ${field('New password', 'password', 'password', 'At least 6 characters', 'new-password')}
    ${field('Confirm password', 'confirm', 'password', 'Type it again', 'new-password')}
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Save new password</button>
  </form>` : `${cloud.email && S.users[cloud.email] ? `<div class="card stack gap-12 mb-24">
      <p class="t-body"><strong>We’ve confirmed it’s you.</strong> You’re signed in to claude.ai as <strong>${esc(cloud.email)}</strong>, the same email as your Folio account.</p>
      <button class="btn btn-primary" data-act="reset-verified">Reset my password</button>
    </div>
    <p class="t-small muted center mb-24">Or reset another account below</p>` : ''}
  <form class="stack gap-16" novalidate data-submit="forgot">
    <p class="t-body muted">Enter the email you signed up with.${cloud.db ? ' Your Folio accounts live in your private claude.ai storage, so being signed in here is how we know it’s you.' : ' Your Folio accounts are kept on this device, so you can set a new password right here.'}</p>
    ${field('Email', 'email', 'email', 'you@example.com', 'email', p.tried || '')}
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Continue</button>
    ${p.notFound ? `<button type="button" class="btn btn-outline" data-act="go" data-to="signup" data-replace="1">Create a new account instead</button>` : ''}
    <p class="t-small center">Remembered it? <a href="#" class="link" data-act="back">Back to log in</a></p>
  </form>`}
  <div class="art-bottom">${ART.folders}</div></div></div>`;
};

/* ---------- Onboarding: uses ---------- */
screens.uses = () => `<div class="screen"><div class="scroll pad pt">
  <h1 class="t-h2 center" style="margin-top:12px">What do you want to use Folio for?</h1>
  <p class="t-body center muted mt-8">Select a few to personalize your experience</p>
  <div class="uses-grid">${USES.map(([label, , ic, bg]) => `<button class="use-tile ${S.usesSel.has(label) ? 'on' : ''}" data-act="use" data-use="${label}" aria-pressed="${S.usesSel.has(label)}">
    <span class="ui" style="background:${bg}">${icon(ic)}</span>${label}</button>`).join('')}</div>
  <div class="stack gap-12 mt-24">
    <button class="btn btn-primary" data-act="uses-next" id="uses-next">${S.usesSel.size ? 'Continue' : 'Skip for now'}</button>
  </div></div></div>`;

/* ---------- Onboarding: all set ---------- */
screens.allset = () => `<div class="screen"><div class="scroll pad pt" style="display:flex;flex-direction:column">
  <h1 class="t-h1 center" style="margin-top:28px">You’re all set!</h1>
  <p class="t-body center muted mt-8">Let’s start capturing your ideas</p>
  <div class="allset-art">${ART.allset}</div>
  <div class="spacer"></div>
  <button class="btn btn-primary" data-act="get-started">Get started</button></div></div>`;

/* ---------- Home ---------- */
screens.home = () => {
  const d = S.data; const tag = S.homeTag;
  const notes = sortNotes(d.notes, 'edited');
  const filtered = tag ? notes.filter((n) => n.tags.includes(tag)) : notes;
  const qa = (ic, label, act, bg) => `<button class="qa" data-act="${act}"><span class="qa-ic" style="background:${bg}">${icon(ic)}</span>${label}</button>`;
  return `<div class="screen"><div class="scroll pad-x pt">
    <h1 class="t-h2">${greeting()}, ${esc(firstName(user().name))}</h1>
    <div class="searchbar fake" data-act="tab" data-to="search" role="button" tabindex="0" aria-label="Search">${icon('search')}<span class="muted">Search for anything...</span></div>
    ${tagChips(tag, 'home-tag')}
    ${d.settings.tips && !d.tipDismissed && d.notes.length < 3 ? `<div class="tip">${icon('sparkle')}<p>Tip: after you snap a page, tap <b>Enhance → Cleaned</b> to whiten the paper and sharpen your handwriting.</p><button class="icon-btn" style="width:32px;height:32px" data-act="dismiss-tip" aria-label="Dismiss tip">${icon('close')}</button></div>` : ''}
    ${!d.notes.length ? `<div class="empty mt-16">${ART.emptyLib}<h2 class="t-h3">Your library is empty!</h2><p class="t-body muted">Start by adding your first note, drawing, or idea!</p>
        <button class="btn btn-primary btn-pill" data-act="add">${icon('plus')} Add your first note</button></div>`
      : `<div class="sec-head"><h2 class="t-h3">Recent</h2><button class="link t-small" data-act="tab" data-to="library">See all</button></div>
        ${filtered.length ? `<div class="hscroll">${filtered.slice(0, 10).map(noteCard).join('')}</div>` : `<p class="muted t-small">No notes tagged “${esc(tag)}” yet.</p>`}`}
    <h2 class="t-h3 sec-title">Quick Actions</h2>
    <div class="qa-grid">
      ${qa('camera', 'Take a photo', 'pick-camera', 'var(--c-mint)')}
      ${qa('image', 'Upload photo', 'pick-photos', 'var(--c-pink)')}
      ${qa('pages', 'Scan pages', 'pick-multi', 'var(--c-lav)')}
      ${qa('blank', 'Blank page', 'blank', 'var(--c-gold)')}
    </div>
  </div>${footer('home')}</div>`;
};

/* ---------- Search ---------- */
const hasSpeech = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
screens.search = () => `<div class="screen"><div class="scroll pad-x pt">
  <h1 class="t-h2">Search</h1>
  <label class="searchbar">${icon('search')}<input id="q" type="search" placeholder="Search for anything..." value="${esc(S.q)}" data-in="q" enterkeyhint="search" autocomplete="off" aria-label="Search notes">
    ${hasSpeech() && !embedded ? `<button type="button" class="mic" data-act="voice" aria-label="Search by voice">${icon('mic')}</button>` : ''}</label>
  <h2 class="t-small muted label">Search by</h2>
  <div class="type-grid">${[['scan', 'Notes', 'pages', 'var(--c-mint)'], ['drawing', 'Drawing', 'brush', 'var(--c-gold)'], ['todo', 'To-do', 'list', 'var(--c-lav)']].map(([t, l, ic, bg]) =>
    `<button class="type-tile ${S.qTypes.has(t) ? 'on' : ''}" data-act="qtype" data-t="${t}" aria-pressed="${S.qTypes.has(t)}"><span class="ti" style="background:${bg}">${icon(ic)}</span>${l}</button>`).join('')}</div>
  <div id="search-body">${searchBody()}</div>
</div>${footer('search')}</div>`;

function matchNote(n, q) {
  if (S.qTypes.size && !S.qTypes.has(n.type)) return false;
  if (!q) return true;
  const f = folderById(n.folderId);
  const hay = [n.title, ...n.tags, f?.name, n.type === 'todo' ? (n.items || []).map((i) => i.text).join(' ') : '', n.text || '', fmtLong(n.date)].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}
function searchBody() {
  const q = S.q.trim();
  if (!q && !S.qTypes.size) {
    const rec = S.data.recent;
    return `<div class="sec-head"><h2 class="t-small muted">Recent searches</h2>${rec.length ? '<button class="link t-cap" data-act="clear-recent">Clear</button>' : ''}</div>
      ${rec.length ? rec.map((r) => `<button class="recent-item" data-act="run-recent" data-q="${esc(r)}">${icon('search')}<span class="grow">${esc(r)}</span>${icon('history')}</button>`).join('')
        : '<p class="t-small muted">Your recent searches will show up here.</p>'}`;
  }
  const res = sortNotes(S.data.notes.filter((n) => matchNote(n, q)), 'edited');
  return `${q && aiOn() ? aiSearchCard(q) : ''}<p class="t-small muted results-count">${res.length} result${res.length === 1 ? '' : 's'}${q ? ` for “${esc(q)}”` : ''}</p>
    ${res.length ? res.map((n) => noteRow(n, q)).join('') : `<div class="empty">${ART.emptyLib}<p class="t-body muted">Nothing matches yet. Try a title, tag, or folder name.</p></div>`}`;
}
function aiSearchCard(q) {
  const r = S.aiSearch;
  if (!r || r.q !== q) return `<button class="ai-search-btn" data-act="ai-search">${icon('sparkle')}<span class="grow"><strong>Ask AI</strong> about “${esc(q)}”<small>Searches by meaning and reads your handwriting</small></span></button>`;
  if (r.busy) return `<div class="ai-card"><div class="ai-head">${icon('sparkle')} AI search</div><p class="t-small"><span class="spinner sm"></span> Reading your notes… this can take up to a minute.</p><button class="link t-cap" data-act="ai-search-stop">Stop</button></div>`;
  if (r.error) return `<div class="ai-card"><div class="ai-head">${icon('sparkle')} AI search</div><p class="t-small">${esc(r.error)}</p><button class="link t-cap" data-act="ai-search">Try again</button></div>`;
  const notes = r.ids.map((id) => S.data.notes.find((n) => n.id === id)).filter(Boolean);
  return `<div class="ai-card"><div class="ai-head">${icon('sparkle')} AI search</div><p class="t-body">${esc(r.answer)}</p>
    ${notes.length ? notes.map((n) => noteRow(n)).join('') : ''}</div>`;
}
A['ai-search-stop'] = () => ai.ctl?.abort();
A['ai-search'] = async () => {
  const q = S.q.trim(); if (!q || !aiOn()) return;
  addRecent(q);
  S.aiSearch = { q, busy: true }; refreshSearch();
  try {
    const notes = sortNotes(S.data.notes, 'edited').slice(0, 300);
    // Read handwriting on pages Folio hasn't read yet (newest first), within the image allowance.
    const unread = notes.filter((n) => n.type !== 'todo' && n.pages?.[0] && n.textFor !== n.pages[0]).slice(0, ai.maxImages);
    const images = [], readIds = [];
    for (const n of unread) {
      try { const src = (await getImg(n.pages[0] + '_t')) || (await getImg(n.pages[0])); if (src) { images.push(await toJpegBlob(src, 900)); readIds.push(n.id); } } catch { /* skip */ }
    }
    const catalog = notes.map((n) => ({
      id: n.id, type: n.type === 'scan' ? 'scanned note' : n.type, title: n.title, folder: folderById(n.folderId)?.name || null, tags: n.tags, date: n.date,
      ...(n.type === 'todo' ? { items: (n.items || []).slice(0, 40).map((i) => (i.done ? '[x] ' : '[ ] ') + i.text) } : {}),
      ...(n.text ? { text: n.text.slice(0, 1200) } : {}),
    }));
    const res = await aiJSON(`You are the search assistant inside Folio, an app for handwritten notes, drawings and to-do lists. Today is ${new Date().toDateString()}.
The user searched for: "${q}"

Their notes (JSON; "text" is what is written on the page, when known):
${JSON.stringify(catalog).slice(0, 150000)}
${readIds.length ? `\nAttached images, in order, are the first page of these notes: ${readIds.map((id, i) => `image ${i + 1} = ${id}`).join(', ')}. Read the handwriting in each.` : ''}

Find the notes that match by meaning, not just exact words (a search for "biology" should find notes about cells; "things to buy" should find a shopping list).
Reply with ONLY this JSON:
{"answer":"1–3 short friendly sentences that answer the search or say what you found, speaking to the user","ids":["matching note ids, best first, at most 12"],"read":{${readIds.length ? '"<note id>":"everything written on that page (or a short description if it is a drawing)"' : ''}}}
If nothing matches, use "ids": [] and say so kindly.`, { images });
    const known = new Set(S.data.notes.map((n) => n.id));
    const ids = (Array.isArray(res?.ids) ? res.ids : []).map(String).filter((id) => known.has(id)).slice(0, 12);
    let learned = 0;
    if (res?.read && typeof res.read === 'object') for (const id of readIds) {
      const n = S.data.notes.find((x) => x.id === id); const t = res.read[id];
      if (n && typeof t === 'string' && t.trim()) { n.text = t.trim().slice(0, 4000); n.textFor = n.pages[0]; learned++; }
    }
    if (learned) saveData();
    S.aiSearch = { q, answer: String(res?.answer || (ids.length ? 'Here’s what I found.' : 'I couldn’t find anything that matches.')).slice(0, 600), ids };
  } catch (e) {
    const msg = aiErrText(e);
    S.aiSearch = msg ? { q, error: msg } : null;
  }
  if (S.route?.name === 'search') refreshSearch();
};
function refreshSearch() { const b = $('#search-body'); if (b) { b.innerHTML = searchBody(); hydrate(b); } }
function addRecent(q) {
  q = q.trim(); if (!q) return;
  S.data.recent = [q, ...S.data.recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 8); saveData();
}

/* ---------- Library ---------- */
function folderTile(f) {
  const count = S.data.notes.filter((n) => n.folderId === f.id).length;
  return `<button class="folder-tile" style="--fc:${f.color}" data-act="open-folder" data-id="${f.id}">${icon('folder')}<div><div class="fn">${esc(f.name)}</div><div class="fc">${count} note${count === 1 ? '' : 's'}</div></div></button>`;
}
screens.library = () => {
  const d = S.data;
  return `<div class="screen"><div class="scroll pad-x pt">
    <h1 class="t-h2">My library</h1>
    <label class="searchbar">${icon('search')}<input id="libq" type="search" placeholder="Search for anything..." value="${esc(S.libQ)}" data-in="libq" autocomplete="off" aria-label="Filter library"></label>
    <div class="sec-head"><h2 class="t-h3">Folders</h2>${d.folders.length ? '<button class="link t-small" data-act="new-folder">New folder</button>' : ''}</div>
    ${d.folders.length ? `<div class="hscroll">${d.folders.map(folderTile).join('')}<button class="folder-tile new" data-act="new-folder">${icon('plus')}<div class="fn">Create folder</div></button></div>`
      : `<div class="empty">${ART.emptyFolder}<h3 class="t-h3">No folders yet</h3><p class="t-small muted">Create folder to keep your notes organized</p><button class="btn btn-soft btn-pill" data-act="new-folder">${icon('plus')} Create Folder</button></div>`}
    <div class="sec-head"><h2 class="t-h3">All notes</h2><button class="sort-btn" data-act="sort">${icon('sort')} ${SORT_LABELS[d.sort]}</button></div>
    <div id="lib-list">${libList()}</div>
  </div>${footer('library')}</div>`;
};
function libList(folderId) {
  const q = (folderId ? S.folderQ : S.libQ) || '';
  let notes = S.data.notes;
  if (folderId) notes = notes.filter((n) => n.folderId === folderId);
  if (folderId && S.folderTag) notes = notes.filter((n) => n.tags.includes(S.folderTag));
  const total = notes.length;
  notes = sortNotes(notes.filter((n) => { const sv = S.qTypes; S.qTypes = new Set(); const ok = matchNote(n, q.trim()); S.qTypes = sv; return ok; }));
  if (!total) return `<div class="empty">${ART.emptyLib}<h3 class="t-h3">No notes yet</h3><p class="t-small muted">Add your first note to start building your collection!</p>
    <button class="btn btn-primary btn-pill" data-act="add" ${folderId ? `data-folder="${folderId}"` : ''}>${icon('plus')} Add a note</button></div>`;
  if (!notes.length) return '<p class="t-small muted">No notes match.</p>';
  return notes.map((n) => noteRow(n, q.trim())).join('') + `<div class="center-btn"><button class="btn btn-soft btn-pill" data-act="add" ${folderId ? `data-folder="${folderId}"` : ''}>${icon('plus')} Add a note</button></div>`;
}

/* ---------- Folder ---------- */
screens.folder = ({ id }) => {
  const f = folderById(id); if (!f) return screens.library();
  return `<div class="screen">${topbar({ title: `<span class="folder-pill" style="--fc:${f.color}">${icon('folder')}<span>${esc(f.name)}</span></span>`, right: `<button class="icon-btn" data-act="folder-more" data-id="${f.id}" aria-label="Folder options">${icon('more')}</button>` })}
  <div class="scroll pad-x">
    <label class="searchbar">${icon('search')}<input id="folderq" type="search" placeholder="Search in ${esc(f.name)}..." value="${esc(S.folderQ || '')}" data-in="folderq" data-id="${f.id}" autocomplete="off"></label>
    ${tagChips(S.folderTag, 'folder-tag')}
    <div class="sec-head"><h2 class="t-h3">${esc(f.name)}</h2><button class="sort-btn" data-act="sort">${icon('sort')} ${SORT_LABELS[S.data.sort]}</button></div>
    <div id="lib-list">${libList(f.id)}</div>
  </div>${footer('library')}</div>`;
};

/* ---------- Note ---------- */
screens.note = ({ id }) => {
  const n = noteById(id); if (!n) return `<div class="screen">${topbar({})}<div class="scroll pad"><div class="empty"><p>This note was deleted.</p></div></div></div>`;
  const f = folderById(n.folderId);
  let body;
  if (n.type === 'todo') {
    const items = n.items || []; const done = items.filter((i) => i.done).length;
    body = `<p class="todo-progress">${done} of ${items.length} done</p><div class="todo-sheet"><div class="todo-list">
      ${items.map((it) => `<div class="todo-item ${it.done ? 'done' : ''}"><label class="check"><input type="checkbox" data-ch="todo-toggle" data-id="${it.id}" ${it.done ? 'checked' : ''}><span class="box">${icon('check')}</span></label><span class="tx">${esc(it.text)}</span></div>`).join('')}
      <form class="todo-add" data-submit="todo-quick">${icon('plus')}<input name="t" placeholder="Add an item" autocomplete="off" enterkeyhint="done"></form></div></div>`;
  } else {
    body = n.pages.map((k, i) => `${n.pages.length > 1 ? `<div class="page-label">Page ${i + 1} of ${n.pages.length}</div>` : ''}<img class="page-img" data-img="${k}" alt="${esc(n.title)} page ${i + 1}" data-act="full" data-i="${i}">`).join('');
  }
  return `<div class="screen">${topbar({ title: '', right: `<button class="icon-btn" data-act="note-more" aria-label="More options">${icon('more')}</button>` })}
    <div class="scroll pad-x">
      <h1 class="t-h2">${esc(n.title)}</h1>
      <div class="note-meta" style="margin-top:8px"><span>${fmtLong(n.date)}</span>
        ${f ? `<button class="folder-pill" style="--fc:${f.color}" data-act="open-folder" data-id="${f.id}">${icon('folder')}<span>${esc(f.name)}</span></button>` : ''}
        ${n.tags.map((t) => `<span class="tag-mini" style="--dot:${tagColor(t)}"><i class="dot"></i>${esc(t)}</span>`).join('')}</div>
      ${body}
    </div>
    <nav class="note-actions">
      <button data-act="note-edit">${icon('edit')}Edit</button><button data-act="note-move">${icon('move')}Move</button>
      <button data-act="note-share">${icon('share')}Share</button><button data-act="note-more">${icon('more')}More</button>
    </nav></div>`;
};

/* ---------- Full note viewer ---------- */
screens.full = ({ id, i = 0 }) => {
  const n = noteById(id); if (!n) return screens.home();
  return `<div class="screen viewer">${topbar({ title: `<span id="full-count" class="t-small">${Number(i) + 1} / ${n.pages.length}</span>`, right: '' })}
    <div class="viewer-track" id="vtrack">${n.pages.map((k) => `<div class="viewer-page"><img data-img="${k}" alt=""></div>`).join('')}</div>
    <p class="viewer-hint">Double-tap to zoom${n.pages.length > 1 ? ' · swipe for more pages' : ''}</p></div>`;
};
after.full = ({ i = 0 }) => {
  const tr = $('#vtrack'); if (!tr) return;
  tr.scrollLeft = tr.clientWidth * Number(i);
  tr.addEventListener('scroll', () => { const c = $('#full-count'); if (c) c.textContent = `${Math.round(tr.scrollLeft / tr.clientWidth) + 1} / ${tr.children.length}`; });
  tr.addEventListener('dblclick', (e) => { const pg = e.target.closest('.viewer-page'); if (pg) pg.classList.toggle('zoom'); });
};

/* ---------- Capture: Scan / crop ---------- */
const curPage = () => S.draft.pages[S.draft.idx] || S.draft.pages[0];
function pageStrip(act) {
  const dr = S.draft;
  return `<div class="page-strip">${dr.pages.map((p, i) => `<button class="pthumb ${i === dr.idx ? 'on' : ''}" data-act="${act}" data-i="${i}" aria-label="Page ${i + 1}"><img src="${act === 'edit-page' ? (p._thumb || p.base) : p.src}" alt=""><span class="n">${i + 1}</span></button>`).join('')}
    ${act === 'crop-page' ? `<button class="pthumb add" data-act="crop-add" aria-label="Add a page">${icon('plus')}</button>` : ''}</div>`;
}
screens.crop = () => {
  const dr = S.draft; const p = curPage();
  return `<div class="screen editor">${topbar({ title: 'Scan/crop', backAct: 'draft-cancel', right: dr.pages.length > 1 ? `<button class="icon-btn" data-act="crop-del" aria-label="Remove this page">${icon('trash')}</button>` : '' })}
    <p class="sub">Page ${dr.idx + 1} of ${dr.pages.length} · drag the corners to fit your page</p>
    <div class="stage" id="stage"><img id="crop-img" src="${p.src}" alt="Captured page">
      <div class="crop-ov" id="crop-ov"><div class="crop-box ${S.cropOff ? 'off' : ''}" id="crop-box"><div class="grid"></div>
        <span class="h" data-h="nw"></span><span class="h" data-h="ne"></span><span class="h" data-h="sw"></span><span class="h" data-h="se"></span></div></div></div>
    ${pageStrip('crop-page')}
    <div class="toolbar">
      <button class="tool" data-act="crop-retake">${icon('retake')}Retake</button>
      <button class="tool" data-act="crop-rotate">${icon('rotate')}Rotate</button>
      <button class="tool ${!S.cropOff ? 'on' : ''}" data-act="crop-toggle">${icon('crop')}Crop</button>
      <button class="tool" data-act="crop-auto">${icon('auto')}Auto</button>
    </div>
    <div class="editor-foot"><button class="btn btn-primary" data-act="crop-next">Next</button></div></div>`;
};
after.crop = () => {
  const p = curPage(); const stage = $('#stage'), img = $('#crop-img'), ov = $('#crop-ov'), box = $('#crop-box');
  if (!stage) return;
  const placeBox = () => { const c = p.crop; Object.assign(box.style, { left: c.x * 100 + '%', top: c.y * 100 + '%', width: c.w * 100 + '%', height: c.h * 100 + '%' }); };
  const sw = stage.clientWidth, sh = stage.clientHeight; const s = Math.min(sw / p.w, sh / p.h);
  const dw = p.w * s, dh = p.h * s, L = (sw - dw) / 2, T = (sh - dh) / 2;
  for (const el of [img, ov]) Object.assign(el.style, { left: L + 'px', top: T + 'px', width: dw + 'px', height: dh + 'px' });
  placeBox();
  let drag = null;
  ov.onpointerdown = (e) => {
    if (S.cropOff) return;
    const h = e.target.closest('[data-h]')?.dataset.h || (e.target.closest('#crop-box') ? 'move' : null); if (!h) return;
    e.preventDefault(); ov.setPointerCapture(e.pointerId);
    drag = { h, sx: e.clientX, sy: e.clientY, c: { ...p.crop }, W: ov.clientWidth, H: ov.clientHeight };
  };
  ov.onpointermove = (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / drag.W, dy = (e.clientY - drag.sy) / drag.H; let { x, y, w, h } = drag.c; const m = 0.1;
    if (drag.h === 'move') { x = clamp(x + dx, 0, 1 - w); y = clamp(y + dy, 0, 1 - h); }
    else {
      if (drag.h.includes('w')) { const nx = clamp(x + dx, 0, x + w - m); w += x - nx; x = nx; }
      if (drag.h.includes('e')) w = clamp(w + dx, m, 1 - x);
      if (drag.h.includes('n')) { const ny = clamp(y + dy, 0, y + h - m); h += y - ny; y = ny; }
      if (drag.h.includes('s')) h = clamp(h + dy, m, 1 - y);
    }
    p.crop = { x, y, w, h }; placeBox();
  };
  ov.onpointerup = ov.onpointercancel = () => { drag = null; };
};

/* ---------- Capture: Clean & edit ---------- */
const ADJ = [['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation'], ['highlights', 'Highlights'], ['shadows', 'Shadows']];
const FILTERS = [['none', 'Original'], ['mono', 'Mono'], ['ink', 'Ink'], ['warm', 'Warm'], ['sage', 'Sage'], ['soft', 'Soft'], ['night', 'Night']];
function editPanel() {
  const p = curPage(); const e = p.edit; const tab = S.editTab;
  if (tab === 'enhance') return `<div class="seg" role="group" aria-label="Clean up"><button class="${!e.cleaned ? 'on' : ''}" data-act="edit-clean" data-v="0">Original</button><button class="${e.cleaned ? 'on' : ''}" data-act="edit-clean" data-v="1">Cleaned</button></div>
    <div class="panel-row"><span class="hint">${e.cleaned ? 'Paper whitened, ink darkened.' : 'Cleaned whitens paper and sharpens ink.'}</span>
    <button class="ghost-btn" data-act="edit-auto" aria-pressed="${e.auto}">${icon('auto')} ${e.auto ? 'Auto on' : 'Auto'}</button></div>`;
  if (tab === 'erase') return `<div class="slider-row"><span class="hint">Brush</span><input type="range" min="1" max="12" value="${S.brush || 4}" data-in="brush" aria-label="Brush size"><span class="val" id="brush-val">${S.brush || 4}</span></div>
    <div class="panel-row"><span class="hint">Paint over smudges, shadows or stray marks.</span><button class="ghost-btn" data-act="edit-undo" ${e.strokes.length ? '' : 'disabled'}>${icon('undo')} Undo</button></div>`;
  if (tab === 'adjust') {
    const k = S.adjKey;
    return `<div class="adj-chips"><button class="${e.auto ? 'on' : ''}" data-act="edit-auto">${icon('auto')} Auto</button>
      ${ADJ.map(([key, l]) => `<button class="${k === key ? 'on' : ''}" data-act="adj-key" data-k="${key}">${l}${e.adj[key] ? ` <span class="v">${e.adj[key] > 0 ? '+' : ''}${e.adj[key]}</span>` : ''}</button>`).join('')}</div>
      <div class="slider-row"><input type="range" min="-100" max="100" value="${e.adj[k]}" data-in="adj" aria-label="${k}"><span class="val" id="adj-val">${e.adj[k]}</span></div>
      <div class="panel-row" style="margin-top:2px"><span></span><button class="ghost-btn" data-act="edit-reset">${icon('undo')} Reset</button></div>`;
  }
  if (tab === 'ai') return `<div class="panel-row" style="margin-top:0"><span class="hint">Tell the AI what you want, like “make the writing darker” or “circle the dates”.</span></div>
    <div class="panel-row"><button class="ghost-btn ai-ask" data-act="edit-ai">${icon('sparkle')} Ask AI</button>
    ${p._aiUndo ? `<button class="ghost-btn" data-act="edit-ai-undo">${icon('undo')} Undo AI</button>` : ''}</div>`;
  return `<div class="filters">${FILTERS.map(([k, l]) => `<button class="filter-btn ${e.filter === k ? 'on' : ''}" data-act="edit-filter" data-f="${k}"><canvas data-fthumb="${k}" width="62" height="76"></canvas>${l}</button>`).join('')}</div>`;
}
screens.edit = () => {
  const dr = S.draft; const tab = S.editTab;
  const t = (id, ic, l) => `<button class="tool ${tab === id ? 'on' : ''}" data-act="edit-tab" data-t="${id}">${icon(ic)}${l}</button>`;
  return `<div class="screen editor">${topbar({ title: 'Clean &amp; edit', right: dr.pages.length > 1 ? `<button class="icon-btn" data-act="edit-all" aria-label="Apply these edits to all pages">${icon('copy')}</button>` : '' })}
    ${dr.pages.length > 1 ? `<p class="sub">Page ${dr.idx + 1} of ${dr.pages.length}</p>` : ''}
    <div class="stage" id="stage"><canvas id="edit-canvas" class="${tab === 'erase' ? 'erasing' : ''}"></canvas></div>
    ${dr.pages.length > 1 ? pageStrip('edit-page') : ''}
    <div class="panel" id="panel">${editPanel()}</div>
    <div class="toolbar">${t('enhance', 'enhance', 'Enhance')}${t('erase', 'erase', 'Erase')}${t('adjust', 'adjust', 'Adjust')}${t('filter', 'filter', 'Filter')}${aiOn() ? t('ai', 'sparkle', 'AI') : ''}</div>
    <div class="editor-foot"><button class="btn btn-primary" data-act="edit-next">Next</button></div></div>`;
};
after.edit = async () => {
  const p = curPage(); await ensureBase(p);
  const stage = $('#stage'), c = $('#edit-canvas'); if (!c || !stage) return;
  const s = Math.min(stage.clientWidth / p.bw, stage.clientHeight / p.bh);
  const dw = Math.floor(p.bw * s), dh = Math.floor(p.bh * s);
  c.style.width = dw + 'px'; c.style.height = dh + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1); const k = Math.min(1, 1400 / Math.max(dw * dpr, dh * dpr));
  c.width = Math.max(1, Math.round(dw * dpr * k)); c.height = Math.max(1, Math.round(dh * dpr * k));
  drawEdited(p, c);
  if (S.editTab === 'filter') renderFilterThumbs(p);
  // erase brush
  let stroke = null;
  const pt = (e) => { const r = c.getBoundingClientRect(); return [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)]; };
  c.onpointerdown = (e) => {
    if (S.editTab !== 'erase') return; e.preventDefault(); c.setPointerCapture(e.pointerId);
    stroke = { size: ((S.brush || 4) * 6) / c.clientWidth, pts: [pt(e)] };
    drawStrokes(ctx2d(c), [stroke], c.width, c.height, p._paper);
  };
  c.onpointermove = (e) => {
    if (!stroke) return; const a = stroke.pts[stroke.pts.length - 1]; const b = pt(e); stroke.pts.push(b);
    drawStrokes(ctx2d(c), [{ size: stroke.size, pts: [a, b] }], c.width, c.height, p._paper);
  };
  c.onpointerup = c.onpointercancel = () => {
    if (!stroke) return; p.edit.strokes.push(stroke); stroke = null;
    const u = $('[data-act="edit-undo"]'); if (u) u.disabled = false;
  };
};
function scheduleEditRender() {
  if (S._raf) return;
  S._raf = requestAnimationFrame(() => { S._raf = 0; const c = $('#edit-canvas'); const p = curPage(); if (c && p._img) drawEdited(p, c); });
}
function renderFilterThumbs(p) {
  $$('canvas[data-fthumb]').forEach((cv) => {
    const w = 124, h = 152; cv.width = w; cv.height = h; const x = ctx2d(cv);
    const s = Math.max(w / p.bw, h / p.bh); const tc = mkCanvas(Math.round(p.bw * s), Math.round(p.bh * s));
    drawEdited(p, tc, { ...p.edit, filter: cv.dataset.fthumb, strokes: [] });
    x.drawImage(tc, (w - tc.width) / 2, (h - tc.height) / 2);
  });
}

/* ---------- Blank page: drawing ---------- */
const PENS = ['#1f281e', '#4b5e49', '#96b093', '#c46f86', '#c9a43c', '#5b6fc4'];
screens.draw = () => {
  const dr = S.draft;
  return `<div class="screen editor">${topbar({ title: 'Blank page', backAct: 'draft-cancel', right: `<button class="icon-btn" data-act="draw-undo" aria-label="Undo">${icon('undo')}</button>` })}
    <div class="stage" id="stage"><canvas id="draw-canvas"></canvas></div>
    <div class="panel" style="min-height:0;padding-top:8px">
      <div class="panel-row" style="margin-top:0">
        <div class="pens">${PENS.map((c) => `<button class="pen ${dr.tool === 'pen' && dr.color === c ? 'on' : ''}" style="background:${c}" data-act="draw-color" data-c="${c}" aria-label="Pen color"></button>`).join('')}</div>
        <div class="sizes">${[2, 5, 10].map((s) => `<button class="size-btn ${dr.size === s ? 'on' : ''}" data-act="draw-size" data-s="${s}" aria-label="Pen size ${s}"><i style="width:${s + 4}px;height:${s + 4}px"></i></button>`).join('')}</div>
      </div>
    </div>
    <div class="toolbar">
      <button class="tool ${dr.tool === 'pen' ? 'on' : ''}" data-act="draw-tool" data-t="pen">${icon('pen')}Pen</button>
      <button class="tool ${dr.tool === 'eraser' ? 'on' : ''}" data-act="draw-tool" data-t="eraser">${icon('erase')}Eraser</button>
      <button class="tool" data-act="draw-clear">${icon('trash')}Clear</button>
      ${aiOn() ? `<button class="tool" data-act="draw-ai">${icon('sparkle')}AI</button>` : ''}
    </div>
    <div class="editor-foot"><button class="btn btn-primary" data-act="draw-next">Next</button></div></div>`;
};
function redrawDrawing(c) {
  const dr = S.draft; const x = c.getContext('2d');
  x.fillStyle = PAPER; x.fillRect(0, 0, c.width, c.height);
  // faint ruled lines like a notebook page
  x.strokeStyle = 'rgba(150,176,147,.28)'; x.lineWidth = 2;
  for (let y = 140; y < c.height; y += 64) { x.beginPath(); x.moveTo(60, y); x.lineTo(c.width - 60, y); x.stroke(); }
  if (dr._bg) x.drawImage(dr._bg, 0, 0, c.width, c.height);
  drawStrokes(x, dr.strokes, c.width, c.height, PAPER);
}
after.draw = async () => {
  const dr = S.draft; const stage = $('#stage'), c = $('#draw-canvas'); if (!c) return;
  c.width = 1200; c.height = 1600;
  if (dr.bg && !dr._bg) dr._bg = await loadImg(dr.bg);
  const s = Math.min(stage.clientWidth / c.width, stage.clientHeight / c.height);
  c.style.width = Math.floor(c.width * s) + 'px'; c.style.height = Math.floor(c.height * s) + 'px';
  redrawDrawing(c);
  let stroke = null;
  const pt = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  c.onpointerdown = (e) => {
    e.preventDefault(); c.setPointerCapture(e.pointerId);
    const er = dr.tool === 'eraser';
    stroke = { color: er ? PAPER : dr.color, size: (dr.size * (er ? 4 : 1.6)) / 1200, pts: [pt(e)] };
    drawStrokes(c.getContext('2d'), [stroke], c.width, c.height);
  };
  c.onpointermove = (e) => {
    if (!stroke) return; const a = stroke.pts[stroke.pts.length - 1]; const b = pt(e); stroke.pts.push(b);
    drawStrokes(c.getContext('2d'), [{ ...stroke, pts: [a, b] }], c.width, c.height);
  };
  c.onpointerup = c.onpointercancel = () => { if (stroke) { dr.strokes.push(stroke); stroke = null; } };
};

/* ---------- Blank page: to-do list ---------- */
screens.todo = () => {
  const dr = S.draft;
  return `<div class="screen">${topbar({ title: 'To-do list', backAct: 'draft-cancel' })}
    <div class="scroll pad-x">
      <div class="todo-sheet mt-8"><div class="todo-list" id="todo-list">
        ${dr.items.map((it) => `<div class="todo-item ${it.done ? 'done' : ''}">
          <label class="check"><input type="checkbox" data-ch="draft-todo" data-id="${it.id}" ${it.done ? 'checked' : ''}><span class="box">${icon('check')}</span></label>
          <input type="text" value="${esc(it.text)}" data-in="draft-todo-text" data-id="${it.id}" aria-label="Item">
          <button class="icon-btn" style="width:34px;height:34px" data-act="draft-todo-del" data-id="${it.id}" aria-label="Remove item">${icon('close')}</button></div>`).join('')}
        <form class="todo-add" data-submit="draft-todo-add">${icon('plus')}<input id="todo-new" name="t" placeholder="Add an item" autocomplete="off" enterkeyhint="done"></form>
      </div></div>
      <p class="t-cap muted mt-16">Press return to add each item. You can keep checking things off after saving.</p>
    </div>
    <div class="editor-foot" style="background:var(--bg)"><button class="btn btn-primary" data-act="todo-next" ${dr.items.length ? '' : 'disabled'}>Next</button></div></div>`;
};
after.todo = () => { const i = $('#todo-new'); if (i && !S.draft.items.length) i.focus(); };

/* ---------- Save note ---------- */
screens.save = () => {
  const dr = S.draft; const f = folderById(dr.folderId);
  const preview = dr.type === 'todo'
    ? `<div class="thumb-todo">${dr.items.slice(0, 6).map((i) => `<div class="tl"><span class="tb ${i.done ? 'done' : ''}"></span>${esc(i.text)}</div>`).join('')}</div>`
    : dr.outputs.map((o) => `<img src="${o}" alt="">`).join('');
  return `<div class="screen">${topbar({ title: 'Save note' })}
    <div class="scroll pad-x">
      <div class="save-preview">${preview}</div>
      <div class="stack gap-24">
        <label class="field"><span class="field-label t-h3">Title</span>
          <input class="input" id="save-title" value="${esc(dr.title)}" placeholder="Give your note a name..." data-in="save-title" maxlength="80" autocomplete="off"></label>
        <div class="field"><span class="field-label t-h3">Folder</span>
          <div class="dropdown"><button class="dd-btn ${S.ddOpen ? 'open' : ''}" data-act="dd-toggle" aria-expanded="${!!S.ddOpen}">${icon('folder')}
            <span class="grow ${f ? '' : 'ph'}">${f ? esc(f.name) : 'No folder'}</span>${icon('down')}</button>
            ${S.ddOpen ? `<div class="dd-list">
              <button class="dd-opt ${!f ? 'on' : ''}" data-act="dd-pick" data-id="">No folder</button>
              ${S.data.folders.map((x) => `<button class="dd-opt ${x.id === dr.folderId ? 'on' : ''}" data-act="dd-pick" data-id="${x.id}" style="--fc:${x.color}"><span class="sw"></span>${esc(x.name)}</button>`).join('')}
              <form class="dd-new" data-submit="dd-new">${icon('plus')}<input id="dd-new" name="n" placeholder="Create new folder..." autocomplete="off" maxlength="40"><button class="link t-small">Add</button></form>
            </div>` : ''}</div></div>
        <div class="field"><span class="field-label t-h3">Tags</span>
          <div class="chips" style="flex-wrap:wrap;margin:0;padding:0">${S.data.tags.map((t) => `<button class="chip ${dr.tags.includes(t.name) ? 'on' : ''}" style="--dot:${t.color}" data-act="save-tag" data-tag="${esc(t.name)}" aria-pressed="${dr.tags.includes(t.name)}"><i class="dot"></i>${esc(t.name)}</button>`).join('')}
            <button class="chip add" data-act="new-tag">${icon('plus')} New tag</button></div></div>
        <label class="field"><span class="field-label t-h3">Date</span>
          <div class="date-wrap">${icon('calendar')}<input class="input" type="date" value="${dr.date}" data-in="save-date" aria-label="Date"></div></label>
      </div>
    </div>
    <div class="editor-foot" style="background:var(--bg)"><button class="btn btn-primary" data-act="save-note">Save</button></div></div>`;
};

/* ---------- Profile ---------- */
screens.profile = () => {
  const u = user(); const d = S.data;
  const pages = d.notes.reduce((s, n) => s + (n.type === 'todo' ? 0 : n.pages.length), 0);
  const item = (act, ic, label, bg) => `<button class="menu-item" data-act="go" data-to="${act}"><span class="mi" style="background:${bg}">${icon(ic)}</span><span class="grow">${label}</span>${icon('right', 'chev')}</button>`;
  return `<div class="screen"><div class="scroll pad-x pt">
    <h1 class="t-h2">Profile</h1>
    <div class="profile-head">
      <button class="avatar" data-act="avatar" aria-label="Change profile photo">${d.avatar ? `<img src="${d.avatar}" alt="">` : esc(firstName(u.name)[0]?.toUpperCase() || 'F')}<span class="avatar-edit">${icon('camera')}</span></button>
      <div style="min-width:0"><h2 class="t-h3">${esc(u.name)}</h2><p class="t-small muted" style="overflow-wrap:anywhere">${esc(u.email)}</p></div>
    </div>
    <div class="stats"><div class="stat"><b>${d.notes.length}</b><span>Notes</span></div><div class="stat"><b>${d.folders.length}</b><span>Folders</span></div><div class="stat"><b>${pages}</b><span>Pages scanned</span></div></div>
    <div class="menu">
      ${item('account', 'user', 'Account Settings', 'var(--c-mint)')}
      ${item('notifications', 'bell', 'Notifications', 'var(--c-gold)')}
      ${item('themes', 'palette', 'Themes &amp; Appearance', 'var(--c-pink)')}
      ${item('backup', 'cloud', 'Backup &amp; Sync', 'var(--c-peri)')}
      ${item('help', 'help', 'Help &amp; Support', 'var(--c-lav)')}
    </div>
    <div class="menu"><button class="menu-item danger" data-act="logout"><span class="mi" style="background:var(--surface-2);color:var(--danger)">${icon('logout')}</span><span class="grow">Log out</span></button></div>
  </div>${footer('profile')}</div>`;
};

screens.account = () => {
  const u = user();
  return `<div class="screen">${topbar({ title: 'Account Settings' })}<div class="scroll pad-x">
    <form class="card stack gap-16" data-submit="account" novalidate><h3 class="t-h3">Personal info</h3>
      ${field('Name', 'name', 'text', 'Your name', 'name', u.name)}${field('Email', 'email', 'email', 'you@example.com', 'email', u.email)}
      <button class="btn btn-primary">Save changes</button></form>
    <form class="card stack gap-16" data-submit="password" novalidate><h3 class="t-h3">Security</h3>
      ${field('Current password', 'cur', 'password', '••••••', 'current-password')}${field('New password', 'pw', 'password', 'At least 6 characters', 'new-password')}
      <button class="btn btn-soft">Change password</button></form>
    <div class="card"><h3 class="t-h3">Delete account</h3><p class="t-small muted" style="margin-bottom:14px">${SB.on ? 'Permanently removes your account, notes, folders and pages from Folio. This can’t be undone.' : 'Removes your account and every note stored on this device. This can’t be undone.'}</p>
      <button class="btn btn-danger" data-act="delete-account">Delete my account</button></div>
  </div></div>`;
};
screens.notifications = () => {
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const st = S.data.settings;
  return `<div class="screen">${topbar({ title: 'Notifications' })}<div class="scroll pad-x">
    <div class="menu" style="margin-top:6px">
      ${embedded ? '' : `<div class="setting-row"><div class="grow"><b>Device notifications</b><p>${perm === 'granted' ? 'Allowed in this browser' : perm === 'denied' ? 'Blocked — change it in your browser’s site settings' : perm === 'unsupported' ? 'Not supported in this browser' : 'Not allowed yet'}</p></div>
        ${perm === 'default' ? '<button class="btn btn-primary btn-sm" data-act="notif-allow">Allow</button>' : perm === 'granted' ? '<button class="btn btn-soft btn-sm" data-act="notif-test">Test</button>' : ''}</div>`}
      <div class="setting-row"><div class="grow"><b>Helpful tips</b><p>Show capture tips on your Home screen</p></div>
        <label class="switch"><input type="checkbox" data-ch="tips" ${st.tips ? 'checked' : ''} aria-label="Helpful tips"><span></span></label></div>
    </div>
  </div></div>`;
};
screens.themes = () => {
  const st = S.data.settings;
  return `<div class="screen">${topbar({ title: 'Themes &amp; Appearance' })}<div class="scroll pad-x">
    <div class="card"><h3 class="t-h3">Appearance</h3><div class="seg">${[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="set-theme" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="card"><h3 class="t-h3">Accent color</h3><div class="swatches">${Object.entries(ACCENTS).map(([k, a]) => `<button class="swatch ${st.accent === k ? 'on' : ''}" style="background:${a.deep}" data-act="set-accent" data-v="${k}" aria-label="${a.name}">${icon('check')}</button>`).join('')}</div>
      <p class="t-small muted mt-16">${ACCENTS[st.accent]?.name || 'Sage'}</p></div>
    <div class="card"><h3 class="t-h3">Text size</h3><div class="seg">${[['standard', 'Standard'], ['large', 'Large']].map(([k, l]) => `<button class="${st.size === k ? 'on' : ''}" data-act="set-size" data-v="${k}">${l}</button>`).join('')}</div></div>
  </div></div>`;
};
screens.backup = () => `<div class="screen">${topbar({ title: 'Backup &amp; Sync' })}<div class="scroll pad-x">
    <div class="card"><h3 class="t-h3">On this device</h3><p class="t-small muted" id="storage-info">Checking storage…</p></div>
    <div class="card stack gap-12"><h3 class="t-h3">Backup</h3>
      <p class="t-small muted">Download your whole library — notes, folders, tags and page images — as a single file you can keep safe or move to another device.</p>
      <button class="btn btn-primary" data-act="export">${icon('download')} Download backup</button>
      <button class="btn btn-soft" data-act="import">${icon('upload')} Restore from a backup</button>
      ${S.data.lastBackup ? `<p class="t-cap muted">Last backup: ${new Date(S.data.lastBackup).toLocaleString()}</p>` : ''}</div>
  </div></div>`;
after.backup = async () => {
  const el = $('#storage-info'); if (!el) return;
  const n = S.data.notes.length;
  try { const e = await navigator.storage.estimate(); el.textContent = `${n} note${n === 1 ? '' : 's'} · about ${(e.usage / 1048576).toFixed(1)} MB used. ${SB.on ? 'Your library is saved to your account, with a copy on this phone.' : 'Your library is stored privately in this browser.'}`; }
  catch { el.textContent = `${n} note${n === 1 ? '' : 's'} stored privately in this browser.`; }
};
const SUPPORT_EMAIL = 'folionotes.help@gmail.com';
screens.help = () => {
  const faq = [
    ['How do I scan a page?', 'Tap the + button, then Take a photo. Drag the corners to fit your page (or tap Auto), tap Next, then use Enhance → Cleaned to make it crisp.'],
    ['Can I scan several pages into one note?', 'Yes — choose Scan multiple pages, or tap the + tile in the page strip while cropping to add more.'],
    ['Where are my notes stored?', SB.on ? 'Your notes are saved privately to your Folio account, so you can log in on another phone and find them there. A copy also stays on this phone so Folio works offline.' : 'Everything is saved privately in this browser on this device. Use Backup & Sync to download a copy or move it to another device.'],
    ['I forgot my password', SB.on ? 'On the Log in screen, tap Forgot password? and enter your email. We’ll email you a 6-digit code to set a new one.' : 'On the Log in screen, tap Forgot password? to set a new one.'],
    ['How do I organize notes?', 'Create folders from your Library, then use Move on any note. Tags help you filter on Home and inside folders.'],
    ['Can I edit a note after saving?', 'Open the note and tap Edit to re-crop, clean up, or change the title, folder, tags and date.'],
  ];
  return `<div class="screen">${topbar({ title: 'Help &amp; Support' })}<div class="scroll pad-x">
    ${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}${icon('down')}</summary><p>${esc(a)}</p></details>`).join('')}
    <div class="card mt-24"><h3 class="t-h3">Still stuck?</h3><p class="t-small muted" style="margin-bottom:12px">Email us with questions, bugs or ideas and we’ll get back to you.</p>
      <div class="contact-row"><span class="contact-email" id="help-email">${SUPPORT_EMAIL}</span><button class="btn btn-soft btn-sm" data-act="copy-help-email">${icon('copy')} Copy</button></div></div>
  </div></div>`;
};

/* =========================================================
   ACTIONS
   ========================================================= */
/* (action table `A` is declared near the top) */
A['ai-chip'] = (el) => { const t = $('#ai-form textarea'); if (t) { t.value = el.dataset.s; t.focus(); } };
A['ai-cancel'] = () => { ai.ctl?.abort(); closeSheet(); };
A.submit_ai = async (form) => {
  const prompt = String(form.elements.p.value || '').trim();
  const st = $('#ai-status'), go = $('#ai-go');
  if (!prompt) { form.elements.p.focus(); return; }
  if (go.disabled) return;
  go.disabled = true; form.elements.p.disabled = true;
  st.hidden = false; st.classList.remove('err'); st.innerHTML = '<span class="spinner sm"></span> Thinking… this can take up to a minute.';
  $('[data-act="ai-cancel"]', form).textContent = 'Stop';
  try {
    await S.aiRun(prompt);
    S.sheetClose = null; closeSheet();
  } catch (e) {
    console.warn('AI', e);
    const msg = aiErrText(e);
    if (!form.isConnected) return;
    go.disabled = false; form.elements.p.disabled = false; $('[data-act="ai-cancel"]', form).textContent = 'Cancel';
    if (msg) { st.classList.add('err'); st.textContent = msg; } else st.hidden = true;
  }
};
A.go = (el) => go(el.dataset.to, {}, { replace: !!el.dataset.replace });
A.back = () => back();
A.tab = (el) => { const to = el.dataset.to; if (to === 'search') S.q = S.q || ''; go(to, {}, { reset: true }); if (to === 'search') setTimeout(() => $('#q')?.focus(), 50); };
A['close-sheet'] = () => closeSheet();
A['confirm-ok'] = () => S.confirmResolve?.();
A.pick = (el) => S.pickResolve?.(Number(el.dataset.i));
A['copy-help-email'] = async () => {
  try { await navigator.clipboard.writeText(SUPPORT_EMAIL); toast('Email address copied'); }
  catch { const el = $('#help-email'); const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Press and hold to copy'); }
};
A.terms = () => openSheet(`<h2 class="t-h3 sheet-title">Terms &amp; Privacy</h2>
  <p class="t-body" style="margin-bottom:12px">${SB.on ? 'Folio keeps your account and notes in your private Folio account, so they follow you to other devices. Only you can see them. A copy is also kept on this phone so Folio works offline.' : cloud.db ? 'Folio keeps your account and notes in your private claude.ai storage, so they follow you across devices. Nobody else who opens this page can see them.' : 'Folio keeps your account and notes on this device, inside this browser. Nothing is uploaded to a server.'}</p>
  <p class="t-body muted" style="margin-bottom:20px">Download a backup from Profile → Backup &amp; Sync from time to time to keep a copy of your own.</p>
  <button class="btn btn-primary" data-act="close-sheet">Got it</button>`);

/* auth */
function setErr(form, name, msg) { const e = $(`[data-err="${name}"]`, form); if (e) e.textContent = msg; $(`[name="${name}"]`, form)?.classList.add('has-err'); }
function clearErrs(form) { $$('[data-err]', form).forEach((e) => (e.textContent = '')); $$('.has-err', form).forEach((e) => e.classList.remove('has-err')); const fe = $('.form-error', form); if (fe) fe.textContent = ''; }
async function startSession(email, keep) {
  S.session = { email, keep }; await saveSession(); ssSet('folio-active', '1');
  S.data = (await store.get('kv', 'data:' + email)) || newData();
  migrate(S.data); applyTheme();
}
function migrate(d) {
  const nd = newData();
  for (const k of Object.keys(nd)) if (d[k] === undefined) d[k] = nd[k];
  d.settings = { ...nd.settings, ...d.settings };
}
/* Run an auth handler with the button showing progress, and show any failure
   in the form instead of letting it disappear silently. */
async function authRun(form, label, fn) {
  const btn = $('button[type="submit"]', form); const orig = btn?.textContent;
  if (btn) { if (btn.disabled) return; btn.disabled = true; btn.textContent = label; }
  try { await fn(); }
  catch (e) { console.error(e); const fe = $('.form-error', form); if (fe) fe.textContent = `Something went wrong saving your account (${String(e?.code || e?.name || 'error')}: ${String(e?.message || e).slice(0, 140)}). Please try again.`; }
  finally { if (btn && btn.isConnected) { btn.disabled = false; btn.textContent = orig; } }
}
A.submit_forgot = (form) => {
  clearErrs(form);
  const email = String(form.elements.email.value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr(form, 'email', 'Enter a valid email address');
  const u = S.users[email];
  if (!u) {
    const n = Object.keys(S.users).length;
    go('forgot', { tried: email, notFound: true }, { replace: true });
    const f = $('form[data-submit="forgot"]');
    setErr(f, 'email', n ? 'No Folio account uses that email. Check the spelling, or create a new account.' : 'There are no Folio accounts here yet. Create one to get started.');
    return;
  }
  go('forgot', { email: u.email }, { replace: true });
};
A['reset-verified'] = () => go('forgot', { email: cloud.email }, { replace: true });
A.submit_reset = (form) => authRun(form, 'Saving…', async () => {
  clearErrs(form);
  const email = form.elements.email.value, pw = String(form.elements.password.value || ''), cf = String(form.elements.confirm.value || '');
  if (pw.length < 6) return setErr(form, 'password', 'Use at least 6 characters');
  if (pw !== cf) return setErr(form, 'confirm', 'Those passwords don’t match');
  const u = S.users[email]; if (!u) return;
  u.hash = await hashPw(email, pw); await saveUsers();
  await startSession(email, true);
  go('home', {}, { reset: true });
  toast('Password updated — you’re logged in');
});
A.submit_signup = (form) => authRun(form, 'Creating account…', async () => {
  clearErrs(form);
  const f = Object.fromEntries(new FormData(form));
  const name = String(f.name || '').trim(), email = String(f.email || '').trim().toLowerCase(), pw = String(f.password || '');
  let ok = true;
  if (!name) { setErr(form, 'name', 'Please enter your name'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(form, 'email', 'Enter a valid email address'); ok = false; }
  else if (S.users[email]) { setErr(form, 'email', 'An account with this email already exists — try logging in'); ok = false; }
  if (pw.length < 6) { setErr(form, 'password', 'Use at least 6 characters'); ok = false; }
  if (!ok) return;
  S.users[email] = { name, email, hash: await hashPw(email, pw), created: Date.now() };
  await saveUsers();
  await startSession(email, !!f.keep);
  S.data = newData(); if (S.signupAvatar) S.data.avatar = S.signupAvatar; S.signupAvatar = null; await flushData();
  S.usesSel = new Set();
  go('uses', {}, { reset: true });
});
A.submit_login = (form) => authRun(form, 'Logging in…', async () => {
  clearErrs(form);
  const f = Object.fromEntries(new FormData(form));
  const id = String(f.id || '').trim().toLowerCase(); const pw = String(f.password || '');
  if (!id) { setErr(form, 'id', 'Enter your username or email'); return; }
  if (!pw) { setErr(form, 'password', 'Enter your password'); return; }
  const u = S.users[id] || Object.values(S.users).find((x) => x.name.toLowerCase() === id);
  if (!u || (await hashPw(u.email, pw)) !== u.hash) { $('.form-error', form).textContent = 'That username/email and password don’t match.'; return; }
  await startSession(u.email, !!f.keep);
  go('home', {}, { reset: true });
});
A.use = (el) => {
  const k = el.dataset.use; S.usesSel.has(k) ? S.usesSel.delete(k) : S.usesSel.add(k);
  el.classList.toggle('on', S.usesSel.has(k)); el.setAttribute('aria-pressed', S.usesSel.has(k));
  $('#uses-next').textContent = S.usesSel.size ? 'Continue' : 'Skip for now';
};
A['uses-next'] = () => {
  S.data.uses = [...S.usesSel]; S.data.tags = tagsFromUses(S.data.uses); S.data.onboarded = true; saveData();
  go('allset', {}, { reset: true });
};
A['get-started'] = () => go('home', {}, { reset: true });
A.logout = async () => {
  if (!(await confirmSheet({ title: 'Log out of Folio?', body: SB.on ? 'Your notes stay saved in your account. Log back in any time to see them.' : 'Your notes stay saved on this device.', ok: 'Log out' }))) return;
  await flushData(); S.session = null; S.data = null; await store.del('kv', 'session');
  if (SB.on) { await SB.client.auth.signOut().catch(() => {}); SB.uid = null; }
  applyTheme(); go('welcome', {}, { reset: true });
};

/* home / search / library */
A['home-tag'] = (el) => { S.homeTag = el.dataset.tag || null; rerender(); };
A['folder-tag'] = (el) => { S.folderTag = el.dataset.tag || null; rerender(); };
A['dismiss-tip'] = () => { S.data.tipDismissed = true; saveData(); rerender(); };
A['open-note'] = (el) => { if (S.route.name === 'search' && S.q.trim()) addRecent(S.q); go('note', { id: el.dataset.id }); };
A.in_q = (el) => { S.q = el.value; $('#search-body').innerHTML = searchBody(); hydrate($('#search-body')); };
A.qtype = (el) => { const t = el.dataset.t; S.qTypes.has(t) ? S.qTypes.delete(t) : S.qTypes.add(t); el.classList.toggle('on'); el.setAttribute('aria-pressed', S.qTypes.has(t)); $('#search-body').innerHTML = searchBody(); hydrate($('#search-body')); };
A['clear-recent'] = () => { S.data.recent = []; saveData(); $('#search-body').innerHTML = searchBody(); };
A['run-recent'] = (el) => { S.q = el.dataset.q; const i = $('#q'); i.value = S.q; A.in_q(i); addRecent(S.q); };
A.voice = (el) => {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) return;
  const r = new R(); r.lang = navigator.language || 'en-US'; r.interimResults = false;
  el.classList.add('listening');
  r.onresult = (e) => { const t = e.results[0][0].transcript; const i = $('#q'); if (i) { i.value = t; A.in_q(i); addRecent(t); } };
  r.onerror = () => toast('Couldn’t hear that — try again');
  r.onend = () => el.classList.remove('listening');
  try { r.start(); } catch { el.classList.remove('listening'); }
};
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'q') { addRecent(e.target.value); e.target.blur(); } });
A.in_libq = (el) => { S.libQ = el.value; $('#lib-list').innerHTML = libList(); hydrate($('#lib-list')); };
A.in_folderq = (el) => { S.folderQ = el.value; $('#lib-list').innerHTML = libList(el.dataset.id); hydrate($('#lib-list')); };
A.sort = async () => {
  const v = await pickOption({ title: 'Sort notes', options: Object.entries(SORT_LABELS).map(([k, l]) => ({ label: l, value: k, on: S.data.sort === k })) });
  if (v) { S.data.sort = v; saveData(); rerender(); }
};
async function createFolder(name) {
  name = (name || '').trim(); if (!name) return null;
  const f = { id: uid(), name, color: FOLDER_COLORS[S.data.folders.length % FOLDER_COLORS.length], created: Date.now() };
  S.data.folders.push(f); saveData(); return f;
}
A['new-folder'] = async () => { const n = await askText({ title: 'New folder', placeholder: 'e.g. Chemistry 3 Notes', ok: 'Create' }); if (n) { await createFolder(n); toast(`Folder “${n}” created`); rerender(); } };
A['open-folder'] = (el) => { S.folderQ = ''; S.folderTag = null; go('folder', { id: el.dataset.id }); };
A['folder-more'] = async (el) => {
  const f = folderById(el.dataset.id); if (!f) return;
  const v = await pickOption({ title: f.name, options: [
    { label: 'Rename', value: 'rename', icon: 'edit' },
    { label: 'Change color', value: 'color', icon: 'palette' },
    { label: 'Delete folder', value: 'delete', icon: 'trash', danger: true, sub: 'Notes inside are kept' }] });
  if (v === 'rename') { const n = await askText({ title: 'Rename folder', value: f.name }); if (n) { f.name = n; saveData(); rerender(); } }
  if (v === 'color') { const c = await pickOption({ title: 'Folder color', options: FOLDER_COLORS.map((c) => ({ label: c === f.color ? 'Current' : ' ', swatch: c, value: c, on: c === f.color })) }); if (c) { f.color = c; saveData(); rerender(); } }
  if (v === 'delete' && (await confirmSheet({ title: `Delete “${f.name}”?`, body: 'The notes inside move to All notes.', ok: 'Delete', danger: true }))) {
    S.data.notes.forEach((n) => { if (n.folderId === f.id) n.folderId = null; });
    S.data.folders = S.data.folders.filter((x) => x.id !== f.id); saveData(); toast('Folder deleted'); back();
  }
};

/* add a note */
A.add = (el) => {
  S.pendingFolder = el?.dataset?.folder || (S.route.name === 'folder' ? S.route.params.id : null);
  const o = (act, ic, label, sub, bg) => `<button class="opt" data-act="${act}"><span class="oi" style="background:${bg}">${icon(ic)}</span><span class="grow">${label}<small>${sub}</small></span></button>`;
  openSheet(`<h2 class="t-h3 sheet-title">Add a note</h2>
    <button class="btn btn-primary" data-act="pick-camera">${icon('camera')} Take a photo</button>
    <h3 class="t-small sheet-sub">Other options</h3>
    ${o('pick-photos', 'image', 'Upload from photos', 'Pick one or more pictures', 'var(--c-pink)')}
    ${o('pick-multi', 'pages', 'Scan multiple pages', 'Combine pages into one note', 'var(--c-lav)')}
    ${o('blank', 'blank', 'Create blank page', 'Draw, sketch or make a list', 'var(--c-gold)')}
    ${o('pick-files', 'file', 'Import from files', 'Images from your files', 'var(--c-peri)')}`);
};
function pickFile(id, purpose) { S.pickPurpose = purpose; const i = $('#' + id); i.value = ''; i.click(); }
A['pick-camera'] = () => { closeSheet(); pickFile('in-camera', 'new'); };
A['pick-photos'] = () => { closeSheet(); pickFile('in-photos', 'new'); };
A['pick-multi'] = () => { closeSheet(); pickFile('in-photos', 'new'); toast('Select all the pages you want in this note'); };
A['pick-files'] = () => { closeSheet(); pickFile('in-files', 'new'); };
A.blank = () => {
  S.pendingFolder = S.pendingFolder || (S.route.name === 'folder' ? S.route.params.id : null);
  openSheet(`<h2 class="t-h3 sheet-title">Create blank page</h2>
    <button class="opt" data-act="blank-draw"><span class="oi" style="background:var(--c-gold)">${icon('brush')}</span><span class="grow">Drawing page<small>Handwrite or sketch with your finger or stylus</small></span></button>
    <button class="opt" data-act="blank-todo"><span class="oi" style="background:var(--c-lav)">${icon('list')}</span><span class="grow">To-do list<small>A checklist you can tick off</small></span></button>`);
};
function baseDraft(type) {
  return { type, mode: 'new', pages: [], idx: 0, title: '', folderId: S.pendingFolder || null, tags: [], date: todayISO(), outputs: [] };
}
A['blank-draw'] = () => { closeSheet(); S.draft = { ...baseDraft('drawing'), strokes: [], tool: 'pen', color: PENS[0], size: 5 }; go('draw'); };
A['blank-todo'] = () => { closeSheet(); S.draft = { ...baseDraft('todo'), items: [] }; go('todo'); };

async function onFiles(files) {
  const purpose = S.pickPurpose; S.pickPurpose = null;
  if (!files.length) return;
  busy(true, 'Opening…');
  try {
    const pages = [];
    for (const f of files) { try { pages.push(await fileToPage(f)); } catch { toast(`Couldn’t open ${f.name}`); } }
    if (!pages.length) return;
    if (purpose === 'retake') { const i = S.draft.idx; S.draft.pages[i] = pages[0]; render(); }
    else if (purpose === 'addpage') { S.draft.pages.push(...pages); S.draft.idx = S.draft.pages.length - 1; render(); }
    else { S.draft = { ...baseDraft('scan'), pages }; S.cropOff = false; go('crop'); }
  } finally { busy(false); }
}
['in-camera', 'in-photos', 'in-files'].forEach((id) => $('#' + id).addEventListener('change', (e) => onFiles([...e.target.files])));

/* crop */
A['draft-cancel'] = async () => {
  if (await confirmSheet({ title: 'Discard this note?', body: 'Anything you captured here will be lost.', ok: 'Discard', danger: true })) { S.draft = null; back(); }
};
A['crop-page'] = (el) => { S.draft.idx = Number(el.dataset.i); render(); };
A['crop-add'] = () => pickFile('in-photos', 'addpage');
A['crop-retake'] = () => pickFile('in-camera', 'retake');
A['crop-del'] = () => { const dr = S.draft; dr.pages.splice(dr.idx, 1); dr.idx = Math.min(dr.idx, dr.pages.length - 1); render(); };
A['crop-toggle'] = () => { S.cropOff = !S.cropOff; render(); };
A['crop-rotate'] = async () => {
  const p = curPage(); busy(true, 'Rotating…');
  try { const r = await rotateSrc(p.src); const c = p.crop; Object.assign(p, r); p.crop = { x: 1 - c.y - c.h, y: c.x, w: c.h, h: c.w }; render(); } finally { busy(false); }
};
A['crop-auto'] = async () => {
  const p = curPage(); busy(true, 'Finding page edges…');
  try { const b = await autoCrop(p.src); S.cropOff = false; if (b) { p.crop = b; toast('Page edges found'); } else { p.crop = { x: 0.04, y: 0.04, w: 0.92, h: 0.92 }; toast('Couldn’t find clear edges — adjust the corners'); } render(); } finally { busy(false); }
};
A['crop-next'] = async () => {
  const dr = S.draft; busy(true, 'Preparing pages…');
  try {
    for (const p of dr.pages) { const r = await cropSrc(p); p.base = r.src; p.bw = r.w; p.bh = r.h; p._thumb = await makeThumb(r.src, 120); }
    dr.idx = 0; S.editTab = 'enhance'; go('edit');
  } finally { busy(false); }
};

/* edit */
A['edit-tab'] = (el) => { S.editTab = el.dataset.t; render(); };
A['edit-page'] = (el) => { S.draft.idx = Number(el.dataset.i); render(); };
A['edit-clean'] = (el) => { curPage().edit.cleaned = el.dataset.v === '1'; $('#panel').innerHTML = editPanel(); scheduleEditRender(); };
A['edit-auto'] = () => { const e = curPage().edit; e.auto = !e.auto; $('#panel').innerHTML = editPanel(); scheduleEditRender(); };
A['adj-key'] = (el) => { S.adjKey = el.dataset.k; $('#panel').innerHTML = editPanel(); };
A.in_adj = (el) => {
  const p = curPage(); p.edit.adj[S.adjKey] = Number(el.value); $('#adj-val').textContent = el.value;
  const chip = $(`[data-act="adj-key"][data-k="${S.adjKey}"]`);
  if (chip) chip.innerHTML = `${ADJ.find((a) => a[0] === S.adjKey)[1]}${Number(el.value) ? ` <span class="v">${el.value > 0 ? '+' : ''}${el.value}</span>` : ''}`;
  scheduleEditRender();
};
A.in_brush = (el) => { S.brush = Number(el.value); $('#brush-val').textContent = el.value; };
A['edit-reset'] = () => { const e = curPage().edit; e.adj = defaultEdit().adj; e.auto = false; $('#panel').innerHTML = editPanel(); scheduleEditRender(); };
A['edit-undo'] = () => { curPage().edit.strokes.pop(); $('#panel').innerHTML = editPanel(); scheduleEditRender(); };
A['edit-filter'] = (el) => { curPage().edit.filter = el.dataset.f; $$('.filter-btn').forEach((b) => b.classList.toggle('on', b === el)); scheduleEditRender(); };
A['edit-all'] = () => {
  const src = curPage().edit;
  S.draft.pages.forEach((p) => { if (p !== curPage()) p.edit = { ...src, adj: { ...src.adj }, strokes: p.edit.strokes }; });
  toast('Applied to all pages');
};
A['edit-next'] = async () => {
  const dr = S.draft; busy(true, 'Cleaning up pages…');
  try {
    dr.outputs = []; for (const p of dr.pages) dr.outputs.push(await exportPage(p));
    S.ddOpen = false; go('save');
  } catch (e) { toast(e.message || 'Something went wrong'); } finally { busy(false); }
};

/* draw */
A['draw-color'] = (el) => { S.draft.color = el.dataset.c; S.draft.tool = 'pen'; render(); };
A['draw-size'] = (el) => { S.draft.size = Number(el.dataset.s); render(); };
/* AI: photo edits come back as Folio's own settings plus pen marks. */
A['edit-ai'] = () => aiSheet({
  title: 'Edit with AI',
  intro: 'The AI looks at this page and adjusts it for you. It can change the look (light, contrast, colour, filters) and draw on top, like circling or underlining. It can’t remove objects or create new photo content.',
  placeholder: 'e.g. Make it look like a clean black and white scan',
  suggestions: ['Make the writing easier to read', 'Clean black & white scan', 'Highlight the title', 'Circle the important parts', 'Warmer, softer look'],
  run: async (prompt) => {
    const p = curPage(); await ensureBase(p);
    const c = mkCanvas(p.bw, p.bh); drawEdited(p, c);
    const images = ai.maxImages ? [await toJpegBlob(c, 1100)] : [];
    const e = p.edit;
    const res = await aiJSON(`You are the photo-editing assistant inside Folio, an app for scanning handwritten notes.
${images.length ? 'The attached image is the page as it looks right now.' : 'You cannot see the page; make your best guess from the request.'}
The user asked: "${prompt}"

You cannot paint pixels. You can only (1) set Folio's edit settings and (2) draw pen marks on top of the page.
Current settings: ${JSON.stringify({ cleaned: e.cleaned, auto: e.auto, filter: e.filter, adj: e.adj })}
Settings:
- cleaned (true/false): document-scan look — whitens paper, darkens ink.
- auto (true/false): automatic levels.
- filter: one of "none", "mono" (greyscale), "ink" (high-contrast black ink on white), "warm", "sage" (soft green tint), "soft" (faded, low contrast), "night" (inverted, light ink on dark).
- adj: brightness, contrast, saturation, highlights, shadows — integers from -100 to 100, 0 means unchanged.
Marks: pen strokes drawn over the page. Each is {"color":"#rrggbb" or "#rrggbbaa", "width": number (pixels on a 1000px-wide page, 2–40), "points": [[x,y], ...]} with x and y from 0 to 1 (0,0 = top-left of the page). Use them for circling, underlining, arrows, boxes or highlighting (a translucent colour such as "#ffd54a66" with width 18–30 works as a highlighter). Use smooth paths with enough points (an ellipse needs 24+). Only add marks when the user asks for something to be drawn or marked; base positions on what you actually see.

Reply with ONLY this JSON:
{"settings":{"cleaned":bool,"auto":bool,"filter":string,"adj":{"brightness":n,"contrast":n,"saturation":n,"highlights":n,"shadows":n}},"marks":[...],"message":"one short friendly sentence saying what you changed, or what you couldn't do"}`, { images });
    if (!res || typeof res !== 'object') throw { code: 'invalid_json' };
    p._aiUndo = JSON.parse(JSON.stringify({ ...p.edit, strokes: p.edit.strokes }));
    const st = res.settings || {};
    if (typeof st.cleaned === 'boolean') e.cleaned = st.cleaned;
    if (typeof st.auto === 'boolean') e.auto = st.auto;
    if (FILTERS.some(([k]) => k === st.filter)) e.filter = st.filter;
    if (st.adj && typeof st.adj === 'object') for (const [k] of ADJ) if (k in st.adj) e.adj[k] = Math.round(num(st.adj[k], -100, 100));
    e.strokes = [...e.strokes, ...aiStrokes(res.marks, (w) => w / 1000, '#c0392b')];
    render();
    toast(String(res.message || 'Done').slice(0, 160));
  },
});
A['edit-ai-undo'] = () => { const p = curPage(); if (!p._aiUndo) return; p.edit = p._aiUndo; p._aiUndo = null; render(); toast('AI edit undone'); };

/* AI: drawings come back as pen strokes, either replacing the page or adding to it. */
A['draw-ai'] = () => aiSheet({
  title: 'Draw with AI',
  intro: 'Ask the AI to redraw your sketch, draw it in a different style, or add something new. It draws in pen strokes, so you can keep drawing or undo afterwards.',
  placeholder: 'e.g. Redraw this as a neat cartoon',
  suggestions: ['Tidy up my drawing', 'Redraw it as a cartoon', 'Add colour', 'Draw a cute lizard', 'Turn it into a simple diagram'],
  run: async (prompt) => {
    const dr = S.draft;
    const c = $('#draw-canvas');
    const images = ai.maxImages && c ? [await toJpegBlob(c, 900)] : [];
    const summary = images.length ? '' : `Current strokes (x,y from 0 to 1): ${JSON.stringify(dr.strokes.slice(0, 80).map((st) => ({ color: st.color, points: st.pts.filter((_, i) => i % Math.ceil(st.pts.length / 16) === 0).map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]) })))}`.slice(0, 20000);
    const res = await aiJSON(`You are the drawing assistant inside Folio, a note-taking app. The page is portrait, 3:4 (1200×1600 px), cream paper with faint ruled lines.
${images.length ? 'The attached image shows the page as it looks now.' : summary}
The user asked: "${prompt}"

Draw with pen strokes. Coordinates: x and y from 0 to 1, (0,0) is top-left, so y=1 is the bottom of the page and the page is taller than it is wide (keep circles round by making their height in y about 0.75× their width in x).
Choose "mode":
- "replace" when they want the drawing redrawn, tidied, restyled, changed or drawn differently (your strokes become the whole page),
- "add" when they want something added to what's there.
Each stroke: {"color":"#rrggbb","width": pen width in pixels on the 1200px page (3–30),"points":[[x,y],...]}.
Draw clear, recognisable, pleasant line art: smooth curves with plenty of points (15–80 per stroke), close shapes by repeating the first point, fill areas with a few loose hatching strokes if colour is wanted. Folio's pens: #1f281e (ink), #4b5e49 (forest), #96b093 (sage), #c46f86 (rose), #c9a43c (gold), #5b6fc4 (blue); other colours are fine. Use at most 150 strokes and keep the drawing inside 0.05–0.95.

Reply with ONLY this JSON:
{"mode":"replace"|"add","strokes":[...],"message":"one short friendly sentence about what you drew"}`, { images });
    const strokes = aiStrokes(res?.strokes, (w) => w / 1200, '#1f281e');
    if (!strokes.length) throw { code: 'empty_completion' };
    dr._aiUndo = { strokes: dr.strokes.slice(), bg: dr.bg, _bg: dr._bg };
    if (res.mode === 'add') dr.strokes = [...dr.strokes, ...strokes];
    else { dr.strokes = strokes; dr.bg = null; dr._bg = null; }
    dr._aiUndo.n = dr.strokes.length;
    const cv = $('#draw-canvas'); if (cv) redrawDrawing(cv);
    toast(String(res.message || 'Done').slice(0, 160));
  },
});
A['draw-tool'] = (el) => { S.draft.tool = el.dataset.t; render(); };
A['draw-undo'] = () => {
  const dr = S.draft, u = dr._aiUndo;
  if (u && dr.strokes.length === u.n) { dr.strokes = u.strokes; dr.bg = u.bg; dr._bg = u._bg; dr._aiUndo = null; toast('AI drawing undone'); }
  else dr.strokes.pop();
  const c = $('#draw-canvas'); if (c) redrawDrawing(c);
};
A['draw-clear'] = async () => { if (!S.draft.strokes.length && !S.draft._bg) return; if (await confirmSheet({ title: 'Clear the page?', ok: 'Clear', danger: true })) { S.draft.strokes = []; S.draft._bg = null; S.draft.bg = null; render(); } };
A['draw-next'] = () => {
  const c = $('#draw-canvas'); if (!S.draft.strokes.length && !S.draft._bg) { toast('Draw something first'); return; }
  S.draft.outputs = [c.toDataURL('image/jpeg', 0.92)]; S.ddOpen = false; go('save');
};

/* todo draft */
A['submit_draft-todo-add'] = (form) => {
  const v = form.t.value.trim(); if (!v) return;
  S.draft.items.push({ id: uid(), text: v, done: false }); render(); setTimeout(() => $('#todo-new')?.focus(), 30);
};
A['in_draft-todo-text'] = (el) => { const it = S.draft.items.find((i) => i.id === el.dataset.id); if (it) it.text = el.value; };
A['ch_draft-todo'] = (el) => { const it = S.draft.items.find((i) => i.id === el.dataset.id); if (it) { it.done = el.checked; el.closest('.todo-item').classList.toggle('done', it.done); } };
A['draft-todo-del'] = (el) => { S.draft.items = S.draft.items.filter((i) => i.id !== el.dataset.id); render(); };
A['todo-next'] = () => {
  const pending = $('#todo-new')?.value.trim(); if (pending) S.draft.items.push({ id: uid(), text: pending, done: false });
  S.draft.items = S.draft.items.filter((i) => i.text.trim()); if (!S.draft.items.length) { toast('Add at least one item'); return; }
  S.ddOpen = false; go('save');
};

/* save */
A['in_save-title'] = (el) => { S.draft.title = el.value; };
A['in_save-date'] = (el) => { if (el.value) S.draft.date = el.value; };
A['dd-toggle'] = () => { S.ddOpen = !S.ddOpen; rerender(); if (S.ddOpen) setTimeout(() => $('.dd-list')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30); };
A['dd-pick'] = (el) => { S.draft.folderId = el.dataset.id || null; S.ddOpen = false; rerender(); };
A['submit_dd-new'] = async (form) => { const f = await createFolder(form.n.value); if (f) { S.draft.folderId = f.id; S.ddOpen = false; rerender(); toast(`Folder “${f.name}” created`); } };
A['save-tag'] = (el) => {
  const t = el.dataset.tag; const tags = S.draft.tags;
  const i = tags.indexOf(t); if (i >= 0) tags.splice(i, 1); else tags.push(t);
  el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', i < 0);
};
A['new-tag'] = async () => {
  const n = await askText({ title: 'New tag', placeholder: 'e.g. Biology', ok: 'Add tag' }); if (!n) return;
  if (!S.data.tags.some((t) => t.name.toLowerCase() === n.toLowerCase())) S.data.tags.push({ name: n, color: TAG_COLORS[S.data.tags.length % TAG_COLORS.length] });
  const name = S.data.tags.find((t) => t.name.toLowerCase() === n.toLowerCase()).name;
  if (S.draft && !S.draft.tags.includes(name)) S.draft.tags.push(name);
  saveData(); rerender();
};
function defaultTitle(dr) {
  const d = fmtLong(dr.date);
  return dr.type === 'todo' ? `To-do – ${d}` : dr.type === 'drawing' ? `Sketch – ${d}` : `Note – ${d}`;
}
A['save-note'] = async () => {
  const dr = S.draft; if (!dr) return;
  busy(true, 'Saving…');
  try {
    const now = Date.now(); const pages = [];
    if (dr.type !== 'todo') {
      for (const src of dr.outputs) {
        const key = 'img_' + uid(); const thumb = await makeThumb(src);
        await store.set('images', key, src); await store.set('images', key + '_t', thumb);
        S.img.set(key, src); S.img.set(key + '_t', thumb); pages.push(key);
      }
    }
    const fields = { title: dr.title.trim() || defaultTitle(dr), folderId: dr.folderId, tags: [...dr.tags], date: dr.date, updated: now };
    let id;
    if (dr.mode === 'edit') {
      const n = noteById(dr.noteId);
      if (dr.type !== 'todo') { for (const k of n.pages) { store.del('images', k); store.del('images', k + '_t'); S.img.delete(k); S.img.delete(k + '_t'); } n.pages = pages; }
      else n.items = dr.items;
      Object.assign(n, fields); id = n.id;
    } else {
      id = uid();
      S.data.notes.push({ id, type: dr.type, pages, items: dr.type === 'todo' ? dr.items : undefined, created: now, ...fields });
    }
    await flushData();
    S.draft = null;
    toast(dr.mode === 'edit' ? 'Note updated' : 'Note saved');
    go('note', { id }, { stack: [{ name: 'home', params: {} }] });
  } catch (e) {
    toast('Couldn’t save — your device storage may be full');
  } finally { busy(false); }
};

/* note actions */
const curNote = () => noteById(S.route.params.id);
A.full = (el) => go('full', { id: S.route.params.id, i: Number(el.dataset.i) });
A['ch_todo-toggle'] = (el) => {
  const n = curNote(); const it = n.items.find((i) => i.id === el.dataset.id); if (!it) return;
  it.done = el.checked; n.updated = Date.now(); saveData(); rerender();
};
A['submit_todo-quick'] = (form) => {
  const v = form.t.value.trim(); if (!v) return; const n = curNote();
  n.items.push({ id: uid(), text: v, done: false }); n.updated = Date.now(); saveData(); rerender();
  setTimeout(() => $('.todo-add input')?.focus(), 30);
};
A['note-edit'] = async () => {
  const n = curNote(); if (!n) return;
  const common = { mode: 'edit', noteId: n.id, title: n.title, folderId: n.folderId, tags: [...n.tags], date: n.date, idx: 0, outputs: [] };
  if (n.type === 'todo') { S.draft = { ...common, type: 'todo', items: n.items.map((i) => ({ ...i })) }; go('todo'); return; }
  busy(true, 'Opening…');
  try {
    if (n.type === 'drawing') { S.draft = { ...common, type: 'drawing', bg: await getImg(n.pages[0]), strokes: [], tool: 'pen', color: PENS[0], size: 5 }; go('draw'); return; }
    const pages = [];
    for (const k of n.pages) { const src = await getImg(k); const img = await loadImg(src); pages.push(newPage(src, img.naturalWidth, img.naturalHeight)); }
    S.draft = { ...common, type: 'scan', pages }; S.cropOff = false; go('crop');
  } finally { busy(false); }
};
A['note-move'] = async () => {
  const n = curNote();
  const v = await pickOption({ title: 'Move to folder', options: [
    { label: 'No folder', value: '__none', icon: 'books', on: !n.folderId },
    ...S.data.folders.map((f) => ({ label: f.name, value: f.id, icon: 'folder', bg: f.color, on: n.folderId === f.id })),
    { label: 'New folder…', value: '__new', icon: 'plus' }] });
  if (!v) return;
  let fid = v === '__none' ? null : v;
  if (v === '__new') { const name = await askText({ title: 'New folder', placeholder: 'Folder name', ok: 'Create' }); if (!name) return; fid = (await createFolder(name)).id; }
  n.folderId = fid; n.updated = Date.now(); saveData(); rerender();
  toast(fid ? `Moved to ${folderById(fid).name}` : 'Removed from folder');
};
A['note-share'] = async () => {
  const n = curNote();
  try {
    if (n.type === 'todo') {
      const text = `${n.title}\n` + n.items.map((i) => `${i.done ? '☑' : '☐'} ${i.text}`).join('\n');
      if (navigator.share) await navigator.share({ title: n.title, text });
      else { await navigator.clipboard.writeText(text); toast('List copied to clipboard'); }
      return;
    }
    const files = []; for (const [i, k] of n.pages.entries()) files.push(new File([await srcToBlob(await getImg(k))], `${slug(n.title)}${n.pages.length > 1 ? '-' + (i + 1) : ''}.jpg`, { type: 'image/jpeg' }));
    if (navigator.canShare && navigator.canShare({ files })) await navigator.share({ files, title: n.title });
    else { for (const f of files) if (!(await downloadBlob(f, f.name))) break; }
  } catch (e) { if (e?.name !== 'AbortError') toast('Sharing isn’t available here'); }
};
A['note-more'] = async () => {
  const n = curNote();
  const v = await pickOption({ title: n.title, options: [
    { label: 'Rename', value: 'rename', icon: 'edit' },
    { label: 'Change tags', value: 'tags', icon: 'tag' },
    { label: 'Duplicate', value: 'dup', icon: 'copy' },
    ...(n.type !== 'todo' ? [{ label: 'Download pages', value: 'dl', icon: 'download' }] : []),
    { label: 'Delete note', value: 'del', icon: 'trash', danger: true }] });
  if (v === 'rename') { const t = await askText({ title: 'Rename note', value: n.title }); if (t) { n.title = t; n.updated = Date.now(); saveData(); rerender(); } }
  if (v === 'tags') {
    openSheet(`<h2 class="t-h3 sheet-title">Tags</h2><div class="chips" style="flex-wrap:wrap;margin:0;padding:0 0 20px">${S.data.tags.map((t) => `<button class="chip ${n.tags.includes(t.name) ? 'on' : ''}" style="--dot:${t.color}" data-act="note-tag" data-tag="${esc(t.name)}"><i class="dot"></i>${esc(t.name)}</button>`).join('')}</div><button class="btn btn-primary" data-act="close-sheet">Done</button>`, () => rerender());
  }
  if (v === 'dup') {
    busy(true, 'Duplicating…');
    const copy = { ...JSON.parse(JSON.stringify(n)), id: uid(), title: n.title + ' (copy)', created: Date.now(), updated: Date.now(), pages: [] };
    for (const k of n.pages) { const nk = 'img_' + uid(); await store.set('images', nk, await getImg(k)); await store.set('images', nk + '_t', await getImg(k + '_t')); copy.pages.push(nk); }
    S.data.notes.push(copy); await flushData(); busy(false); toast('Note duplicated'); go('note', { id: copy.id }, { replace: true });
  }
  if (v === 'dl') { for (const [i, k] of n.pages.entries()) if (!(await downloadBlob(await srcToBlob(await getImg(k)), `${slug(n.title)}${n.pages.length > 1 ? '-' + (i + 1) : ''}.jpg`))) break; }
  if (v === 'del' && (await confirmSheet({ title: 'Delete this note?', body: 'This can’t be undone.', ok: 'Delete', danger: true }))) {
    for (const k of n.pages) { store.del('images', k); store.del('images', k + '_t'); }
    S.data.notes = S.data.notes.filter((x) => x.id !== n.id); saveData(); toast('Note deleted'); back();
  }
};
A['note-tag'] = (el) => {
  const n = curNote(); const t = el.dataset.tag; const i = n.tags.indexOf(t);
  if (i >= 0) n.tags.splice(i, 1); else n.tags.push(t); el.classList.toggle('on', i < 0); n.updated = Date.now(); saveData();
};

/* profile & settings */
A.avatar = () => pickFile('in-avatar', 'avatar');
A['signup-avatar'] = () => pickFile('in-avatar', 'signup');
async function avatarFromFile(f) {
  const p = await fileToPage(f, 1200); const img = await loadImg(p.src); const s = Math.min(img.naturalWidth, img.naturalHeight); const c = mkCanvas(240, 240);
  c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 240, 240);
  return c.toDataURL('image/jpeg', 0.85);
}
$('#in-avatar').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const url = await avatarFromFile(f);
    if (S.pickPurpose === 'signup') {
      S.signupAvatar = url;
      const box = $('.signup-avatar');
      if (box) { box.querySelector('.avatar').innerHTML = `<img src="${url}" alt=""><span class="avatar-edit">${icon('camera')}</span>`; box.querySelector('span.t-small').textContent = 'Tap to change photo'; }
    } else { S.data.avatar = url; saveData(); rerender(); }
  } catch { toast('Couldn’t use that photo'); }
});
A.submit_account = async (form) => {
  clearErrs(form); const f = Object.fromEntries(new FormData(form)); const u = user();
  const name = String(f.name).trim(), email = String(f.email).trim().toLowerCase();
  if (!name) return setErr(form, 'name', 'Please enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr(form, 'email', 'Enter a valid email address');
  if (email !== u.email && S.users[email]) return setErr(form, 'email', 'That email is already used by another account');
  if (email !== u.email) {
    toast('To change your email, also re-enter your password below');
    const pw = await askText({ title: 'Confirm your password', type: 'password', placeholder: 'Password', ok: 'Confirm' });
    if (!pw || (await hashPw(u.email, pw)) !== u.hash) { toast('Password didn’t match'); return; }
    const data = S.data; delete S.users[u.email];
    S.users[email] = { ...u, email, name, hash: await hashPw(email, pw) };
    await store.del('kv', 'data:' + u.email); S.session.email = email; await saveSession(); await store.set('kv', 'data:' + email, data);
  } else S.users[email].name = name;
  await saveUsers(); toast('Account updated'); rerender();
};
A.submit_password = async (form) => {
  clearErrs(form); const f = Object.fromEntries(new FormData(form)); const u = user();
  if ((await hashPw(u.email, String(f.cur))) !== u.hash) return setErr(form, 'cur', 'That’s not your current password');
  if (String(f.pw).length < 6) return setErr(form, 'pw', 'Use at least 6 characters');
  u.hash = await hashPw(u.email, String(f.pw)); await saveUsers(); form.reset(); toast('Password changed');
};
A['delete-account'] = async () => {
  if (!(await confirmSheet({ title: 'Delete your account?', body: 'All notes, folders and pages on this device will be permanently removed.', ok: 'Delete forever', danger: true }))) return;
  const u = user(); busy(true, 'Deleting…');
  for (const n of S.data.notes) for (const k of n.pages) { await store.del('images', k); await store.del('images', k + '_t'); }
  await store.del('kv', 'data:' + u.email); delete S.users[u.email]; await saveUsers(); await store.del('kv', 'session');
  S.session = null; S.data = null; busy(false); applyTheme(); go('welcome', {}, { reset: true });
};
A['ch_tips'] = (el) => { S.data.settings.tips = el.checked; if (el.checked) S.data.tipDismissed = false; saveData(); };
A['notif-allow'] = async () => { try { await Notification.requestPermission(); } catch { /* */ } rerender(); };
A['notif-test'] = () => { try { new Notification('Folio', { body: 'Notifications are working. Happy capturing!', icon: 'assets/icon-192.png' }); } catch { toast('This browser can only show notifications from an installed app'); } };
A['set-theme'] = (el) => { S.data.settings.theme = el.dataset.v; saveData(); applyTheme(); rerender(); };
A['set-accent'] = (el) => { S.data.settings.accent = el.dataset.v; saveData(); applyTheme(); rerender(); };
A['set-size'] = (el) => { S.data.settings.size = el.dataset.v; saveData(); applyTheme(); rerender(); };
A.export = async () => {
  busy(true, 'Packing your library…');
  try {
    const images = {};
    for (const n of S.data.notes) for (const k of n.pages) { images[k] = await asDataURL(await getImg(k)); images[k + '_t'] = await asDataURL(await getImg(k + '_t')); }
    const u = user();
    const blob = new Blob([JSON.stringify({ app: 'folio', version: 1, exportedAt: new Date().toISOString(), user: { name: u.name, email: u.email }, data: S.data, images })], { type: 'application/json' });
    if (await downloadBlob(blob, `folio-backup-${todayISO()}.json`)) { S.data.lastBackup = Date.now(); saveData(); rerender(); toast('Backup saved'); }
  } finally { busy(false); }
};
A.import = () => pickFile('in-backup', 'backup');
$('#in-backup').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (j.app !== 'folio' || !j.data) throw new Error('bad');
    if (!(await confirmSheet({ title: 'Restore this backup?', body: `It has ${j.data.notes.length} notes and will replace what’s in your library now.`, ok: 'Restore', danger: true }))) return;
    busy(true, 'Restoring…');
    for (const [k, v] of Object.entries(j.images || {})) if (v) { await store.set('images', k, v); S.img.set(k, v); }
    S.data = j.data; migrate(S.data); await flushData(); applyTheme(); busy(false); toast('Library restored'); go('library', {}, { reset: true });
  } catch { busy(false); toast('That file isn’t a Folio backup'); }
});

/* ---------------- event delegation ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (el.tagName === 'A') e.preventDefault();
  const fn = A[el.dataset.act]; if (fn) fn(el, e);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && e.target.matches('.ai-text')) { e.preventDefault(); e.target.form?.requestSubmit(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-submit]'); if (!f) return; e.preventDefault();
  if (f.dataset.submit === 'ask') { S.askResolve?.(String(f.v.value).trim() || null); return; }
  A['submit_' + f.dataset.submit]?.(f);
});
document.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el) A['in_' + el.dataset.in]?.(el, e); });
document.addEventListener('change', (e) => { const el = e.target.closest('[data-ch]'); if (el) A['ch_' + el.dataset.ch]?.(el, e); });

/* ---------------- theme ---------------- */
const HOST_THEME = document.documentElement.getAttribute('data-theme');
function applyTheme() {
  const st = S.data?.settings || { theme: 'system', accent: 'sage', size: 'standard' };
  const r = document.documentElement;
  if (st.theme === 'system') { if (HOST_THEME) r.setAttribute('data-theme', HOST_THEME); else r.removeAttribute('data-theme'); } else r.setAttribute('data-theme', st.theme);
  const a = ACCENTS[st.accent] || ACCENTS.sage;
  r.style.setProperty('--brand-deep', a.deep); r.style.setProperty('--brand', a.mid); r.style.setProperty('--brand-soft', a.soft);
  r.dataset.size = st.size;
  const dark = st.theme === 'dark' || (st.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name="theme-color"]').setAttribute('content', dark ? '#171d16' : '#fafcf2');
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ---------------- boot ---------------- */

/* =========================================================
   SUPABASE ACCOUNTS (App Store build)
   Sign-up and password reset are confirmed with a 6-digit code
   that Supabase emails to the person.
   ========================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function sbErrText(e) {
  const code = e?.code || '', msg = String(e?.message || e || '');
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) return 'That email and password don’t match.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || /rate limit/i.test(msg)) return 'Too many tries in a short time. Wait a minute, then try again.';
  if (code === 'otp_expired' || /expired|invalid.*(otp|token)/i.test(msg)) return 'That code is wrong or has expired. Check the newest email, or send a new code.';
  if (code === 'weak_password' || /password should/i.test(msg)) return 'Pick a stronger password — at least 6 characters.';
  if (code === 'same_password') return 'That’s your current password. Pick a new one.';
  if (/failed to fetch|network/i.test(msg)) return 'Couldn’t reach Folio. Check your internet connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}
/* Like authRun, but shows friendly Supabase messages. */
async function sbRun(form, label, fn) {
  const btn = $('button[type="submit"]', form); const orig = btn?.textContent;
  if (btn) { if (btn.disabled) return; btn.disabled = true; btn.textContent = label; }
  try { await fn(); }
  catch (e) { console.error(e); const fe = form.isConnected ? $('.form-error', form) : $('.form-error'); if (fe) fe.textContent = sbErrText(e); }
  finally { if (btn && btn.isConnected) { btn.disabled = false; btn.textContent = orig; } }
}
const sbOk = ({ data, error }) => { if (error) throw error; return data; };
async function sbEnter(authUser, keep) {
  SB.uid = authUser.id;
  const email = String(authUser.email || '').toLowerCase();
  const md = authUser.user_metadata || {};
  S.users = { [email]: { name: md.name || md.full_name || md.given_name || email.split('@')[0], email } };
  await startSession(email, keep);
}
/* A person who has never been through onboarding (new Google/Apple sign-in). */
const needsOnboarding = () => !S.data.onboarded && !S.data.notes.length && !(S.data.uses || []).length;
async function sbInit() {
  try {
    const { data } = await withTimeout(SB.client.auth.getSession(), 8000);
    const u = data?.session?.user;
    const sess = await local.get('kv', 'session');
    if (u && (sess?.keep !== false || ssGet('folio-active'))) {
      await sbEnter(u, sess?.keep !== false);
      S.usesSel = new Set();
      S.route = { name: needsOnboarding() ? 'uses' : 'home', params: {} };
      sbRetryPending();
      return;
    }
    if (u) await SB.client.auth.signOut().catch(() => {});
  } catch (e) { console.error(e); }
  S.route = { name: 'welcome', params: {} };
}

screens.verify = (p) => `<div class="screen">${topbar({})}<div class="scroll pad">
  <h1 class="t-h2 center mb-24">${p.kind === 'recovery' ? 'Check your email' : 'Confirm your email'}</h1>
  <form class="stack gap-16" novalidate data-submit="verify">
    <p class="t-body muted">${p.kind === 'recovery'
      ? `If there’s a Folio account for <strong>${esc(p.email)}</strong>, we’ve emailed it a 6-digit code. Enter it below to choose a new password.`
      : `We’ve emailed a 6-digit code to <strong>${esc(p.email)}</strong>. Enter it below to finish creating your account.`}</p>
    ${field('Code', 'code', 'text', '123456', 'one-time-code').replace('<input', '<input inputmode="numeric" maxlength="10"')}
    <p class="t-cap muted">It can take a minute to arrive. Check your spam or junk folder too.</p>
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">${p.kind === 'recovery' ? 'Continue' : 'Confirm and continue'}</button>
    <button type="button" class="btn btn-outline" data-act="verify-resend">Send a new code</button>
    <p class="t-small center">Wrong email? <a href="#" class="link" data-act="back">Go back</a></p>
  </form>
  <div class="art-bottom">${ART.folders}</div></div></div>`;
after.verify = () => $('input[name="code"]')?.focus();

const _forgotLocal = screens.forgot;
screens.forgot = (p) => !SB.on ? _forgotLocal(p) : `<div class="screen">${topbar({})}<div class="scroll pad">
  <h1 class="t-h2 center mb-24">Reset password</h1>
  ${p.verified ? `<form class="stack gap-16" novalidate data-submit="reset">
    <p class="t-body muted">Choose a new password for <strong>${esc(p.email)}</strong>. Your notes stay just as they are.</p>
    ${field('New password', 'password', 'password', 'At least 6 characters', 'new-password')}
    ${field('Confirm password', 'confirm', 'password', 'Type it again', 'new-password')}
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Save new password</button>
  </form>` : `<form class="stack gap-16" novalidate data-submit="forgot">
    <p class="t-body muted">Enter the email you signed up with and we’ll email you a 6-digit code to reset your password.</p>
    ${field('Email', 'email', 'email', 'you@example.com', 'email', p.tried || '')}
    <p class="form-error t-small" role="alert"></p>
    <button class="btn btn-primary mt-8" type="submit">Email me a code</button>
    <p class="t-small center">Remembered it? <a href="#" class="link" data-act="back">Back to log in</a></p>
  </form>`}
  <div class="art-bottom">${ART.folders}</div></div></div>`;

if (SB.on) {
  A.submit_signup = (form) => sbRun(form, 'Creating account…', async () => {
    clearErrs(form);
    const f = Object.fromEntries(new FormData(form));
    const name = String(f.name || '').trim(), email = String(f.email || '').trim().toLowerCase(), pw = String(f.password || '');
    let ok = true;
    if (!name) { setErr(form, 'name', 'Please enter your name'); ok = false; }
    if (!EMAIL_RE.test(email)) { setErr(form, 'email', 'Enter a valid email address'); ok = false; }
    if (pw.length < 6) { setErr(form, 'password', 'Use at least 6 characters'); ok = false; }
    if (!ok) return;
    const data = sbOk(await SB.client.auth.signUp({ email, password: pw, options: { data: { name } } }));
    // Supabase answers an existing, confirmed email with a user that has no identities.
    if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) {
      setErr(form, 'email', 'An account with this email already exists — try logging in'); return;
    }
    S.pendingSignup = { keep: !!f.keep };
    if (data.session?.user) return sbFinishSignup(data.session.user);
    go('verify', { kind: 'signup', email });
  });
  async function sbFinishSignup(authUser) {
    await sbEnter(authUser, S.pendingSignup?.keep !== false);
    S.data = newData(); if (S.signupAvatar) S.data.avatar = S.signupAvatar; S.signupAvatar = null; S.pendingSignup = null;
    await flushData();
    S.usesSel = new Set();
    go('uses', {}, { reset: true });
  }
  A.submit_verify = (form) => sbRun(form, 'Checking…', async () => {
    clearErrs(form);
    const p = S.route.params; const token = String(form.elements.code.value || '').replace(/\D/g, '');
    if (token.length < 6) return setErr(form, 'code', 'Enter the code from the email');
    const data = sbOk(await SB.client.auth.verifyOtp({ email: p.email, token, type: p.kind === 'recovery' ? 'recovery' : 'email' }));
    if (p.kind === 'recovery') { go('forgot', { email: p.email, verified: true }, { replace: true }); return; }
    await sbFinishSignup(data.user || data.session?.user);
  });
  A['verify-resend'] = async (el) => {
    const p = S.route.params; el.disabled = true;
    try {
      if (p.kind === 'recovery') sbOk(await SB.client.auth.resetPasswordForEmail(p.email));
      else sbOk(await SB.client.auth.resend({ type: 'signup', email: p.email }));
      toast('New code sent — check your email');
    } catch (e) { toast(sbErrText(e)); }
    setTimeout(() => { if (el.isConnected) el.disabled = false; }, 30000);
  };
  A.submit_login = (form) => sbRun(form, 'Logging in…', async () => {
    clearErrs(form);
    const f = Object.fromEntries(new FormData(form));
    const email = String(f.id || '').trim().toLowerCase(); const pw = String(f.password || '');
    if (!EMAIL_RE.test(email)) { setErr(form, 'id', 'Enter the email you signed up with'); return; }
    if (!pw) { setErr(form, 'password', 'Enter your password'); return; }
    const { data, error } = await SB.client.auth.signInWithPassword({ email, password: pw });
    if (error && (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message))) {
      await SB.client.auth.resend({ type: 'signup', email }).catch(() => {});
      S.pendingSignup = { keep: !!f.keep };
      go('verify', { kind: 'signup', email }); toast('Confirm your email first — we’ve sent you a new code');
      return;
    }
    if (error) throw error;
    await sbEnter(data.user, !!f.keep);
    sbRetryPending();
    go('home', {}, { reset: true });
  });
  A.submit_forgot = (form) => sbRun(form, 'Sending…', async () => {
    clearErrs(form);
    const email = String(form.elements.email.value || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return setErr(form, 'email', 'Enter a valid email address');
    sbOk(await SB.client.auth.resetPasswordForEmail(email));
    go('verify', { kind: 'recovery', email });
  });
  A.submit_reset = (form) => sbRun(form, 'Saving…', async () => {
    clearErrs(form);
    const pw = String(form.elements.password.value || ''), cf = String(form.elements.confirm.value || '');
    if (pw.length < 6) return setErr(form, 'password', 'Use at least 6 characters');
    if (pw !== cf) return setErr(form, 'confirm', 'Those passwords don’t match');
    const data = sbOk(await SB.client.auth.updateUser({ password: pw }));
    await sbEnter(data.user, true);
    go('home', {}, { reset: true });
    toast('Password updated — you’re logged in');
  });
  A.submit_account = async (form) => {
    clearErrs(form); const f = Object.fromEntries(new FormData(form)); const u = user();
    const name = String(f.name).trim(), email = String(f.email).trim().toLowerCase();
    if (!name) return setErr(form, 'name', 'Please enter your name');
    if (email !== u.email) { setErr(form, 'email', 'To change your email, contact folionotes.help@gmail.com'); return; }
    try { sbOk(await SB.client.auth.updateUser({ data: { name } })); u.name = name; toast('Account updated'); rerender(); }
    catch (e) { toast(sbErrText(e)); }
  };
  A.submit_password = async (form) => {
    clearErrs(form); const f = Object.fromEntries(new FormData(form)); const u = user();
    if (String(f.pw).length < 6) return setErr(form, 'pw', 'Use at least 6 characters');
    const chk = await SB.client.auth.signInWithPassword({ email: u.email, password: String(f.cur) });
    if (chk.error) return setErr(form, 'cur', 'That’s not your current password');
    try { sbOk(await SB.client.auth.updateUser({ password: String(f.pw) })); form.reset(); toast('Password changed'); }
    catch (e) { setErr(form, 'pw', sbErrText(e)); }
  };
  A['delete-account'] = async () => {
    if (!(await confirmSheet({ title: 'Delete your account?', body: 'Your account and all of your notes, folders and pages will be permanently removed from Folio. This can’t be undone.', ok: 'Delete forever', danger: true }))) return;
    busy(true, 'Deleting…');
    try {
      // Remove this person's images, then their login (their notes row goes with it).
      for (;;) {
        const list = sbOk(await SB.client.storage.from(SB.bucket).list(SB.uid, { limit: 1000 }));
        if (!list?.length) break;
        sbOk(await SB.client.storage.from(SB.bucket).remove(list.map((o) => `${SB.uid}/${o.name}`)));
        if (list.length < 1000) break;
      }
      sbOk(await SB.client.rpc('delete_my_account'));
    } catch (e) { busy(false); toast('Couldn’t delete your account: ' + sbErrText(e)); return; }
    for (const n of S.data.notes) for (const k of n.pages) { await local.del('images', k); await local.del('images', k + '_t'); }
    await local.del('kv', 'data:' + user().email); await local.del('kv', 'session');
    await SB.client.auth.signOut({ scope: 'local' }).catch(() => {});
    SB.uid = null; S.session = null; S.data = null; busy(false); applyTheme(); go('welcome', {}, { reset: true });
    toast('Your account has been deleted');
  };
}


/* ---------- Sign in with Apple / Google (App Store build) ----------
   In the iPhone app, the native Apple and Google sheets hand back an ID
   token that Supabase verifies. In a browser, Supabase's own sign-in page
   is used and redirects back here. */
const APPLE_LOGO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.37 1.43c0 1.14-.42 2.2-1.25 3.05-.9.93-1.97 1.47-3.13 1.38-.02-.11-.03-.23-.03-.36 0-1.09.48-2.26 1.32-3.12.42-.44.96-.8 1.6-1.09.64-.28 1.25-.44 1.82-.47.02.2.03.4.03.61zm4.2 16.3c-.32.74-.7 1.43-1.14 2.06-.6.86-1.09 1.45-1.47 1.78-.59.54-1.22.82-1.9.84-.48 0-1.07-.14-1.75-.42-.68-.28-1.31-.42-1.89-.42-.6 0-1.25.14-1.94.42-.7.28-1.26.43-1.69.44-.65.03-1.3-.26-1.95-.86-.41-.36-.93-.97-1.55-1.84-.66-.93-1.21-2.01-1.64-3.24C1.18 15.76 1 14.44 1 13.17c0-1.46.31-2.71.94-3.77.5-.84 1.15-1.51 1.97-2 .82-.49 1.71-.74 2.66-.76.52 0 1.21.16 2.06.48.85.32 1.39.48 1.63.48.18 0 .78-.19 1.81-.56.97-.35 1.79-.5 2.46-.44 1.82.15 3.19.87 4.1 2.16-1.63.99-2.43 2.37-2.42 4.14.02 1.38.51 2.53 1.49 3.44.45.42.95.75 1.5.98-.12.35-.25.68-.38 1.01z"/></svg>';
const GOOGLE_LOGO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>';
function socialButtons() {
  if (!SB.on) return '';
  return `<div class="stack gap-12 social">
    <button type="button" class="btn btn-apple" data-act="social" data-p="apple">${APPLE_LOGO}<span>Continue with Apple</span></button>
    <button type="button" class="btn btn-google" data-act="social" data-p="google">${GOOGLE_LOGO}<span>Continue with Google</span></button>
    <p class="form-error t-small social-error" role="alert"></p>
    <div class="or-row"><span>or use your email</span></div>
  </div>`;
}
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const socialPlugin = () => window.Capacitor?.Plugins?.SocialLogin || null;
let socialReady = null;
function initSocial() {
  if (!socialReady) {
    const g = SB.googleIOSClientId ? { iOSClientId: SB.googleIOSClientId, iOSServerClientId: SB.googleWebClientId || undefined } : undefined;
    socialReady = socialPlugin().initialize({ apple: {}, ...(g ? { google: g } : {}) });
  }
  return socialReady;
}
function socialErrText(e, name) {
  const msg = String(e?.message || e || '');
  if (/cancel/i.test(msg) || e?.code === '1001') return '';
  if (/provider is not enabled|unsupported provider/i.test(msg)) return `${name} sign-in isn’t switched on yet. Use your email for now.`;
  if (/client ?id|not configured/i.test(msg)) return `${name} sign-in isn’t set up in this build yet. Use your email for now.`;
  return sbErrText(e);
}
A.social = async (el) => {
  const provider = el.dataset.p, name = provider === 'apple' ? 'Apple' : 'Google';
  const err = $('.social-error'); if (err) err.textContent = '';
  $$('[data-act="social"]').forEach((b) => (b.disabled = true));
  try {
    if (isNative() && socialPlugin()) {
      await initSocial();
      if (provider === 'apple') {
        const raw = uid() + uid() + uid();
        const r = await socialPlugin().login({ provider: 'apple', options: { scopes: ['email', 'name'], nonce: await sha256Hex(raw) } });
        const token = r?.result?.idToken; if (!token) throw new Error('No Apple ID token returned');
        const data = sbOk(await SB.client.auth.signInWithIdToken({ provider: 'apple', token, nonce: raw }));
        // Apple only shares the person's name the first time, so save it.
        const p = r.result.profile || {}; const full = [p.givenName, p.familyName].filter(Boolean).join(' ');
        let u = data.user;
        if (full && !u.user_metadata?.name) u = sbOk(await SB.client.auth.updateUser({ data: { name: full } })).user;
        await socialFinish(u);
      } else {
        if (!SB.googleIOSClientId) throw new Error('Google client ID not configured');
        const r = await socialPlugin().login({ provider: 'google', options: { scopes: ['email', 'profile'] } });
        const token = r?.result?.idToken; if (!token) throw new Error('No Google ID token returned');
        const data = sbOk(await SB.client.auth.signInWithIdToken({ provider: 'google', token }));
        await socialFinish(data.user);
      }
    } else {
      // Browser: go to Supabase's sign-in page; we come back signed in.
      // Check first that the provider is switched on, so nobody lands on an error page.
      const st = await fetch(`${SB.url}/auth/v1/settings`, { headers: { apikey: SB.key } }).then((r) => r.json()).catch(() => null);
      if (st && !st.external?.[provider]) throw new Error('provider is not enabled');
      await local.set('kv', 'session', { keep: true });
      sbOk(await SB.client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } }));
    }
  } catch (e) {
    console.error(e);
    const t = socialErrText(e, name); if (err && t) err.textContent = t;
  } finally { $$('[data-act="social"]').forEach((b) => (b.disabled = false)); }
};
async function socialFinish(authUser) {
  await sbEnter(authUser, true);
  if (needsOnboarding() && S.signupAvatar) { S.data.avatar = S.signupAvatar; S.signupAvatar = null; saveData(); }
  sbRetryPending();
  S.usesSel = new Set();
  go(needsOnboarding() ? 'uses' : 'home', {}, { reset: true });
}

(async function init() {
  if (SB.on) { await sbInit(); applyTheme(); await sleep(250); render(); return; }
  try {
    await initCloud();
    S.users = (await store.get('kv', 'users')) || {};
    if (cloud.db) {
      const localUsers = (await local.get('kv', 'users').catch(() => null)) || {};
      const missing = Object.keys(localUsers).filter((e) => !S.users[e]);
      for (const e of missing) {
        S.users[e] = localUsers[e];
        const d = await local.get('kv', 'data:' + e).catch(() => null);
        if (d) await store.set('kv', 'data:' + e, d);
      }
      if (missing.length) await saveUsers();
    }
    const sess = await store.get('kv', 'session');
    if (sess && S.users[sess.email] && (sess.keep || ssGet('folio-active'))) {
      await startSession(sess.email, sess.keep);
      S.route = { name: S.data.uses?.length || S.data.notes.length ? 'home' : 'home', params: {} };
    } else {
      if (sess) await store.del('kv', 'session');
      S.route = { name: 'welcome', params: {} };
    }
  } catch (e) {
    console.error(e); S.route = { name: 'welcome', params: {} };
  }
  applyTheme();
  await sleep(250);
  render();
})();
