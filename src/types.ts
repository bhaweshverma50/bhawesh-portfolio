export type RouteKey = 'home' | 'work' | 'blog' | 'contact' | 'project' | 'post';

export interface Theme {
  label: string;
  accent: string;
  bg: string;
  bg2: string;
  bg3: string;
}

export interface ProjectMedia {
  src: string;
  alt: string;
  caption?: string;
  /** 'image' covers png/jpg/gif (default); 'video' renders a muted looping <video> */
  type?: 'image' | 'video';
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
  /** internal route to a related write-up (e.g. "/post/my-article") */
  writeup?: string;
  /** cursor-follow hover thumbnail (may be an animated gif) */
  thumb?: string;
  /** thumbnail orientation — 'portrait' renders a phone-shaped hover preview (default landscape) */
  thumbAspect?: 'landscape' | 'portrait';
  /** detail-page hero media; falls back to a striped placeholder when absent */
  hero?: ProjectMedia;
  /** detail-page gallery; replaces the placeholder shots when present */
  gallery?: ProjectMedia[];
}

export interface PostLink {
  label: string;
  url: string;
}

export interface Post {
  slug: string;
  title: string;
  /** ISO date, used for sorting (e.g. "2026-06-02") */
  date: string;
  /** human label shown in the UI (e.g. "Jun 2026") */
  displayDate: string;
  /** reading estimate, e.g. "6 min" */
  read: string;
  tag: string;
  /** optional one-line dek on the listing */
  summary?: string;
  /** optional cover image URL (local "/posts/…" or absolute) */
  cover?: string;
  /** optional cross-post buttons (LinkedIn, dev.to, …) */
  links?: PostLink[];
  /** where this post came from */
  source: 'local' | 'devto' | 'hashnode' | 'medium';
  /** canonical URL (used to dedupe cross-posted pieces) */
  canonical?: string;
  /** prerendered, sanitized HTML body */
  html: string;
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
  /** extra phrases the line loops through with a scramble effect (text is the first) */
  rotate?: string[];
}

/* ---- Tweaks (curated: tasteful, performant, flicker-free) ---- */
export type HeroFx = 'dots' | 'off';
export type CursorStyle = 'ring' | 'minimal' | 'off';
export type TransitionStyle = 'wipe' | 'slide' | 'fade';
export type TransSpeed = 'fast' | 'normal' | 'slow';

export interface Tweaks {
  /** hero ambient background effect */
  heroFx: HeroFx;
  /** custom cursor style */
  cursor: CursorStyle;
  /** film-grain overlay */
  grain: boolean;
  /** master switch for ambient/looping motion (marquee, hero rotation, caret, reveals) */
  motion: boolean;
  /** page-transition wipe style */
  transition: TransitionStyle;
  transSpeed: TransSpeed;
}
