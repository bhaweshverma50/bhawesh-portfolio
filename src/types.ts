export type RouteKey = 'home' | 'work' | 'blog' | 'contact' | 'project' | 'post';

export interface Theme {
  label: string;
  accent: string;
  bg: string;
  bg2: string;
  bg3: string;
}

export interface Project {
  slug: string;
  name: string;
  /** short one-liner shown on cards + the home "Selected Work" list */
  tagline: string;
  /** category label used in the work-grid number prefix, e.g. "AI Infra" */
  category: string;
  year: string;
  role: string;
  stack: string[];
  /** 1–2 short tags rendered on cards */
  cardTags: string[];
  /** label shown in the cursor-follow hover preview */
  preview: string;
  /** show on the home page "Selected Work" section */
  featured: boolean;
  lead: string;
  body: string[];
  features: string[];
  metrics: Array<[string, string]>;
  /** optional outbound links (rendered on the detail page when present) */
  repo?: string;
  demo?: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  read: string;
  tag: string;
  body: string[];
}

export interface ExperienceItem {
  when: string;
  role: string;
  co: string;
  desc: string;
  place: string;
}

export interface SkillGroup {
  cat: string;
  items: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  when: string;
  note?: string;
}

export interface Fact {
  k: string;
  v: string;
}

export interface MarqueeItem {
  label: string;
  hot?: boolean;
}

export interface HeadlineLine {
  text: string;
  outline?: boolean;
}

/* ---- Tweaks ---- */
export type HeroMode = 'dots' | 'weight' | 'tilt' | 'magnet' | 'off';
export type CursorStyle = 'ring' | 'glow' | 'crosshair' | 'spotlight';
export type ClickFx = 'ripple' | 'particles' | 'glitch' | 'off';
export type Holo = 'off' | 'sheen' | 'aurora' | 'mesh';
export type TransitionStyle = 'wipe' | 'slide' | 'fade';
export type TransSpeed = 'fast' | 'normal' | 'slow';
export type TextFx = 'off' | 'chromatic' | 'holo' | 'glitch' | 'scrollhue';

export interface Tweaks {
  grain: boolean;
  heroMode: HeroMode;
  cursor: CursorStyle;
  trail: boolean;
  clickFx: ClickFx;
  holo: Holo;
  transition: TransitionStyle;
  transSpeed: TransSpeed;
  textFx: TextFx;
  svgFx: boolean;
}
