import { useEffect, useRef, useState } from 'react';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#<>/*+=_';

/** Cycles through phrases with a left-to-right decode/scramble effect:
 *  hold a phrase, then resolve the next one character by character while the
 *  unresolved tail flickers through a techy charset. Static (first phrase)
 *  when reduced-motion is on or there is nothing to rotate. */
export function useScramble(
  phrases: string[],
  reduced: boolean,
  { holdMs = 3000, scrambleMs = 700, startDelayMs = 3500 } = {},
) {
  const [display, setDisplay] = useState(phrases[0] ?? '');
  const idx = useRef(0);

  useEffect(() => {
    if (reduced || phrases.length < 2) {
      setDisplay(phrases[0] ?? '');
      return;
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    const transition = () => {
      const from = phrases[idx.current];
      idx.current = (idx.current + 1) % phrases.length;
      const to = phrases[idx.current];
      const t0 = performance.now();

      const frame = (now: number) => {
        const p = Math.min((now - t0) / scrambleMs, 1);
        if (p >= 1) {
          setDisplay(to);
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
        setDisplay(out);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    timer = setTimeout(transition, startDelayMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // phrases come from static site content; joining keeps the dep primitive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, phrases.join('|'), holdMs, scrambleMs, startDelayMs]);

  return display;
}
