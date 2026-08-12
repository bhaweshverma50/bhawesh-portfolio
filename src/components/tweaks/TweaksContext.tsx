import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Tweaks } from '../../types';

export const TWEAK_DEFAULTS: Tweaks = {
  heroFx: 'dots',
  cursor: 'ring',
  grain: true,
  motion: true,
  transition: 'wipe',
  transSpeed: 'normal',
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

  // The motion master toggle is the one tweak the stylesheet keys off globally
  // (heroFx is passed to useHero; cursor style lives on body.cur-* set in Cursor).
  useEffect(() => {
    document.body.classList.toggle('motion-off', !tweaks.motion);
  }, [tweaks.motion]);

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
