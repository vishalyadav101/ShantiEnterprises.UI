export interface NavbarTheme {
  a: string; // Color 1 (gradient start)
  b: string; // Color 2 (gradient end)
  glow: string; // neeche ki glow line
  accent: string; // gold button (Sign Up) ka color
}

/** WebsiteSetting mein jo 4 fields jodni hain (sab nullable string) */
export interface NavbarThemeFields {
  navbarColor1?: string | null;
  navbarColor2?: string | null;
  navbarGlowColor?: string | null;
  navbarButtonColor?: string | null;
}

export const NAVBAR_PRESETS: Record<string, NavbarTheme> = {
  blue: { a: '#0A2E6E', b: '#0D6EFD', glow: '#6EA8FE', accent: '#FF8A1F' },
  emerald: { a: '#062A21', b: '#0C4A38', glow: '#19C08F', accent: '#FF8A1F' },
  plum: { a: '#2A0840', b: '#5A1778', glow: '#D25AD8', accent: '#FF8A1F' },
  charcoal: { a: '#0B0B0F', b: '#20202A', glow: '#9AA0B5', accent: '#FF8A1F' },
  maroon: { a: '#3A0813', b: '#7A1627', glow: '#FF5A6E', accent: '#FF8A1F' },
};
export const DEFAULT_NAVBAR_THEME: NavbarTheme = NAVBAR_PRESETS['blue'];

const CACHE_KEY = 'shanti-navbar-theme';
const HEX = /^#[0-9a-fA-F]{6}$/;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
const hex = (c: number[]) =>
  '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (h: string, t: string, k: number) => {
  const c = rgb(h),
    d = rgb(t);
  return hex(c.map((v, i) => v + (d[i] - v) * k));
};

export function luminance(h: string): number {
  const c = rgb(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Navbar ka text white hai, isliye light background allowed nahi */
export const isNavbarThemeTooLight = (t: NavbarTheme) =>
  luminance(t.a) > 0.35 || luminance(t.b) > 0.35;

export function themeFromSetting(s: NavbarThemeFields | null | undefined): NavbarTheme {
  const t: NavbarTheme = {
    a: s?.navbarColor1 ?? '',
    b: s?.navbarColor2 ?? '',
    glow: s?.navbarGlowColor ?? '',
    accent: s?.navbarButtonColor ?? '',
  };
  const valid = HEX.test(t.a) && HEX.test(t.b) && HEX.test(t.glow) && HEX.test(t.accent);
  return valid && !isNavbarThemeTooLight(t) ? t : DEFAULT_NAVBAR_THEME;
}

/** Page ke CSS variables set karta hai. cache=true par browser mein yaad rakhta hai (flash rokne ke liye). */
export function applyNavbarTheme(t: NavbarTheme, cache = false): void {
  if (typeof document === 'undefined') return; // SSR par skip
  const s = document.documentElement.style;
  s.setProperty('--a', t.a);
  s.setProperty('--b', t.b);
  s.setProperty('--glow', t.glow);
  s.setProperty('--edge', mix(t.a, '#000000', 0.5));
  s.setProperty('--gold-2', t.accent);
  s.setProperty('--gold-1', mix(t.accent, '#ffffff', 0.4));
  s.setProperty('--gold-edge', mix(t.accent, '#000000', 0.35));
  if (cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(t));
    } catch {}
  }
}

export function loadCachedNavbarTheme(): NavbarTheme {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const t = JSON.parse(raw) as NavbarTheme;
      if (HEX.test(t.a) && HEX.test(t.b) && HEX.test(t.glow) && HEX.test(t.accent)) return t;
    }
  } catch {}
  return DEFAULT_NAVBAR_THEME;
}
