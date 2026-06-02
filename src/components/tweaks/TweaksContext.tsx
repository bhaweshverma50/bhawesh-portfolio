import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Tweaks } from '../../types';

export const TWEAK_DEFAULTS: Tweaks = {
  grain: true,
  heroMode: 'dots',
  cursor: 'ring',
  trail: false,
  clickFx: 'ripple',
  holo: 'off',
  transition: 'wipe',
  transSpeed: 'normal',
  textFx: 'off',
  svgFx: true,
};

const STORAGE_KEY = 'bhawesh-tweaks';

interface TweaksContextValue {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
  reset: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const TweaksContext = createContext<TweaksContextValue | null>(null);

function loadInitial(): Tweaks {
  if (typeof localStorage === 'undefined') return TWEAK_DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return TWEAK_DEFAULTS;
    return { ...TWEAK_DEFAULTS, ...(JSON.parse(raw) as Partial<Tweaks>) };
  } catch {
    return TWEAK_DEFAULTS;
  }
}

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(loadInitial);
  const [open, setOpen] = useState(false);

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / private-mode errors */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setTweaks(TWEAK_DEFAULTS);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // CSS-driven effects live on data-attributes the stylesheet keys off.
  useEffect(() => {
    document.body.setAttribute('data-textfx', tweaks.textFx);
    document.body.setAttribute('data-svgfx', tweaks.svgFx ? 'on' : 'off');
    const root = document.documentElement;
    root.setAttribute('data-hero-mode', tweaks.heroMode);
    root.setAttribute('data-cursor', tweaks.cursor);
    root.setAttribute('data-holo', tweaks.holo);
  }, [tweaks.textFx, tweaks.svgFx, tweaks.heroMode, tweaks.cursor, tweaks.holo]);

  // Shift+T toggles the panel (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      if (e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // reflect open state on <body> so the FAB can hide itself in CSS
  useEffect(() => {
    document.body.classList.toggle('tweaks-open', open);
  }, [open]);

  const value = useMemo<TweaksContextValue>(
    () => ({ tweaks, setTweak, reset, open, setOpen, toggle }),
    [tweaks, setTweak, reset, open, toggle],
  );

  return <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>;
}

export function useTweaks(): TweaksContextValue {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error('useTweaks must be used within <TweaksProvider>');
  return ctx;
}
