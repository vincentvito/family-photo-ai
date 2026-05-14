export type Occasion = {
  id: string;
  label: string;
  accent: string;
  accentSoft: string;
  greeting: string;
  sub: string;
  img: string;
};

export const OCCASIONS: readonly Occasion[] = [
  { id: 'christmas', label: 'Christmas',      accent: '#a02e2a', accentSoft: '#fff0ee', greeting: 'Merry Christmas',  sub: 'The Hendersons',          img: '/ai-landing/after-1.jpg' },
  { id: 'diwali',    label: 'Diwali',         accent: '#b9651b', accentSoft: '#fff1d4', greeting: 'Happy Diwali',     sub: 'with love, the Patels',   img: '/ai-landing/after-2.jpg' },
  { id: 'hanukkah',  label: 'Hanukkah',       accent: '#2e4f8b', accentSoft: '#e3edff', greeting: 'Happy Hanukkah',   sub: 'eight nights of light',   img: '/ai-landing/after-3.jpg' },
  { id: 'eid',       label: 'Eid',            accent: '#5e8572', accentSoft: '#d6e4db', greeting: 'Eid Mubarak',      sub: 'from our family to yours',img: '/ai-landing/before-2.jpg' },
  { id: 'lunar',     label: 'Lunar New Year', accent: '#a02e2a', accentSoft: '#fff0ee', greeting: '新年快乐',          sub: 'Year of the Wood Horse',  img: '/ai-landing/before-3.jpg' },
  { id: 'easter',    label: 'Easter',         accent: '#b86a8a', accentSoft: '#ffe9f1', greeting: 'Happy Easter',     sub: 'love, the Kims',          img: '/ai-landing/before-1.jpg' },
] as const;

export const CTA_BASE = 'https://familyshoot.com/';

export const ctaHref = (occasionId?: string) =>
  occasionId ? `${CTA_BASE}?occasion=${occasionId}` : CTA_BASE;
