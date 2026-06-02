import type { RouteKey, Theme } from '../types';

/** Per-route colour themes — drives --accent / --bg CSS vars and the transition label. */
export const THEMES: Record<RouteKey, Theme> = {
  home: { label: 'Home', accent: 'oklch(0.88 0.20 124)', bg: '#0a0a0a', bg2: '#100f0e', bg3: '#161513' },
  work: { label: 'Work', accent: 'oklch(0.80 0.16 245)', bg: '#080a0e', bg2: '#0d1017', bg3: '#12161f' },
  blog: { label: 'Writing', accent: 'oklch(0.82 0.15 70)', bg: '#0c0a07', bg2: '#12100b', bg3: '#181511' },
  contact: { label: 'Contact', accent: 'oklch(0.74 0.20 350)', bg: '#0c0810', bg2: '#120b17', bg3: '#18111e' },
  project: { label: 'Project', accent: 'oklch(0.80 0.16 245)', bg: '#080a0e', bg2: '#0d1017', bg3: '#12161f' },
  post: { label: 'Reading', accent: 'oklch(0.82 0.15 70)', bg: '#0c0a07', bg2: '#12100b', bg3: '#181511' },
};

export const TRANSITION_SPEED_MS = { fast: 380, normal: 520, slow: 760 } as const;
