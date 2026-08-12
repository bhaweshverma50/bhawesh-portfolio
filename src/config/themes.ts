import type { RouteKey, Theme } from '../types';

/** Per-route colour themes — drives --accent / --bg CSS vars and the transition
 *  label. All accents stay in the electric-blue family (cobalt → cyan → steel →
 *  indigo) so the identity reads as one cohesive system, not a rainbow. */
export const THEMES: Record<RouteKey, Theme> = {
  home: { label: 'Home', accent: 'oklch(0.69 0.17 264)', bg: '#0a0b0f', bg2: '#0e1016', bg3: '#141823' },
  work: { label: 'Work', accent: 'oklch(0.72 0.15 240)', bg: '#090b10', bg2: '#0d1017', bg3: '#131a24' },
  blog: { label: 'Writing', accent: 'oklch(0.74 0.13 220)', bg: '#0a0c10', bg2: '#0e1118', bg3: '#141b24' },
  contact: { label: 'Contact', accent: 'oklch(0.67 0.18 280)', bg: '#0b0a12', bg2: '#0f0e1a', bg3: '#161525' },
  project: { label: 'Project', accent: 'oklch(0.72 0.15 240)', bg: '#090b10', bg2: '#0d1017', bg3: '#131a24' },
  post: { label: 'Reading', accent: 'oklch(0.74 0.13 220)', bg: '#0a0c10', bg2: '#0e1118', bg3: '#141b24' },
};

export const TRANSITION_SPEED_MS = { fast: 380, normal: 520, slow: 760 } as const;
