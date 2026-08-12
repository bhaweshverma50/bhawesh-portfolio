import { useEffect, type RefObject } from 'react';

const CHARSET = '01<>/[]{}*+=_#xz';

interface Options {
  holdMs?: number;
  scrambleMs?: number;
  startDelayMs?: number;
}

/** Cycles a single element's text through phrases with a left-to-right
 *  decode/scramble effect, writing directly to `el.textContent` on each
 *  animation frame. Imperative on purpose: it never triggers a React render
 *  and never re-creates DOM nodes, so it can't thrash sibling effects or
 *  flicker. Static (first phrase) when `enabled` is false or reduced-motion
 *  is on, or when there is nothing to rotate.
 *
 *  The element should already contain `phrases[0]` as its server/initial text
 *  so screen readers and no-JS views see the canonical phrase. */
export function useRotatingText(
  ref: RefObject<HTMLElement>,
  phrases: string[],
  enabled: boolean,
  { holdMs = 2600, scrambleMs = 640, startDelayMs = 2600 }: Options = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = phrases[0] ?? '';
    el.textContent = first;
    if (!enabled || phrases.length < 2) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    let alive = true;
    let idx = 0;

    const transition = () => {
      const from = phrases[idx];
      idx = (idx + 1) % phrases.length;
      const to = phrases[idx];
      const t0 = performance.now();

      const frame = (now: number) => {
        if (!alive) return;
        const p = Math.min((now - t0) / scrambleMs, 1);
        if (p >= 1) {
          el.textContent = to;
          timer = setTimeout(transition, holdMs);
          return;
        }
        // length eases from the old phrase to the new one while chars resolve left to right
        const len = Math.round(from.length + (to.length - from.length) * p);
        const resolved = Math.floor(p * to.length);
        let out = to.slice(0, Math.min(resolved, len));
        for (let i = out.length; i < len; i++) {
          out += CHARSET[(Math.random() * CHARSET.length) | 0];
        }
        el.textContent = out;
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    timer = setTimeout(transition, startDelayMs);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.textContent = first;
    };
    // phrases come from static site content; joining keeps the dep primitive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, phrases.join('|'), enabled, holdMs, scrambleMs, startDelayMs]);
}
